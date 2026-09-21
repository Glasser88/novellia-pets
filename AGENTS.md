<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working in this repo

Read README.md for what the app is and DECISIONS.md for why it is built this way. This file is the short version for anyone (or any tool) editing the code.

## Commands

- `make dev` runs Postgres in Docker and `next dev` on the host. `make seed` reloads demo data.
- `make check` is the gate: lint, typecheck, format check, tests. Run it before you say you are done.
- `npm test` alone for the unit tests; `npx prettier --write <files>` to format.

## Architecture rules

- Dependency direction is `app -> server -> shared`, and `components -> shared`. Nothing in `shared` imports from `server` or `app`.
- Pages are Server Components that call services in `src/server/*/service.ts` directly. Client components write through `src/app/api/**`, which validate with Zod and call the same services. Never put Prisma calls in a page, route or component.
- Every service function takes `ownerId` first and scopes its query by it. Keep that; it is the authorization model.
- `findX` returns `null` (pages call `notFound()`); `getX` throws `NotFoundError` (routes and services). Add both when you add an entity.
- Record types live only in `src/shared/recordTypes/`. To add one: copy the closest file, edit it, add it to `ALL_RECORD_TYPES` in `index.ts`, add its key to the pinned list in `recordTypes.test.ts`. No migration, route or component changes.
- What "overdue", "due soon" and "upcoming" mean is defined once in `src/shared/care.ts`; the Prisma filters for them are built once in `src/server/dueDates.ts`. Do not re-derive these anywhere else.

## Conventions

- Functions are `const name = () => {}` (ESLint enforces it). Expression bodies for one-liners. Define helpers above their callers.
- No single-letter parameter names (`event`, not `e`; `recordType`, not `t`).
- `Pet` and `MedicalRecord` are the app's shapes (dates as `YYYY-MM-DD` strings). Prisma row types appear only inside services, aliased `PetRow` / `MedicalRecordRow`, converted by `petFromRow` / `recordFromRow`.
- Lookups are plain objects typed `Partial<Record<string, T>>`, not `Map`.
- Every block of content on a page is a `SectionCard`. Lists open the thing they name; only a thing's own page has Edit and Delete. Filters live in the URL as a GET form.
- Status colours (red / amber / sky / green / muted) are reserved for care status and always come with a label.
- Prefer a comment that says why over a clever construct. If code needs a paragraph to explain, simplify the code.
- No em or en dashes in anything a person reads (UI strings, docs). Use a comma, colon or period. The empty-cell marker in tables is the one exception.
- No new dependencies without a reason written in DECISIONS.md.
