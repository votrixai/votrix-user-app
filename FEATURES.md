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
| Start new chat (employee selection) | ✅ | ⏳ | From session panel or home page |
| Chat thread (send/receive messages) | ✅ | ⏳ | |
| Streaming responses | ✅ | ⏳ | SSE via ai-sdk useChat, custom chat UI |
| Markdown rendering | ✅ | ❌ | react-markdown + remark-gfm, LobeHub-inspired typography |
| Tool call display (rich) | ✅ | ❌ | Auto-expand, timer, status colors, shimmer |
| Reasoning/thinking blocks | ✅ | ❌ | Collapsible, auto-expand while streaming |
| Export conversation | ✅ | ❌ | Download as .md file |
| Image preview + lightbox | ✅ | ❌ | Inline thumbnail, click to zoom |
| Artifact panel | ✅ | ❌ | Code preview with iframe/Sandpack |
| Message editing | ✅ | ❌ | Edit user message, re-send from that point |
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
| 3-column layout (rail + sessions + chat) | ✅ | ❌ | Employee rail (180px) + session panel (240px) + chat |
| Employee rail | ✅ | ❌ | Compact list with info icon hover-reveal |
| Session panel | ✅ | ❌ | Collapsible, auto-selects from URL |
| Delete session (context menu + hover icon) | ✅ | ⏳ | Long-press on mobile |
| Files link in sidebar | ✅ | ❌ | |
| Marketplace page | ✅ | ❌ | |
| Home page (employee-first) | ✅ | ❌ | Shows employees or marketplace CTA |
| Command palette (Cmd+K) | ✅ | ❌ | Search sessions, employees, pages |

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

## UX Polish

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Message entrance animations | ✅ | ❌ | Stagger fade-in slide-up |
| Thinking indicator (pulse dots + elapsed) | ✅ | ❌ | Shows elapsed time after 2.1s |
| Scroll-to-bottom button | ✅ | ❌ | Bottom-right, backdrop-blur, slide transition |
| Hover-reveal action bars | ✅ | ❌ | Copy/edit/reload appear on message hover |
| Welcome state personalization | ✅ | ❌ | Shows employee name and icon |
| Suggestion chips | ❌ | ❌ | Removed during @assistant-ui migration |
| Modal backdrop blur | ✅ | ❌ | backdrop-blur-sm on all dialogs |
| Dialog entrance animation | ✅ | ❌ | fade-in + zoom-in on open |
| Employee panel slide animation | ✅ | ❌ | AnimatePresence slide-in/out |
| Custom scrollbars | ✅ | ❌ | Thin, rounded, themed colors |
| Staggered list animations | ✅ | ❌ | Sidebar, marketplace, files, landing |
| Reduced motion support | ✅ | ❌ | Respects prefers-reduced-motion |
| Composer focus ring (DESIGN.md) | ✅ | ❌ | Indigo border + shadow ring |
