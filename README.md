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
                  (pets, records) and the dashboard read model, typed errors, the auth seam (currentUser).
  shared/         Code used by both server and client: Zod input schemas and the
                  record-type registry.
  components/     React components (shadcn/ui primitives under components/ui).
  lib/            Small client-side helpers (API fetch wrapper, date formatting).
prisma/           Schema, migrations, seed.
```

The dependency direction is `app → server → shared`, and `components → shared`. Nothing in `shared` imports from `server` or `app`.

### The record-type registry

`src/shared/recordTypes/` is the single source of truth for what a record type is. Each type is one file with two things: a Zod schema that validates the record's `data`, and a list of form fields that says how to render it.

```ts
export const vaccination = defineRecordType({
  key: "vaccination",
  label: "Vaccination",
  pluralLabel: "Vaccinations",
  description: "A vaccine dose administered, with when the next one is due.",

  schema: z.strictObject({
    vaccine: z.string().trim().min(1, "Required"),
    nextDueDate: optionalIsoDate,
  }),

  fields: [
    { name: "vaccine", label: "Vaccine", kind: "text", required: true },
    { name: "nextDueDate", label: "Next dose due", kind: "date" },
  ],

  dueDate: (data) => data.nextDueDate ?? null,
  summary: (data) => data.vaccine,
});
```

The API validates incoming `data` with `schema`, the form renders inputs from `fields`, the table shows `summary`, and the dashboard uses `dueDate`. None of those places mention a specific type. A test checks that every type's `fields` and `schema` list the same keys, so they cannot drift.

**To add a record type:** copy the closest file in `src/shared/recordTypes/`, edit it, and add it to the list in `index.ts`. No migration, route or component changes.

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

## Tools and AI usage

**Stack choices.** Next.js, React and TypeScript are what I know best, so the UI and API layers are on familiar ground. Prisma and Postgres were new to me; I chose them because Postgres is what the team runs in production, and Prisma keeps the learning surface small (one schema file, generated types, a handful of query methods). The ORM was the right trade: the interesting decisions in this project are about the data model and the registry, not about SQL syntax. Tailwind and shadcn/ui are for speed; the components are copied into the repo, not imported from a package, so there is nothing hidden.

**AI.** I built this with Claude as a pair, working in small steps: I set the architecture direction and the constraints (extensible record types, thin API over services, no dependencies without a reason), it drafted code and explained the trade-offs, and I reviewed each change, ran it, and pushed back where the code was cleverer than it needed to be (several commits are readability passes that came out of that). Every decision in DECISIONS.md is one I can defend without the tool. The commit history is the honest record of how the project was built.

## Tests

`npm test` runs unit tests for the pure logic: the record-type registry and schema derivation, input schemas, and the care-status rules. Manual API checks are in the commit history; there are no database integration tests (see DECISIONS.md).
