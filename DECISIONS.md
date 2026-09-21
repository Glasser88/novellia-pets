# Decisions

The brief left a lot open on purpose. This is what I decided, why, and what I would revisit.

## Assumptions I made

- **One owner, no login.** Everything runs as a single demo user. The data model and every service already take an owner, so adding authentication is additive (see below).
- **"State of all pets" means "what needs attention."** The dashboard is organised around care that is overdue or due soon, not around raw counts.
- **Record types are a growing set; species is not.** So `type` is an application-level registry key and `species` is a database enum.
- **Dates are calendar dates.** A vaccination happened on a day, not at an instant. Dates are `DATE` columns and cross the API as `YYYY-MM-DD` strings. "Today" is judged in one time zone for the whole app (the server's `TZ`; Docker sets it, since containers default to UTC), which is right for one owner. A per-user time zone belongs on the user profile that arrives with authentication.
- **Search is simple.** Case-insensitive substring match on a couple of columns is enough for an owner with a handful of pets.

## The feature I chose: care tracking

Records that imply future care carry a due date, and the app is organised around what that makes visible. The reasoning is in the README ("The feature: care tracking"); the decision that makes it work is below under "The data model": `dueDate` is derived from a record's `data` by its type's rule on every write and stored as an indexed column, so the dashboard asks the database "what is due before this date" instead of unpacking JSON. The rules for what "overdue" and "due soon" mean live in one pure file (`src/shared/care.ts`), unit-tested without a database, and the server turns them into query windows in one place (`src/server/dueDates.ts`), so the dashboard counts, the dashboard lists and the records page filter cannot disagree.

### Ideas I considered and set aside

- **Weather-aware care.** Pull NOAA weather alerts (thunderstorms, heat waves, cold snaps) and map them to the pets that are sensitive to them: a nervous dog before a storm, an older cat or a brachycephalic breed in a heat wave, with a nudge like "keep Milo indoors this afternoon." I like this a lot, and it is where a product like this could become something people open every day. I set it aside because it turns a records app into one that gives care advice, and that advice needs veterinary input before it should reach an owner; it also needs the pet's location and a model of which conditions matter, neither of which the MVP has. It would build on the same due-date machinery (an alert is just a short-lived "due now").
- **Weight trend.** A weight-check record type with a chart per pet. I had it in and took it out: with one owner and a few pets there is rarely enough data for a trend to mean anything, and the pet's current weight on its profile covers the common case. It comes back the moment the app has recurring weigh-ins.
- **Reminders.** Email or push notifications for what is due. The data is already there (every due date is an indexed column), so this is a scheduled job plus a mail provider. It is the most obvious next feature and deliberately not in an MVP that has no accounts to send to.
- **Sharing with a vet.** A read-only link or PDF export of a pet's history. Useful and small, but it is a distribution feature rather than a product decision, so it did not compete for the "one feature" slot.

## Stack

**Next.js App Router for both the UI and the API.** The team works in React and Node; Next gives both in one runtime, one `npm run dev`, one container. The API layer (`src/app/api`) is deliberately thin, and all logic lives in `src/server`, so moving to a separate Express service or Lambda handlers would only replace the handlers.

**Postgres via Docker Compose, Prisma as the ORM.** Postgres matches production and gives `jsonb` for the record data. Prisma keeps the schema readable in one file, generates migrations, and produces types the rest of the code uses. The trade: Prisma types JSON columns loosely (`Json`), which is exactly why the registry exists to give `data` real types at the application boundary.

**Zod at every boundary.** Input schemas live in `src/shared` and run on both the client (instant field errors) and the server (the source of truth). Record types write their schema in plain Zod; a test keeps the schema and the form field list in sync.

**Two shapes per entity, named for what they are.** `Pet` and `MedicalRecord` (in `src/shared/schemas`) are the app's shapes: dates as `YYYY-MM-DD` strings, `data` as a typed object, safe to send over the API and render. Prisma's generated row types are only imported inside `src/server/*/service.ts`, aliased as `PetRow` and `MedicalRecordRow`, and `petFromRow` / `recordFromRow` are the one place a row becomes an app object. Everything outside the service layer only ever sees the app shape.

**No form, data-fetching or date library.** Pages are Server Components that read straight from the service layer, so there is no client cache to manage (TanStack Query solves a problem this app does not have). Forms are `useState` plus the shared Zod schema. Dates are strings outside the database and formatted with `Intl`. Each of these is a dependency I would add the first time a screen needs it: type-ahead search or polling for TanStack Query, a large multi-step form for a form library, calendar arithmetic (recurring schedules) for date-fns.

## The data model

```
User 1─* Pet 1─* MedicalRecord
```

`MedicalRecord` has real columns for what every record shares (`type`, `title`, `date`, `notes`) and a `data` jsonb column for what varies by type.

Alternatives considered:

- **A table per record type** (`vaccinations`, `allergies`, …). Best for querying, but adding a type means a migration, a service, routes and components. Too slow for a type set that is expected to grow, and for the live exercise.
- **Fully generic** (`type` + `data`, nothing else). Fastest to extend, but nothing validates `data`, and common queries (by date, by due date) have to dig into JSON.

The middle path keeps the queryable fields as columns and validates `data` through the registry. `dueDate` is a "promoted" field: derived from `data` on every write and stored as a real indexed column, so the dashboard query is `WHERE dueDate IS NOT NULL ORDER BY dueDate`. The same promotion is available for any other field a query ever needs.

## The record-type registry

Each type is one file: a plain Zod schema for its `data` plus a list of form fields. The API validates with the schema, the form renders from the field list (one component switches on field kind), the table shows `summary`, and the dashboard reads the `dueDate` rule. A test asserts the schema keys and field names match.

I first built this with the schema _derived_ from the field list, so a type was declared once. It worked, but it needed a handful of mapped and conditional TypeScript types to give `data` a real type, and that machinery was the hardest thing in the codebase to explain. Writing the schema by hand costs a few duplicated lines per type and removes all of it; the sync test catches the drift the derivation was preventing. Plain code that a test guards beat clever code that guards itself.

Adding a type is a new file plus one line in the index. Removing or renaming a `key` is a data migration and is documented as such.

## UI structure

**One frame for every block of content.** `SectionCard` (title, optional info tooltip, optional header action, one empty state) wraps every list, table and detail block, so pages differ in content, not in chrome. Stat cards are the same frame with a number inside.

**Lists find, detail pages act.** Every row in every list opens the thing it names (a pet, a record). Edit and Delete exist only on a thing's own page, so there is exactly one place each destructive action lives and forms always know where to return to.

**Filters live in the URL.** Search and dropdown filters are a plain GET form, so every filtered view is server-rendered, linkable, and works without JavaScript; the dashboard's "View all" links are just URLs into the records page.

**Theme is a cookie, not a client script.** An explicit light/dark choice is stored in a cookie and rendered as a class on `<html>` by the root layout; with no choice, CSS follows `prefers-color-scheme`. This avoids the pre-hydration script that `next-themes` injects (and the console warning it produces on not-found pages in Next 16), and it means no flash and no client theme state. The trade is a server round-trip per toggle, which is rare.

## Authentication (not built, designed for)

There is no login, but the app is shaped as if there were, so that adding it is a contained change rather than a rewrite.

**What exists today.** `src/server/currentUser.ts` is the seam. `getCurrentUser()` returns the signed-in user (`id`, `name`, `email`) and `getCurrentUserId()` is a convenience over it; in the MVP both resolve to one upserted demo owner. Every service takes `ownerId` as its first argument and scopes every query by it, so authorization is already enforced: a user could never read or change another owner's pets even if two users existed. The header renders whatever `getCurrentUser()` returns as an avatar with an account menu, whose "Sign out" item is present but disabled and labelled "demo" so the UI is honest about the state of things.

**How it would be wired up.** Auth.js (NextAuth v5) with the Prisma adapter and database sessions, which keeps sessions revocable and needs no JWT secret rotation story:

1. **Schema.** Add the adapter's `Account`, `Session` and `VerificationToken` models next to `User`, and make `User.name` optional (providers do not always supply it). Existing `Pet.ownerId` rows are untouched; the demo owner becomes a normal user row.
2. **Providers.** Start with a magic-link email provider (Resend) because pet owners are consumers and it needs no password UI; add Google OAuth as the second option. Both are configuration, not code.
3. **The seam.** `getCurrentUser()` becomes `const session = await auth(); if (!session?.user) throw new UnauthorizedError(); return session.user;`. `UnauthorizedError` joins `NotFoundError`/`BadRequestError` in `src/server/errors.ts` and `withErrorHandling` maps it to a 401, so API routes get the right status with no per-route code.
4. **Pages.** A `proxy.ts` (Next 16's middleware) redirects unauthenticated requests for `/`, `/pets/*` and `/api/*` to `/login`, so Server Components can assume a user and the seam's throw is a safety net rather than the main path.
5. **Header.** `UserMenu` gets the user's image from the provider (the `Avatar` already falls back to initials) and "Sign out" becomes a Server Action calling `signOut()`.
6. **Seed and tests.** The seed signs the demo user in the same way any user would exist, and the future service tests take an `ownerId` exactly as they do now.

Nothing in `src/server/*/service.ts`, the API routes or the pages changes, which is the point of putting the seam where it is.

## Records API details

- `type` is immutable after creation. Changing it would orphan `data`; that operation is a delete and a create.
- `data` is replaced whole on update, never merged, so it is always validated as a complete object.
- `PATCH` with partial bodies rather than `PUT`, because the UI edits fields, not documents. One rule for blank inputs everywhere: blank means `null` ("no value"); a key that is not sent means "leave it alone".

## What I am not satisfied with

**Due dates have no lifecycle.** A vaccination's `nextDueDate` stays "overdue" until someone edits or deletes the record, even after the next dose is logged as a new record. With more time I would add a `completedAt` (or a `supersededById`) to `MedicalRecord`, set it when a newer record of the same kind is created for the same pet, and exclude completed items from the dashboard. It is a small schema change; I left it out to keep the MVP's write path simple, and the seed data works around it.

Smaller things I would revisit:

- **Offset pagination, only on the records page.** The records page shows 10 per page with `?page=N` (skip/take plus a count query, so "Showing 26 to 50 of 132" is exact) and a page past the end falls back to the last page. Offset pagination can skip or repeat a row if records are added while paging, which does not matter for one owner browsing their own history; if it ever did (a shared or high-write list), I would switch to cursor pagination keyed on `(date, id)`. The dashboard lists are capped at five with "View all" links, and a pet's own records and the pets list are small by the "handful of pets" assumption, so they are not paginated.
- **No database integration tests.** The unit tests cover the pure logic (registry, schemas, care rules). The services are exercised manually and by the seed. I would add a test database in Compose and a handful of service tests next.
- **`getCurrentUser` upserts on every request.** Fine for one user; it becomes a session lookup with auth.
- **Age is approximate** (30-day months). Clearly commented; date-fns would make it exact.
- **The form component holds field state as strings** and converts on submit. Simple and explicit, but a large form would want a form library.
