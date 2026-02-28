# Research: Frontend Technology Decisions

**Feature**: 1-ehr-frontend
**Date**: 2026-02-25
**Status**: Complete

## Overview

This document captures technology decisions made for the EHR Lite frontend, including options considered and rationale for each choice.

---

## 1. Frontend Framework

### Decision: Next.js 14+ with App Router

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Next.js 14 (App Router)** | Built-in routing, SSR/SSG, API routes, excellent DX, strong community | More opinionated than React |
| **React + Vite** | Simpler, faster dev server | Manual routing setup, no SSR |
| **Remix** | Great form handling, nested routing | Smaller ecosystem, steeper learning curve |

**Rationale**:
- Next.js 14 App Router provides file-based routing that maps cleanly to our page structure
- Server Components reduce client-side JavaScript
- Built-in image optimization for report galleries
- Easy deployment to static hosting (if needed later)
- Strong TypeScript support

**Alternatives Rejected**:
- Vite: Would require additional routing library (react-router)
- Remix: Overkill for local-first app, smaller ecosystem

---

## 2. Component Library

### Decision: shadcn/ui

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **shadcn/ui** | Copy-paste components, full ownership, Radix UI primitives, Tailwind | Initial setup required |
| **MUI** | Complete component set, popular | Heavy bundle, harder to customize |
| **Chakra UI** | Good accessibility, simple API | Larger bundle size |
| **Headless UI** | Unstyled, flexible | Requires more styling work |

**Rationale**:
- Components live in our codebase (full ownership, easy modification)
- Built on Radix UI (excellent accessibility)
- Tailwind CSS integration (consistent with our styling)
- No runtime dependency on component library
- Perfect for healthcare UI where customization matters

**Alternatives Rejected**:
- MUI: Too opinionated visually, harder to match our "simple & functional" style
- Chakra UI: Larger bundle, less control over component code

---

## 3. Styling

### Decision: Tailwind CSS 3.4+

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Tailwind CSS** | Utility-first, consistent, small production bundle, great DX | Initial learning curve |
| **CSS Modules** | Scoped styles, standard | More verbose, harder to share styles |
| **Styled Components** | CSS-in-JS, dynamic styling | Larger bundle, runtime overhead |

**Rationale**:
- shadcn/ui uses Tailwind (required dependency)
- Utility classes enable consistent spacing/colors
- No runtime CSS-in-JS overhead
- Easy to maintain design system via tailwind.config.ts

**Alternatives Rejected**:
- Styled Components: Unnecessary runtime overhead for local app
- Plain CSS: Harder to maintain consistency

---

## 4. Form State Management

### Decision: React Hook Form + Zod

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **React Hook Form + Zod** | Minimal re-renders, TypeScript-first, Zod schemas | Learning curve for Zod |
| **Formik** | Popular, well-documented | More re-renders, heavier |
| **TanStack Form** | Type-safe, modern | Smaller ecosystem |

**Rationale**:
- React Hook Form minimizes re-renders (important for 82-field diagnosis form)
- Zod provides runtime validation + TypeScript types in one
- Perfect for complex multi-step wizard
- Integrates with shadcn/ui form components

**Alternatives Rejected**:
- Formik: More re-renders = worse performance on large forms
- TanStack Form: Less mature, smaller community

---

## 5. HTTP Client

### Decision: Native fetch API with wrapper

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Native fetch** | Built-in, no dependencies, sufficient for needs | Manual error handling |
| **Axios** | Interceptors, automatic JSON, cancellation | 13KB bundle, unnecessary |
| **Ky** | Modern API, lightweight | Still external dependency |

**Rationale**:
- Fetch is built into modern browsers
- Local API (localhost) doesn't need retry/interceptor complexity
- We'll build a simple wrapper for consistent error handling
- Reduces bundle size

**Alternatives Rejected**:
- Axios: Overkill for local API, adds bundle size

---

## 6. Camera Capture

### Decision: navigator.mediaDevices.getUserMedia

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **getUserMedia API** | Native browser API, works on all modern browsers | Requires HTTPS (localhost exempt) |
| **html5-qrcode** | Barcode scanning built-in | Unnecessary features |
| **react-qr-reader** | React wrapper | Abstraction leak, dependencies |

**Rationale**:
- Native API is sufficient for camera access
- No external dependencies needed
- Fallback to `<input type="file" capture="environment">` for mobile
- We'll create a custom React hook for camera handling

**Alternatives Rejected**:
- html5-qrcode: Unnecessary complexity (we're not scanning barcodes)

---

## 7. Image Handling

### Decision: Client-side preview + Base64 for upload

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Base64 preview** | Simple, no temp files needed | 33% larger than binary |
| **Object URL (blob:)** | Efficient, no encoding | Memory management complexity |
| **Direct FormData** | No preview duplication | No preview until upload |

**Rationale**:
- Use Object URL for instant preview (no encoding delay)
- Convert to FormData for actual upload
- Display preview immediately after capture
- Clean up Object URLs to prevent memory leaks

**Alternatives Rejected**:
- Base64 encoding: Unnecessary for preview, slower

---

## 8. State Management

### Decision: React Query (TanStack Query)

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **TanStack Query** | Caching, refetching, optimistic updates | Additional dependency |
| **SWR** | Simpler API | Less feature-rich |
| **React Context + useState** | No dependencies | Manual caching/refetching |

**Rationale**:
- Automatic caching reduces API calls
- Refetch on window focus keeps data fresh
- Optimistic updates for better UX
- Handles loading/error states automatically

**Alternatives Rejected**:
- Manual state: Would need to build caching, invalidation logic

---

## 9. Type Generation

### Decision: Manual TypeScript types from schema

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Manual types** | Control, no toolchain, matches backend | Must stay in sync |
| **sql.js typed** | Automatic from DB | Complex setup, not aligned |
| **OpenAPI generator** | Auto from API spec | Backend doesn't have OpenAPI |

**Rationale**:
- Backend is simple, schema won't change often
- Manual types in `lib/db.types.ts`
- Keep types in sync via code review
- Simpler than automated toolchain

**Alternatives Rejected**:
- Automated tools: Overkill for stable schema

---

## 10. Testing Approach

### Decision: Vitest + React Testing Library

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Vitest + RTL** | Fast, Jest-compatible, Vite-native | Config required |
| **Jest + RTL** | Standard, popular | Slower, Vite incompatibility |
| **Playwright** | E2E testing | Slower, for different use case |

**Rationale**:
- Vitest is faster than Jest (native ESM)
- React Testing Library for component tests
- Focus on integration tests over unit tests
- Manual E2E testing for camera/flows

**Alternatives Rejected**:
- Jest: Slower, ESM compatibility issues with Next.js
- Playwright: Use for E2E later, not during development

---

## Summary

| Technology | Version | Decision |
|------------|---------|----------|
| Framework | Next.js 14.2+ | App Router for routing |
| UI Library | shadcn/ui | Copy-paste components |
| Styling | Tailwind CSS 3.4+ | Utility-first |
| Forms | React Hook Form 7.x | Minimal re-renders |
| Validation | Zod 3.x | Runtime + TS types |
| HTTP | Native fetch | Wrapper for consistency |
| Camera | getUserMedia API | Native browser API |
| State | TanStack Query 5.x | Caching + refetching |
| Testing | Vitest + RTL | Fast, compatible |

**No NEEDS CLARIFICATION items remain** - all technical decisions made.
