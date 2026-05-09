# Data Fetching

## CRITICAL: Server Components Only

**ALL data fetching MUST be done exclusively via Server Components.**

- **NEVER** fetch data in Client Components (`"use client"`)
- **NEVER** fetch data in Route Handlers (API routes) for the purpose of rendering UI data
- **ALWAYS** fetch data in Server Components and pass results down as props

This is a hard rule with no exceptions for UI data fetching.

```tsx
// CORRECT — fetch in a Server Component
// app/dashboard/page.tsx (no "use client" directive)
import { getWorkoutsForUser } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkoutsForUser(userId);
  return <WorkoutList workouts={workouts} />;
}

// WRONG — never do this
"use client";
export default function DashboardPage() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    fetch("/api/workouts").then(...); // ❌ forbidden
  }, []);
}
```

## Database Queries: /data Directory + Drizzle ORM

All database queries must go through **helper functions** located in the `/data` directory. These functions are the only place database access is permitted.

Rules:
- **NEVER** write raw SQL strings — use Drizzle ORM's query builder exclusively
- **NEVER** query the database directly from a page, layout, or component
- **ALWAYS** create or use a helper in `/data` for every query

```ts
// CORRECT — /data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// WRONG — raw SQL
export async function getWorkoutsForUser(userId: string) {
  return db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`); // ❌ forbidden
}
```

## Data Isolation: Users Must Only Access Their Own Data

**This is a security requirement.** Every `/data` helper function that returns user-specific data MUST scope its query to the authenticated user's ID. It is never acceptable to fetch all records and filter in the caller.

- Always retrieve the current user's ID from the session inside the helper (or accept it as a parameter and validate it against the session).
- Always include a `WHERE userId = currentUserId` condition (via Drizzle's `.where()`) on every query that touches user-owned data.
- Never expose a helper that returns another user's data to a regular user.

```ts
// CORRECT — user is scoped to their own data
import { auth } from "@/auth";

export async function getWorkoutsForUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, session.user.id)); // ✅ always scoped
}

// WRONG — no user scoping, any caller could pass any userId
export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId)); // ❌ caller controls scope
}
```

## Summary

| Rule | Requirement |
|------|-------------|
| Where to fetch data | Server Components only |
| Where to write queries | `/data` helper functions only |
| Query style | Drizzle ORM — no raw SQL |
| Data scoping | Always enforce `userId` = authenticated user |
