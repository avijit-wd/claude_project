# Server Components

## CRITICAL: `params` and `searchParams` Are Promises

In Next.js 16, `params` and `searchParams` props are **asynchronous** — they are `Promise` objects and **must be awaited** before accessing their values.

- **NEVER** access `params.someKey` directly without awaiting
- **ALWAYS** type `params` as `Promise<{ ... }>` in the component props
- **ALWAYS** `await params` before destructuring or reading values

```tsx
// CORRECT — params typed as Promise and awaited
type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function WorkoutPage({ params }: Props) {
  const { workoutId } = await params; // ✅ awaited before use
  // ...
}

// WRONG — params accessed synchronously (Next.js 15 and earlier style)
type Props = {
  params: { workoutId: string }; // ❌ not a Promise
};

export default function WorkoutPage({ params }: Props) {
  const { workoutId } = params; // ❌ not awaited
  // ...
}
```

The same rule applies to `searchParams`:

```tsx
// CORRECT
type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { date } = await searchParams; // ✅
  // ...
}
```

## Server Components Must Be `async`

All Server Components that fetch data or need to await `params`/`searchParams` must be declared `async`.

```tsx
// CORRECT
export default async function Page({ params }: Props) {
  const { id } = await params;
  const data = await fetchSomeData(id);
  return <div>{data.name}</div>;
}

// WRONG — cannot use await in a non-async component
export default function Page({ params }: Props) {
  const { id } = await params; // ❌ syntax error
}
```

## Handling Invalid Dynamic Segments

When a dynamic route segment must be a specific type (e.g. a numeric ID), validate it immediately after awaiting `params` and call `notFound()` for invalid values.

```tsx
import { notFound } from "next/navigation";

export default async function WorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const id = Number(workoutId);

  if (isNaN(id)) notFound(); // ✅ guard before any data fetching
  // ...
}
```

## Summary

| Rule | Requirement |
|------|-------------|
| `params` type | Always `Promise<{ ... }>` |
| `searchParams` type | Always `Promise<{ ... }>` |
| Accessing `params` / `searchParams` | Always `await` before use |
| Server Components with data fetching | Always `async` functions |
| Invalid dynamic segments | Call `notFound()` immediately after validation |
