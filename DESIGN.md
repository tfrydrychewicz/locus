# Locus — System Design

> **Adaptive Cognitive Operating System for Engineering Leaders with ADHD**
>
> Desktop + Mobile · Local-First · AI-Native
>
> Version: 1.0 · March 2026

---

## Table of Contents

1. [Product Vision & Design Axioms](#1-product-vision--design-axioms)
2. [Target Users & Core Use Cases](#2-target-users--core-use-cases)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Monorepo Structure](#5-monorepo-structure)
6. [Domain Model](#6-domain-model)
7. [Core Subsystems](#7-core-subsystems)
   - 7.1 [Knowledge Management](#71-knowledge-management)
   - 7.2 [Productivity & Cognitive Support](#72-productivity--cognitive-support)
   - 7.3 [AI Subsystem](#73-ai-subsystem)
   - 7.4 [Meeting Intelligence](#74-meeting-intelligence)
   - 7.5 [Temporal Awareness Engine](#75-temporal-awareness-engine)
   - 7.6 [Reward & Gamification](#76-reward--gamification)
   - 7.7 [Sync Engine](#77-sync-engine)
8. [Data Layer](#8-data-layer)
9. [UI Architecture & Design System](#9-ui-architecture--design-system)
10. [API & IPC Layer](#10-api--ipc-layer)
11. [Cross-Platform Strategy](#11-cross-platform-strategy)
12. [Security & Privacy](#12-security--privacy)
13. [Scalability & Performance (Million-Note Scale)](#13-scalability--performance-million-note-scale)
14. [Testing Strategy](#14-testing-strategy)
15. [Observability & Error Handling](#15-observability--error-handling)
16. [Risks & Mitigations](#16-risks--mitigations)

---

## 1. Product Vision & Design Axioms

### Vision

Locus is a cognitive operating system that unifies knowledge management and adaptive productivity support into a single local-first platform for engineering leaders with ADHD. It captures everything — meetings, notes, decisions, people context — connects it via an AI-powered knowledge graph, and externalizes executive functions at the point of performance. The system adapts to fluctuating cognitive states through on-device ML, scheduling work around energy rather than the clock.

**One sentence:** Locus remembers so you don't have to, and activates you when importance alone can't.

### Design Axioms

Every feature, component, and interaction in Locus must satisfy at least one of these axioms. Any feature that violates one is a bug.

| # | Axiom | Evidence Base | Design Test |
|---|-------|---------------|-------------|
| 1 | **Externalize everything** | Barkley's prosthetic environment; ADHD as performance disorder (30% EF delay) | Does this feature offload an executive function? |
| 2 | **Capture is effortless** | Encoding bottleneck d = 0.69–2.15; Sweller's cognitive load theory | Does capture require zero categorization decisions? |
| 3 | **Activate through PINCH, not importance** | Dodson's interest-based nervous system; Volkow's dopamine findings (r = 0.39–0.41) | Does this surface novelty, challenge, or urgency? |
| 4 | **Predict, don't react** | JITAI framework (Hedges's g = 1.65 vs. waitlist) | Does the system intervene before focus collapses? |
| 5 | **Minimize the executive tax** | App graveyard phenomenon (12–47+ abandoned apps); Hick's Law | Does using this feature require fewer decisions than not using it? |
| 6 | **Context builds over time** | Encoding specificity (Tulving & Thomson); transactive memory (Wegner) | Does every interaction make the system smarter? |
| 7 | **Respect the inverted-U** | Arnsten's catecholamine dose-response in PFC | Does the UI balance stimulation between boredom and overload? |
| 8 | **User sovereignty** | Deshmukh 2025; 56% differently-treated-after-disclosure | Is all cognitive data local-only? Can the user override everything? |
| 9 | **Energy budgets over time budgets** | 75% circadian phase-delay; Kleitman's 90–120 min ultradian cycles | Does scheduling respect biological rhythms? |
| 10 | **Forgive inconsistency** | Interest-based nervous system produces variable engagement | Does the system punish gaps? Can users re-enter seamlessly? |

---

## 2. Target Users & Core Use Cases

### Primary Persona

Engineering managers / directors with ADHD managing 5–15 direct reports, multiple projects, and 15–30+ meetings/week. Works across macOS (primary) and iOS, with Android and Windows as secondary targets.

### Use Cases — Knowledge Management

| Problem | Locus Solution |
|---------|----------------|
| "I can't remember what we decided last week" | Auto-transcription + NER-linked meeting notes + semantic search |
| "I need to prep for my 1:1 in 10 min" | Daily Brief surfaces per-person context, open action items, and last-meeting topics |
| "I lose track of action items" | AI-extracted action items linked to source notes, surfaced contextually |
| "I saved it somewhere but can't find it" | Hybrid FTS + semantic search with query expansion; multiple retrieval pathways (temporal, semantic, contextual) |
| "I spend more time organizing than working" | Auto-tagging, auto-linking, auto-categorization; zero manual filing |

### Use Cases — Productivity & Cognitive Support

| Problem | Locus Solution |
|---------|----------------|
| "I can't start tasks even though I know they matter" | PINCH-based activation scoring; task decomposition; body doubling |
| "I lose track of time completely" | Persistent timers, transition alerts, duration calibration, visual timeline |
| "I crash after pushing too hard" | Energy modeling; ultradian enforcement; boom-bust prevention |
| "I make bad decisions in the afternoon" | Decision budget tracking; depletion warnings; defer suggestions |
| "I send emails I regret when frustrated" | Impulse delay; tone calibration; draft-and-review nudges |
| "Every productivity app ends up in my app graveyard" | Zero-decision startup; non-punitive design; works with 30s/day engagement |

---

## 3. System Architecture

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                  │
│                                                                            │
│  ┌────────────────┐   ┌────────────────┐   ┌───────────────────────────┐  │
│  │   Desktop App   │   │   Mobile App   │   │   Browser Extension      │  │
│  │   (Tauri v2)    │   │   (Expo/RN)    │   │   (Plasmo)               │  │
│  │                 │   │                │   │                           │  │
│  │  React 19       │   │  React Native  │   │  Capture + Focus Tracking│  │
│  │  + Rust Backend │   │  + Expo SQLite │   │                           │  │
│  └───────┬─────────┘   └───────┬────────┘   └────────────┬──────────────┘  │
│          │                     │                          │                  │
│          └─────────────────────┴──────────────────────────┘                  │
│                                │                                             │
│                    @locus/core (shared business logic)                       │
│                                │                                             │
├────────────────────────────────┼─────────────────────────────────────────────┤
│                         ON-DEVICE SERVICES                                   │
│                                                                              │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │  AI Engine       │  │  Cognitive    │  │  Knowledge Graph             │   │
│  │                  │  │  State        │  │                              │   │
│  │  • Multi-provider│  │  Tracker      │  │  • Entity system             │   │
│  │  • RAG pipeline  │  │              │  │  • Embedding pipeline        │   │
│  │  • On-device LLM │  │  • Behavioral │  │  • NER + auto-linking       │   │
│  │  • Embedding     │  │  • Wearable   │  │  • Semantic search          │   │
│  └─────────────────┘  │  • Self-report │  └──────────────────────────────┘   │
│                        └──────────────┘                                       │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │  JITAI Engine    │  │  Energy &     │  │  Temporal Awareness          │   │
│  │                  │  │  Rhythm       │  │                              │   │
│  │  • Intervention  │  │  Modeler      │  │  • Duration calibration      │   │
│  │    selection     │  │              │  │  • Transition alerts         │   │
│  │  • Learning loop │  │  • Chronotype │  │  • Time boxing              │   │
│  │  • Nudge catalog │  │  • Ultradian  │  │  • Visual timeline          │   │
│  └─────────────────┘  │  • Boom-bust  │  └──────────────────────────────┘   │
│                        └──────────────┘                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                                            │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  SQLite (WAL mode) + sqlite-vec (vector search) + FTS5              │   │
│  │  Event-sourced append-only activity log                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Sync: Automerge CRDT (optional, E2E encrypted, multi-device)       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────┤
│                         INTEGRATION LAYER                                     │
│                                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Calendar │ │ Jira /   │ │ Slack /  │ │ GitHub / │ │ Wearable (Apple  │ │
│  │ (Google, │ │ Linear   │ │ Teams    │ │ GitLab   │ │ Watch, Garmin)   │ │
│  │ O365)    │ │          │ │          │ │          │ │                  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Patterns

| Pattern | Where Applied | Rationale |
|---------|---------------|-----------|
| **Hexagonal (Ports & Adapters)** | `@locus/core` | Domain logic is framework-agnostic; external dependencies plug in via ports |
| **CQRS** | Command/Query separation in use cases | Read and write paths have different optimization needs |
| **Event Sourcing** | Activity log, intervention history | Full auditability; temporal queries; ML training data; undo/replay |
| **Repository Pattern** | Data access layer | Decouple domain from storage; testable with in-memory implementations |
| **Strategy Pattern** | AI providers, intervention selection, calendar providers | Swap implementations without changing consumers |
| **Observer/Pub-Sub** | Cross-module communication | Loose coupling between subsystems; reactive UI updates |
| **Mediator (Command Bus)** | Use case orchestration | Decouple callers from handlers; add cross-cutting concerns (logging, validation) |
| **Presentational/Container** | UI layer | Dumb components are reusable and testable in Storybook; containers wire state |
| **Atomic Design** | Component hierarchy | Consistent composition: atoms → molecules → organisms → templates → pages |
| **Feature Modules** | Code organization | Each domain area is a self-contained module with clear boundaries |

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Processing location | **Local-first, on-device** | Privacy sovereignty; no cognitive data leaves device; eliminates disclosure risk |
| Desktop runtime | **Tauri v2** | Native performance; Rust backend for ML/system APIs; ~10MB vs Electron's ~100MB |
| UI framework | **React 19** | Shared with React Native; largest ecosystem; best Storybook integration |
| Mobile framework | **Expo + React Native (New Architecture)** | Code sharing with desktop; native APIs for health/wearables |
| Database | **SQLite + sqlite-vec + FTS5** | Zero-config embedded; vector search + full-text in one engine |
| Sync | **Automerge CRDTs** | Offline-first; conflict-free multi-device sync without central authority |
| State management | **Zustand** | Lightweight; middleware support; works in React and React Native |
| AI inference | **On-device (ONNX/CoreML) + opt-in cloud** | Core features work offline; cloud only for optional higher-quality AI |

---

## 4. Technology Stack

### Core Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Desktop Shell** | Tauri v2 | ^2.x | Rust backend, native WebView, small binary, system API access |
| **Desktop Backend** | Rust | 2024 edition | Performance, safety, ML inference, SQLite, system APIs |
| **UI Framework** | React 19 | ^19.x | Shared component model for desktop + mobile; concurrent features |
| **Mobile** | Expo + React Native | SDK 52+ / 0.76+ | New Architecture (Fabric + TurboModules); Expo Router |
| **Language** | TypeScript | ^5.7 | Strict mode everywhere; satisfies constraint for both React and RN |
| **Build** | Vite 6 | ^6.x | Fast HMR, modern bundling, Tauri plugin |
| **Monorepo** | Turborepo + pnpm | latest | Fast builds, dependency management, caching |
| **State** | Zustand | ^5.x | Minimal boilerplate; middleware (persist, devtools); framework-agnostic stores |
| **Styling (Desktop)** | Tailwind CSS 4 | ^4.x | Utility-first; design tokens via CSS variables; tree-shaking |
| **Styling (Mobile)** | NativeWind | ^4.x | Tailwind for React Native; shared design tokens |
| **Component Docs** | Storybook 8 | ^8.x | Component-driven dev; visual testing; accessibility checks |
| **Internationalization** | react-i18next + i18next | latest | ICU MessageFormat; namespace-based; lazy-loaded per locale |
| **i18n Extraction** | i18next-parser | latest | Auto-extract keys from source; detect missing translations |
| **Theming** | Tailwind CSS dark/light | built-in | `class` strategy (`dark:` prefix); OS preference detection |

### Data & AI

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Database** | SQLite | via rusqlite (desktop) / expo-sqlite (mobile) | Embedded, zero-config, WAL mode |
| **Vector Search** | sqlite-vec | ^0.2.x | Native vec0 virtual tables; cosine/L2 distance |
| **Full-Text Search** | SQLite FTS5 | built-in | Tokenized search; rank functions |
| **ORM / Query** | Drizzle ORM | ^0.36.x | Type-safe; lightweight; SQLite support; schema-as-code |
| **Sync** | Automerge | ^2.x | CRDT; offline-first; no central server required |
| **AI — Anthropic** | @anthropic-ai/sdk | latest | Best reasoning for chat, summaries, NER |
| **AI — OpenAI** | openai SDK | latest | Embeddings (text-embedding-3-small), image gen |
| **AI — Local LLM** | llama.cpp (via Rust FFI) | latest | On-device task breakdown, summarization; no API dependency |
| **AI — Local STT** | Whisper.cpp (via Rust FFI) | latest | On-device speech-to-text; privacy-preserving |
| **AI — Local Embed** | ONNX Runtime (Rust) | latest | On-device embeddings (nomic-embed-text / BGE-small) |
| **ML Models** | ONNX Runtime | latest | Cognitive state classification; energy prediction |

### Rich Text & Visualization

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Editor** | TipTap 3 (ProseMirror) | Rich text, extensible, mention/link support, collaborative-ready |
| **Diagrams** | Mermaid + Excalidraw | Structured diagrams + freehand whiteboard |
| **Charts** | Recharts | React-native-compatible charting |
| **Icons** | Lucide React | Consistent, tree-shakeable icon library |
| **Markdown** | unified + remark + rehype | Extensible markdown pipeline |

### Testing & Quality

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Unit/Integration** | Vitest | Fast; Vite-native; compatible API |
| **Component Testing** | React Testing Library | Testing behavior, not implementation |
| **E2E (Desktop)** | Playwright | Cross-platform; Tauri WebDriver support |
| **E2E (Mobile)** | Maestro | Simple, reliable mobile E2E |
| **Visual Regression** | Storybook + Chromatic | Component screenshot comparison |
| **Type Checking** | tsc (strict mode) | Compile-time safety |
| **Linting** | Biome | Fast; replaces ESLint + Prettier; opinionated |
| **API Contract** | Zod | Runtime validation + TypeScript inference for IPC/API schemas |

---

## 5. Monorepo Structure

```
locus/
├── .cursor/
│   └── rules/                          # Cursor AI rules (see §14)
├── apps/
│   ├── desktop/                        # Tauri v2 desktop application
│   │   ├── src/
│   │   │   ├── main.tsx                # React entry point
│   │   │   ├── App.tsx                 # Root shell
│   │   │   ├── pages/                  # Page-level containers
│   │   │   │   ├── TodayPage.tsx       # Daily Brief / Command Center
│   │   │   │   ├── NotesPage.tsx       # Note list + editor
│   │   │   │   ├── EntitiesPage.tsx    # Entity browser
│   │   │   │   ├── TasksPage.tsx       # GTD task manager
│   │   │   │   ├── CalendarPage.tsx    # Calendar view
│   │   │   │   ├── SearchPage.tsx      # Semantic search
│   │   │   │   └── SettingsPage.tsx    # Settings
│   │   │   ├── containers/             # Smart components (wire state to UI)
│   │   │   ├── hooks/                  # Desktop-specific hooks
│   │   │   └── tauri/                  # Tauri command bindings
│   │   ├── src-tauri/                  # Rust backend
│   │   │   ├── src/
│   │   │   │   ├── main.rs             # Entry point
│   │   │   │   ├── commands/           # Tauri IPC command handlers
│   │   │   │   ├── db/                 # SQLite setup, migrations, queries
│   │   │   │   ├── ai/                 # AI provider adapters (Rust)
│   │   │   │   ├── transcription/      # Whisper.cpp integration
│   │   │   │   ├── embedding/          # ONNX embedding pipeline
│   │   │   │   ├── ml/                 # On-device ML models (cognitive state, energy)
│   │   │   │   ├── mic/                # Microphone monitoring (platform-native)
│   │   │   │   ├── sync/              # Automerge CRDT engine
│   │   │   │   └── platform/           # OS-specific (audio capture, notifications)
│   │   │   ├── migrations/             # SQL migration files
│   │   │   └── Cargo.toml
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── tauri.conf.json
│   │
│   ├── mobile/                         # Expo + React Native application
│   │   ├── app/                        # Expo Router file-based routing
│   │   │   ├── (tabs)/                 # Tab navigator
│   │   │   │   ├── today.tsx
│   │   │   │   ├── tasks.tsx
│   │   │   │   ├── capture.tsx
│   │   │   │   └── search.tsx
│   │   │   ├── notes/[id].tsx
│   │   │   └── settings.tsx
│   │   ├── components/                 # Mobile-specific containers
│   │   ├── hooks/                      # Mobile-specific hooks
│   │   ├── services/                   # Native module bridges
│   │   └── app.config.ts
│   │
│   └── storybook/                      # Storybook host application
│       ├── .storybook/
│       │   ├── main.ts
│       │   └── preview.ts
│       └── package.json
│
├── packages/
│   ├── core/                           # Domain logic (PURE TypeScript, zero dependencies)
│   │   ├── src/
│   │   │   ├── domain/                 # Domain models and value objects
│   │   │   │   ├── note.ts
│   │   │   │   ├── entity.ts
│   │   │   │   ├── task.ts
│   │   │   │   ├── calendar-event.ts
│   │   │   │   ├── cognitive-state.ts
│   │   │   │   ├── energy-block.ts
│   │   │   │   ├── intervention.ts
│   │   │   │   └── daily-brief.ts
│   │   │   ├── ports/                  # Interfaces (inbound + outbound)
│   │   │   │   ├── inbound/            # Use case interfaces
│   │   │   │   │   ├── note-commands.ts
│   │   │   │   │   ├── task-commands.ts
│   │   │   │   │   ├── search-queries.ts
│   │   │   │   │   └── ...
│   │   │   │   └── outbound/           # Repository / service interfaces
│   │   │   │       ├── note-repository.ts
│   │   │   │       ├── task-repository.ts
│   │   │   │       ├── ai-service.ts
│   │   │   │       ├── embedding-service.ts
│   │   │   │       ├── calendar-provider.ts
│   │   │   │       └── ...
│   │   │   ├── use-cases/              # Application services
│   │   │   │   ├── notes/
│   │   │   │   ├── tasks/
│   │   │   │   ├── search/
│   │   │   │   ├── calendar/
│   │   │   │   ├── daily-brief/
│   │   │   │   ├── cognitive/
│   │   │   │   └── interventions/
│   │   │   ├── lql/                    # Locus Query Language (computed fields)
│   │   │   │   ├── parser.ts           # LQL → AST
│   │   │   │   ├── evaluator.ts        # AST → entity results
│   │   │   │   └── types.ts            # LQL AST types
│   │   │   ├── events/                 # Domain events
│   │   │   │   ├── event-types.ts
│   │   │   │   └── event-bus.ts
│   │   │   └── validation/             # Zod schemas for domain validation
│   │   └── package.json
│   │
│   ├── ui/                             # Shared React UI components (DUMB)
│   │   ├── src/
│   │   │   ├── atoms/                  # Buttons, inputs, badges, chips, icons
│   │   │   ├── molecules/              # Search bars, form fields, cards, timers
│   │   │   ├── organisms/              # Task cards, note previews, entity chips
│   │   │   ├── templates/              # Page layouts, split views, modals
│   │   │   ├── charts/                 # Data visualization components
│   │   │   └── index.ts                # Public API barrel export
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui-native/                      # React Native UI components (DUMB)
│   │   ├── src/
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   ├── organisms/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── tokens/                         # Design tokens (shared across platforms)
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   ├── animation.ts
│   │   │   └── index.ts
│   │   ├── tailwind.preset.ts          # Tailwind preset from tokens
│   │   └── package.json
│   │
│   ├── ai/                             # AI subsystem (TypeScript, used by Tauri commands)
│   │   ├── src/
│   │   │   ├── providers/              # Provider adapters (Anthropic, OpenAI, Ollama)
│   │   │   ├── feature-slots.ts        # Feature slot registry
│   │   │   ├── model-router.ts         # Fallback chain resolution
│   │   │   ├── embedding/              # Embedding pipeline (chunk, embed, cluster)
│   │   │   ├── ner/                    # Named Entity Recognition
│   │   │   ├── summarizer/             # Note and meeting summarization
│   │   │   ├── task-extractor/         # Action item extraction
│   │   │   ├── search/                 # Query expansion + re-ranking
│   │   │   └── prompts/                # Prompt templates (version-controlled)
│   │   └── package.json
│   │
│   ├── cognitive/                      # Cognitive state tracking & JITAI
│   │   ├── src/
│   │   │   ├── state-tracker.ts        # Behavioral signal processing
│   │   │   ├── energy-modeler.ts       # Rhythm and energy prediction
│   │   │   ├── jitai-engine.ts         # Intervention selection
│   │   │   ├── intervention-catalog.ts # Available interventions
│   │   │   ├── learning-loop.ts        # Personalization ML
│   │   │   └── pinch-scorer.ts         # Interest-based activation scoring
│   │   └── package.json
│   │
│   ├── i18n/                           # Internationalization
│   │   ├── src/
│   │   │   ├── index.ts                # i18next setup + provider
│   │   │   ├── useTranslation.ts       # Typed translation hook
│   │   │   └── types.ts                # Generated types from EN namespace
│   │   ├── locales/
│   │   │   ├── en/                     # English (source of truth)
│   │   │   │   ├── common.json         # Shared: buttons, labels, status
│   │   │   │   ├── notes.json          # Notes feature
│   │   │   │   ├── tasks.json          # Tasks / GTD feature
│   │   │   │   ├── calendar.json       # Calendar feature
│   │   │   │   ├── search.json         # Search feature
│   │   │   │   ├── ai.json             # AI chat / features
│   │   │   │   ├── settings.json       # Settings
│   │   │   │   ├── cognitive.json      # Cognitive state / JITAI
│   │   │   │   └── help.json           # Contextual help content
│   │   │   └── pl/                     # Polish (mandatory, always complete)
│   │   │       ├── common.json
│   │   │       ├── notes.json
│   │   │       ├── tasks.json
│   │   │       ├── calendar.json
│   │   │       ├── search.json
│   │   │       ├── ai.json
│   │   │       ├── settings.json
│   │   │       ├── cognitive.json
│   │   │       └── help.json
│   │   ├── i18next-parser.config.ts    # Auto-extract keys; CI enforcement
│   │   └── package.json
│   │
│   ├── help/                           # Contextual help & documentation
│   │   ├── src/
│   │   │   ├── HelpButton.tsx          # "?" button component (shared UI)
│   │   │   ├── HelpPanel.tsx           # Slide-out help panel
│   │   │   ├── HelpProvider.tsx        # Context provider for help topics
│   │   │   ├── useHelp.ts              # Hook: useHelp('notes.editor')
│   │   │   └── help-registry.ts        # Topic → content mapping
│   │   ├── content/
│   │   │   ├── en/                     # English help articles (MDX)
│   │   │   │   ├── getting-started.mdx
│   │   │   │   ├── notes/
│   │   │   │   │   ├── editor.mdx
│   │   │   │   │   ├── mentions.mdx
│   │   │   │   │   └── search.mdx
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── gtd.mdx
│   │   │   │   │   ├── pinch.mdx
│   │   │   │   │   └── breakdown.mdx
│   │   │   │   ├── cognitive/
│   │   │   │   │   ├── energy.mdx
│   │   │   │   │   ├── jitai.mdx
│   │   │   │   │   └── modes.mdx
│   │   │   │   └── settings/
│   │   │   │       ├── ai-providers.mdx
│   │   │   │       └── calendar-sync.mdx
│   │   │   └── pl/                     # Polish help articles (MDX)
│   │   │       └── ...                 # Mirror of en/ structure
│   │   └── package.json
│   │
│   ├── shared/                         # Shared utilities
│   │   ├── src/
│   │   │   ├── result.ts               # Result<T, E> type
│   │   │   ├── event-emitter.ts        # Typed event emitter
│   │   │   ├── date-utils.ts
│   │   │   ├── id.ts                   # ULID generation
│   │   │   └── schemas.ts              # Shared Zod schemas
│   │   └── package.json
│   │
│   └── config/                         # Shared configs
│       ├── tsconfig.base.json
│       ├── tsconfig.react.json
│       ├── biome.json
│       └── vitest.shared.ts
│
├── turbo.json                          # Turborepo pipeline config
├── pnpm-workspace.yaml
├── package.json
├── DESIGN.md                           # This document
└── IMPLEMENTATION_PLAN.md              # Phased delivery plan
```

### Package Dependency Graph

```
apps/desktop ──► packages/ui ──► packages/tokens
     │                │
     ├──► packages/core ◄──┤
     │         │            │
     │         ▼            │
     ├──► packages/ai       │
     │                      │
     ├──► packages/cognitive│
     │                      │
     └──► packages/shared ◄─┘

apps/mobile ──► packages/ui-native ──► packages/tokens
     │
     ├──► packages/core
     ├──► packages/cognitive
     └──► packages/shared

apps/storybook ──► packages/ui ──► packages/tokens
```

**Rule:** `packages/core` has ZERO external dependencies (pure TypeScript). All I/O is abstracted behind ports. This guarantees testability and platform independence.

---

## 6. Domain Model

### Core Entities

```typescript
// packages/core/src/domain/

// --- Knowledge Management ---

interface Note {
  id: ULID
  title: string
  body: TipTapDocument        // structured rich text
  bodyPlain: string           // extracted plain text for FTS
  templateId?: ULID
  embeddingDirty: boolean
  createdAt: DateTime
  updatedAt: DateTime
  archivedAt?: DateTime       // soft-delete
}

interface Entity {
  id: ULID
  name: string
  typeId: ULID
  fields: Record<string, unknown>  // dynamic fields per type schema
  trashedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}

interface EntityType {
  id: ULID
  name: string
  icon: string
  color: string
  schema: FieldDefinition[]   // JSON schema for entity fields
  reviewConfig?: ReviewConfig
  builtIn: boolean
}

// Field type system — including computed queries
interface FieldDefinition {
  name: string
  type: FieldType
  required?: boolean
  options?: string[]                 // for 'select' / 'multi_select'
  refEntityTypeId?: ULID             // for 'entity_ref' / 'entity_ref_list'
  query?: string                     // for 'computed_query' — LQL expression
  isEmailField?: boolean             // flag for attendee matching
}

type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'text_list'
  | 'entity_ref'           // reference to a single entity
  | 'entity_ref_list'      // multiple entity references
  | 'computed_query'        // dynamically evaluated LQL query (read-only)

// Computed query examples (LQL — Locus Query Language):
//   "select p from Person where p.team = {this}"
//   "select proj from Project where proj.team = {this} and proj.status = 'active'"
//   "select team from Team where team.parent_team = {this}"

// Built-in types: Person, Project, Team, Decision, OKR

interface NoteChunk {
  id: number
  noteId: ULID
  chunkText: string
  chunkContext?: string       // contextual prefix for retrieval
  layer: 1 | 2 | 3           // 1=raw, 2=summary, 3=cluster
  position: number
}

interface EntityMention {
  id: number
  noteId: ULID
  entityId: ULID
  mentionType: 'manual' | 'auto_detected'
  confidence?: number
  matchedTexts?: string[]
}

interface NoteRelation {
  sourceNoteId: ULID
  targetNoteId: ULID
  relationType: 'references' | 'follows_up' | 'contradicts' | 'supersedes'
  strength?: number
}

// --- Productivity & Cognitive ---

interface Task {
  id: ULID
  title: string
  body?: string
  status: 'captured' | 'ready' | 'active' | 'blocked' | 'done' | 'archived'
  sourceNoteId?: ULID
  assignedEntityId?: ULID
  projectEntityId?: ULID
  dueDate?: DateTime
  parentId?: ULID             // sub-tasks

  // GTD extensions
  contexts: string[]
  energyLevel?: 'low' | 'medium' | 'high'
  isWaitingFor: boolean
  waitingForEntityId?: ULID
  isSomeday: boolean
  isNextAction: boolean

  // PINCH activation
  activationScore?: ActivationScore

  // Time estimation
  estimatedMinutes?: number
  calibratedMinutes?: number  // system-adjusted
  domain?: 'maker' | 'manager' | 'admin'

  extractionType: 'manual' | 'ai_extracted'
  confidence?: number
  createdAt: DateTime
  updatedAt: DateTime
  completedAt?: DateTime
}

interface ActivationScore {
  passion: number             // alignment with stated interests
  interest: number            // novelty; decays with exposure
  novelty: number             // new type of task?
  challenge: number           // cognitive sweet spot
  hurry: number               // deadline proximity
  composite: number           // weighted combination
}

interface CognitiveState {
  timestamp: DateTime
  attention: number           // 0 = scattered, 1 = deep focus
  arousal: number             // inverted-U optimal ≈ 0.5
  energy: number              // depletion over day
  emotionalValence: number    // -1 = dysregulated, +1 = positive
  confidence: number          // model confidence in estimate
  mode: 'hyperfocus' | 'flow' | 'drift' | 'depleted' | 'dysregulated' | 'startup'
}

interface EnergyBlock {
  id: ULID
  timeRange: TimeRange
  predictedEnergy: number
  actualEnergy?: number       // post-hoc self-report
  taskId?: ULID
  blockType: 'deep_work' | 'meeting' | 'admin' | 'break' | 'buffer'
  cognitiveStateSamples: CognitiveState[]
}

interface Intervention {
  id: ULID
  type: InterventionType
  level: 0 | 1 | 2 | 3
  deliveredAt: DateTime
  stateAtDelivery: CognitiveState
  userResponse: 'accepted' | 'dismissed' | 'snoozed' | 'ignored'
  stateDelta5min?: CognitiveState
  context: InterventionContext
}

interface RhythmProfile {
  chronotype: 'morning' | 'afternoon' | 'evening' | 'auto'
  peakWindows: TimeRange[]
  ultradianCycleMinutes: number   // typically 80–120
  recoveryRate: number
  boomBustTendency: number
  meetingRecoveryCost: number
  decisionBudget: number
}

// --- Calendar ---

interface CalendarEvent {
  id: number
  externalId?: string
  sourceId?: ULID
  title: string
  startAt: DateTime
  endAt: DateTime
  attendees: Attendee[]
  linkedNoteId?: ULID
  transcriptNoteId?: ULID
  recurrenceRule?: string
}

// --- Daily Brief ---

interface DailyBrief {
  id: number
  date: DateString
  content: string             // structured markdown
  calendarSnapshot?: string
  pendingActionsSnapshot?: string
  generatedAt: DateTime
  acknowledgedAt?: DateTime
}

// --- Event Sourcing ---

interface DomainEvent {
  id: ULID
  timestamp: DateTime
  type: EventType
  entityId: ULID
  payload: Record<string, unknown>
  source: 'user' | 'system' | 'integration'
}

type EventType =
  | 'task.created' | 'task.updated' | 'task.completed'
  | 'note.created' | 'note.updated' | 'note.archived'
  | 'focus_session.started' | 'focus_session.ended'
  | 'intervention.delivered' | 'intervention.responded'
  | 'context_switch.detected' | 'context.restored'
  | 'meeting.started' | 'meeting.ended'
  | 'energy.reported' | 'cognitive_state.updated'
  | 'break.started' | 'break.ended'
  | 'daily_shutdown.completed'
```

### Ports (Hexagonal Architecture)

```typescript
// packages/core/src/ports/outbound/

// Cursor-based pagination for million-note scale
interface Page<T> {
  items: T[]
  cursor: string | null       // opaque cursor for next page; null = last page
  totalEstimate?: number      // approximate total (avoid COUNT(*) on large tables)
}

interface PaginationParams {
  cursor?: string             // resume from this position
  limit?: number              // page size (default 50, max 200)
}

interface NoteRepository {
  findById(id: ULID): Promise<Note | null>
  findAll(filter?: NoteFilter, page?: PaginationParams): Promise<Page<Note>>
  save(note: Note): Promise<void>
  softDelete(id: ULID): Promise<void>
  hardDelete(id: ULID): Promise<void>
  searchFTS(query: string, limit?: number): Promise<NoteSearchResult[]>
  countByFilter(filter?: NoteFilter): Promise<number>  // cached, refreshed periodically
}

interface TaskRepository {
  findById(id: ULID): Promise<Task | null>
  findByFilter(filter: TaskFilter, page?: PaginationParams): Promise<Page<Task>>
  save(task: Task): Promise<void>
  delete(id: ULID): Promise<void>
}

interface EmbeddingService {
  embed(texts: string[]): Promise<Float32Array[]>
  searchSimilar(query: Float32Array, topK: number, layer?: 1|2|3): Promise<VectorResult[]>
}

interface AIService {
  chat(params: ChatParams): Promise<ChatResponse>
  summarize(text: string): Promise<string>
  extractEntities(text: string, knownEntities: Entity[]): Promise<EntityMention[]>
  extractActions(text: string): Promise<ExtractedAction[]>
  expandQuery(query: string): Promise<string[]>
  rerank(query: string, results: SearchResult[]): Promise<SearchResult[]>
}

interface CognitiveStateService {
  getCurrentState(): CognitiveState
  predictEnergy(timeRange: TimeRange): number
  getInterventionRecommendation(state: CognitiveState, context: Context): Intervention
}

interface CalendarProvider {
  fetchEvents(range: TimeRange): Promise<CalendarEvent[]>
  createEvent(event: CalendarEvent): Promise<CalendarEvent>
  updateEvent(event: CalendarEvent): Promise<void>
}

interface EventStore {
  append(event: DomainEvent): Promise<void>
  query(filter: EventFilter): Promise<DomainEvent[]>
  queryAfter(timestamp: DateTime, types?: EventType[]): Promise<DomainEvent[]>
}

interface SyncService {
  pushChanges(changes: Change[]): Promise<void>
  pullChanges(): Promise<Change[]>
  resolveConflicts(local: Document, remote: Document): Document
}
```

---

## 7. Core Subsystems

### 7.1 Knowledge Management

#### Note System

The note editor is built on TipTap v3 (ProseMirror) with custom extensions for ADHD-optimized capture:

| Extension | Purpose |
|-----------|---------|
| `SlashCommand` | `/` trigger → command palette (task, date, callout, diagram) |
| `AISpace` | Space on empty line → AI prompt modal |
| `MentionEntity` | `@` trigger → entity search and link |
| `MentionNoteLink` | `[[` trigger → note search with create option |
| `Callout` | Info/warning/success/danger callout blocks |
| `ExcalidrawEmbed` | Inline whiteboard drawings |
| `AutoMentionDecoration` | Highlights NER-detected entity spans |
| `ActionTaskItem` | GTD task items with attribute chips |

**Auto-save:** 500ms debounce. Each save triggers (fire-and-forget):
1. FTS5 index update
2. Entity mention rebuild (manual @mentions)
3. Note relation rebuild (from `[[links]]`)
4. Background NER for auto-detected mentions
5. Background embedding pipeline (deferred to focus loss)

#### Embedding & Retrieval Pipeline (RAPTOR+)

Three-layer hierarchical embedding for retrieval at different granularities:

```
L3 — Cluster Summaries (nightly batch, K-means++ on L2, LLM-labeled)
     ↑
L2 — Note Summaries (one per note, LLM-generated on save)
     ↑
L1 — Raw Chunks (~1600 char, sentence-bounded, ~200 char overlap)
```

**Chunking:** Sentence-bounded splitting at ~1600 chars with ~200 char overlap. Each chunk prefixed with `Note: {title}` for contextual retrieval.

**Search pipeline:**

```
Query → [Parallel] → Query Expansion (LLM)
                    → Embed Query (vector)
      → [Parallel] → FTS5 OR search on expanded terms (top 20)
                    → KNN on chunk_embeddings (top 20)
      → Reciprocal Rank Fusion (k=60, L3 boost +0.05)
      → Re-rank (LLM)
      → Return top 15 with excerpts
```

Graceful degradation: FTS5-only if no embedding model configured.

#### Entity System (Knowledge Graph)

Five built-in entity types (Person, Project, Team, Decision, OKR) with user-definable custom types. Dynamic field schemas support: text, number, date, select, multi_select, text_list, entity_ref, entity_ref_list, and **computed_query**.

#### Computed Query Fields (LQL)

Computed fields are read-only fields whose values are dynamically derived by evaluating an LQL (Locus Query Language) expression against the entity system. They enable relational views without manual data entry.

**Examples (built-in Team entity type):**

| Field | Type | Query |
|-------|------|-------|
| `members` | computed_query | `select p from Person where p.team = {this}` |
| `active_projects` | computed_query | `select proj from Project where proj.team = {this} and proj.status = 'active'` |
| `sub_teams` | computed_query | `select team from Team where team.parent_team = {this}` |

**LQL Specification:**

```
LQL Grammar:
  query       = "select" identifier "from" EntityType where_clause?
  where_clause = "where" condition ("and" condition)*
  condition   = field_path operator value
  field_path  = identifier ("." identifier)*
  operator    = "=" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "in"
  value       = string_literal | number | "{this}" | "{today}" | "null"
  {this}      = reference to the current entity
  {today}     = current date (for date field comparisons)
```

**Implementation:**

- LQL is parsed at entity type save time → AST stored in the schema definition.
- On entity detail view, computed fields are evaluated lazily (only when the entity detail panel is open).
- Results are cached per entity with a 30-second TTL; invalidated on entity save events.
- Computed fields render as a list of entity chips (clickable, same as entity_ref_list display).
- A `QueryFieldEditor` component provides syntax highlighting and autocomplete for LQL in the entity type editor.
- Computed fields are indexed for the knowledge graph: they contribute to entity co-occurrence without manual linking.

NER runs on every note save and auto-detects entity mentions by matching against existing entities. Bidirectional links, backlinks, and entity co-occurrence form the knowledge graph.

**Entity Reviews:** Periodic AI-generated reviews for entities with configurable frequency (daily/weekly/biweekly/monthly). Type-aware prompts (Person → relationship focus, Project → health/blockers, etc.).

#### Daily Briefs

Auto-generated morning briefings that surface:
- Overdue items requiring attention
- Today's meetings with per-person context from previous meetings
- Open action items with project context
- Stale follow-ups (configurable threshold)
- Proactive insights from the knowledge graph

### 7.2 Productivity & Cognitive Support

#### Cognitive State Tracker

Continuously estimates the user's cognitive state along four dimensions:

| Dimension | Signals | Source |
|-----------|---------|--------|
| **Attention** | App switch frequency, typing cadence, idle gaps, tab dwell time | OS activity monitor |
| **Arousal** | HRV, EDA, skin temperature | Wearable (optional) |
| **Energy** | Time since break, decision count, meeting load, self-report | Activity log + calendar |
| **Emotional valence** | Communication sentiment, self-report | NLP on drafts (local) |

**Operating modes derived from state:**

| Mode | Trigger | System Behavior |
|------|---------|-----------------|
| **Hyperfocus** | attention > 0.85 sustained > 10 min | Shield interruptions; defer notifications; gentle time pulse every 25 min |
| **Flow** | attention 0.6–0.85, arousal 0.4–0.6 | Normal operation; light ambient cues |
| **Drift** | attention < 0.4 for > 3 min | Graduated JITAI nudges; suggest body double; surface interest-aligned tasks |
| **Depleted** | energy < 0.2 | Suggest break; shift to low-EF tasks; offer recovery ritual |
| **Dysregulated** | emotional_valence < -0.5 | Delay outbound comms; offer CBT micro-intervention |
| **Startup** | first 30 min of work session | Zero-decision task selection; momentum-building micro-tasks |

#### JITAI Engine (Just-in-Time Adaptive Intervention)

Implements Nahum-Shani's six-element JITAI framework (meta-analytic effect Hedges's g = 1.65):

**Graduated intervention catalog:**

```
Level 0 — Ambient (non-interruptive)
  ├── Background color temperature shift
  ├── Subtle progress animation
  └── Wearable haptic pulse (single gentle tap)

Level 1 — Suggestion (dismissible, peripheral)
  ├── "You've been on this 47 min. Stretch?"
  ├── Next-task preview in sidebar
  └── Interest-reframe: "This connects to the auth redesign you liked"

Level 2 — Nudge (minimal interaction)
  ├── Focus check-in: "Still on [task]? 👍/🔄/⏸"
  ├── Decision offload: "Pick one: A or B"
  └── Timer proposal: "25 min sprint?"

Level 3 — Direct (structured intervention)
  ├── Guided task breakdown
  ├── CBT thought record for stuck states
  └── Forced break with re-engagement ritual
```

**Learning loop:** Every intervention records `{intervention_id, state_at_delivery, user_response, state_delta_5min}`. A lightweight on-device model (gradient-boosted trees, < 5 MB) trains weekly to personalize effectiveness. Initial cold-start uses research-derived defaults.

#### Energy & Rhythm Modeler

Replaces time-based planning with energy-aware planning.

**Scheduling rules:**
1. Peak windows → deep work (architecture decisions, writing, difficult conversations)
2. Trough windows → low-EF tasks (email, routine reviews, admin)
3. Ultradian enforcement → auto-insert breaks at cycle boundaries (80–120 min)
4. Meeting clustering → consolidate meetings; protect one 2h deep work block daily
5. Decision budget tracking → warn at 70% and 90% depletion
6. Boom-bust prevention → detect extended hyperfocus > 2× ultradian cycle; escalate breaks

#### Task Intelligence (PINCH Scoring)

Tasks are scored for neurological activation, not just importance:

```
ActivationScore = f(Passion, Interest, Novelty, Challenge, Hurry)
```

When the user asks "what should I work on?", the system presents 2–3 options ranked by `ActivationScore × EnergyFit × Priority`, eliminating decision paralysis. AI-powered task breakdown with adjustable granularity.

#### Working Memory Externalizer

- **Global capture hotkey** (e.g., `Cmd+Shift+Space`): minimal overlay from anywhere
- **Voice capture** with on-device Whisper transcription
- **Zero-categorization inbox**: items captured raw; AI suggests organization later
- **"Not Now" list**: intrusive ideas captured during focus without breaking flow
- **Context snapshots** on task switch: open files, scroll positions, draft state, mental note

#### Mode Switching (Maker / Manager / Admin)

Engineering managers oscillate between modes. Each mode surfaces relevant tools/data and automatically inserts 10-min cognitive buffer on transition.

#### Stakeholder Communication Guard

- **Impulse delay**: On detected emotional dysregulation, suggest "Save as draft, review in 15 min?"
- **Tone calibration**: Optional AI tone-check on outgoing messages
- **Response batching**: Non-urgent messages queued for communication windows

### 7.3 AI Subsystem

#### Multi-Provider Architecture

```
Feature Slot Registry (15+ slots, each with fallback chain)
         │
    Model Router (resolveChain → callWithFallback)
         │
    ┌────┴────┬──────────┬─────────┬────────┐
    │Anthropic│  OpenAI  │ Ollama  │ Local  │
    │(chat)   │(chat,emb)│(chat)   │(ONNX)  │
    └─────────┴──────────┴─────────┴────────┘
```

**Feature slots:**

| Slot | Default | Purpose |
|------|---------|---------|
| `chat` | claude-sonnet | AI chat conversations |
| `daily_brief` | claude-sonnet | Morning briefing generation |
| `note_summary` | claude-haiku | L2 note summaries |
| `ner` | claude-haiku / local | Named Entity Recognition |
| `action_extract` | claude-haiku | Task extraction from notes |
| `task_clarify` | claude-haiku | GTD attribute derivation |
| `inline_ai` | claude-haiku | Inline AI in editor |
| `meeting_summary` | claude-haiku | Transcript summarization |
| `query_expand` | claude-haiku | Search query expansion |
| `rerank` | claude-haiku | Search result re-ranking |
| `entity_review` | claude-haiku | Periodic entity reviews |
| `embedding` | text-embedding-3-small / local | Vector embeddings |
| `task_breakdown` | local LLM / cloud | PINCH-aware task decomposition |
| `tone_check` | claude-haiku | Communication tone calibration |
| `cognitive_insight` | local LLM | Cognitive state interpretation |

**On-device ML models:**

| Model | Purpose | Architecture | Size |
|-------|---------|-------------|------|
| Attention classifier | Predict attention from behavioral signals | Gradient-boosted trees | < 5 MB |
| Energy predictor | Forecast energy for scheduling | LSTM | < 10 MB |
| Intervention recommender | Select optimal intervention | Contextual bandit (LinUCB) | < 2 MB |
| Duration calibrator | Adjust time estimates | Bayesian regression | < 1 MB |
| Embeddings (local) | Vector embeddings | nomic-embed-text (ONNX) | ~275 MB |
| STT (local) | Speech-to-text | Whisper small/medium | ~500 MB |

### 7.4 Meeting Intelligence

**Pre-meeting** (auto, 15 min before):
- Agenda from calendar + linked docs
- Context: last meeting with attendees, open action items
- Suggested talking points from team data

**During meeting:**
- Real-time local transcription (Whisper) with speaker diarization
- AI-highlighted decisions and action items
- One-tap action item capture

**Post-meeting:**
- Auto-generated summary with extracted action items
- Action items pushed to task system with ownership and deadlines
- Follow-up drafts for decisions needing communication
- Decompression prompt if high-emotional-load (detected via sentiment)

**STT Tiered Backends:**

| Tier | Backend | Latency | Privacy |
|------|---------|---------|---------|
| 1 | ElevenLabs Scribe v2 (WebSocket) | < 150ms | Cloud |
| 2 | Deepgram Nova-3 (WebSocket) | < 200ms | Cloud |
| 3 | Whisper.cpp (on-device, Rust) | Batch | Fully local |

### 7.5 Temporal Awareness Engine

| Component | Description |
|-----------|-------------|
| **Persistent time display** | Always-visible elapsed timer on current task; color shifts as block progresses |
| **Duration calibrator** | Tracks estimated vs. actual duration; shows "your estimate: 30 min / historical actual: 52 min" |
| **Transition alerts** | T-15, T-10, T-5 before meetings/deadlines; adapts to individual transition time |
| **Time-boxing** | Visible countdown; expiry triggers "continue / switch / break?" not failure |
| **Visual timeline** | Tiimo-inspired day ribbon: past → present → future as continuous spatial dimension |
| **Deadline proximity** | Approaching deadlines rendered as growing visual indicators, not static dates |

### 7.6 Reward & Gamification

Compensates for ventral-striatal hyporesponsiveness (d = 0.48–0.58). All rewards are immediate, variable, non-punitive, and intrinsically connected to progress.

| Mechanic | Description |
|----------|-------------|
| **Micro-completions** | Satisfying animation + sound + haptic on task completion |
| **Progress crystallization** | Completed tasks as accumulated visual artifacts; permanent |
| **Momentum meter** | Real-time visualization that builds during focus |
| **Surprise rewards** | Random reinforcement: "40 min focused — longest this week" |
| **Streak-free consistency** | Track "days active" without streak counters; no guilt from gaps |

### 7.7 Sync Engine

**Architecture:** Automerge CRDTs for conflict-free offline-first sync.

```
Device A                          Sync Server                     Device B
   │                              (zero-knowledge)                    │
   │  Local changes ──────────►  E2E encrypted                       │
   │                              blob storage  ──────────►  Merge   │
   │  ◄────────────────────────  (no decryption                      │
   │                              capability)   ◄──────────  changes │
```

- User holds encryption keys; server stores opaque blobs
- Sync is optional; app fully functional offline
- Conflict resolution is automatic (CRDTs guarantee convergence)
- Selective sync: user chooses which data types sync

---

## 8. Data Layer

### SQLite Schema (Core Tables)

```sql
-- Knowledge Management
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled',
  body TEXT NOT NULL DEFAULT '',
  body_plain TEXT NOT NULL DEFAULT '',
  template_id TEXT,
  embedding_dirty INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  archived_at TEXT
);

CREATE VIRTUAL TABLE notes_fts USING fts5(
  title, body_plain,
  content='notes', content_rowid='rowid',
  tokenize='unicode61'
);

CREATE TABLE note_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_context TEXT,
  layer INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE entity_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#888888',
  schema TEXT NOT NULL DEFAULT '[]',
  built_in INTEGER DEFAULT 0,
  review_enabled INTEGER DEFAULT 0,
  review_frequency TEXT DEFAULT 'weekly',
  review_day TEXT,
  review_time TEXT DEFAULT '07:00',
  review_guidance TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type_id TEXT NOT NULL REFERENCES entity_types(id),
  fields TEXT NOT NULL DEFAULT '{}',
  trashed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE entity_mentions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  mention_type TEXT NOT NULL DEFAULT 'manual',
  confidence REAL,
  matched_texts TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE note_relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL DEFAULT 'references',
  strength REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source_note_id, target_note_id, relation_type)
);

-- Task Management (GTD + PINCH)
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'captured'
    CHECK(status IN ('captured','ready','active','blocked','done','archived')),
  source_note_id TEXT REFERENCES notes(id) ON DELETE SET NULL,
  assigned_entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  project_entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  due_date TEXT,
  parent_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  contexts TEXT DEFAULT '[]',
  energy_level TEXT,
  is_waiting_for INTEGER DEFAULT 0,
  waiting_for_entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  is_someday INTEGER DEFAULT 0,
  is_next_action INTEGER DEFAULT 0,
  activation_score TEXT,
  estimated_minutes INTEGER,
  calibrated_minutes INTEGER,
  domain TEXT CHECK(domain IN ('maker','manager','admin')),
  extraction_type TEXT DEFAULT 'manual',
  confidence REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Calendar
CREATE TABLE calendar_sources (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  name TEXT NOT NULL,
  config TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER DEFAULT 1,
  sync_interval_minutes INTEGER DEFAULT 15,
  last_sync_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT UNIQUE,
  source_id TEXT REFERENCES calendar_sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  attendees TEXT DEFAULT '[]',
  linked_note_id TEXT REFERENCES notes(id) ON DELETE SET NULL,
  transcript_note_id TEXT REFERENCES notes(id) ON DELETE SET NULL,
  recurrence_rule TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Cognitive State & Productivity
CREATE TABLE cognitive_state_samples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  attention REAL NOT NULL,
  arousal REAL NOT NULL,
  energy REAL NOT NULL,
  emotional_valence REAL NOT NULL,
  confidence REAL NOT NULL,
  mode TEXT NOT NULL,
  source_weights TEXT
);

CREATE TABLE energy_blocks (
  id TEXT PRIMARY KEY,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  predicted_energy REAL NOT NULL,
  actual_energy REAL,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  block_type TEXT NOT NULL
    CHECK(block_type IN ('deep_work','meeting','admin','break','buffer')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE interventions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  level INTEGER NOT NULL CHECK(level BETWEEN 0 AND 3),
  delivered_at TEXT NOT NULL,
  state_at_delivery TEXT NOT NULL,
  user_response TEXT
    CHECK(user_response IN ('accepted','dismissed','snoozed','ignored')),
  state_delta_5min TEXT,
  context TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE rhythm_profile (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Daily Briefs
CREATE TABLE daily_briefs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  calendar_snapshot TEXT,
  pending_actions_snapshot TEXT,
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  acknowledged_at TEXT
);

-- Event Log (append-only)
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  entity_id TEXT,
  payload TEXT NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'user'
    CHECK(source IN ('user','system','integration')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_events_type_ts ON events(type, timestamp);

-- AI Configuration
CREATE TABLE ai_providers (
  id TEXT PRIMARY KEY,
  api_key TEXT NOT NULL DEFAULT '',
  enabled INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE ai_models (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  capabilities TEXT NOT NULL DEFAULT '[]',
  enabled INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE ai_feature_models (
  feature_slot TEXT NOT NULL,
  position INTEGER NOT NULL,
  model_id TEXT NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_slot, position)
);

-- Vector Tables (sqlite-vec)
CREATE VIRTUAL TABLE chunk_embeddings USING vec0(
  id INTEGER PRIMARY KEY,
  embedding FLOAT[1536] distance_metric=cosine
);

CREATE VIRTUAL TABLE summary_embeddings USING vec0(
  id INTEGER PRIMARY KEY,
  embedding FLOAT[1536] distance_metric=cosine
);

-- Transcriptions
CREATE TABLE note_transcriptions (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  raw_transcript TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Entity Reviews
CREATE TABLE entity_reviews (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  model_id TEXT,
  acknowledged_at TEXT
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Scalability: cached counts (avoid COUNT(*) on large tables)
CREATE TABLE count_cache (
  key TEXT PRIMARY KEY,           -- e.g., 'notes:active', 'entity_mentions:ULID'
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Scalability: persistent embedding queue (survives crash/restart)
CREATE TABLE embedding_queue (
  note_id TEXT PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 3,  -- 1=highest, 4=lowest
  enqueued_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Schema Migrations
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════
-- INDEXES (critical for million-note scale)
-- ═══════════════════════════════════════════════════

-- Notes: list queries sort by updated_at, filter by archived
CREATE INDEX idx_notes_updated ON notes(updated_at DESC) WHERE archived_at IS NULL;
CREATE INDEX idx_notes_archived ON notes(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX idx_notes_template ON notes(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_notes_embedding_dirty ON notes(id) WHERE embedding_dirty = 1;

-- Chunks: bulk operations per note; layer filtering for search
CREATE INDEX idx_chunks_note_layer ON note_chunks(note_id, layer);
CREATE INDEX idx_chunks_layer_pos ON note_chunks(layer, position);

-- Entity mentions: lookup by note (on save) and by entity (for backlinks/reviews)
CREATE INDEX idx_mentions_note ON entity_mentions(note_id);
CREATE INDEX idx_mentions_entity ON entity_mentions(entity_id);
CREATE INDEX idx_mentions_type ON entity_mentions(mention_type);

-- Note relations: bidirectional traversal
CREATE INDEX idx_relations_source ON note_relations(source_note_id);
CREATE INDEX idx_relations_target ON note_relations(target_note_id);

-- Entities: list queries filter by type, sort by name
CREATE INDEX idx_entities_type ON entities(type_id, name) WHERE trashed_at IS NULL;
CREATE INDEX idx_entities_trashed ON entities(trashed_at) WHERE trashed_at IS NOT NULL;

-- Tasks: GTD views filter by status, project, flags
CREATE INDEX idx_tasks_status ON tasks(status) WHERE status NOT IN ('done', 'archived');
CREATE INDEX idx_tasks_project ON tasks(project_entity_id) WHERE status NOT IN ('done', 'archived');
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE due_date IS NOT NULL AND status NOT IN ('done', 'archived');
CREATE INDEX idx_tasks_parent ON tasks(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_tasks_source_note ON tasks(source_note_id) WHERE source_note_id IS NOT NULL;
CREATE INDEX idx_tasks_waiting ON tasks(is_waiting_for) WHERE is_waiting_for = 1;
CREATE INDEX idx_tasks_someday ON tasks(is_someday) WHERE is_someday = 1;
CREATE INDEX idx_tasks_next ON tasks(is_next_action) WHERE is_next_action = 1;

-- Calendar: range queries are the primary access pattern
CREATE INDEX idx_cal_events_range ON calendar_events(start_at, end_at);
CREATE INDEX idx_cal_events_external ON calendar_events(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_cal_events_note ON calendar_events(linked_note_id) WHERE linked_note_id IS NOT NULL;

-- Event log: time-series queries; type filtering
CREATE INDEX idx_events_ts ON events(timestamp DESC);
CREATE INDEX idx_events_entity ON events(entity_id, timestamp DESC);

-- Cognitive state: time-series access
CREATE INDEX idx_cognitive_ts ON cognitive_state_samples(timestamp DESC);
CREATE INDEX idx_cognitive_mode ON cognitive_state_samples(mode, timestamp DESC);

-- Energy blocks: time-range queries
CREATE INDEX idx_energy_range ON energy_blocks(start_at, end_at);

-- Interventions: analytics and learning loop
CREATE INDEX idx_interventions_ts ON interventions(delivered_at DESC);
CREATE INDEX idx_interventions_type ON interventions(type, delivered_at DESC);

-- Entity reviews: per-entity lookup
CREATE INDEX idx_reviews_entity ON entity_reviews(entity_id, generated_at DESC);

-- Transcriptions: per-note lookup
CREATE INDEX idx_transcriptions_note ON note_transcriptions(note_id);
```

### Migration Strategy

- Migrations in `src-tauri/migrations/NNNN_description.sql`
- Applied sequentially on startup via Rust migration runner
- Forward-only (no rollbacks for local-first single-user app)
- Bootstraps existing DBs by detecting canary columns

### Database Configuration

- **WAL mode** for concurrent read/write
- **64 MB page cache**
- **FTS5** for full-text search
- **sqlite-vec** loaded as extension for vector similarity

---

## 9. UI Architecture & Design System

### Component Architecture

All UI components follow the **Presentational/Container** pattern with **Atomic Design** hierarchy:

```
atoms/        → Button, Input, Badge, Chip, Icon, Timer, ProgressBar
molecules/    → SearchBar, FormField, TaskCard, EnergyIndicator, TimerBlock
organisms/    → NotePreview, EntityCard, MeetingCard, InterventionCard, TaskList
templates/    → SplitView, ModalLayout, SidebarLayout, CommandCenter
pages/        → TodayPage, NotesPage, TasksPage, CalendarPage, SearchPage
```

**Rules for dumb components (`packages/ui/`):**

1. Accept only props and callbacks — no direct state management
2. No API calls, no store access, no side effects
3. Must render correctly in Storybook in isolation
4. Every component has a `.stories.tsx` file with all variant states
5. Every component has a unit test with React Testing Library
6. Use design tokens from `@locus/tokens` exclusively — no hardcoded colors/spacing
7. Accessibility: all interactive elements have proper ARIA attributes
8. All text content is externalized via `t()` from `@locus/i18n` — no hardcoded user-facing strings
9. Must render correctly in both light and dark themes (Storybook theme toggle)
10. Feature-level components include a `HelpButton` in their header/toolbar

### Design Tokens (`packages/tokens/`)

Tokens are defined per theme. The `theme` dimension is resolved at runtime via CSS custom properties (Tailwind `dark:` variant) or React Native's `useColorScheme()`.

```typescript
// Semantic color tokens — resolved per theme
export const colors = {
  dark: {
    bg:       { DEFAULT: '#1a1a1a', sidebar: '#161616', surface: '#242424', elevated: '#2a2a2a' },
    border:   { DEFAULT: '#2e2e2e' },
    text:     { primary: '#e8e8e8', secondary: '#888888', muted: '#666666' },
  },
  light: {
    bg:       { DEFAULT: '#ffffff', sidebar: '#f5f5f5', surface: '#fafafa', elevated: '#ffffff' },
    border:   { DEFAULT: '#e2e2e2' },
    text:     { primary: '#1a1a1a', secondary: '#555555', muted: '#888888' },
  },

  // Theme-independent (same in both themes)
  accent:         { DEFAULT: '#5b8def', hover: '#7aaeff', muted: 'rgba(91,141,239,0.1)' },
  danger:         { DEFAULT: '#ef4444', subtle: 'rgba(239,68,68,0.1)' },
  warning:        { DEFAULT: '#f59e0b' },
  success:        { DEFAULT: '#34d399' },
  note:           { DEFAULT: '#50c0a0' },

  // Energy states
  energy:         { high: '#34d399', medium: '#f59e0b', low: '#ef4444', depleted: '#666666' },

  // Cognitive modes
  mode: {
    hyperfocus: '#a78bfa',
    flow:       '#34d399',
    drift:      '#f59e0b',
    depleted:   '#666666',
    dysregulated: '#ef4444',
    startup:    '#5b8def',
  }
} as const

export const spacing = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', '2xl': '32px', '3xl': '48px'
} as const

export const typography = {
  fontFamily: { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, monospace' },
  fontSize:   { xs: '11px', sm: '13px', base: '14px', lg: '16px', xl: '20px', '2xl': '24px' },
  fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeight: { tight: 1.3, normal: 1.5, relaxed: 1.7 },
} as const

export const animation = {
  duration: { fast: '100ms', normal: '200ms', slow: '300ms' },
  easing:   { default: 'cubic-bezier(0.4, 0, 0.2, 1)', bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
} as const

export const layout = {
  sidebar: { width: '200px' },
  panel:   { width: '360px' },
  chat:    { width: '360px' },
  editor:  { maxWidth: '720px' },
} as const
```

### Storybook Convention

Every component in `packages/ui/` must have a co-located `.stories.tsx`:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Atoms/Button',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { variant: 'primary', children: 'Click me' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancel' } }
export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } }
export const Disabled: Story = { args: { variant: 'primary', disabled: true, children: 'Disabled' } }
export const Loading: Story = { args: { variant: 'primary', loading: true, children: 'Saving...' } }
```

### Primary Views (Desktop)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              App Shell                                    │
│                                                                           │
│  ┌───────────┐  ┌────────────────────────────────────────────────────┐   │
│  │  Sidebar   │  │              Main Area                              │   │
│  │  (200px)   │  │                                                     │   │
│  │            │  │  ┌──────────────────────────────────────────────┐   │   │
│  │ ⚡ Today   │  │  │  Content (tab-based)                         │   │   │
│  │ 📝 Notes   │  │  │                                              │   │   │
│  │ 📋 Templ.  │  │  │  TodayPage:     Command Center + Day Ribbon │   │   │
│  │ ────────── │  │  │  NotesPage:     List + TipTap Editor        │   │   │
│  │ 👤 Person  │  │  │  TasksPage:     GTD views (Inbox/Projects/  │   │   │
│  │ 📁 Project │  │  │                  Waiting/Someday)            │   │   │
│  │ 👥 Team    │  │  │  CalendarPage:  Day/Week/Month calendar     │   │   │
│  │ ⚖ Decision│  │  │  SearchPage:    Semantic search              │   │   │
│  │ 🎯 OKR     │  │  │  EntitiesPage:  Entity browser              │   │   │
│  │ ────────── │  │  │                                              │   │   │
│  │ ✅ Tasks   │  │  └──────────────────────────────────────────────┘   │   │
│  │ 📅 Calendar│  │                                                     │   │
│  │ 🔍 Search  │  │  ┌─────────────────────┐  ┌──────────────────────┐ │   │
│  │ 🗑 Trash   │  │  │ TaskDetailPanel     │  │ ChatSidebar (360px) │ │   │
│  │ ────────── │  │  │ (overlay, right)    │  │ (fixed right)       │ │   │
│  │ 💬 Ask AI  │  │  └─────────────────────┘  └──────────────────────┘ │   │
│  │ ⚙ Settings│  │                                                     │   │
│  └───────────┘  └────────────────────────────────────────────────────┘   │
│                                                                           │
│  Status Bar: ⚡Energy: 72% │ 🕐 2:34 PM │ 🧠 Flow │ 📊 3/7 tasks      │
└──────────────────────────────────────────────────────────────────────────┘
```

### Command Center (TodayPage — default view)

Answers "what should I do right now?" without executive function:

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚡ Energy: ████████░░ 72%    🕐 2:34 PM    🧠 Flow Mode        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│              ┌────────────────────────┐                          │
│              │  Current Task           │                          │
│              │                         │                          │
│              │  Review PR #482         │                          │
│              │  Auth service           │                          │
│              │                         │                          │
│              │  ⏱ 23:47 / ~30m        │                          │
│              │  ███████░░░ 79%         │                          │
│              │                         │                          │
│              │  [✓ Done] [↻ Switch]    │                          │
│              └────────────────────────┘                          │
│                                                                  │
│  Next up: 1:1 with Sarah (15 min)                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  💭 Quick capture...                        [⌘⇧Space]   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Day Ribbon:                                                     │
│  ═══════════════════════╤════════════════════════════            │
│  ▓▓ standup  ▓▓▓ PR     │  ▒▒ Current   ░░ 1:1                 │
│  9:00       10:30        │  2:34 PM      3:00                    │
│  ⚡⚡⚡⚡⚡⚡⚡⚡ ⚡⚡⚡⚡⚡│ ⚡⚡⚡⚡⚡     ⚡⚡⚡⚡⚡⚡               │
│                                                                  │
│  Today: ██░░░░░░░░ 3/7 tasks  •  2h 14m focused                │
└──────────────────────────────────────────────────────────────────┘
```

### Mobile Views

```
┌─────────────────────┐    ┌─────────────────────┐
│  Today               │    │  Capture              │
│                      │    │                       │
│  ⚡ 72%  🧠 Flow    │    │  ┌─────────────────┐  │
│                      │    │  │                 │  │
│  ┌──────────────┐    │    │  │   🎤 Voice      │  │
│  │ Current Task │    │    │  │                 │  │
│  │ Review PR    │    │    │  └─────────────────┘  │
│  │ ⏱ 23:47     │    │    │                       │
│  │ [Done]       │    │    │  or type...           │
│  └──────────────┘    │    │  ┌─────────────────┐  │
│                      │    │  │                 │  │
│  Next: 1:1 Sarah    │    │  │                 │  │
│                      │    │  └─────────────────┘  │
│  ──── Day ────       │    │                       │
│  ▓▓▓  ▒▒  ░░░       │    │  [Save to Inbox]      │
│                      │    │                       │
│  ─────────────────   │    │                       │
│  📋 Today  🔍  ➕   │    │  ─────────────────    │
└─────────────────────┘    │  📋 Today  🔍  ➕    │
                           └─────────────────────┘
```

### Settings Architecture

The Settings view is a full-screen modal (macOS System Preferences–style) with a two-pane layout and a single global Save button.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Settings                                                     ✕    │
│                                                                     │
│  ┌────────────────────┐  ┌──────────────────────────────────────┐  │
│  │  Left Nav (180px)  │  │  Content Pane                        │  │
│  │                    │  │                                      │  │
│  │  🤖 AI             │  │  LLM Providers                      │  │
│  │    LLM Providers ◄─│  │                                      │  │
│  │    Personalization  │  │  ☑ Enable local web search for AI   │  │
│  │    AI Features      │  │                                      │  │
│  │    Transcription    │  │  ┌──────────────────────────────┐   │  │
│  │    Follow-up        │  │  │ Anthropic               ✕   │   │  │
│  │                    │  │  │ ●●●●●●●●●●●●  👁  Refresh   │   │  │
│  │  ✅ Actions        │  │  │ ☑ Claude Haiku 4.5          │   │  │
│  │                    │  │  │ ☑ Claude Opus 4.6           │   │  │
│  │  📅 Calendar       │  │  │ ☑ Claude Sonnet 4.6        │   │  │
│  │    General          │  │  └──────────────────────────────┘   │  │
│  │    Calendar Sync    │  │                                      │  │
│  │    Attendees        │  │  [+ Add Provider]                    │  │
│  │                    │  │                                      │  │
│  │  🧠 Cognitive      │  │                                      │  │
│  │    Energy           │  │                                      │  │
│  │    Interventions    │  │                                      │  │
│  │    Notifications    │  │                                      │  │
│  │                    │  │                                      │  │
│  │  🎨 Appearance     │  │                                      │  │
│  │    Theme            │  │                                      │  │
│  │    Language          │  │                                      │  │
│  │                    │  │                                      │  │
│  │  🔐 Privacy        │  │                                      │  │
│  │                    │  │                                      │  │
│  │  🐛 Debug          │  │                                      │  │
│  └────────────────────┘  └──────────────────────────────────────┘  │
│                                                                     │
│                                           [Cancel]  [Save]          │
└─────────────────────────────────────────────────────────────────────┘
```

**Layout rules:**

- **Left nav** (180px): Tree structure with category groups (bold, with icon) and subcategory items (indented, plain text). Only one subcategory is active at a time — clicking it loads its content in the right pane.
- **Content pane** (flex): Renders the settings section for the active subcategory. All form fields are editable in-place.
- **Single Save button**: Bottom-right footer. Saves all pending changes across all categories at once. Disabled when no changes exist. Cancel discards all unsaved changes and closes the modal.
- **Dirty tracking**: The settings store tracks all modified fields. If the user navigates away with unsaved changes, a confirmation dialog prevents accidental loss.

**Settings categories:**

| Category | Subcategories | Contents |
|----------|---------------|----------|
| **AI** | LLM Providers | Web search toggle, provider cards with API key + model checkboxes, [+ Add Provider] |
| | Personalization | Rich text input for user self-description (injected into AI prompts) |
| | AI Features | Feature chain editors (one per slot) — model priority ordering |
| | Transcription | STT engine picker, API keys, language, diarization, system audio toggle |
| | Follow-up | Assignee entity type, staleness threshold (days) |
| **Actions** | *(no sub)* | GTD project entity type, default contexts |
| **Calendar** | General | Slot duration, meeting note title template |
| | Calendar Sync | Source cards, sync-now button, add source |
| | Attendees | Attendee entity type + fields, team mapping |
| **Cognitive** | Energy | Chronotype override, ultradian cycle, peak window preferences |
| | Interventions | Intervention intensity (min/moderate/full), Level 0–3 toggles |
| | Notifications | Frequency limit (per hour), batching preferences, sound/haptic toggles |
| **Appearance** | Theme | System / Dark / Light selector |
| | Language | English / Polish selector |
| **Privacy** | *(no sub)* | Encryption toggle, data retention, "What I know" dashboard link, export/delete data |
| **Debug** | *(no sub)* | Save audio toggle, re-embed all, open audio folder, DB stats, performance report |

### Notification Design Rules

1. **Never guilt-based** ("You missed..." → "Ready to pick up...?")
2. **Action-oriented** (every notification has a one-tap action)
3. **Context-aware** (suppressed during hyperfocus unless urgent)
4. **Batched** (digest mode during focus blocks)
5. **Sensory-calibrated** (subtle haptic, gentle sound, muted visual — configurable)
6. **Frequency-limited** (max N/hour, default 4, user-configurable)

### Theming (Light & Dark)

Both light and dark themes are first-class citizens. The user chooses between three modes in settings:

| Mode | Behavior |
|------|----------|
| **System** (default) | Follows OS appearance (`prefers-color-scheme`); switches automatically |
| **Dark** | Always dark theme |
| **Light** | Always light theme |

**Implementation:**

- Desktop: Tailwind CSS `class` strategy. A `dark` class on `<html>` toggles all `dark:` variants. The Zustand `themeStore` manages the state and syncs with OS preference via `matchMedia('(prefers-color-scheme: dark)')`.
- Mobile: React Native's `useColorScheme()` hook + NativeWind `dark:` support.
- Storybook: Theme toggle addon; all stories must render correctly in both themes.
- Design tokens: Semantic colors (`bg`, `surface`, `text`, `border`) have separate `dark` and `light` definitions in `@locus/tokens`. Theme-independent colors (accent, danger, energy, cognitive modes) are the same in both themes.
- Every component must use semantic token classes (`bg-surface`, `text-primary`) — never raw color values.
- Contrast ratios must meet WCAG AA (4.5:1 for normal text, 3:1 for large text) in both themes.

### Internationalization (i18n)

Locus ships with **English (en)** and **Polish (pl)** as mandatory, always-complete locales. The architecture supports adding more locales without code changes.

**Architecture (`packages/i18n/`):**

```
i18n/
├── locales/
│   ├── en/                  # Source of truth — all keys defined here first
│   │   ├── common.json      # Shared strings: buttons, labels, status, errors
│   │   ├── notes.json       # "New note", "Search notes...", "Untitled", etc.
│   │   ├── tasks.json       # GTD labels, PINCH descriptions, status names
│   │   ├── calendar.json    # Calendar view labels, meeting modal
│   │   ├── search.json      # Search placeholders, result labels
│   │   ├── ai.json          # AI chat, daily brief, entity review
│   │   ├── settings.json    # All settings labels and descriptions
│   │   ├── cognitive.json   # Energy states, modes, intervention text
│   │   └── help.json        # Contextual help strings (short descriptions)
│   └── pl/                  # Polish — mirrors en/ 1:1, enforced by CI
│       └── ...
├── i18next-parser.config.ts # Extracts keys from source; flags missing translations
└── index.ts                 # i18next setup with namespace lazy-loading
```

**Key rules:**

1. **English is the source namespace.** All new keys are added to `en/*.json` first.
2. **Polish must always be 100% complete.** CI fails if any key present in `en/` is missing from `pl/`.
3. **No hardcoded user-facing strings.** Every text visible to the user goes through `t('namespace:key')`.
4. **ICU MessageFormat** for plurals, gender, and interpolation: `t('tasks:count', { count: 5 })` → "5 tasks" / "5 zadań".
5. **Namespace-based lazy loading.** Only the active page's namespace is loaded; others load on navigation.
6. **RTL-ready.** Layout uses logical properties (`margin-inline-start` not `margin-left`) for future RTL locales.
7. **Date/number formatting.** Use `Intl.DateTimeFormat` and `Intl.NumberFormat` with the active locale — never hardcoded formats.
8. **AI output language.** AI prompts include `Respond in {locale}` when the user's locale is not English.

**Typed translations:**

```typescript
// Auto-generated from en/ namespace files — provides compile-time key safety
import { useTranslation } from '@locus/i18n'

function TaskCard({ count }: { count: number }) {
  const { t } = useTranslation('tasks')
  return <span>{t('activeCount', { count })}</span>
  //                ^^^^^^^^^^^^ TypeScript error if key doesn't exist in en/tasks.json
}
```

### Contextual Help System

Every feature in Locus has built-in, context-aware documentation accessible via a `?` help button. The help system follows the ADHD design axiom of progressive disclosure — brief answer first, full article on demand.

**Architecture (`packages/help/`):**

```
User clicks "?" button on a feature
        │
        ▼
┌──────────────────────────────────┐
│  HelpPanel (slide-out, 400px)    │
│                                  │
│  ┌─────────────────────────────┐ │
│  │ Title: "Note Editor"       │ │
│  │                            │ │
│  │ Quick answer (2-3 lines):  │ │
│  │ "Write and format notes    │ │
│  │  with rich text. Use @     │ │
│  │  to mention entities..."   │ │
│  │                            │ │
│  │ ▸ Keyboard shortcuts       │ │  ← Expandable sections
│  │ ▸ Slash commands           │ │
│  │ ▸ AI features              │ │
│  │ ▸ Tips for ADHD users      │ │
│  │                            │ │
│  │ [Open full docs ↗]         │ │  ← Link to full article
│  └─────────────────────────────┘ │
│                                  │
│  Related topics:                 │
│  • Search  • Entities  • Tasks   │
└──────────────────────────────────┘
```

**Components:**

| Component | Purpose |
|-----------|---------|
| `HelpButton` | Small `?` icon button; placed in every feature header/toolbar. Accepts a `topic` prop. |
| `HelpPanel` | Slide-out panel rendering MDX content. Includes search, breadcrumbs, and related topics. |
| `HelpProvider` | React context wrapping the app; manages open/close state and active topic. |
| `useHelp(topic)` | Hook to programmatically open help for a specific topic. |

**Content:**

- Written in MDX (markdown + React components) for rich formatting with embedded interactive examples.
- Organized by feature area in `packages/help/content/{locale}/`.
- Available in all supported locales (English and Polish mandatory).
- Content includes ADHD-specific tips per feature (e.g., "Tip: Use voice capture if typing feels slow today").
- Version-matched: help content is bundled with the app, not fetched from a server.

**Help topic registry:**

```typescript
// packages/help/src/help-registry.ts
const helpTopics = {
  'notes.editor':       { title: 'Note Editor',       namespace: 'notes',     file: 'notes/editor.mdx' },
  'notes.mentions':     { title: '@Mentions',          namespace: 'notes',     file: 'notes/mentions.mdx' },
  'notes.search':       { title: 'Semantic Search',    namespace: 'search',    file: 'notes/search.mdx' },
  'tasks.gtd':          { title: 'Task Management',    namespace: 'tasks',     file: 'tasks/gtd.mdx' },
  'tasks.pinch':        { title: 'PINCH Scoring',      namespace: 'tasks',     file: 'tasks/pinch.mdx' },
  'cognitive.energy':   { title: 'Energy Tracking',    namespace: 'cognitive', file: 'cognitive/energy.mdx' },
  'cognitive.jitai':    { title: 'Smart Nudges',       namespace: 'cognitive', file: 'cognitive/jitai.mdx' },
  'settings.ai':        { title: 'AI Providers',       namespace: 'settings',  file: 'settings/ai-providers.mdx' },
  'settings.calendar':  { title: 'Calendar Sync',      namespace: 'settings',  file: 'settings/calendar-sync.mdx' },
  // ...
} as const
```

**Usage in components:**

```tsx
import { HelpButton } from '@locus/help'

function NoteEditorHeader() {
  return (
    <header>
      <h1>{t('notes:editor')}</h1>
      <HelpButton topic="notes.editor" />
    </header>
  )
}
```

---

## 10. API & IPC Layer

### Desktop IPC (Tauri Commands)

All Tauri commands use typed payloads validated with Zod schemas. The command layer acts as the adapter in the hexagonal architecture, translating IPC calls to use case invocations.

```typescript
// apps/desktop/src/tauri/commands.ts — TypeScript bindings

// Notes (cursor-paginated for million-note scale)
invoke<Note>('notes:create', { title?, body?, templateId? })
invoke<Note | null>('notes:get', { id })
invoke<Page<Note>>('notes:list', { filter?, cursor?, limit? })     // cursor-based pagination
invoke<void>('notes:update', { id, title?, body?, bodyPlain? })
invoke<void>('notes:delete', { id })
invoke<NoteSearchResult[]>('notes:search', { query, limit? })      // capped at 50
invoke<NoteSearchResult[]>('notes:semantic-search', { query, limit? })  // capped at 15

// Entities
invoke<Entity[]>('entities:evaluate-computed', { entityId, fieldName })  // evaluate computed_query field
invoke<LQLParseResult>('entities:parse-query', { query })              // validate LQL syntax

// Tasks (cursor-paginated)
invoke<Task>('tasks:create', { title, sourceNoteId?, ... })
invoke<Task | null>('tasks:get', { id })
invoke<Page<Task>>('tasks:list', { filter?, cursor?, limit? })     // cursor-based pagination
invoke<void>('tasks:update', { id, ... })
invoke<Task[]>('tasks:suggest', { count: 3 })  // PINCH-ranked suggestions

// Cognitive
invoke<CognitiveState>('cognitive:state')
invoke<EnergyBlock[]>('cognitive:predict-energy', { range })
invoke<void>('cognitive:report-energy', { level })
invoke<void>('cognitive:intervention-response', { id, response })

// Calendar
invoke<CalendarEvent[]>('calendar:list', { start, end })
invoke<CalendarEvent>('calendar:create', { ... })

// AI
invoke<ChatResponse>('ai:chat', { messages, context? })
invoke<DailyBrief>('ai:daily-brief', { date })
invoke<EntityReview>('ai:entity-review', { entityId })

// Settings
invoke<string | null>('settings:get', { key })
invoke<void>('settings:set', { key, value })
```

### Event Channel (Push from Backend)

```typescript
// Real-time events pushed from Tauri backend to frontend
listen('note:ner-complete', { noteId })
listen('note:actions-complete', { noteId })
listen('transcription:partial', { text, isFinal })
listen('transcription:complete', { noteId })
listen('cognitive:state-changed', { state: CognitiveState })
listen('intervention:delivered', { intervention })
listen('energy:block-started', { block })
listen('sync:complete', { changes })
```

### Validation

All IPC payloads validated bidirectionally with Zod schemas defined in `@locus/core/validation/`. Schemas are the single source of truth for TypeScript types and runtime validation.

---

## 11. Cross-Platform Strategy

### Shared vs. Platform-Specific

| Layer | Shared | Desktop-Specific | Mobile-Specific |
|-------|--------|-------------------|-----------------|
| **Domain models** | `@locus/core` | — | — |
| **Use cases** | `@locus/core` | — | — |
| **AI logic** | `@locus/ai` | Rust FFI for ONNX/Whisper | Cloud-only AI |
| **Cognitive** | `@locus/cognitive` | Full behavioral tracking | Wearable + self-report only |
| **Design tokens** | `@locus/tokens` | — | — |
| **UI components** | — | `@locus/ui` (React) | `@locus/ui-native` (RN) |
| **Database** | Schema shared | rusqlite (Tauri) | expo-sqlite |
| **Sync** | Automerge protocol | — | — |
| **Notifications** | — | Tauri notifications | Expo notifications |
| **STT** | — | Whisper.cpp (Rust) | Cloud STT only |
| **Wearable** | — | HealthKit (via Rust) | HealthKit / Health Connect |

### Mobile Feature Scope

Mobile is a **companion**, not a clone. It focuses on:
- **Capture** (voice + text, zero-friction)
- **View** today's schedule, tasks, daily brief
- **Respond** to interventions and nudges
- **Quick actions** (mark done, snooze, add to inbox)
- **Wearable bridge** for health data

Full editing, knowledge graph exploration, and settings are desktop-only.

---

## 12. Security & Privacy

### Seven Commitments

| # | Commitment | Implementation |
|---|-----------|----------------|
| 1 | **Granular informed consent** | Permission system per data type; revocable; plain-language explanations |
| 2 | **Full user data ownership** | All data local; export to JSON/CSV/ICS; one-tap full deletion |
| 3 | **Local-first processing** | All ML on-device; no cognitive/behavioral data transmitted |
| 4 | **Transparent visualization** | "What I know" dashboard showing all learned patterns; editable |
| 5 | **Anti-discrimination safeguards** | No employer APIs; no diagnostic language; encrypted at rest |
| 6 | **User override everywhere** | Every intervention dismissible; every automation overridable |
| 7 | **Productivity tool framing** | No medical claims; explicit disclaimers; not a replacement for clinical care |

### Data Classification

| Tier | Data | Storage |
|------|------|---------|
| **Tier 1: Never leaves device** | Cognitive states, behavioral patterns, wearable biometrics, ML weights, emotional inferences | Local SQLite only |
| **Tier 2: E2E encrypted sync** | Tasks, notes, calendar, preferences, intervention history (anonymized) | Optional multi-device |
| **Tier 3: External integration** | Task status → Jira, calendar → Google, notifications → Slack | Explicit user consent |
| **Never shared** | Raw biometrics, cognitive state, behavioral patterns, any data with employers/advertisers | Architecture prevents |

### Desktop Security

| Setting | Value |
|---------|-------|
| CSP | Strict; no inline scripts; no external resources |
| IPC | All commands validated with Zod; no raw SQL from frontend |
| Encryption at rest | SQLCipher (optional, user-provided passphrase) |
| API keys | Stored in OS keychain (Tauri keyring plugin) |

---

## 13. Scalability & Performance (Million-Note Scale)

The system is designed to handle 1M+ notes, 5M+ chunks, 10M+ events, and 5M+ entity mentions without degradation. This section details the strategies that make this possible.

### 13.1 Scale Profile

| Entity | At 1M Notes | Growth Pattern | Critical Operation |
|--------|------------|----------------|-------------------|
| `notes` | 1M rows | Linear | List (paginated), FTS search |
| `note_chunks` (L1) | ~5M rows (~5 chunks/note avg) | Linear | KNN vector search |
| `chunk_embeddings` | ~5M vectors × 6 KB each ≈ **30 GB** | Linear | Cosine similarity KNN |
| `summary_embeddings` (L2) | ~1M vectors ≈ **6 GB** | Linear | Cosine similarity KNN |
| `notes_fts` | 1M documents | Linear | Full-text search |
| `entity_mentions` | ~5–10M rows | Super-linear | Backlink queries |
| `note_relations` | ~2–5M rows | Super-linear | Graph traversal |
| `events` (append-only) | 10M+ rows | Continuous | Time-range queries |
| `cognitive_state_samples` | 5M+ rows (one per 30s) | Continuous | Time-series analytics |

### 13.2 Database Scalability

#### SQLite at Scale

SQLite handles terabyte-scale databases in production (e.g., SQLite is the most deployed database engine in the world). The key constraints at million-note scale are: query planning, index coverage, and avoiding full-table scans.

**Configuration for scale:**

```sql
PRAGMA journal_mode = WAL;          -- concurrent reads during writes
PRAGMA cache_size = -65536;         -- 64 MB page cache
PRAGMA mmap_size = 1073741824;      -- 1 GB memory-mapped I/O
PRAGMA page_size = 8192;            -- 8 KB pages (better for large BLOBs)
PRAGMA synchronous = NORMAL;        -- safe with WAL; 2x faster than FULL
PRAGMA temp_store = MEMORY;         -- temp tables in memory
PRAGMA optimize;                    -- run on connection close (updates statistics)
```

**Index strategy:** Every query must hit a covering or partial index. Full table scans are forbidden at this scale. See §8 for the complete index set. Partial indexes (WHERE clauses) keep index size small for filtered queries.

#### Cursor-Based Pagination

All list operations use **cursor-based pagination** (keyset pagination), never OFFSET:

```sql
-- ✅ GOOD: Cursor-based (O(1) seek via index)
SELECT * FROM notes
WHERE archived_at IS NULL
  AND updated_at < ?cursor_timestamp
ORDER BY updated_at DESC
LIMIT 50;

-- ❌ BAD: OFFSET-based (O(n) skip at large offsets)
SELECT * FROM notes
WHERE archived_at IS NULL
ORDER BY updated_at DESC
LIMIT 50 OFFSET 999950;
```

Cursor values are opaque, base64-encoded `(sort_column, id)` tuples. The `Page<T>` response type includes the cursor for the next page and a `totalEstimate` (via `sqlite_stat1` rather than `COUNT(*)`) to avoid full scans for counts.

#### Count Caching

`COUNT(*)` on million-row tables is expensive. Locus maintains approximate counts:

| Approach | Use Case |
|----------|----------|
| **`sqlite_stat1` estimates** | Sidebar badge counts, total note count |
| **Trigger-maintained counters** | Entity mention count per entity, backlink count per note |
| **Periodic refresh (60s)** | Active task count, inbox count |

```sql
CREATE TABLE count_cache (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trigger example: maintain mention count
CREATE TRIGGER trg_mention_insert AFTER INSERT ON entity_mentions
BEGIN
  INSERT INTO count_cache(key, count, updated_at)
  VALUES ('entity_mentions:' || NEW.entity_id, 1, datetime('now'))
  ON CONFLICT(key) DO UPDATE SET
    count = count + 1,
    updated_at = datetime('now');
END;
```

#### Database Partitioning Strategy

For users who accumulate notes over years, Locus supports time-based database partitioning:

```
locus-data/
├── locus.db              # Active database (current year + recent)
├── archive-2025.db       # Archived notes from 2025
├── archive-2024.db       # Archived notes from 2024
└── vectors.db            # All vector tables (separate for performance)
```

| Strategy | Details |
|----------|---------|
| **Active DB** | Current year's notes + any note accessed in last 90 days. All writes go here. |
| **Archive DBs** | Read-only, attached via `ATTACH DATABASE`. Searchable but not in hot path. |
| **Vector DB** | All vec0 tables in a separate database file. Decouples vector growth from relational queries. Allows independent vacuuming and optimization. |
| **Cross-DB queries** | FTS5 searches the active DB first; archive DBs searched on explicit "search all" toggle. |
| **Archival** | Background job (weekly) moves notes older than the threshold to archive DBs. Rewriting references as cross-DB pointers. |

#### Vacuum & Maintenance

```
┌─────────────────────────────────────────────────────────┐
│  Background Maintenance Scheduler                        │
│                                                          │
│  • PRAGMA optimize           — on every connection close │
│  • PRAGMA integrity_check    — weekly, on idle           │
│  • VACUUM (incremental)      — weekly, on idle           │
│  • VACUUM vectors.db         — monthly, on idle          │
│  • Rebuild FTS5 index        — monthly, on idle          │
│  • Archive old notes         — weekly, on idle           │
│  • Prune event log (>1yr)    — monthly                   │
│  • Update count_cache        — every 60s                 │
└─────────────────────────────────────────────────────────┘
```

### 13.3 Vector Search at Scale

At 5M chunks × 1536 dimensions, the `chunk_embeddings` table holds ~30 GB. Brute-force KNN is infeasible.

#### Approximate Nearest Neighbor (ANN) Strategy

| Approach | When | Details |
|----------|------|---------|
| **Exact KNN** | < 100K vectors | sqlite-vec brute-force; fast enough on modern hardware |
| **IVF (Inverted File Index)** | 100K–5M vectors | Partition vectors into Voronoi cells; search only `nprobe` closest cells. sqlite-vec supports IVF via `vec0` partitioning. |
| **HNSW (future)** | > 5M vectors | Hierarchical Navigable Small World graph. If sqlite-vec adds HNSW, migrate. Otherwise, consider `usearch` or `hnswlib` via Rust FFI. |

**IVF Configuration:**

```sql
-- Partition vectors into clusters for ANN search
-- nlist = √(n) for balanced recall/speed tradeoff
-- At 5M vectors: nlist ≈ 2236, nprobe ≈ 50 (top ~2% of cells)

-- The implementation uses a two-phase approach:
-- 1. Precompute cluster centroids via K-means (nightly, same as L3)
-- 2. Assign each vector to its nearest centroid
-- 3. At query time, find nearest centroids, then search only those partitions
```

**Search performance targets:**

| Scale | Strategy | Latency Target | Recall Target |
|-------|----------|---------------|---------------|
| < 100K chunks | Exact KNN | < 50ms | 100% |
| 100K–1M chunks | IVF (nprobe=20) | < 100ms | > 95% |
| 1M–5M chunks | IVF (nprobe=50) | < 200ms | > 90% |
| > 5M chunks | HNSW or external engine | < 100ms | > 95% |

**Dimensionality reduction fallback:** If vector DB size becomes prohibitive, reduce from 1536d to 512d using PCA or Matryoshka embeddings (OpenAI's `text-embedding-3-small` natively supports this). Halves storage from 30 GB to 10 GB with ~3% recall loss.

### 13.4 FTS5 at Scale

FTS5 handles millions of documents well, but requires tuning:

| Optimization | Details |
|-------------|---------|
| **Merge policy** | `INSERT INTO notes_fts(notes_fts, rank) VALUES('merge', 50);` — merge small segments periodically to avoid search-time overhead |
| **Automerge** | `INSERT INTO notes_fts(notes_fts, rank) VALUES('automerge', 8);` — automatically merge when segment count exceeds threshold |
| **Rebuild** | Monthly `INSERT INTO notes_fts(notes_fts) VALUES('rebuild');` — full index rebuild during idle |
| **Content sync** | Use `content=` and `content_rowid=` with triggers rather than maintaining a separate copy |
| **Rank function** | Use `bm25()` for relevance ranking instead of raw match count |

### 13.5 Embedding Pipeline at Scale

At million-note scale, the embedding pipeline must handle bulk operations efficiently:

```
┌──────────────────────────────────────────────────────────┐
│  Embedding Queue (Priority-Based)                         │
│                                                           │
│  Priority 1: Current note (user is editing)               │
│  Priority 2: Notes accessed today                         │
│  Priority 3: Recently imported notes                      │
│  Priority 4: Re-embedding after model change              │
│                                                           │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │
│  │ Chunk Worker │   │ Embed Worker│   │ Store Worker │    │
│  │ (1 thread)  │──►│ (batch=32)  │──►│ (1 thread)   │    │
│  └─────────────┘   └─────────────┘   └─────────────┘    │
│                                                           │
│  Rate limiting: max 100 embed calls/min (cloud)           │
│  Batch size: 32 texts per API call                        │
│  Backpressure: pause queue when > 1000 pending            │
│  Retry: exponential backoff (1s, 2s, 4s, max 60s)        │
│  Resume: persist queue position; survive app restart      │
└──────────────────────────────────────────────────────────┘
```

**Bulk operations:**

| Operation | Strategy |
|-----------|----------|
| **Initial import (100K+ notes)** | Stream notes in batches of 100; embed in batches of 32; write chunks in transactions of 500; show progress bar |
| **Model change (re-embed all)** | Background job; user can continue working; old embeddings serve search until replaced |
| **Nightly L3 clustering** | K-means++ on L2 summaries; incremental (only re-cluster if > 10% new summaries since last run) |
| **Embedding queue persistence** | SQLite table `embedding_queue(note_id, priority, enqueued_at)`; survives crash/restart |

### 13.6 UI Performance at Scale

| Technique | Details |
|-----------|---------|
| **Virtualized lists** | `react-window` (desktop) / `FlashList` (mobile) for all note, entity, and task lists. Only renders visible items + buffer. At 1M notes, the list component holds ~20 rendered items regardless of total count. |
| **Incremental search** | Search results stream in as they arrive (FTS results first, then vector results merge in). Users see results within 50ms even if full search takes 200ms. |
| **Debounced queries** | Search: 300ms debounce. Auto-save: 500ms. Prevents query storms during rapid input. |
| **Optimistic updates** | UI updates instantly on user action; backend confirms async. Rollback on failure. |
| **Lazy rendering** | TipTap editor loads note body on selection, not on list render. Rich content (Excalidraw, Mermaid) rendered on viewport intersection only. |
| **Web Workers** | Markdown rendering, JSON parsing of large note bodies, and search result formatting run off the main thread. |
| **React.memo boundaries** | Memoize list items, sidebar sections, and chart components. Re-render only when props change. |
| **Code splitting** | Per-route dynamic imports. Excalidraw (~2 MB) loaded on first use. Settings page lazy-loaded. |
| **Skeleton loading** | Show skeleton placeholders immediately; replace with content as data arrives. Prevents layout shift. |

### 13.7 Memory Management

| Constraint | Strategy |
|------------|----------|
| **Note body loading** | Only the active note's full body is in memory. List shows title + excerpt (from `body_plain` truncated). |
| **Vector tables** | sqlite-vec uses memory-mapped I/O; OS manages page cache. Set `mmap_size` to available RAM / 4. |
| **Chat history** | Session-only; cleared on sidebar close. Max 100 messages per session. |
| **ONNX models** | Loaded on demand; released after 5 min idle. Whisper model (~500 MB) loaded only during active transcription. |
| **Event log** | Append-only; old events (> 1 year) pruned to aggregated summaries. Raw events archived. |
| **Attachment cache** | LRU cache with 200 MB cap. Files beyond cap loaded on demand from disk. |
| **Background queues** | Bounded: max 1000 pending embedding jobs; max 100 pending NER jobs. Excess items dropped and re-queued on next save. |

### 13.8 Performance Budgets

| Operation | Target | Degraded (acceptable) |
|-----------|--------|----------------------|
| App cold start | < 2s | < 5s |
| Note list render (50 items) | < 100ms | < 200ms |
| Note open (load body) | < 50ms | < 150ms |
| FTS search (1M notes) | < 100ms | < 300ms |
| Semantic search (1M notes, IVF) | < 300ms | < 800ms |
| Auto-save round-trip | < 200ms | < 500ms |
| NER pipeline (single note) | < 3s | < 10s |
| Embedding pipeline (single note) | < 5s | < 15s |
| Bulk import (1000 notes) | < 30s | < 120s |
| Daily brief generation | < 10s | < 30s |
| Command palette open | < 50ms | < 100ms |

### 13.9 Performance Monitoring

Built-in performance tracking (local-only, never transmitted):

```rust
struct PerformanceTrace {
    operation: String,
    started_at: Instant,
    duration_ms: f64,
    metadata: HashMap<String, String>,  // e.g., {"note_count": "1200000"}
}
```

- All Tauri commands automatically traced
- SQLite queries above 100ms logged with EXPLAIN QUERY PLAN
- Weekly performance report in settings: slowest queries, largest tables, index usage stats
- `PRAGMA compile_options` and `PRAGMA cache_hit_rate` exposed in debug panel

---

## 14. Testing Strategy

### Test Pyramid

```
         ┌─────────┐
         │   E2E   │  Playwright (desktop), Maestro (mobile)
         │  (~10%) │  Critical user journeys only
         ├─────────┤
         │ Integr. │  Vitest: use case + repository + AI pipeline tests
         │  (~30%) │  In-memory SQLite, mocked AI providers
         ├─────────┤
         │  Unit   │  Vitest: domain models, utilities, pure functions
         │  (~50%) │  React Testing Library: component behavior
         ├─────────┤
         │ Visual  │  Storybook + Chromatic: component screenshot regression
         │  (~10%) │  Every PR checked for visual changes
         └─────────┘
```

### Testing Rules

1. **Domain models** (`@locus/core/domain/`): 100% unit test coverage. Pure functions, no mocks needed.
2. **Use cases** (`@locus/core/use-cases/`): Integration tests with in-memory repository implementations.
3. **UI components** (`@locus/ui/`): Every component has RTL tests verifying behavior (not implementation). Every component has Storybook stories covering all states.
4. **Tauri commands**: Integration tests with real SQLite (in-memory mode).
5. **AI pipelines**: Tests with fixture data and mocked AI responses. Snapshot tests for prompts.
6. **E2E**: Playwright tests for critical paths: create note → search → find; create task → complete; daily brief generation.

### Coverage Targets

| Package | Target |
|---------|--------|
| `@locus/core` | 90%+ |
| `@locus/ui` | 80%+ |
| `@locus/ai` | 70%+ |
| `@locus/cognitive` | 70%+ |
| `apps/desktop` | 60%+ |

---

## 15. Observability & Error Handling

### Error Handling Pattern

All operations return `Result<T, E>` for predictable error handling:

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

// Usage in use cases
async function createNote(params: CreateNoteParams): Promise<Result<Note, NoteError>> {
  const validation = NoteSchema.safeParse(params)
  if (!validation.success) {
    return { ok: false, error: new ValidationError(validation.error) }
  }
  // ...
  return { ok: true, value: note }
}
```

### Logging

- Structured logging (JSON format) via Rust's `tracing` crate (backend) and `pino` (frontend)
- Log levels: error, warn, info, debug, trace
- Sensitive data never logged (API keys, biometrics, personal content)
- Logs stored locally; never transmitted

### Error Recovery

- Auto-save prevents data loss on crash
- Embedding pipeline: retry with exponential backoff; fallback to FTS-only search
- AI calls: model fallback chains; graceful degradation to non-AI features
- Transcription: recovery recorder saves audio; retryable on restart
- Sync: CRDT guarantees eventual consistency; no data loss on conflict

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| App becomes another abandoned tool | Critical | Zero-friction design; works with 30s/day; degrades gracefully if ignored for days |
| Cognitive state prediction inaccuracy | High | Confidence scores; transparent "why"; user correction loop; graceful degradation to manual |
| Privacy breach | Critical | Local-first architecture; E2E encryption; no cloud processing of cognitive data |
| Over-reliance / reduced self-regulation | Medium | Gradual autonomy building; periodic "self-guided days"; metacognitive reflection |
| Feature creep increases cognitive load | High | Progressive disclosure; complexity budget per release; "does this reduce EF demand?" gate |
| Notification fatigue | High | Aggressive rate limiting; learning loop on dismissals; default to less |
| Tauri v2 maturity | Medium | WebView abstraction; migration path to Electron if needed |
| On-device ML model size | Medium | Models loaded on demand; quantized models; streaming inference |
| Cross-platform complexity | High | Strict shared/platform-specific boundaries; shared core tests run on all platforms |
| Scope creep between KM and productivity | High | Each phase delivers standalone value; features work independently |
| SQLite single-file at > 1M notes | Medium | Database partitioning (active + archive DBs); separate vector DB; incremental vacuum |
| Vector search latency at scale | High | IVF indexing for ANN; dimensionality reduction fallback (1536d → 512d); HNSW migration path |
| Embedding pipeline throughput | Medium | Priority queue with batch processing; rate limiting; persistent queue survives restarts |
| Memory pressure from large datasets | Medium | Memory-mapped I/O; LRU caches with caps; lazy loading; ONNX models loaded on demand |
| FTS5 index corruption | Low | Monthly rebuild on idle; integrity checks; backup before rebuild |

---

## Appendix A: Research-to-Design Traceability

| Design Decision | Research Basis | Key Stat |
|----------------|---------------|----------|
| Three-pathway coverage (EF, delay aversion, temporal) | Sonuga-Barke Triple Pathway Model | Three independent deficits |
| External scaffolding over skill training | Barkley's prosthetic environment | 30% EF developmental delay |
| JITAI delivery model | Wang et al. meta-analysis | g = 1.65 vs. waitlist |
| CBT micro-interventions | Safren et al.; 2025 meta-analysis | 53% vs. 23% response; SMD = −0.45 |
| PINCH activation scoring | Dodson; Volkow dopamine | D2/D3 ↔ motivation r = 0.39–0.41 |
| Immediate variable rewards | Plichta & Scheres | d = 0.48–0.58 ventral-striatal hyporesponsiveness |
| Time visualization | Marx et al.; Zheng et al. | g = 0.688 time perception deficit |
| Energy-based scheduling | Luu & Fabiano; Kleitman | 75% circadian phase delay; 90–120 min cycles |
| Decision budget tracking | Danziger et al.; Baumeister | Favorable rulings: 65% → ~0% within session |
| Local-first privacy | Deshmukh; Deloitte | 56% felt differently treated after disclosure |
| Body doubling | Eagle et al.; Ara et al. | Faster completion, greater sustained attention |
| Non-punitive design | ADHD app failure literature | 12–47+ app download-hope-abandon cycle |
| Working memory externalization | Kofler et al. | d = 2.01–2.05 on construct-valid WM tests |
| Zero-friction capture | Sweller cognitive load; Friedman et al. | 45% of ADHD children have writing deficits |
| Semantic/associative retrieval | White & Shah; Hoogman et al. | Wider semantic activation; more flexible association |
| Auto-classification | McKinsey; Hick's Law | 1.8h/day searching; decision time ∝ log(choices) |
| Event-based surfacing | Altgassen et al. | Time-based PM impaired (η² = .415); event-based intact |
| Voice capture priority | Friedman et al.; Berninger et al. | Verbal expression preserved; writing WM-constrained |
| Context-rich capture | Tulving & Thomson; Choi et al. | Encoding specificity; stronger effects at low-frequency locations |
| Progressive disclosure UX | Hwang et al.; ACM ADHD study | Optimal 3 initial options; ADHD-friendly interfaces |
| AI as scaffold, not substitute | EEG study; meta-analysis of 47 experiments | AI-as-substitute: 72% → 39% conceptual scores |

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **PINCH** | Passion, Interest, Novelty, Challenge, Hurry — the five activators of the ADHD interest-based nervous system |
| **JITAI** | Just-in-Time Adaptive Intervention — delivering the right intervention at the right time based on real-time state |
| **RAPTOR+** | Recursive Abstractive Processing for Tree-Organized Retrieval — hierarchical embedding strategy |
| **GTD** | Getting Things Done — David Allen's task management methodology |
| **CRDT** | Conflict-free Replicated Data Type — data structures that merge without coordination |
| **NER** | Named Entity Recognition — AI extraction of people, projects, etc. from text |
| **FTS5** | Full-Text Search v5 — SQLite's built-in full-text search engine |
| **WAL** | Write-Ahead Logging — SQLite mode enabling concurrent reads during writes |
| **ULID** | Universally Unique Lexicographically Sortable Identifier |
