# Data Mutations

## CRITICAL: Server Actions Only

**ALL data mutations MUST be done exclusively via Server Actions.**

- **NEVER** mutate data in Route Handlers (API routes)
- **NEVER** mutate data directly from a component or page
- **ALWAYS** define mutations as Server Actions in colocated `actions.ts` files

## Server Actions: Colocated `actions.ts` Files

Server Actions must live in `actions.ts` files colocated next to the route or feature they serve.

```
src/app/
  dashboard/
    actions.ts        ✅ server actions for the dashboard feature
    page.tsx
  workouts/
    [id]/
      actions.ts      ✅ server actions for a single workout
      page.tsx
```

Every `actions.ts` file must begin with the `"use server"` directive.

```ts
// CORRECT — src/app/workouts/actions.ts
"use server";

import { createWorkout } from "@/data/workouts";

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // ...
}
```

## Typed Parameters — No FormData

All Server Action parameters must be explicitly typed. `FormData` is **never** an acceptable parameter type.

```ts
// CORRECT — strongly typed input
export async function createWorkoutAction(input: CreateWorkoutInput) { ... }

// WRONG — FormData is forbidden
export async function createWorkoutAction(formData: FormData) { ... } // ❌
```

Define input types inline or import them from a shared types file. Prefer `z.infer<typeof Schema>` when the type is derived from a Zod schema (see below).

## Validation: Zod Required on Every Action

Every Server Action **MUST** validate its arguments with [Zod](https://zod.dev/) before doing anything else. No action may proceed to a database call if validation has not passed.

```ts
// CORRECT — src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().date(),
  notes: z.string().optional(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = CreateWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  await createWorkout(parsed.data);
}

// WRONG — no validation before db call
export async function createWorkoutAction(input: CreateWorkoutInput) {
  await createWorkout(input); // ❌ unvalidated input reaches the database
}
```

## Database Mutations: /data Directory + Drizzle ORM

All database write operations must go through **helper functions** in the `src/data/` directory. Server Actions call these helpers — they never write Drizzle queries inline.

Rules:
- **NEVER** write raw SQL strings — use Drizzle ORM's query builder exclusively
- **NEVER** call `db.insert()`, `db.update()`, or `db.delete()` from an `actions.ts` file directly
- **ALWAYS** create or use a helper in `/data` for every mutation

```ts
// CORRECT — src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function createWorkout(data: { name: string; date: string; notes?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.insert(workouts).values({ ...data, userId: session.user.id });
}

// WRONG — raw SQL
export async function createWorkout(data: ...) {
  return db.execute(sql`INSERT INTO workouts ...`); // ❌ forbidden
}
```

## Data Isolation: Always Scope Mutations to the Authenticated User

**This is a security requirement.** Every `/data` mutation helper that writes user-owned data MUST enforce the authenticated user's ID. The caller must never be able to write on behalf of another user.

- Always retrieve the current user's ID from the session inside the helper.
- Always include the `userId` from the session in `INSERT` values or as a `WHERE` condition on `UPDATE`/`DELETE`.
- Never accept a bare `userId` parameter that the caller controls without validating it against the session.

```ts
// CORRECT — userId always comes from the session
export async function deleteWorkout(workoutId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, session.user.id) // ✅ prevents deleting another user's workout
      )
    );
}

// WRONG — caller controls which user's data is deleted
export async function deleteWorkout(workoutId: string, userId: string) {
  await db.delete(workouts).where(eq(workouts.id, workoutId)); // ❌ no ownership check
}
```

## Post-Mutation Navigation: No `redirect()` in Server Actions

**NEVER call `redirect()` inside a Server Action.** Navigation after a mutation is the responsibility of the Client Component that called the action.

- Server Actions must return (or throw) to signal success or failure — nothing more.
- The calling Client Component handles navigation using the Next.js router after the action resolves.

```ts
// CORRECT — actions.ts returns, does not redirect
"use server";

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = CreateWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  await createWorkout(parsed.data);
  // ✅ action is done — no redirect here
}

// WRONG — redirect inside the action
export async function createWorkoutAction(input: CreateWorkoutInput) {
  await createWorkout(parsed.data);
  redirect("/dashboard"); // ❌ forbidden
}
```

```tsx
// CORRECT — Client Component navigates after the action resolves
"use client";
import { useRouter } from "next/navigation";

const router = useRouter();

async function handleSubmit() {
  await createWorkoutAction(input);
  router.push("/dashboard"); // ✅ navigation lives here
}
```

## Summary

| Rule | Requirement |
|------|-------------|
| Where to mutate data | Server Actions only |
| Where to define Server Actions | Colocated `actions.ts` files with `"use server"` |
| Parameter types | Explicit TypeScript types — `FormData` is forbidden |
| Validation | Zod `safeParse` at the top of every action, before any db call |
| Where to write db mutations | `/data` helper functions only |
| Query style | Drizzle ORM — no raw SQL |
| Data scoping | Always enforce `userId` = authenticated user from session |
| Post-mutation navigation | `router.push()` in the Client Component — never `redirect()` in an action |
