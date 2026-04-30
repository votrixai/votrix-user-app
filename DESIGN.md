---
name: Votrix
description: Stripe-inspired enterprise productivity UI — white canvas, deep navy headings, indigo-violet accent, blue-tinted chromatic shadows, Geist typography at light weights.

colors:
  canvas: "#ffffff"
  surface: "#f6f9fc"
  surface-raised: "#eef2f7"
  heading: "#061b31"
  label: "#273951"
  body: "#64748d"
  placeholder: "#94a3b8"
  border: "#e5edf5"
  border-strong: "#d4dce8"
  accent: "#533afd"
  accent-hover: "#4434d4"
  accent-deep: "#2e2b8c"
  accent-light: "#b9b9f9"
  accent-subtle: "rgba(83,58,253,0.05)"
  accent-muted: "rgba(83,58,253,0.15)"
  destructive: "#ea2261"
  destructive-hover: "#d11d57"
  success: "#15be53"
  success-text: "#108c3d"
  success-subtle: "rgba(21,190,83,0.2)"
  success-border: "rgba(21,190,83,0.4)"
  warning: "#9b6829"
  brand-dark: "#1c1e54"
  shadow-blue: "rgba(50,50,93,0.25)"
  shadow-black: "rgba(0,0,0,0.1)"
  shadow-ambient: "rgba(23,23,23,0.08)"
  shadow-soft: "rgba(23,23,23,0.06)"

typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  heading:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.0
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 300
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 2.0

rounded:
  none: "0"
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
  4xl: "64px"

shadows:
  ambient: "rgba(23,23,23,0.06) 0px 3px 6px"
  standard: "rgba(23,23,23,0.08) 0px 15px 35px"
  elevated: "rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px"
  deep: "rgba(3,3,39,0.25) 0px 14px 21px -14px, rgba(0,0,0,0.1) 0px 8px 17px -8px"
  focus: "0 0 0 2px rgba(83,58,253,0.3)"

components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    border: "1px solid {colors.accent-light}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.accent-subtle}"
  button-neutral:
    backgroundColor: "transparent"
    textColor: "{colors.label}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-neutral-hover:
    backgroundColor: "{colors.surface}"
  input-text:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.heading}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    fontSize: "0.875rem"
  input-text-focus:
    border: "1px solid {colors.accent}"
    boxShadow: "{shadows.focus}"
  card:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "16px"
    boxShadow: "{shadows.ambient}"
  card-elevated:
    boxShadow: "{shadows.elevated}"
  nav-item:
    textColor: "{colors.heading}"
    typography: "{typography.body}"
    fontWeight: 400
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  nav-item-active:
    backgroundColor: "{colors.surface}"
    fontWeight: 500
  nav-item-hover:
    backgroundColor: "{colors.surface}"
  sidebar-section-label:
    typography: "{typography.label}"
    textColor: "{colors.body}"
    textTransform: "uppercase"
    letterSpacing: "0.04em"
  chat-bubble-user:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.heading}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  chat-bubble-assistant:
    backgroundColor: "transparent"
    textColor: "{colors.heading}"
    padding: "0"
  composer:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    boxShadow: "{shadows.ambient}"
  composer-focus:
    border: "1px solid {colors.accent}"
    boxShadow: "{shadows.focus}"
  badge-success:
    backgroundColor: "{colors.success-subtle}"
    textColor: "{colors.success-text}"
    border: "1px solid {colors.success-border}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
    fontSize: "0.625rem"
    fontWeight: 300
  badge-neutral:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.heading}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    padding: "0px 6px"
    fontSize: "0.6875rem"
    fontWeight: 400
---

# Design System: Votrix

## 1. Overview

**Creative North Star: "The Financial Institution Redesigned"**

Votrix feels simultaneously technical and luxurious, precise and warm. A clean white canvas with deep navy headings and a signature indigo-violet accent that reads as confident and premium. The overall impression is of an enterprise tool redesigned by a world-class type foundry.

