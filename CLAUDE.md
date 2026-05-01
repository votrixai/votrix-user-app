This is a monorepo with apps/web (Next.js) and apps/mobile (Expo, coming soon). Shared types live in packages/shared.

When adding, removing, or modifying any feature in apps/web or apps/mobile, update FEATURES.md at the repo root to reflect the change. Mark the correct platform column (✅, ⏳, ❌, or ➖) and add notes if relevant.

When zipping the repo, exclude build artifacts and dependencies:
```
cd /Users/wsu78/Desktop/Files/votrix && zip -r votrix-user-app.zip votrix-user-app -x "*/node_modules/*" "*/.next/*" "*/dist/*" "*/.turbo/*"
```
