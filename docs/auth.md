# Authentication

## Provider: Clerk

This app uses **[Clerk](https://clerk.com/)** for all authentication. Do NOT use NextAuth, Auth.js, custom JWT handling, or any other auth library.

Relevant packages:
- `@clerk/nextjs` — Next.js SDK (client + server helpers, middleware, UI components)

## Setup

### ClerkProvider

Wrap the app in `<ClerkProvider>` at the root layout (`src/app/layout.tsx`). This is already in place — do not add it elsewhere.

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
```

### Middleware

Clerk middleware lives in `src/proxy.ts` and runs on every request. Do not remove or bypass it.

```ts
// src/proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
```

## Getting the Current User

### In Server Components and `/data` helpers (server-side)

Use `auth()` from `@clerk/nextjs/server`. This is an async function — always `await` it.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthorized");
```

- Always check that `userId` is non-null before proceeding.
- This is the canonical way to scope database queries to the authenticated user (see `docs/data-fetching.md`).

### In Client Components (client-side)

Use `useAuth()` or `useUser()` hooks from `@clerk/nextjs`.

```tsx
"use client";
import { useAuth } from "@clerk/nextjs";

const { userId, isLoaded, isSignedIn } = useAuth();
```

Do **not** fetch the userId server-side and pass it as a prop to Client Components for auth purposes — use the hook directly.

## UI Components

Use Clerk's built-in UI components. Do not build custom sign-in/sign-up forms.

| Component | Purpose |
|-----------|---------|
| `<SignInButton>` | Triggers sign-in (use `mode="modal"` for modal) |
| `<SignUpButton>` | Triggers sign-up (use `mode="modal"` for modal) |
| `<UserButton>` | Avatar dropdown with sign-out and account management |
| `<Show>` | Conditionally render based on auth state |

```tsx
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";

<Show when="signed-out">
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Rules Summary

| Rule | Requirement |
|------|-------------|
| Auth provider | Clerk only — no other auth libraries |
| Server-side user ID | `auth()` from `@clerk/nextjs/server` |
| Client-side user ID | `useAuth()` or `useUser()` hooks |
| UI components | Clerk built-ins (`SignInButton`, `UserButton`, etc.) |
| Data scoping | Always enforce `userId` from `auth()` in `/data` helpers |
| Custom auth logic | Forbidden — rely on Clerk middleware and helpers |
