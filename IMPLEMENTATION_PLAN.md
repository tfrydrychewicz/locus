# Locus — Implementation Plan

> Phased delivery plan where every increment is a working, testable system.
>
> Each phase produces a deployable artifact with standalone value.

---

## Guiding Principles

1. **Every phase ships working software.** No phase is "just infrastructure." Each ends with a usable feature set.
2. **Vertical slices over horizontal layers.** Each feature is built end-to-end: domain → data → backend → UI → tests → Storybook.
3. **Tests are not optional.** No feature merges without tests. No component merges without a Storybook story.
4. **Progressive complexity.** Start with the simplest valuable thing; add intelligence in later phases.
5. **ADHD-first UX from day one.** Even Phase 0 follows progressive disclosure and non-punitive patterns.

---

## Phase 0: Foundation & Tooling (Weeks 1–3)

> **Goal:** Monorepo scaffolding, build pipeline, design system foundation, and CI. Nothing user-facing yet, but everything is wired, tested, and deployable.

### 0.1 Monorepo Setup


| Task                      | Details                                                                                                                   | Tests                             | Done |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---- |
| Initialize pnpm workspace | `pnpm-workspace.yaml`, root `package.json`, `.npmrc`                                                                      | CI: `pnpm install` succeeds       | [x]  |
| Configure Turborepo       | `turbo.json` with `build`, `test`, `lint`, `typecheck` pipelines                                                          | CI: `turbo run build` succeeds    | [x]  |
| Create package scaffolds  | `packages/core`, `packages/ui`, `packages/tokens`, `packages/shared`, `packages/i18n`, `packages/help`, `packages/config` | Each package builds independently | [x]  |
| TypeScript config         | `tsconfig.base.json` with strict mode; per-package configs extending base                                                 | `turbo run typecheck` passes      | [x]  |
| Biome config              | `biome.json` in `packages/config`; shared across all packages                                                             | `turbo run lint` passes           | [x]  |
| Git hooks                 | Husky + lint-staged: typecheck + lint on pre-commit                                                                       | Commit with errors fails          | [x]  |


### 0.2 Design Token Package (`@locus/tokens`)


| Task                                         | Details                                           | Tests                                          | Done |
| -------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- | ---- |
| Define color tokens (light + dark)           | Semantic colors for both themes from DESIGN.md §9 | Unit: both themes export correctly             | [x]  |
| Define spacing, typography, animation tokens | Complete token set                                | Unit: tokens are type-safe                     | [x]  |
| Create Tailwind preset                       | `tailwind.preset.ts` with `dark:` variant support | Build: Tailwind resolves all tokens            | [x]  |
| Document tokens                              | Token catalog page in Storybook (both themes)     | Visual: token showcase renders in light + dark | [x]  |


### 0.3 Storybook Setup


| Task                     | Details                                                             | Tests                                  | Done |
| ------------------------ | ------------------------------------------------------------------- | -------------------------------------- | ---- |
| Configure Storybook 8    | `apps/storybook/` consuming `@locus/ui`                             | `storybook build` succeeds             | [x]  |
| Add Tailwind integration | PostCSS + Tailwind in Storybook                                     | Styles render correctly                | [x]  |
| Add accessibility addon  | `@storybook/addon-a11y`                                             | a11y checks run on stories             | [x]  |
| Add theme toggle         | Toolbar addon to switch light/dark; both themes render all stories  | Visual: both themes render             | [x]  |
| Add i18n decorator       | Storybook decorator with i18next provider + locale switcher (en/pl) | Visual: stories render in both locales | [x]  |


### 0.4 Shared Utilities (`@locus/shared`)


| Task                | Details                                               | Tests                                      | Done |
| ------------------- | ----------------------------------------------------- | ------------------------------------------ | ---- |
| `Result<T, E>` type | Type-safe error handling without exceptions           | Unit: Result creation, mapping, unwrapping | [x]  |
| ULID generator      | `generateId(): ULID`                                  | Unit: uniqueness, sortability              | [x]  |
| Typed event emitter | `EventEmitter<EventMap>` with type-safe on/off/emit   | Unit: subscribe, emit, unsubscribe         | [x]  |
| Date utilities      | Formatters, range helpers, timezone-aware comparisons | Unit: edge cases (DST, boundaries)         | [x]  |
| Zod schema helpers  | Shared validation schemas (ULID, DateTime, etc.)      | Unit: valid/invalid inputs                 | [x]  |


### 0.5 Internationalization (`@locus/i18n`)


| Task                          | Details                                                               | Tests                                   | Done |
| ----------------------------- | --------------------------------------------------------------------- | --------------------------------------- | ---- |
| i18next + react-i18next setup | Configure with namespace lazy-loading; ICU MessageFormat              | Unit: provider renders                  | [x]  |
| EN locale namespace files     | `common.json` with shared strings (buttons, labels, status)           | Unit: all keys parse                    | [x]  |
| PL locale namespace files     | Mirror of EN; 100% coverage                                           | CI: `i18next-parser` flags missing keys | [x]  |
| Typed `useTranslation` hook   | Generate TypeScript types from EN namespace files                     | Unit: type-safe `t()` calls             | [x]  |
| i18next-parser config         | Auto-extract keys from source; CI step to detect missing translations | CI: missing key = build failure         | [x]  |
| Date/number formatting        | Locale-aware via `Intl.DateTimeFormat` / `Intl.NumberFormat`          | Unit: formatting in en and pl           | [x]  |


### 0.6 Contextual Help (`@locus/help`)


| Task                      | Details                                                       | Tests                               | Done |
| ------------------------- | ------------------------------------------------------------- | ----------------------------------- | ---- |
| `HelpButton` component    | Small `?` icon button accepting `topic` prop                  | Storybook: default, hover, active   | [x]  |
| `HelpPanel` component     | Slide-out panel (400px) rendering MDX content                 | Storybook: open, closed, loading    | [x]  |
| `HelpProvider` context    | React context wrapping app; manages open/close + active topic | Unit: provider state management     | [x]  |
| `useHelp` hook            | Programmatically open help: `useHelp('notes.editor')`         | Unit: opens correct topic           | [x]  |
| Help topic registry       | Topic → file mapping; related topics                          | Unit: all topics resolve            | [x]  |
| Initial help content (EN) | `getting-started.mdx` — first article                         | Renders in HelpPanel                | [x]  |
| Initial help content (PL) | Polish translation of `getting-started.mdx`                   | Renders in HelpPanel with pl locale | [x]  |


### 0.7 CI/CD Pipeline


| Task                    | Details                                                               | Done |
| ----------------------- | --------------------------------------------------------------------- | ---- |
| GitHub Actions workflow | On PR: install → build → typecheck → lint → test → i18n-check         | [x]  |
| i18n completeness check | CI step: verify all EN keys exist in PL; fail on missing              | [x]  |
| Turborepo caching       | Remote cache for faster CI (via `TURBO_TOKEN` / `TURBO_TEAM` secrets) | [x]  |
| Branch protection       | Require CI pass for merge to main (no review required for solo dev)   | [x]  |


### Phase 0 Definition of Done

