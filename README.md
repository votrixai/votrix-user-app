# votrix-user-app

Monorepo for Votrix user-facing applications.

## Structure

```
apps/
  web/       — Next.js web app
  mobile/    — Expo React Native app (coming soon)
packages/
  shared/    — Shared TypeScript types and utilities
```

## Development

```bash
npm install          # install all workspace dependencies
npm run dev:web      # start the web app dev server
npm run build:web    # production build for web
```

## Workspaces

| Package | Path | Description |
|---------|------|-------------|
| `@votrix/web` | `apps/web` | Next.js web application |
| `@votrix/shared` | `packages/shared` | Shared types and models |
