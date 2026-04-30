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

## Agents & Employees

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Marketplace (browse blueprints) | ✅ | ❌ | Shows hire/hired state |
| Hire agent from marketplace | ✅ | ❌ | Post-hire starts first chat |
| Employee list in sidebar | ✅ | ❌ | Collapsible groups with nested chats |
| Employee detail panel | ✅ | ❌ | Slide-over with memory stores |
| View memory stores | ✅ | ❌ | Expandable in detail panel |
| View memories | ✅ | ❌ | Lazy-loaded per store |
| Remove employee from team | ✅ | ❌ | With confirmation dialog |

## Chat

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Start new chat (employee selection) | ✅ | ⏳ | From sidebar [+] or home page |
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
| Sidebar with employee groups | ✅ | ❌ | WhatsApp-style collapsible groups |
| Chat grouping by employee | ✅ | ❌ | Replaces time-based grouping |
| Delete session (context menu + hover icon) | ✅ | ⏳ | Long-press on mobile |
| Files link in sidebar | ✅ | ❌ | |
| Marketplace page | ✅ | ❌ | |
| Home page (employee-first) | ✅ | ❌ | Shows employees or marketplace CTA |

## API Routes (backend proxy)

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| POST /api/chat | ✅ | ❌ | Mobile hits backend directly |
| GET/POST /api/sessions | ✅ | ❌ | |
| GET/DELETE /api/sessions/:id | ✅ | ❌ | |
| GET /api/employees | ✅ | ❌ | |
| POST /api/employees/hire | ✅ | ❌ | |
| DELETE /api/employees/:id | ✅ | ❌ | |
| GET /api/employees/:id/memory-stores | ✅ | ❌ | |
| GET /api/employees/:id/memory-stores/:id/memories | ✅ | ❌ | |
| GET /api/blueprints | ✅ | ❌ | |
| GET/POST /api/files | ✅ | ❌ | |
| GET /api/files/:id/content | ✅ | ❌ | |

## UX Hardening

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Toast notification system | ✅ | ❌ | Error/success feedback for mutations |
| Error page (error.tsx) | ✅ | ❌ | Branded with retry action |
| Not-found page (not-found.tsx) | ✅ | ❌ | Branded 404 |
| Mutation error feedback | ✅ | ❌ | Toasts on delete, create, upload failures |