- `pnpm install && turbo run build test lint typecheck` passes from clean clone
- Storybook runs locally with token showcase page, theme toggle (light/dark), and locale switcher (en/pl)
- i18n: EN and PL `common.json` files exist; CI check passes for translation completeness
- Help: `HelpButton` and `HelpPanel` render in Storybook with `getting-started` topic
- CI pipeline green on empty PR
- All packages have `README.md` with purpose and usage

---

## Phase 1: Core Desktop Shell & Note Editor (Weeks 4–8)

> **Goal:** A working Tauri desktop app with a rich text note editor, local SQLite storage, and the first UI components in Storybook. Users can create, edit, and search notes.

### 1.1 Tauri Desktop App (`apps/desktop`)


| Task                         | Details                                                           | Tests                                                      | Done |
| ---------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| Scaffold Tauri v2 + React 19 | Vite + React + Tauri; Rust backend compiles                       | Build: app launches                                        | [x]  |
| Window management            | Main window, titlebar, resize/minimize/maximize                   | Manual: window behaves correctly                           | [x]  |
| Tauri command infrastructure | Typed command bindings; Zod validation in Rust → TS               | Unit: command validation                                   | [x]  |
| SQLite setup in Rust         | rusqlite + WAL + 64MB cache + mmap + 8KB pages; migration runner  | Integration: DB creates, migrates                          | [x]  |
| Scale-ready DB config        | All PRAGMA settings from DESIGN.md §13.2; partial indexes from §8 | Integration: PRAGMA values verified                        | [x]  |
| Cursor-based pagination      | `Page<T>` response type; keyset pagination helper in Rust         | Unit: cursor encode/decode; Integration: paginated queries | [x]  |
| Count cache table            | `count_cache` table + trigger infrastructure                      | Integration: counts maintained                             | [x]  |


### 1.2 Core Domain — Notes (`@locus/core`)


| Task                      | Details                                                            | Tests                              | Done |
| ------------------------- | ------------------------------------------------------------------ | ---------------------------------- | ---- |
| `Note` domain model       | Interface + factory + validation (Zod schema)                      | Unit: creation, validation         | [x]  |
| `NoteRepository` port     | Interface for CRUD + FTS search + cursor-paginated list            | — (port only)                      | [x]  |
| `Page<T>` pagination type | Cursor-based pagination response with totalEstimate                | Unit: type construction            | [x]  |
| Note use cases            | `CreateNote`, `UpdateNote`, `DeleteNote`, `SearchNotes`, `GetNote` | Unit: each use case with mock repo | [x]  |
| `NoteFilter` value object | Filter by archived, date range, template                           | Unit: filter logic                 | [x]  |


### 1.3 Data Layer — Notes


| Task                    | Details                                       | Tests                                     | Done |
| ----------------------- | --------------------------------------------- | ----------------------------------------- | ---- |
| `notes` table migration | Schema from DESIGN.md §8                      | Integration: table exists after migration | [x]  |
| `notes_fts` FTS5 table  | Virtual table + triggers for sync             | Integration: FTS search returns results   | [x]  |
| SQLite note repository  | Implements `NoteRepository` port via rusqlite | Integration: CRUD + search with real DB   | [x]  |
| Tauri note commands     | IPC handlers calling use cases                | Integration: invoke from frontend works   | [x]  |


### 1.4 Atom Components (`@locus/ui`)


| Component | Props                                              | Stories                                              | Tests                         | Done |
| --------- | -------------------------------------------------- | ---------------------------------------------------- | ----------------------------- | ---- |
| `Button`  | variant, size, disabled, loading, icon, onClick    | Primary, Secondary, Ghost, Danger, Disabled, Loading | Click handler, disabled state | [ ]  |
| `Input`   | value, placeholder, onChange, error, icon          | Default, WithIcon, WithError, Disabled               | Value change, error display   | [ ]  |
| `Badge`   | variant (default, success, warning, danger), label | All variants                                         | Renders label                 | [ ]  |
| `Chip`    | label, color, icon, onRemove, onClick              | Entity chip, note chip, removable                    | Click, remove handlers        | [ ]  |
| `Icon`    | name (Lucide), size, color                         | Common icons                                         | Renders SVG                   | [ ]  |
| `Spinner` | size                                               | Small, Medium, Large                                 | Renders animation             | [ ]  |
| `Tooltip` | content, position                                  | Top, Bottom, Left, Right                             | Shows on hover                | [ ]  |


### 1.5 Molecule Components


| Component      | Props                                        | Stories                          | Tests              | Done |
| -------------- | -------------------------------------------- | -------------------------------- | ------------------ | ---- |
| `SearchBar`    | value, onChange, placeholder, loading        | Empty, WithQuery, Loading        | Debounced onChange | [ ]  |
| `FormField`    | label, error, required, children             | WithInput, WithSelect, WithError | Error display      | [ ]  |
| `EmptyState`   | icon, title, description, action             | WithAction, WithoutAction        | Action click       | [ ]  |
| `NoteListItem` | title, excerpt, updatedAt, onClick, selected | Default, Selected, Archived      | Click handler      | [ ]  |


### 1.6 Note Editor


| Task                         | Details                                                                           | Tests                                | Done |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------------------------ | ---- |
| TipTap editor setup          | StarterKit + Placeholder + TextStyle + basic formatting                           | Component: renders, accepts input    | [ ]  |
| `SlashCommand` extension     | `/` trigger → command palette (task, date, callout, mermaid, excalidraw, chart)   | Component: triggers, renders options | [ ]  |
| `Callout` extension          | Info/warning/success/danger callout blocks with icon and editable content         | Component: all callout types         | [ ]  |
| `CalloutView` node view      | Colored block with icon selector and editable body                                | Storybook: all variants              | [ ]  |
| Auto-save (500ms debounce)   | Debounced save on content change via Tauri command                                | Integration: saves after debounce    | [ ]  |
| Note list panel              | Sidebar list of notes with search                                                 | Component: filters on search         | [ ]  |
| Split view layout            | List (240px) + Editor (flex)                                                      | Component: renders both panes        | [ ]  |
| Keyboard shortcuts           | `Cmd+N` (new), `Cmd+F` (search)                                                   | E2E: shortcuts work                  | [ ]  |
| Mermaid code block rendering | Detect `language=mermaid` in code blocks; debounced SVG preview; hide-code toggle | Component: renders diagram           | [ ]  |
| Chart code block rendering   | Detect `language=chart` in code blocks; Recharts-based rendering                  | Component: renders chart             | [ ]  |


### 1.7 Sidebar & Navigation


| Task                      | Details                                         | Tests                                | Done |
| ------------------------- | ----------------------------------------------- | ------------------------------------ | ---- |
| Sidebar component         | Navigation items, active state, icons           | Storybook: all states (light + dark) | [ ]  |
| Basic routing             | Today, Notes, Settings pages (shell only)       | Navigation works                     | [ ]  |
| Command Palette (`Cmd+K`) | Fuzzy search over commands; note search via IPC | Component: filters, keyboard nav     | [ ]  |


### 1.8 Settings Shell


