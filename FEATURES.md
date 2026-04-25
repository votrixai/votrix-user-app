# Feature Matrix

Tracks feature parity between web and mobile. Update this file in the same PR that ships a feature.

## Legend

- ✅ Shipped
- ⏳ In progress
- ❌ Not started
- ➖ Not applicable (platform doesn't support this interaction)

## Auth

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Login (magic link / OAuth) | ✅ | ⏳ | Supabase auth |
| Auth callback handling | ✅ | ⏳ | Deep link on mobile |
| Sign out | ✅ | ⏳ | |

## Chat

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Start new chat (agent selection) | ✅ | ⏳ | |
| Chat thread (send/receive messages) | ✅ | ⏳ | |
| Streaming responses | ✅ | ⏳ | SSE via ai-sdk |
| Markdown rendering | ✅ | ❌ | |
| Tool call display | ✅ | ⏳ | |
| Polling for async responses | ✅ | ❌ | |

## Files

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| File attachments in chat | ✅ | ❌ | |
| Session files panel | ✅ | ❌ | |
| File download | ✅ | ❌ | |
| Files workspace page | ✅ | ❌ | |

## Navigation

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Session sidebar | ✅ | ⏳ | Drawer on mobile |
| Session grouping (today/yesterday/older) | ✅ | ⏳ | |
| Delete session (context menu) | ✅ | ⏳ | Long-press on mobile |
| Marketplace page | ✅ | ❌ | |

## API Routes (backend proxy)

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| POST /api/chat | ✅ | ❌ | Mobile hits backend directly |
| GET/POST /api/sessions | ✅ | ❌ | |
| GET/DELETE /api/sessions/:id | ✅ | ❌ | |
| GET/POST /api/files | ✅ | ❌ | |
| GET /api/files/:id/content | ✅ | ❌ | |
