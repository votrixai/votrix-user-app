# TODO

## Mobile App (apps/mobile)

- [ ] Initialize Expo project in `apps/mobile/`
- [ ] Set up Supabase auth with AsyncStorage
- [ ] Build chat thread screen (send/receive, streaming)
- [ ] Build agent selection / new chat screen
- [ ] Build session list (drawer navigation)
- [ ] File attachments in chat
- [ ] Session files panel + download
- [ ] Deep link handling for auth callback
- [ ] Push notifications (optional)

## Shared Package (packages/shared)

- [ ] Move `isAwaitingAssistantResponse()` to shared
- [ ] Add shared constants (event type strings, API paths)

## Infrastructure

- [ ] Set up EAS Build for iOS/Android
- [ ] Set up EAS Submit for App Store / Play Store
- [ ] Add Vercel project root directory config (`apps/web`)
- [ ] Add feature flag service when both platforms have users

## Web App (apps/web)

- [ ] Verify Vercel deployment works with monorepo structure