| Task                         | Details                                                                                          | Tests                                                 | Done |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ---- |
| `SettingsModal` layout       | Two-pane modal: left nav (180px, category tree) + right content pane + single Save/Cancel footer | Storybook: open, with categories                      | [ ]  |
| `SettingsNav` component      | Category groups (icon + bold label) with indented subcategory items; active state highlighting   | Storybook: all categories, active states              | [ ]  |
| Dirty tracking               | Settings store tracks modified fields; confirmation dialog on navigate-away with unsaved changes | Unit: dirty detection; Component: confirmation dialog | [ ]  |
| Appearance → Theme           | System / Dark / Light selector; persisted in settings DB                                         | Integration: theme switches, persists                 | [ ]  |
| Appearance → Language        | English / Polish selector; persisted; reloads i18n namespace                                     | Integration: locale switches, all strings update      | [ ]  |
| `settings.json` locale files | EN + PL for all settings labels and descriptions                                                 | CI: 100% PL coverage                                  | [ ]  |
| Help content: Settings       | `settings/overview.mdx` (EN + PL)                                                                | HelpPanel renders content                             | [ ]  |


### 1.9 i18n & Help for Notes


| Task                      | Details                                                              | Tests                          | Done |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------ | ---- |
| `notes.json` locale files | EN + PL for all note feature strings                                 | CI: 100% PL coverage           | [ ]  |
| `common.json` expansion   | Buttons, labels, errors for Phase 1 features                         | CI: 100% PL coverage           | [ ]  |
| Help content: Note Editor | `notes/editor.mdx` with quick answer + expandable sections (EN + PL) | HelpPanel renders content      | [ ]  |
| Help content: Search      | `notes/search.mdx` (EN + PL)                                         | HelpPanel renders content      | [ ]  |
| HelpButton integration    | `?` button in note editor header and search view                     | Component: opens correct topic | [ ]  |


### Phase 1 Definition of Done

- App launches on macOS with sidebar, note list, and TipTap editor
- Notes persist in SQLite across app restarts
- FTS search works in command palette and search bar
- Note list uses cursor-based pagination and virtualized rendering
- Scale test: seed 100K notes → list scrolls smoothly, FTS search < 100ms
- Settings modal works with left nav (categories/subcategories), right content pane, single Save button, dirty tracking
- Light and dark themes both work via Settings → Appearance → Theme
- All UI text comes from i18n; language switchable via Settings → Appearance → Language
- Note editor and search views have `?` help buttons with contextual documentation
- All atom and molecule components in Storybook with stories and tests (both themes, both locales)
- CI passes with > 80% coverage on `@locus/core` and `@locus/ui`; i18n completeness check green
- Auto-save works with 500ms debounce

---

## Phase 2: Entity System & Knowledge Graph (Weeks 9–13)

> **Goal:** Entity types (Person, Project, Team, Decision, OKR), @mentions in notes, [[note links]], and the knowledge graph. The system starts connecting information automatically.

### 2.1 Core Domain — Entities


| Task                                             | Details                                                            | Tests                                       | Done |
| ------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------- | ---- |
| `Entity`, `EntityType` domain models             | Interfaces + validation + field type system (incl. computed_query) | Unit: creation, field validation            | [ ]  |
| `FieldDefinition` type system                    | All 9 field types including `computed_query` with LQL expression   | Unit: field type validation                 | [ ]  |
| `EntityRepository`, `EntityTypeRepository` ports | CRUD + search + mention queries + computed field evaluation        | — (ports)                                   | [ ]  |
| Entity use cases                                 | CRUD, search, trash/restore, hard delete                           | Unit: each use case                         | [ ]  |
| `EntityMention`, `NoteRelation` models           | Mention types, relation types                                      | Unit: creation                              | [ ]  |
| LQL parser (`@locus/core/lql`)                   | Parse LQL expressions to AST; validate syntax and entity type refs | Unit: valid/invalid queries parse           | [ ]  |
| LQL evaluator                                    | Evaluate AST against entity repository; return matching entities   | Integration: queries return correct results | [ ]  |


### 2.2 Data Layer — Entities


| Task                                           | Details                                                               | Tests                       | Done |
| ---------------------------------------------- | --------------------------------------------------------------------- | --------------------------- | ---- |
| `entity_types`, `entities` migrations          | Schema + seed built-in types (Person, Project, Team, Decision, OKR)   | Integration: types seeded   | [ ]  |
| `entity_mentions`, `note_relations` migrations | Schema with foreign keys                                              | Integration: tables created | [ ]  |
| SQLite entity repositories                     | Full CRUD + search + mention tracking + computed field queries        | Integration: all operations | [ ]  |
| Tauri entity commands                          | IPC handlers for entities incl. `evaluate-computed` and `parse-query` | Integration: invoke works   | [ ]  |


### 2.3 Note Templates


| Task                          | Details                                                                        | Tests                             | Done |
| ----------------------------- | ------------------------------------------------------------------------------ | --------------------------------- | ---- |
| `NoteTemplate` domain model   | Interface: id, name, icon, body (TipTap JSON), entityTypeId, autoCreateTrigger | Unit: creation, validation        | [ ]  |
| Template repository           | CRUD + list                                                                    | Integration: all operations       | [ ]  |
| Template list panel           | Sidebar list of templates with create/edit/delete                              | Component: list renders           | [ ]  |
| Template editor               | TipTap editor (subset of extensions) for editing template body                 | Component: renders, edits         | [ ]  |
| Create note from template     | `notes:create` with `templateId` pre-fills body from template                  | Integration: template applied     | [ ]  |
| Template-based meeting notes  | Calendar events can auto-create notes from a configured template               | Integration: meeting note created | [ ]  |
| `templates.json` locale files | EN + PL for template feature strings                                           | CI: 100% PL coverage              | [ ]  |


### 2.4 TipTap Extensions — Mentions & Links


| Task                           | Details                                                 | Tests                                  | Done |
| ------------------------------ | ------------------------------------------------------- | -------------------------------------- | ---- |
| `@mention` extension           | `@` trigger → entity search dropdown → MentionChip node | Component: triggers, searches, inserts | [ ]  |
| `[[noteLink]]` extension       | `[[` trigger → note search → NoteLinkChip node          | Component: triggers, searches, inserts | [ ]  |
| `MentionChip` node view        | Blue chip; red if trashed; click → entity popup         | Storybook: all states                  | [ ]  |
| `NoteLinkChip` node view       | Green chip; grey if archived; click → note popup        | Storybook: all states                  | [ ]  |
| Entity mention rebuild on save | Sync manual @mention nodes to `entity_mentions`         | Integration: mentions tracked          | [ ]  |
| Note relation rebuild on save  | Sync [[links]] to `note_relations`                      | Integration: relations tracked         | [ ]  |


### 2.5 Entity UI


| Component              | Details                                                                        | Stories                      | Tests                    | Done |
| ---------------------- | ------------------------------------------------------------------------------ | ---------------------------- | ------------------------ | ---- |
| `EntityList`           | Entity list panel with type filter, search, sort                               | Filtered, Empty, Loading     | Filter + sort behavior   | [ ]  |
| `EntityDetail`         | Entity form with dynamic fields from schema (incl. computed fields)            | Person, Project, Custom Type | Field rendering, save    | [ ]  |
| `ComputedFieldDisplay` | Read-only entity chip list rendered from LQL query results                     | Loading, WithResults, Empty  | Renders entity chips     | [ ]  |
| `QueryFieldEditor`     | LQL editor with syntax highlighting + autocomplete for entity types            | Empty, WithQuery, WithError  | Validates syntax         | [ ]  |
| `EntityTypeModal`      | Create/edit entity types with field schema builder (incl. computed_query type) | Create, Edit                 | Field add/remove/reorder | [ ]  |
| `EntityMentionPopup`   | Info popup on @mention click                                                   | Active, Trashed              | Shows entity info        | [ ]  |
| `NoteLinkPopup`        | Info popup on [[link]] click                                                   | Active, Archived             | Shows note info          | [ ]  |


