# Localization sources and review

ARTEX is based on RuoJi6/ARTEX. The existing root LICENSE (AGPL-3.0)
continues to apply. Localization adaptations credit the authors and contributors
of jiwoochris/artex-global and cskwork/scopeweaver; their licenses are also
AGPL-3.0. Existing attribution and license notices are retained.

## Reviewed snapshots

- artex-global: https://github.com/jiwoochris/artex-global/tree/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6
- ScopeWeaver: https://github.com/cskwork/scopeweaver/tree/407c8bbdb7855e683b2be8ffb288dd7776c835ac
- Our RuoJi6 baseline remains `212f7c2807580d524bc23baf8dde8a1bf036a43c`.
  This localization work does not advance the full upstream merge baseline.

The reference forks share RuoJi6 history at `d0033724a63aefbbcc1ed022b0faf4dc4a1fce51`
and `160fe13c243be361eeac5408c40a96e824fa842c`, respectively. Their Sessions
source at those ancestors is identical to `e6ec56999175509551a1e43a3ee3b053d0941bd9`
(v0.3.15). Current source is kept; no rollback or whole-fork merge was performed.

## Reused material

### Current wording preference (2026-10-30)

ScopeWeaver is the preferred English wording reference for shared pre-Autumn
screens. The earlier artex-global reuse below remains historical attribution.
This review adapts ScopeWeaver's `interface`, `common`, `settings`, `app`, and
`english` messages into existing semantic keys across navigation, tasks, chat,
findings/evidence, asset management, settings, agents, LLM profiles/retries, MCP,
skills, tools, notifications, interception, and logs. Its `db/db.go` supplies
bundled Agent descriptions and rule display labels. Current ARTEX behavior,
branding, ICU number/plural formatting and context-specific action/status labels
take precedence when the reference differs. No reference runtime, prompts or
database seed mutations are imported.

Browser review also fixes labels arriving from the backend: Agent bindings in
MCP/Skills/Tools, pinned chat labels and descriptions, the new `asset_mapper`,
the unlinked-assets group and bundled rule labels. Global prompt-variable help
is UI text; editable prompt/tool descriptions and user-defined metadata stay raw.
New task schedule names are localized before editing; timezone behavior stays
upstream-compatible. See TODO.md for tested routes and limits.

### Earlier reuse

artex-global's corresponding frontend files and `web/messages/{zh,en}.json`
provided localization edits and translations for:

- Chat, Workspace, Commands, basic Assets and Findings views, lineage and asset
  trees, LLM records, and logs controls.
- Task Assets, Broadcast, Findings, Retests and Coverage panels.
- Agents/editor, MCP, Skills, Tools, LLM profiles/retries, Notifications and their
  field metadata, interception configuration and approval records.
- Transcript, side questions, approval focus, exploration graph, asset DSL search,
  scope editor, retest/traffic dialogs, HTTP/evidence controls and sortable headers.

Catalog namespaces retained from that source: `agentEditor`, `agentsPage`,
`approval`, `approvalFocus`, `assetInterceptPage`, `assetInterceptRules`,
`assetSearch`, `assets`, `builtinAgents`, `chat`, `commands`, `explorationGraph`,
`findings`, `interceptPage`, `linkTraffic`, `llmPage`, `llmRecords`, `logsPage`,
`mcpPage`, `notifyPage`, `retest`, `scopeEditor`, `sideQuestion`, `skillsPage`,
`sortableHead`, `toolsPage`, `trafficEvidence`, `transcript`, `workspace`.
The reused parts of `taskDetail` are named `taskPanels` here. Existing shared
status and pagination catalogs are used instead of maintaining duplicate copies.
Some identical existing messages are reused across screens through semantic keys.

