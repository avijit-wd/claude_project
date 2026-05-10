# Routing

## Route Structure

All application routes live under `/dashboard`. There are no other application routes beyond the root landing page (`/`).

```
/                        — public landing page
/dashboard               — main dashboard (protected)
/dashboard/workout/new   — create a new workout (protected)
/dashboard/workout/[id]  — view/edit a workout (protected)
```

## Protected Routes: Middleware Only

All `/dashboard` routes **must** be protected via **Next.js middleware**. Do NOT enforce auth at the page or layout level (no `auth()` checks in `layout.tsx` or `page.tsx` for the purpose of redirecting unauthenticated users).

The middleware lives in `src/proxy.ts` (Next.js resolves this as the middleware entry point for this project):

```ts
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- Use `createRouteMatcher` to define which routes are protected.
- Call `auth.protect()` inside `clerkMiddleware` for any matched protected route.
- The matcher config must remain unchanged — it ensures middleware runs on all relevant requests.

## Rules Summary

| Rule | Requirement |
|------|-------------|
| Application routes | All under `/dashboard` |
| Route protection | Middleware only (`src/proxy.ts`) — never in pages or layouts |
| Auth provider for protection | Clerk (`clerkMiddleware` + `auth.protect()`) |
| Adding new protected routes | Extend `createRouteMatcher` pattern, do not add page-level guards |