### 2.6 Backlinks & Related Notes


| Task                       | Details                                                       | Tests                                            | Done |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------------------ | ---- |
| Backlinks footer in editor | Count + expandable list of notes linking to current           | Component: shows backlinks                       | [ ]  |
| Trash system               | Soft-delete for notes (archived_at) and entities (trashed_at) | Integration: soft-delete + restore + hard-delete | [ ]  |
| `TrashView`                | Full-screen view with restore + permanent delete              | Component: restore/delete actions                | [ ]  |


### Phase 2 Definition of Done

- Five built-in entity types with full CRUD
- Note templates: create, edit, delete; create note from template; meeting notes auto-created from template
- @mentions and [[note links]] work in the editor
- Knowledge graph (mentions + relations) builds automatically on note save
- Computed query fields (LQL) work: e.g., Team.members shows all Person entities where `team = {this}`
- QueryFieldEditor provides syntax highlighting and autocomplete for LQL
- Backlinks show in note editor footer
- Trash with restore and permanent delete
- All entity components in Storybook (incl. ComputedFieldDisplay, QueryFieldEditor)

---

## Phase 3: AI Pipeline & Semantic Search (Weeks 14–19)

> **Goal:** AI-powered NER, embedding pipeline, semantic search, and AI chat. The knowledge system becomes intelligent — it auto-detects entities, embeds notes, and answers questions about your knowledge base.

### 3.1 AI Subsystem (`@locus/ai`)


| Task                        | Details                                                                   | Tests                                       | Done |
| --------------------------- | ------------------------------------------------------------------------- | ------------------------------------------- | ---- |
| Multi-provider architecture | Provider adapters (Anthropic, OpenAI, Ollama)                             | Unit: adapter interface compliance          | [ ]  |
| Feature slot registry       | 15 slots with default chains                                              | Unit: slot resolution                       | [ ]  |
| Model router                | `resolveChain` + `callWithFallback`                                       | Unit: fallback on failure                   | [ ]  |
| Prompt templates            | Version-controlled prompts for all AI features                            | Snapshot: prompt content                    | [ ]  |
| AI provider settings        | Store/retrieve API keys, configure slots                                  | Integration: settings persist               | [ ]  |
| OS keychain integration     | Store API keys in OS keychain via Tauri keyring plugin (not plaintext DB) | Integration: keys stored/retrieved securely | [ ]  |


### 3.2 Embedding Pipeline


| Task                             | Details                                                                        | Tests                                  | Done |
| -------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------- | ---- |
| Text chunker                     | ~1600 char, sentence-bounded, ~200 char overlap                                | Unit: chunk sizes, boundaries          | [ ]  |
| L1 embedding (raw chunks)        | Chunk → embed → store in chunk_embeddings (vec0)                               | Integration: vectors stored            | [ ]  |
| L2 embedding (note summaries)    | LLM summarize → embed → store in summary_embeddings                            | Integration: summaries generated       | [ ]  |
| sqlite-vec integration           | vec0 virtual tables; cosine distance KNN                                       | Integration: similarity search works   | [ ]  |
| Separate vector DB               | Vector tables in `vectors.db` (ATTACH DATABASE)                                | Integration: cross-DB queries work     | [ ]  |
| Embedding queue (persistent)     | Priority-based queue in `embedding_queue` table; batch of 32; survives restart | Integration: queue persists, processes | [ ]  |
| Embedding pipeline orchestration | Fire-and-forget on note save; deferred to focus loss                           | Integration: pipeline runs async       | [ ]  |
| Embedding dirty flag             | Track which notes need re-embedding                                            | Integration: dirty flag clears         | [ ]  |
| Bulk import pipeline             | Stream notes in batches of 100; embed in batches of 32; progress bar           | Integration: 1K notes imported < 30s   | [ ]  |


### 3.3 NER Pipeline


| Task                       | Details                                           | Tests                          | Done |
| -------------------------- | ------------------------------------------------- | ------------------------------ | ---- |
| Entity detection           | Match note text against existing entities via LLM | Integration: entities detected | [ ]  |
| Auto-mention decoration    | Highlight NER-detected spans in editor            | Component: decorations appear  | [ ]  |
| Confidence-based filtering | Only show high-confidence auto-detections         | Unit: threshold filtering      | [ ]  |
| NER on every note save     | Fire-and-forget; push `note:ner-complete`         | Integration: mentions upserted | [ ]  |


### 3.4 Semantic Search


| Task                         | Details                                     | Tests                           | Done |
| ---------------------------- | ------------------------------------------- | ------------------------------- | ---- |
| Query expansion              | LLM expands query to related concepts       | Unit: expansion produces terms  | [ ]  |
| Hybrid search (FTS + vector) | Parallel FTS5 + KNN; Reciprocal Rank Fusion | Integration: merged results     | [ ]  |
| Re-ranking                   | LLM re-ranks top candidates                 | Integration: order changes      | [ ]  |
| SearchView                   | Full-screen search with result excerpts     | Component: renders results      | [ ]  |
| Graceful degradation         | FTS-only when no embedding model configured | Integration: FTS fallback works | [ ]  |


### 3.5 AI Chat


| Task                  | Details                                            | Tests                               | Done |
| --------------------- | -------------------------------------------------- | ----------------------------------- | ---- |
| Chat sidebar          | Message list, input, model selector                | Storybook: loading, messages, error | [ ]  |
| Context assembly      | FTS search + graph RAG + entity context + calendar | Integration: context gathered       | [ ]  |
| Tool use              | Create/update tasks, events, notes via AI          | Integration: tools execute          | [ ]  |
| Streaming responses   | Token-by-token rendering                           | Component: streaming display        | [ ]  |
| Web search (optional) | DuckDuckGo search + page extraction                | Integration: search returns results | [ ]  |


### 3.6 Inline AI Generation


| Task                  | Details                                                                                                  | Tests                                       | Done |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---- |
| `AISpace` extension   | Space on empty line → opens AI prompt modal in insert mode                                               | Component: triggers on space                | [ ]  |
| `AIPromptModal`       | Modal for inline AI prompt; insert mode (replace empty paragraph) + replace mode (replace selection)     | Storybook: insert, replace modes            | [ ]  |
| Inline AI IPC         | `notes:ai-inline` → FTS context lookup + LLM generation → TipTap JSON nodes inserted as single undo step | Integration: content generated and inserted | [ ]  |
| Selection bubble menu | AI option in text selection bubble → opens AIPromptModal in replace mode                                 | Component: menu appears, opens modal        | [ ]  |


### 3.7 Excalidraw Integration


