# Decisions

The brief left a lot open on purpose. This is what I decided, why, and what I would revisit.

## Assumptions I made

- **One owner, no login.** Everything runs as a single demo user. The data model and every service already take an owner, so adding authentication is additive (see below).
- **"State of all pets" means "what needs attention."** The dashboard is organised around care that is overdue or due soon, not around raw counts.
- **Record types are a growing set; species is not.** So `type` is an application-level registry key and `species` is a database enum.
- **Dates are calendar dates.** A vaccination happened on a day, not at an instant. Dates are `DATE` columns and cross the API as `YYYY-MM-DD` strings.
- **Search is simple.** Case-insensitive substring match on a couple of columns is enough for an owner with a handful of pets.

## Stack

**Next.js App Router for both the UI and the API.** The team works in React and Node; Next gives both in one runtime, one `npm run dev`, one container. The API layer (`src/app/api`) is deliberately thin, and all logic lives in `src/server`, so moving to a separate Express service or Lambda handlers would only replace the handlers.

**Postgres via Docker Compose, Prisma as the ORM.** Postgres matches production and gives `jsonb` for the record data. Prisma keeps the schema readable in one file, generates migrations, and produces types the rest of the code uses. The trade: Prisma types JSON columns loosely (`Json`), which is exactly why the registry exists to give `data` real types at the application boundary.

**Zod at every boundary.** Input schemas live in `src/shared` and run on both the client (instant field errors) and the server (the source of truth). The registry derives its schemas from field definitions rather than hand-written Zod so validation and form rendering cannot drift.

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

Each type is one file calling `defineRecordType` with a declarative field list. From that list the registry builds a strict Zod schema (unknown keys rejected), the form renders inputs by field kind, the table shows a summary, and the dashboard reads a due-date rule. A type can add a `refine` for cross-field rules the field list cannot express.

Adding a type is a new file plus one line in the index. Removing or renaming a `key` is a data migration and is documented as such.

## Authentication (not built, designed for)

`src/server/currentUser.ts` is the seam: today it returns a demo user, later it reads a session. Every service takes `ownerId` as its first argument and scopes every query by it, so authorization is already enforced; only authentication is missing. I would add Auth.js (NextAuth) with an email or OAuth provider, store the session in the database, and change `getCurrentUserId` to read it. Route handlers and pages would not change.

## Records API details

- `type` is immutable after creation. Changing it would orphan `data`; that operation is a delete and a create.
- `data` is replaced whole on update, never merged, so it is always validated as a complete object.
- `PATCH` with partial bodies rather than `PUT`, because the UI edits fields, not documents. Blank inputs on nullable columns send `null` ("clear this"); missing keys mean "leave it alone".

## What I am not satisfied with

**Due dates have no lifecycle.** A vaccination's `nextDueDate` stays "overdue" until someone edits or deletes the record, even after the next dose is logged as a new record. With more time I would add a `completedAt` (or a `supersededById`) to `MedicalRecord`, set it when a newer record of the same kind is created for the same pet, and exclude completed items from the dashboard. It is a small schema change; I left it out to keep the MVP's write path simple, and the seed data works around it.

Smaller things I would revisit:

- **No database integration tests.** The unit tests cover the pure logic (registry, schemas, care rules). The services are exercised manually and by the seed. I would add a test database in Compose and a handful of service tests next.
- **`getCurrentUserId` upserts on every request.** Fine for one user; it becomes a session lookup with auth.
- **Age is approximate** (30-day months). Clearly commented; date-fns would make it exact.
- **The form component holds field state as strings** and converts on submit. Simple and explicit, but a large form would want a form library.
