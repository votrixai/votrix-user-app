# Why Monorepo

## The problem

We have a Next.js web app and need to build an Expo React Native mobile app. Both apps talk to the same backend and share the same data model. Keeping them in separate repos leads to:

- **Type drift** — backend response shapes get updated in one repo but not the other, causing runtime errors instead of compile errors.
- **Cross-repo coordination** — a single feature that touches types + web + mobile requires syncing PRs across repos, with no atomic merge guarantee.
- **Duplicated dependency management** — two lockfiles, two CI pipelines, two sets of version conflicts to resolve independently.

## What the monorepo gives us

### 1. Shared types as a compile-time contract

Both `apps/web` and `apps/mobile` import from `@votrix/shared`. When a backend response shape changes, you update it once — both apps fail to compile until they handle the change. Drift becomes impossible to merge.

### 2. Atomic PRs

"Add file download to mobile" touches `packages/shared` (new type if needed), `apps/mobile` (UI), and `FEATURES.md` (parity tracking) in one PR. One review, one merge, one revert if needed.

### 3. Single dependency tree

One `npm install`, one `package-lock.json`, one CI pipeline. No version conflicts between repos. Shared dependencies (TypeScript, ESLint) are resolved once at the root.

### 4. Consistent tooling

Root `tsconfig.json` sets compiler baseline. Both apps extend it. Formatting, linting, and build conventions stay aligned without manual syncing.

## What the monorepo does NOT give us

- **Shared UI components** — React DOM and React Native use different primitives. The UI layer is completely separate and that's correct. Don't force abstractions here.
- **Massive code reuse** — ~10% of the codebase is shareable (types + pure logic). The other 90% is platform-specific UI and infra. This is normal for web + mobile.
- **Shared deployment** — web deploys via Vercel, mobile deploys via EAS Build. Completely independent pipelines that happen to read from the same repo.

## When to reconsider

If the team grows beyond ~10 engineers and web/mobile teams operate on independent release cycles, the monorepo may become a bottleneck (long CI, merge conflicts across teams). At that point, consider splitting into separate repos with a published `@votrix/shared` npm package. For now, the coordination benefit far outweighs the overhead.