| Task                               | Details                                                                                                     | Tests                                    | Done |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---- |
| `ExcalidrawEmbed` TipTap extension | Atom node for inline whiteboard drawings                                                                    | Component: node renders                  | [ ]  |
| `ExcalidrawView` node view         | SVG preview in view mode; View/Edit/Generate header buttons; drag-resize handle                             | Storybook: view, resize                  | [ ]  |
| Excalidraw edit modal              | Full Excalidraw React canvas mounted imperatively; save on close                                            | Component: opens, edits, saves           | [ ]  |
| AI diagram generation              | Two-step: LLM generates structured plan (nodes + edges) → deterministic Rust/TS renders Excalidraw elements | Integration: prompt → diagram            | [ ]  |
| Lazy loading                       | Excalidraw React (~2 MB) loaded via dynamic import on first use                                             | Integration: no impact on initial bundle | [ ]  |


### 3.8 Action Item Extraction


| Task                               | Details                                         | Tests                             | Done |
| ---------------------------------- | ----------------------------------------------- | --------------------------------- | ---- |
| Extract actions from notes         | LLM extracts tasks from note content            | Integration: tasks extracted      | [ ]  |
| Derive GTD attributes              | AI suggests project, contexts, energy, due date | Integration: attributes populated | [ ]  |
| Action items linked to source note | Bidirectional link to source                    | Integration: link maintained      | [ ]  |


### Phase 3 Definition of Done

- NER auto-detects entities in notes with confidence scores
- Three-layer embedding pipeline (L1 chunks, L2 summaries) runs on note save
- Persistent embedding queue handles backlog across restarts
- Semantic search returns relevant results with excerpts
- Scale test: 500K embedded chunks → semantic search < 300ms (IVF)
- Bulk import: 1K notes processed in < 30s with progress indicator
- Inline AI generation works in the editor (space on empty line, selection replace)
- Excalidraw whiteboard drawings embeddable in notes with AI diagram generation
- AI chat answers questions about the knowledge base
- AI extracts action items from notes
- API keys stored in OS keychain, not plaintext
- All AI features degrade gracefully without API keys

---

## Phase 4: Task Management & Calendar (Weeks 20–25)

> **Goal:** Full GTD task management with PINCH scoring, calendar integration, daily briefs, and meeting intelligence. The system manages both knowledge and work.

### 4.1 Task System


| Task                                 | Details                                                                     | Tests                               | Done |
| ------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------- | ---- |
| `Task` domain model with GTD + PINCH | Full model from DESIGN.md §6                                                | Unit: state transitions, validation | [ ]  |
| Task repository                      | CRUD + filter by status, project, GTD category                              | Integration: all queries            | [ ]  |
| GTD views                            | Inbox, Projects, Waiting, Someday tabs                                      | Component: correct filtering        | [ ]  |
| `TaskCard` component                 | Title, status, chips (project, context, energy), due date                   | Storybook: all states               | [ ]  |
| `TaskDetailPanel`                    | Right overlay with full task editing                                        | Storybook: open, editing            | [ ]  |
| PINCH activation scoring             | Score tasks by Passion, Interest, Novelty, Challenge, Hurry                 | Unit: scoring algorithm             | [ ]  |
| Task suggestions                     | "What should I work on?" → top 2–3 ranked by PINCH × Energy × Priority      | Integration: suggestions ranked     | [ ]  |
| AI task breakdown                    | One-tap decomposition with adjustable granularity                           | Integration: subtasks generated     | [ ]  |
| Slash command `/task`                | Create task inline in editor                                                | Component: slash command works      | [ ]  |
| `ActionTaskItem` extension           | TipTap node view: status checkbox, GTD attribute chips, inline detail popup | Storybook: all task states          | [ ]  |


### 4.2 Calendar


| Task                 | Details                                        | Tests                         | Done |
| -------------------- | ---------------------------------------------- | ----------------------------- | ---- |
| Calendar view        | Day / Work Week / Week / Month modes           | Component: all view modes     | [ ]  |
| Local event CRUD     | Create, edit, delete calendar events           | Integration: events persist   | [ ]  |
| Calendar sync engine | Provider adapters (Google Apps Script, CalDAV) | Integration: events sync      | [ ]  |
| Meeting modal        | Create/edit meetings with attendee search      | Storybook: create, edit modes | [ ]  |
| Meeting note linking | Link notes to calendar events                  | Integration: link maintained  | [ ]  |


### 4.3 Daily Briefs


| Task                      | Details                                | Tests                        | Done |
| ------------------------- | -------------------------------------- | ---------------------------- | ---- |
| Brief generation pipeline | Gather inputs → LLM generate → store   | Integration: brief generated | [ ]  |
| `TodayView`               | Formatted brief with entity/note chips | Component: renders markdown  | [ ]  |
| Auto-generation           | Generate on first view of the day      | Integration: auto-triggers   | [ ]  |


### 4.4 Daily Rituals


| Task                            | Details                                                                                                            | Tests                                | Done |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ---- |
| Morning Launch flow (< 3 min)   | Show max 3 priorities → energy check-in (emoji scale) → adjust schedule → one-tap "Start day"                      | E2E: flow completes                  | [ ]  |
| Evening Shutdown flow (< 5 min) | Auto-summary → "What went well?" → "Anything unfinished?" → "Top 3 for tomorrow?" → explicit "You're done" message | E2E: flow completes                  | [ ]  |
| Ritual triggers                 | Morning: on first app open of the day; Evening: user-initiated or prompted at configurable time                    | Integration: triggers fire correctly | [ ]  |


### 4.5 Meeting Intelligence


| Task                                      | Details                                                 | Tests                                   | Done |
| ----------------------------------------- | ------------------------------------------------------- | --------------------------------------- | ---- |
| Pre-meeting context cards                 | Auto-surface 15 min before meeting                      | Integration: cards generated            | [ ]  |
| Meeting transcription (Tier 1: cloud STT) | ElevenLabs / Deepgram WebSocket integration             | Integration: transcription starts/stops | [ ]  |
| Post-meeting processing                   | Summary + action item extraction + speaker mapping      | Integration: summary generated          | [ ]  |
| Transcription UI                          | Live preview, start/stop controls, processing indicator | Component: transcription states         | [ ]  |


### 4.6 Entity Reviews


| Task                         | Details                                          | Tests                                    | Done |
| ---------------------------- | ------------------------------------------------ | ---------------------------------------- | ---- |
| Review scheduler             | Background scheduler with configurable frequency | Integration: reviews trigger on schedule | [ ]  |
| Review generator             | Gather entity context → LLM review               | Integration: review generated            | [ ]  |
| Review panel in EntityDetail | Collapsible review cards with acknowledge        | Component: review list                   | [ ]  |


### Phase 4 Definition of Done

- Full GTD task management with Inbox/Projects/Waiting/Someday
- `ActionTaskItem` TipTap extension renders tasks inline with GTD chips
- PINCH scoring produces activation-ranked task suggestions
- Calendar with local events and sync
- Daily briefs auto-generate on first view
- Morning Launch and Evening Shutdown daily rituals work end-to-end
- Meeting transcription with post-meeting processing
- Entity reviews on configurable schedule

---

## Phase 5: Cognitive Support & JITAI (Weeks 26–32)

