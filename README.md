# Novellia Pets

An MVP for pet owners to track their pets and their pets' medical records, with a dashboard that surfaces upcoming and overdue care.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 + shadcn/ui · Prisma 7 · PostgreSQL 16 · Zod · Vitest

## Run it

The only requirement is Docker.

```sh
make up          # builds the app, starts Postgres, migrates, seeds demo data, serves on http://localhost:3000
make down        # stops everything
```

The app uses port 3000 and Postgres uses 5432 on the host; stop anything else on those ports first (a running `next dev`, a local Postgres).

For development (app on the host with hot reload, Postgres in Docker), you also need Node 22:

```sh
make dev         # creates .env, starts Postgres, runs `next dev`
make seed        # (re)loads the demo data
make check       # lint + typecheck + format check + tests
make help        # everything else
```

## What it does

- Add, view, edit and delete pets.
- Add, view, edit and delete medical records for a pet. Five record types ship: vaccination, medication, vet visit, allergy, weight check.
- Dashboard showing every pet's status, plus what is overdue and what is due in the next 30 days.
- Search pets by name or breed; search and filter a pet's records by title and type.

## How it is put together

```
src/
  app/            Next.js routes. Pages are Server Components that read via services;
                  app/api/** are thin REST handlers that validate and call services.
  server/         Everything that touches the database: Prisma client, services
                  (pets, records, care), typed errors, the auth seam (currentUser).
  shared/         Code used by both server and client: Zod input schemas and the
                  record-type registry.
  components/     React components (shadcn/ui primitives under components/ui).
  lib/            Small client-side helpers (API fetch wrapper, date formatting).
prisma/           Schema, migrations, seed.
```

The dependency direction is `app → server → shared`, and `components → shared`. Nothing in `shared` imports from `server` or `app`.

### The record-type registry

`src/shared/recordTypes/` is the single source of truth for what a record type is. Each type is one file that declares its fields:

```ts
export const vaccination = defineRecordType({
  key: "vaccination",
  label: "Vaccination",
  pluralLabel: "Vaccinations",
  description: "A vaccine dose administered, with when the next one is due.",
  fields: {
    vaccine: { kind: "text", label: "Vaccine", required: true },
    nextDueDate: { kind: "date", label: "Next dose due" },
  },
  dueDate: (data) => data.nextDueDate ?? null,
  summary: (data) => data.vaccine,
});
```

`defineRecordType` derives a strict Zod schema from `fields`. The API validates incoming `data` against it, the form renders inputs from it, the table shows `summary`, and the dashboard uses `dueDate`. None of those places mention a specific type.

**To add a record type:** create `src/shared/recordTypes/<type>.ts` and add it to the list in `index.ts`. No migration, route or component changes.

### Data model

- `User` → `Pet` → `MedicalRecord`, with cascading deletes.
- `MedicalRecord` keeps the fields every record shares (`type`, `title`, `date`, `notes`) as real columns and the type-specific fields in a `data` jsonb column validated by the registry. `dueDate` is derived from `data` on every write so the dashboard can query it with an index instead of unpacking JSON.
- `Pet.species` is a database enum (a closed set); `MedicalRecord.type` is a string keyed into the registry (an open set).

See [DECISIONS.md](DECISIONS.md) for the reasoning behind these and other choices, and what I would do differently.

## API

All routes act as a single demo owner (see "Authentication" in DECISIONS.md).

| Method             | Path                                 |                                 |
| ------------------ | ------------------------------------ | ------------------------------- |
| GET, POST          | `/api/pets`                          | list (`?q=`) / create           |
| GET, PATCH, DELETE | `/api/pets/:petId`                   | read / partial update / delete  |
| GET, POST          | `/api/pets/:petId/records`           | list (`?type=`, `?q=`) / create |
| GET, PATCH, DELETE | `/api/pets/:petId/records/:recordId` | read / partial update / delete  |

Validation errors return `400 { error, issues: [{ path, message }] }`; unknown ids return `404`.

## Tests

`npm test` runs unit tests for the pure logic: the record-type registry and schema derivation, input schemas, and the care-status rules. Manual API checks are in the commit history; there are no database integration tests (see DECISIONS.md).