The aesthetic is adapted directly from Stripe's design system: light weights that whisper rather than shout, blue-tinted chromatic shadows that make elevation feel atmospheric, and conservative border radii that communicate engineering precision. Geist replaces Stripe's sohne-var but inherits the same philosophy: weight 300 as the signature headline weight, progressive negative tracking at scale, and a two-weight system (300 for reading, 400 for interaction) that creates hierarchy through restraint.

## 2. Colors

A white canvas with deep navy text, indigo-violet accent, and blue-tinted shadows. The palette is deliberately restrained: one chromatic accent, navy-tinted neutrals, and semantic colors for status only.

### Surfaces
- **Canvas** (#ffffff): Page background, card surfaces. Pure white.
- **Surface** (#f6f9fc): Sidebar background, hover states, subtle tinting. A cool blue-white.
- **Surface Raised** (#eef2f7): Active sidebar items, pressed states, secondary containers.

### Text
- **Heading** (#061b31): All headings, nav text, strong labels. Deep navy, not black. The warmth matters.
- **Label** (#273951): Form labels, secondary headings. Dark slate with blue undertone.
- **Body** (#64748d): Body text, descriptions, captions. Slate gray.
- **Placeholder** (#94a3b8): Input placeholders, disabled text.

### Borders
- **Border** (#e5edf5): Standard borders for cards, dividers, containers. Soft blue-gray.
- **Border Strong** (#d4dce8): Input borders, dividers that need more presence.

### Accent
- **Accent** (#533afd): Indigo-violet. Primary CTA backgrounds, link text, interactive highlights. The only chromatic color in the system.
- **Accent Hover** (#4434d4): Darker for hover states on accent elements.
- **Accent Deep** (#2e2b8c): Icon hover states, deep interactive emphasis.
- **Accent Light** (#b9b9f9): Soft lavender for ghost button borders, subdued hover backgrounds.
- **Accent Subtle** (rgba(83,58,253,0.05)): Ghost button hover fills, focus ring glow.
- **Accent Muted** (rgba(83,58,253,0.15)): Badges, active indicators, selection highlight.

### Semantic
- **Destructive** (#ea2261): Delete, remove, error states. Ruby red-pink.
- **Success** (#15be53): Confirmation, online indicators, hired state.
- **Success Text** (#108c3d): Text on success backgrounds.
- **Warning** (#9b6829): Caution states, highlighting.

### Brand Dark
- **Brand Dark** (#1c1e54): Deep indigo for immersive sections, footer backgrounds. Not black, not gray, but a branded indigo.

### Named Rules

**The Accent-Primary Rule.** Primary CTA buttons use Accent (#533afd) as background with white text. This is the brand anchor. Ghost/secondary buttons use transparent backgrounds with accent-colored text and light borders.

**The Deep-Navy Rule.** Headings use #061b31 (deep navy), never pure black (#000000). The blue undertone adds warmth and premium depth. Body text uses #64748d (slate), labels use #273951 (dark slate).

**The One-Accent Rule.** Indigo-violet is the only chromatic color in the UI system. If a second emphasis is needed, use weight or scale, never a second hue. Destructive/success/warning are semantic only.

## 3. Typography

**Primary:** Geist (already loaded in the project)
**Monospace:** Geist Mono (already loaded)

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Use |
|------|------|--------|-------------|----------------|-----|
| Display | 2rem (32px) | 300 | 1.1 | -0.04em | Page titles, hero headlines |
| Heading | 1.375rem (22px) | 300 | 1.1 | -0.02em | Section headings, feature titles |
| Title | 1rem (16px) | 300 | 1.3 | -0.01em | Card headings, sidebar employee names, modal headers |
| Body | 0.875rem (14px) | 400 | 1.5 | normal | Chat messages, descriptions, paragraph text |
| Body Small | 0.8125rem (13px) | 400 | 1.5 | normal | Secondary descriptions, timestamps |
| Button | 0.875rem (14px) | 400 | 1.0 | normal | Button text, navigation links |
| Label | 0.75rem (12px) | 400 | 1.4 | normal | Form labels, metadata, section labels |
| Caption | 0.6875rem (11px) | 300 | 1.4 | normal | Fine print, tiny labels |
| Mono | 0.75rem (12px) | 500 | 2.0 | normal | Code blocks, session IDs, technical metadata |

### Named Rules

**The Light-Weight Rule.** Weight 300 is the signature. Display, Heading, Title, and Caption all use weight 300. This is the opposite of convention: lightness as luxury. The text is so confident it doesn't need weight to be authoritative. Weight 400 is reserved for interactive text (buttons, links, body copy) where readability under quick scanning matters.

**The Progressive-Tracking Rule.** Letter-spacing tightens proportionally with size: -0.04em at display, -0.02em at heading, -0.01em at title, normal at body and below. This creates dense, engineered blocks at large sizes while preserving reading comfort at small sizes.

**The 14px-Body Rule.** Body text is 14px throughout the product UI. This is the Stripe/Linear dashboard standard for dense, productive interfaces.

**The Two-Weight Rule.** Primarily weight 300 (headings and reading) and weight 400 (UI interactions and body). No bold (600-700) in the primary font. Geist Mono uses 500 for code contrast.

## 4. Elevation & Shadows

Stripe's shadow system uses chromatic depth: blue-tinted shadows that echo the brand palette. Shadows don't just add depth; they add atmosphere. The multi-layer approach pairs a blue-tinted shadow (far, branded) with a neutral black shadow (near, grounding), creating parallax-like depth.

### Shadow Vocabulary

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, inline elements |
| Ambient (Level 1) | rgba(23,23,23,0.06) 0px 3px 6px | Subtle card lift, resting cards, hover hints |
| Standard (Level 2) | rgba(23,23,23,0.08) 0px 15px 35px | Standard cards, content panels |
| Elevated (Level 3) | rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px | Featured cards, dropdowns, popovers |
| Deep (Level 4) | rgba(3,3,39,0.25) 0px 14px 21px -14px, rgba(0,0,0,0.1) 0px 8px 17px -8px | Modals, floating panels |
| Focus Ring | 0 0 0 2px rgba(83,58,253,0.3) | Keyboard focus, input focus |

### Named Rules

**The Chromatic-Shadow Rule.** The primary shadow color is rgba(50,50,93,0.25): a deep blue-gray that echoes the navy-indigo palette. Never use pure gray or pure black shadows at the elevated and deep levels. The blue tint makes elevation feel on-brand.

**The Two-Layer Rule.** Elevated and deep shadows use two layers: a blue-tinted far shadow (larger offset, larger blur) paired with a neutral near shadow (smaller offset, smaller blur). Negative spread values (-30px, -18px) keep shadows vertical and controlled.

**The Ambient-Rest Rule.** Cards and containers at rest use Level 1 ambient shadows. This is not flat-at-rest; it's gentle atmospheric lift that gives the page dimensionality. Hover intensifies to Level 2 or Level 3.

## 5. Component Patterns

### Buttons

**Primary (Accent)**
- Background: #533afd, text: #ffffff
- Padding: 8px 16px, radius: 4px
- Font: 14px Geist weight 400
- Hover: #4434d4 background

**Ghost / Outlined**
- Background: transparent, text: #533afd
- Border: 1px solid #b9b9f9, radius: 4px
- Hover: rgba(83,58,253,0.05) background

**Neutral**
- Background: transparent, text: #273951
- Border: 1px solid #e5edf5, radius: 4px
- Hover: #f6f9fc background

### Cards & Containers
- Background: #ffffff
- Border: 1px solid #e5edf5
- Radius: 4px (tight), 6px (standard), 8px (featured)
- Shadow at rest: rgba(23,23,23,0.06) 0px 3px 6px (ambient)
- Shadow on hover: intensifies, may add blue-tinted layer

### Inputs & Forms
- Background: #ffffff, text: #061b31
- Border: 1px solid #e5edf5, radius: 4px
- Label: #273951, 14px Geist
- Placeholder: #64748d
- Focus: 1px solid #533afd + focus ring shadow

### Badges & Status
- Success: rgba(21,190,83,0.2) bg, #108c3d text, 1px solid rgba(21,190,83,0.4), 4px radius
- Neutral: #ffffff bg, 1px solid #e5edf5, 4px radius
- All badges use weight 300-400 at 10-11px

### Navigation
- White background, sticky with backdrop-filter blur(12px)
- Brand logotype left-aligned
- Links: 14px Geist weight 400, #061b31 text
- CTA: accent button right-aligned
- Bottom border: 1px solid #e5edf5

### Chat Components
- User bubble: #f6f9fc background, 8px radius, 8px 12px padding
- Assistant bubble: transparent background, no container
- Composer: #ffffff background, 1px solid #e5edf5, 8px radius, ambient shadow. Focus: accent border + focus ring.

## 6. Layout

### Structure
- **Sidebar width:** 256px fixed, collapsible to icon-only 48px.
- **Main content max-width:** 720px for chat threads, 960px for marketplace/files.
- **Right panel:** 320px on desktop, full-width slide-over on mobile.
- **Grid:** No column grid. Flexbox for layout, gap for spacing.

### Spacing
- Base unit: 8px
- Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px
- Dense at the small end (every 4px from 4-16) for precision alignment

### Whitespace Philosophy
- **Precision spacing.** Every gap is a deliberate typographic choice. Not vast minimalist emptiness, but measured, purposeful whitespace.
- **Dense data, generous chrome.** Data displays (tables, metadata) are tightly packed, but the UI chrome around them is generously spaced. Controlled density in a beautiful frame.

### Border Radius Scale
- 4px: Buttons, inputs, badges, cards. The workhorse.
- 6px: Standard card containers, navigation elements.
- 8px: Featured cards, hero elements, composer.
- Never pill-shaped (9999px) on cards or buttons. Conservative rounding is intentional.

### Motion
- **100-150ms:** Button press, toggle, hover color shift.
- **200ms:** Menu open/close, panel slide, shadow transitions.
- **Easing:** cubic-bezier(0.16, 1, 0.3, 1) for all transitions. No bounce, no elastic.
- **Reduced motion:** All non-essential animation collapsed via `prefers-reduced-motion`.

## 7. Do's and Don'ts

### Do
- **Do** use weight 300 for display, heading, and title text. Lightness is the signature.
- **Do** use #061b31 (deep navy) for headings instead of black. The warmth matters.
- **Do** apply blue-tinted shadows (rgba(50,50,93,0.25)) for elevated elements. Chromatic depth is the brand.
- **Do** layer shadows: blue-tinted far + neutral close for parallax depth.
- **Do** use #533afd (indigo-violet) as the primary CTA and interactive accent color.
- **Do** keep border-radius between 4px-8px. Conservative rounding is intentional.
- **Do** use negative letter-spacing on display and heading type (-0.04em to -0.01em progressive).
- **Do** use ambient shadows (Level 1) on resting cards. Gentle atmospheric lift, not flat.
- **Do** use 14px as the base body text size throughout the product.
- **Do** respect `prefers-reduced-motion` on every animation.
- **Do** show employee name and role prominently in the chat header and welcome state.

### Don't
- **Don't** use weight 600-700 for headlines. Weight 300 is the brand voice.
- **Don't** use pure black (#000000) for headings. Always deep navy (#061b31).
- **Don't** use neutral gray shadows on elevated elements. Always tint with blue (rgba(50,50,93,...)).
- **Don't** use large border-radius (12px+, pill shapes) on cards or buttons. Stripe is conservative.
- **Don't** use gradients in the product UI. Reserved for marketing/brand moments only.
- **Don't** apply positive letter-spacing at display sizes. Always track tight.
- **Don't** use warm accent colors (orange, yellow) for interactive elements.
- **Don't** use colored backgrounds on cards or containers. Surfaces are white or #f6f9fc only.
- **Don't** show raw UUIDs in the sidebar. Show chat titles, employee names, or dates.
- **Don't** leave empty states blank. Always provide context and suggested actions.
- **Don't** nest cards inside cards.
- **Don't** animate layout properties (width, height, padding). Use transform and opacity.
- **Don't** use bounce or elastic easing. Expo-out only.