> **Goal:** The system becomes adaptive. Cognitive state tracking, energy modeling, JITAI interventions, temporal awareness, and gamification. Locus starts learning the user's patterns and intervening proactively.

### 5.1 Cognitive State Tracker (`@locus/cognitive`)


| Task                         | Details                                                                     | Tests                          | Done |
| ---------------------------- | --------------------------------------------------------------------------- | ------------------------------ | ---- |
| Behavioral signal collection | App switch frequency, typing cadence, idle gaps (OS-level)                  | Integration: signals collected | [ ]  |
| State estimation model       | Combine signals → CognitiveState (attention, arousal, energy, valence)      | Unit: state calculation        | [ ]  |
| Operating mode derivation    | Map state → mode (hyperfocus, flow, drift, depleted, dysregulated, startup) | Unit: mode transitions         | [ ]  |
| State persistence            | Store samples in `cognitive_state_samples`                                  | Integration: samples stored    | [ ]  |
| Self-report check-ins        | Periodic "How are you feeling?" micro-surveys                               | Component: check-in UI         | [ ]  |


### 5.2 Energy & Rhythm Modeler


| Task                       | Details                                          | Tests                            | Done |
| -------------------------- | ------------------------------------------------ | -------------------------------- | ---- |
| Chronotype detection       | Derive from activity patterns over 2+ weeks      | Unit: classification logic       | [ ]  |
| Ultradian cycle estimation | Detect personal cycle length from focus patterns | Unit: cycle detection            | [ ]  |
| Energy prediction          | Forecast energy levels for upcoming time blocks  | Unit: prediction accuracy        | [ ]  |
| Energy-aware scheduling    | Peak → deep work; trough → admin; enforce breaks | Integration: schedule generation | [ ]  |
| Decision budget tracking   | Count decisions; warn at 70% and 90% depletion   | Integration: counter works       | [ ]  |
| Boom-bust detection        | Alert on extended hyperfocus > 2× cycle          | Integration: detection triggers  | [ ]  |


### 5.3 JITAI Engine


| Task                            | Details                                                 | Tests                                | Done |
| ------------------------------- | ------------------------------------------------------- | ------------------------------------ | ---- |
| Intervention catalog            | Level 0–3 interventions from DESIGN.md §7.2             | Unit: catalog structure              | [ ]  |
| Intervention selection          | State + context + history → optimal intervention        | Unit: selection logic                | [ ]  |
| Delivery system                 | Desktop notifications, inline cards, ambient cues       | Component: intervention UI           | [ ]  |
| User response tracking          | Record response + 5-min state delta                     | Integration: responses stored        | [ ]  |
| Learning loop (cold start)      | Research-derived default rules                          | Unit: defaults produce interventions | [ ]  |
| Learning loop (personalization) | Gradient-boosted trees on user history (weekly retrain) | Integration: model updates           | [ ]  |


### 5.4 Notification Subsystem


| Task                      | Details                                                                                | Tests                                 | Done |
| ------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- | ---- |
| Notification service      | Central notification dispatcher with frequency limiting (max N/hour, configurable)     | Unit: rate limiting logic             | [ ]  |
| Context-aware suppression | Suppress non-urgent notifications during hyperfocus mode (cognitive state integration) | Integration: suppressed in hyperfocus | [ ]  |
| Notification batching     | Batch mode during focus blocks; deliver digest at block end                            | Integration: digest delivered         | [ ]  |
| Desktop notifications     | Tauri notification plugin with action buttons; gentle sound + visual                   | Integration: notifications appear     | [ ]  |
| Notification preferences  | Per-category settings: frequency, sound, visual style                                  | Component: settings UI                | [ ]  |
| Non-punitive language     | All notification templates use encouraging language (never guilt-based)                | Review: language audit                | [ ]  |


### 5.5 Temporal Awareness


| Task                             | Details                                                                        | Tests                       | Done |
| -------------------------------- | ------------------------------------------------------------------------------ | --------------------------- | ---- |
| Persistent timer                 | Always-visible elapsed timer on current task                                   | Component: timer UI         | [ ]  |
| Duration calibrator              | Track estimated vs. actual; show historical comparison                         | Unit: calibration model     | [ ]  |
| Transition alerts                | T-15, T-10, T-5 before meetings with escalating intensity                      | Integration: alerts fire    | [ ]  |
| Time-boxing                      | Visual countdown; non-punitive expiry dialog                                   | Component: countdown UI     | [ ]  |
| Day ribbon (visual timeline)     | Past → present → future as spatial dimension                                   | Component: timeline renders | [ ]  |
| Deadline proximity visualization | Approaching deadlines rendered as growing visual indicators (not static dates) | Component: indicator grows  | [ ]  |


### 5.6 Gamification


| Task                        | Details                                          | Tests                        | Done |
| --------------------------- | ------------------------------------------------ | ---------------------------- | ---- |
| Micro-completion animations | Satisfying animation + sound on task completion  | Component: animation plays   | [ ]  |
| Progress crystallization    | Accumulated visual artifacts for completed tasks | Component: crystals render   | [ ]  |
| Momentum meter              | Real-time focus visualization                    | Component: meter updates     | [ ]  |
| Surprise rewards            | Random reinforcement for sustained effort        | Integration: rewards trigger | [ ]  |
| Streak-free consistency     | "Days active" without streak penalties           | Component: display logic     | [ ]  |


### 5.7 Working Memory Externalizer


| Task                             | Details                                 | Tests                           | Done |
| -------------------------------- | --------------------------------------- | ------------------------------- | ---- |
| Global capture hotkey            | `Cmd+Shift+Space` → minimal overlay     | E2E: hotkey opens overlay       | [ ]  |
| Voice capture                    | On-device Whisper transcription         | Integration: voice → text       | [ ]  |
| "Not Now" list                   | Capture intrusive thoughts during focus | Component: capture + dismiss    | [ ]  |
| Context snapshots on task switch | Save and restore workspace state        | Integration: snapshot → restore | [ ]  |


### 5.8 Mode Switching (Maker / Manager / Admin)


| Task                   | Details                                   | Tests                         | Done |
| ---------------------- | ----------------------------------------- | ----------------------------- | ---- |
| Mode selector          | Visual mode switch with transition buffer | Component: mode states        | [ ]  |
| Mode-specific surfaces | Filter relevant tools/data per mode       | Integration: filtering works  | [ ]  |
| Cognitive buffer       | 10-min transition period on mode switch   | Integration: buffer activates | [ ]  |


### 5.9 Status Bar


| Task                   | Details                      | Tests                        | Done |
| ---------------------- | ---------------------------- | ---------------------------- | ---- |
| Energy indicator       | Percentage + color-coded bar | Component: all energy levels | [ ]  |
| Cognitive mode display | Current mode with icon       | Component: all modes         | [ ]  |
| Task progress          | Today's completion count     | Component: progress display  | [ ]  |
| Timer display          | Current task elapsed time    | Component: timer ticks       | [ ]  |


### Phase 5 Definition of Done