The previously independent Sessions batch was reviewed against both references.
`taskSessions.newDescription`, `workerMessagePlaceholder`, and `loadingActivity`
reuse artex-global's `sessions.newSession.desc`, `sessions.composer.workerPlaceholder`,
and `sessions.transcript.loadingActivity` (with Main Agent capitalization adapted).
Fixed role/title terminology, model fallbacks, SSE state labels, codepoint limits,
and Worker actions were compared with both forks. Our precise deletion wording,
structured render-time errors, stable metadata, number formatting, and current
upstream SSE/message behavior are retained. In particular, the original Chinese
tool-approval protocol regex is preserved; a Korean regex in artex-global is not
suitable for this checkout.

ScopeWeaver's `web/src/i18n/messages/interface.ts` entries `m2290` through `m2294`
provide the English `sideQuestion.phase` wording under our semantic keys.
Its Sessions entries `m0691` through `m0778` were checked for terminology and UI
states. Its custom runtime looks up catalog entries by key; it does not match
rendered Chinese text. That runtime and its numbered interface keys are not
adopted. Neither fork's agent output-language policy is adopted.

New/changed upstream UI absent from these snapshots is translated in `core`:
intelligence/credential processing, traffic history controls, graph zones and
mapping, approval script snapshots/search, finding folders and reproduction
controls. Persisted titles, protocol mention tokens, report parsing headings,
reports, raw HTTP and backend details keep their original values.

## Adaptations and maintenance

Schedules and Asset Sync completion (2026-10-30): neither pinned reference contains
Schedules. Its `schedules` namespace and the schedule validation `serverErrors`
namespace are written against current source. Asset Sync reuses artex-global's
`assetSync` catalog and compatible next-intl component edits, compared against its
common ancestor and current source. ScopeWeaver's corresponding screen was also
reviewed. Both reference implementations reload on locale changes; this fork
keeps data-loading callbacks stable with current-translator refs for error notifications, so
selection and configuration drafts survive. Existing upstream comments, wire
values and raw source results are retained; formatting and small-screen wrapping
use this fork's shared conventions. No unrelated reference behavior is imported.

Repeater Phase 2 (2026-10-30): checked both pinned reference snapshots above;
neither contains the current Repeater route/components or Repeater translations.
The `repeater` namespace is written against the current upstream workspace.
No reference code or translations were copied for this batch. The original
Chinese parser messages remain as compatibility fallbacks; known typed errors
are translated at the editor and traffic-import display boundaries.

- Keep Chinese default, explicit English opt-in, localStorage persistence, static
  export and the existing provider. Dates use the shared formatter and provider
  timezone, without reading localStorage from formatting helpers.
- Loading effects do not depend on translation callbacks. Asynchronous load
  notifications read the latest translator; renderable failures store raw details
  or message IDs. Expanded Transcript labels translate without fetching again.
- Translate only unmodified seeded agent labels; edited names, descriptions,
  variable labels and all prompts remain verbatim.
- Scope validation uses stable local codes; legacy non-UI callers and mock API
  errors keep Chinese messages. Skill overwrite uses HTTP 409, not text matching.
- Keep current upstream graph layout, findings features, side-question props and
  HTTP selection/search behavior when adapting conflicting localization hunks.
  Graph display labels update without recreating its instance or resetting view.

`web/scripts/i18n-coverage.json` declares strict core coverage and narrow Chinese
literal exceptions. Exceptions are seeded intelligence metadata (translated at
render time), original mock logs, persisted finding conversation titles, mention
protocol values, approval source markers, and generated report headings. Regexes
for existing report/approval formats are protocol parsing, not untranslated UI.
The advisory inventory still reports Phase 2 screens, raw mock data, prompts and
protocol text; its count is not a localization coverage percentage.

For every sync, review changed source wording and both catalogs. Run
`npm run i18n:check -- --base <previous-fork-commit>` to report changed Chinese
values whose English text is unchanged, even when ICU arguments match. This is
an advisory review aid, not semantic proof of translation freshness. Use a fork
commit containing both catalogs; the Chinese-only upstream has no catalog base.
Review strings moved out of upstream JSX against their current source as well.
