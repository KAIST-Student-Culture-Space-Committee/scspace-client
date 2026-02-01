# CLIENT KNOWLEDGE BASE

## OVERVIEW
Next.js 15 (App Router) frontend.
- **UI:** Chakra UI + Emotion. Atomic Design (`atoms`, `molecules`, `organisms`).
- **State:**
  - **Server Data:** TanStack Query via custom `useQueryApi` hook.
  - **Client UI:** Zustand (in `Store/`) for modal/filter state.
- **Forms:** React Hook Form + Zod.

## STRUCTURE
```
src/
├── app/           # Next.js App Router pages
├── Components/    # Atomic Design components
│   ├── atoms/     # Basic UI elements (AlertBtn, Field)
│   ├── molecules/ # Composition (buttons, forms)
│   └── organisms/ # Domain components (Header, Article)
├── Hooks/         # Custom React hooks
│   ├── useQueryApi.ts # Wrapper for TanStack Query
│   └── domain/        # Domain-specific hooks (useAuth, useUser)
├── Store/         # Zustand stores (UI state)
└── utils/         # Helper functions
```

## CONVENTIONS
- **Styling:** Chakra UI + Emotion. Tailwind config exists but is secondary/utility.
- **Data Fetching:** ALWAYS use `useQueryApi` wrapper. Never use `useQuery` directly.
- **State:**
  - `Store/`: Pure UI state (isModalOpen, activeFilter).
  - `Query`: All server data.
- **Imports:** Absolute imports preferred.

## ANTI-PATTERNS
- **Direct API Calls:** Never call `fetch`/`axios` directly in components.
- **Heavy Logic in UI:** Move logic to Hooks. Components should be presentational.
- **Bypassing useQueryApi:** Do not use raw `useQuery` or `fetch`.