- Cognitive state tracker estimates attention/energy from behavioral signals
- JITAI engine delivers graduated interventions based on state
- Notification subsystem with rate limiting, batching, and context-aware suppression
- Energy modeler predicts daily energy curve and schedules accordingly
- Temporal awareness features (timer, calibrator, timeline, deadline proximity) are active
- Gamification rewards task completion without punishing gaps
- Global capture hotkey works from any app
- Mode switching with cognitive buffers

---

## Phase 6: Mobile App (Weeks 33–38)

> **Goal:** Companion mobile app (iOS first, then Android) focused on capture, viewing, and responding. Not a desktop clone — a pocket companion.

### 6.1 Expo Setup


| Task                | Details                                            | Tests                   | Done |
| ------------------- | -------------------------------------------------- | ----------------------- | ---- |
| Scaffold Expo app   | Expo Router, NativeWind, `@locus/core` integration | Build: app launches     | [ ]  |
| SQLite on mobile    | expo-sqlite with shared schema                     | Integration: DB works   | [ ]  |
| Sync infrastructure | Automerge sync between desktop and mobile          | Integration: data syncs | [ ]  |


### 6.2 Native UI Components (`@locus/ui-native`)


| Component      | Details                          | Stories                   | Tests         | Done |
| -------------- | -------------------------------- | ------------------------- | ------------- | ---- |
| `NativeButton` | Platform-adaptive button         | All variants              | Tap handler   | [ ]  |
| `NativeInput`  | Text input with platform styling | Default, Error            | Value change  | [ ]  |
| `NativeCard`   | Pressable card with elevation    | Default, Selected         | Press handler | [ ]  |
| `NativeChip`   | Entity/note chip                 | Entity, Note              | Tap handler   | [ ]  |
| `NativeTimer`  | Circular timer with color shifts | Running, Paused, Complete | Timer ticks   | [ ]  |


### 6.3 Mobile Screens


| Screen                    | Features                                      | Tests                               | Done |
| ------------------------- | --------------------------------------------- | ----------------------------------- | ---- |
| **Today**                 | Daily brief summary, current task, day ribbon | Component: renders data             | [ ]  |
| **Capture**               | Voice + text capture to inbox                 | Integration: saves to DB            | [ ]  |
| **Tasks**                 | Today's task list, mark done, snooze          | Component: task actions             | [ ]  |
| **Search**                | Semantic search across notes                  | Integration: search returns results | [ ]  |
| **Intervention Response** | Respond to JITAI nudges                       | Component: response actions         | [ ]  |


### 6.4 Wearable Bridge


| Task                       | Details                                                                      | Tests                                      | Done |
| -------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------ | ---- |
| HealthKit integration      | Read HRV, step count, sleep data (opt-in)                                    | Integration: data reads                    | [ ]  |
| Wearable → cognitive state | Feed HRV/EDA arousal signal into CognitiveState tracker as arousal dimension | Integration: arousal updates from wearable | [ ]  |
| Haptic interventions       | Deliver gentle haptics for JITAI Level 0                                     | Integration: haptic fires                  | [ ]  |


### Phase 6 Definition of Done

- iOS app captures voice/text to inbox
- Syncs with desktop via Automerge
- Shows today's schedule, tasks, and daily brief
- Responds to JITAI interventions
- Wearable data feeds into cognitive state (opt-in)
- All native components in Storybook React Native

---

## Phase 7: Advanced Features & Integrations (Weeks 39–48)

> **Goal:** Body doubling, communication guard, deep integrations (Jira, Slack, GitHub), L3 clustering, import/export, and performance optimization.

### 7.1 Body Doubling


| Task                 | Details                                                                                                                              | Done |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| AI body double       | Ambient presence with periodic check-ins during focus sessions; configurable check-in interval (default 15 min, extends during flow) | [ ]  |
| Focus session system | Start/stop focus sessions with timer and body double option                                                                          | [ ]  |
| Matched partner mode | Focusmate-style matching with another user for mutual accountability (opt-in)                                                        | [ ]  |
| Team focus session   | Shared focus session with team members (manager-initiated, visible availability)                                                     | [ ]  |
| Async accountability | Post-session summary shared with chosen accountability partner                                                                       | [ ]  |


### 7.2 Communication Guard


| Task               | Details                                                                                                                     | Done |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | ---- |
| Impulse delay      | On detected emotional dysregulation (high typing speed + negative sentiment), suggest "Save as draft and review in 15 min?" | [ ]  |
| Tone calibration   | AI tone-check on outgoing messages (opt-in): "This might read as more direct than intended — soften?"                       | [ ]  |
| Response batching  | Queue non-urgent messages for dedicated communication windows                                                               | [ ]  |
| Template responses | Pre-built ADHD-friendly templates for common manager communications (feedback, status updates, pushback)                    | [ ]  |


### 7.3 Integrations


| Integration             | Direction      | Scope                                                   | Done |
| ----------------------- | -------------- | ------------------------------------------------------- | ---- |
| Google Calendar (OAuth) | Bi-directional | Direct OAuth2 sync (replace Apps Script)                | [ ]  |
| Jira / Linear           | Bi-directional | Task sync with PINCH enrichment                         | [ ]  |
| Slack / Teams           | Read + status  | Notification batching, DND sync, status update          | [ ]  |
| GitHub / GitLab         | Read           | PR review scheduling based on energy; activity tracking | [ ]  |


### 7.4 Browser Extension


| Task                  | Details                                                                     | Done |
| --------------------- | --------------------------------------------------------------------------- | ---- |
| Plasmo scaffold       | Cross-browser extension (Chrome, Firefox, Safari) with React                | [ ]  |
| Web capture           | Capture selected text, page URL, and metadata to Locus inbox                | [ ]  |
| Focus tracking        | Tab dwell time and app switch frequency → feed into cognitive state tracker | [ ]  |
| Notification batching | Batch browser-based notifications during focus blocks                       | [ ]  |


### 7.5 L3 Clustering


| Task                 | Details                                 | Done |
| -------------------- | --------------------------------------- | ---- |
| K-means++ clustering | Nightly batch on L2 summaries           | [ ]  |
| Cluster labels       | LLM-generated theme labels              | [ ]  |
| Search boost         | L3 cluster boost in RRF scoring (+0.05) | [ ]  |


### 7.6 Import / Export


| Task              | Details                                      | Done |
| ----------------- | -------------------------------------------- | ---- |
| Import            | Markdown, Notion export, CSV                 | [ ]  |
| Export            | Full DB, Markdown, JSON                      | [ ]  |
| Automatic backups | Daily SQLite backup to configurable location | [ ]  |


### 7.7 Database Partitioning & Maintenance


| Task                             | Details                                                                                                             | Done |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---- |
| Archive database strategy        | Yearly archive DBs (read-only, `ATTACH DATABASE`); configurable archival threshold                                  | [ ]  |
| Archive migration job            | Background job (weekly) moves old notes to archive DBs; rewrites cross-DB pointers                                  | [ ]  |
| Background maintenance scheduler | `PRAGMA optimize` on close; weekly `VACUUM` + `integrity_check`; monthly FTS5 rebuild; event log pruning (> 1 year) | [ ]  |
| Vector DB separation             | All vec0 tables in separate `vectors.db` (already in Phase 3); add monthly vacuum                                   | [ ]  |


### 7.8 Performance Optimization


| Task                    | Details                                                                                                   | Done |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | ---- |
| Profiling               | Identify rendering, DB, and memory bottlenecks                                                            | [ ]  |
| Web Workers             | Offload markdown rendering, JSON parsing, search result formatting to Web Workers                         | [ ]  |
| Performance monitoring  | `PerformanceTrace` struct in Rust; auto-trace Tauri commands; log queries > 100ms with EXPLAIN QUERY PLAN | [ ]  |
| Performance report      | Weekly report in settings: slowest queries, largest tables, index usage stats, cache hit rate             | [ ]  |
| Debug panel             | Expose `PRAGMA compile_options`, `cache_hit_rate`, and DB stats                                           | [ ]  |
| ONNX model optimization | Quantize models; load on demand; release after 5 min idle                                                 | [ ]  |


### 7.9 Privacy & Security Hardening


| Task                         | Details                                                                                                            | Done |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---- |
| SQLCipher encryption at rest | Optional full-database encryption with user-provided passphrase                                                    | [ ]  |
| "What I know" dashboard      | Transparency view showing all learned patterns (rhythm profile, intervention history, energy model); user-editable | [ ]  |
| Data export for portability  | One-tap export of all user data (JSON, CSV, ICS) for data sovereignty                                              | [ ]  |


### Phase 7 Definition of Done

- Body doubling with AI companion + matched partner + team session modes
- Communication guard catches impulsive sends with impulse delay + tone calibration
- Browser extension captures content and feeds focus tracking data
- At least 2 deep integrations (calendar + project tracker)
- Import from Markdown/Notion; Export to Markdown/JSON
- Database partitioning and maintenance scheduler operational
- L3 clustering improves search quality
- Performance profiled, Web Workers deployed, monitoring active
- SQLCipher encryption available; "What I know" dashboard accessible

---

## Phase 8: Polish & Launch Prep (Weeks 49–52)

> **Goal:** Production polish, accessibility audit, documentation, onboarding flow, and distribution.

### 8.1 Onboarding


| Task                   | Details                                                         | Done |
| ---------------------- | --------------------------------------------------------------- | ---- |
| First-run wizard       | Guided setup: name, role, AI provider keys, calendar sync       | [ ]  |
| Progressive disclosure | Show only essential features first; unlock complexity over time | [ ]  |
| Sample data            | Pre-populated demo workspace                                    | [ ]  |


### 8.2 Accessibility


| Task                  | Details                                               | Done |
| --------------------- | ----------------------------------------------------- | ---- |
| WCAG AA + COGA audit  | Full accessibility review with neurodivergent testers | [ ]  |
| Keyboard navigation   | Every action reachable via keyboard                   | [ ]  |
| Screen reader support | ARIA labels on all interactive elements               | [ ]  |
| Reduced motion option | Respect `prefers-reduced-motion`                      | [ ]  |


### 8.3 Distribution


| Task              | Details                            | Done |
| ----------------- | ---------------------------------- | ---- |
| macOS DMG         | Tauri bundler → signed DMG         | [ ]  |
| Windows installer | Tauri bundler → NSIS/WiX installer | [ ]  |
| iOS TestFlight    | Expo EAS Build → TestFlight        | [ ]  |
| Auto-update       | Tauri updater plugin for desktop   | [ ]  |


### 8.4 Documentation


| Task                 | Details                                    | Done |
| -------------------- | ------------------------------------------ | ---- |
| User guide           | In-app help + external docs site           | [ ]  |
| Architecture docs    | Updated DESIGN.md (this document)          | [ ]  |
| API docs             | Generated from Zod schemas                 | [ ]  |
| Storybook deployment | Published Storybook as component reference | [ ]  |


### Phase 8 Definition of Done

- Onboarding flow for new users (< 3 min to first note)
- WCAG AA compliance with COGA considerations
- macOS DMG + Windows installer + iOS TestFlight build
- Auto-update working
- Storybook deployed as component reference
- All tests passing; coverage targets met

---

## Cross-Cutting Concerns (Every Phase)

These are enforced via Cursor rules and CI, not by a specific phase:


| Concern                  | How Enforced                                                                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type safety**          | TypeScript strict mode; no `any`; Zod for runtime validation                                                                                                                              |
| **Testing**              | No merge without tests; coverage gates in CI                                                                                                                                              |
| **Storybook**            | No UI component merge without `.stories.tsx`                                                                                                                                              |
| **Accessibility**        | `@storybook/addon-a11y` checks; ARIA attributes required                                                                                                                                  |
| **Error handling**       | `Result<T, E>` pattern; no unhandled promise rejections                                                                                                                                   |
| **Logging**              | Structured logging; no sensitive data in logs                                                                                                                                             |
| **Performance**          | Lighthouse CI for web; bundle size budget                                                                                                                                                 |
| **Scalability**          | All list queries cursor-paginated; all lists virtualized; no OFFSET pagination; no unbounded `COUNT(*)`; scale tests with 100K+ seeded data in CI                                         |
| **Internationalization** | No hardcoded user-facing strings; all text via `t()` from `@locus/i18n`; EN + PL always 100% complete; CI check enforces PL parity with EN                                                |
| **Theming**              | All components render correctly in both light and dark themes; Storybook stories tested in both; semantic token classes only (no raw colors)                                              |
| **Contextual help**      | Every feature-level view has a `HelpButton` with a corresponding help topic; help content written in EN + PL; MDX content co-located in `packages/help/content/`                          |
| **i18n incremental**     | Each phase creates its own locale namespace files (e.g., Phase 4 creates `tasks.json`, `calendar.json`; Phase 5 creates `cognitive.json`). Both EN + PL delivered with the feature.       |
| **Help incremental**     | Each phase creates help content for its features (e.g., Phase 4 creates `tasks/gtd.mdx`, `tasks/pinch.mdx`; Phase 5 creates `cognitive/energy.mdx`, `cognitive/jitai.mdx`). Both EN + PL. |
| **Documentation**        | README per package; inline JSDoc for public APIs                                                                                                                                          |


---

## Milestone Summary


| Phase | Weeks | Key Deliverable                                                         | Standalone Value         |
| ----- | ----- | ----------------------------------------------------------------------- | ------------------------ |
| **0** | 1–3   | Monorepo + tooling + design tokens + i18n + help system                 | Developer infrastructure |
| **1** | 4–8   | Desktop app + rich note editor (callouts, mermaid, charts) + FTS search | Basic note-taking app    |
| **2** | 9–13  | Entity system + knowledge graph + templates + LQL computed fields       | Connected knowledge base |
| **3** | 14–19 | AI pipeline + semantic search + chat + inline AI + Excalidraw           | AI-powered second brain  |
| **4** | 20–25 | Tasks + calendar + daily briefs + rituals + meetings                    | Full productivity system |
| **5** | 26–32 | Cognitive tracking + JITAI + notifications + gamification               | Adaptive ADHD support    |
| **6** | 33–38 | Mobile app (iOS/Android) + wearable → cognitive state                   | Pocket companion         |
| **7** | 39–48 | Integrations + body doubling + browser ext + DB partitioning + security | Connected ecosystem      |
| **8** | 49–52 | Onboarding + accessibility + distribution                               | Production-ready launch  |


