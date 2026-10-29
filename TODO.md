# TODO: English option with Chinese default

## Decision

- Chinese (`zh-CN`) remains the default.
- English (`en`) is an explicit UI choice, persisted in localStorage.
- Maintain an independent fork of RuoJi6/ARTEX. No upstream pull request is planned.
- Keep upstream RuoJi6 history and source structure mergeable.
- Use next-intl and semantic keys; borrow reviewed translations and runtime
  safeguards from artex-global and ScopeWeaver without adopting either fork wholesale.
- Prefer a small, stable system over translating every string automatically.
- Do not translate agent reasoning prompts, user content, raw HTTP, evidence,
  reports already saved, identifiers, protocol values, or tool payloads.
- Keep UI language and agent output language as separate settings.
- Disable self-update in fork builds before distributing them. Updates are manual
  builds from this fork; never replace its binary with an upstream release.
- Accept a brief Chinese render before restoring English after hydration, and
  temporary Chinese text in newly merged screens or untranslated backend errors.

Semantic keys still require edits to upstream JSX and can cause merge conflicts.
Keep those edits minimal: no unrelated formatting, renaming, or refactoring.
Never translate arbitrary backend errors by matching their rendered text.

## Phase 0: Prepare the long-lived branch

- [x] Create the GitHub fork (`dunvu0/ARTEX`); point `origin` at it and `upstream`
      at RuoJi6/ARTEX.
- [x] Record the initial upstream baseline in `UPSTREAM_BASE.md` or an equivalent
      maintainer note using a full RuoJi6 commit SHA; update it only after a verified
      full merge. Localization coverage is tracked separately.
- [x] Disable upstream update checks/install actions in the backend and explain
      manual updates in the UI. Hiding the button alone is insufficient.
- [x] Document local builds; ensure fork deployments use their own binaries/images.
      Review inherited release/demo workflows before enabling or publishing them.
- [x] Keep localization changes in focused commits separate from upstream feature
      backports.
- [x] Add a maintainer sync checklist: fetch, diff, classify, merge, localize,
      test, record the new base.

## Phase 1: Frontend foundation and core screens

Start from the current RuoJi6 checkout, not a rollback to Autumn-27.
Historical reference: `e6ec569` (2026-10-07, v0.3.15). For screens already present
there, consult artex-global and ScopeWeaver for translations and implementation
ideas. Verify them against current source, record reference commits and preserve
required attribution for copied material. Do not merge unrelated fork features.

### Foundation

- [x] Use `next-intl` with two catalogs: `web/messages/zh-CN.json` and
      `web/messages/en.json`.
- [x] Use semantic keys (`nav.dashboard`, `task.status.running`, etc.); never use
      Chinese source text as the permanent key.
- [x] Keep Chinese source values in the Chinese catalog for upstream comparison.
- [x] Add an AST inventory script for newly introduced user-facing Chinese strings.
      It reports candidates; it does not rewrite source automatically.
- [x] Add a locale provider and selector. Chinese must be the static and runtime
      default; English applies only after explicit selection.
- [x] Use a client provider compatible with static export, without locale routes,
      middleware, or request-time server locale detection.
- [x] Persist the UI choice in localStorage only; handle unavailable storage by
      retaining the in-memory choice. Restore after hydration, update html lang,
      and keep the initial client render consistent with the Chinese static HTML.
- [ ] Language changes must not remount the app or clear chat/Repeater/form drafts.
      Recompute module-level labels and memoized UI values when locale changes.
- [x] Introduce shared date, number, relative-time, and calendar formatting;
      adopt it in the dashboard, navbar clock, pagination, and date controls.
- [ ] Migrate remaining screens to the shared formatters. Scheduling timezone
      semantics and wire date/time values must remain unchanged.

### Initial implementation (2026-10-29)

- Implemented sidebar labels, navigation search, language selectors on auth/sidebar,
  and the manual-update card. Login/setup content and other screens remain pending.
- Backend update check/install/rollback and startup binary swapping are disabled.
- Local image defaults and inherited release/demo workflow guards are in place.
- Build and sync instructions: `FORK.md`. Changes are not committed or published yet.
- Verified: TypeScript, static export (34 pages), 33 catalog keys, and focused
  backend update tests. Browser checks used the production static export with
  mocked API responses: Chinese default, English persistence, switching back,
  sidebar/search updates, preserved login/Repeater drafts, and blocked locale
  storage. Full chat/live-task behavior and other screens remain unverified.

### Continued implementation (2026-10-29)

- Localized login/setup, terms dialog, and frontend validation using semantic
  keys. Local validation stores message IDs so existing errors change language;
  backend error text remains verbatim. Translations were written against this
  checkout without copying either reference fork.
- Added `npm run i18n:check` for catalog keys, non-empty values, ICU syntax,
  argument/type parity, nested plurals, and rich-text tags; 88 messages pass.
- Added `npm run test:i18n`; all 3 focused catalog/inventory tests pass.
- Added advisory AST inventory: `npm run i18n:inventory -- --base <commit>`.
  Against the recorded upstream baseline, 5,026 candidates remain; the only
  added candidate is the intentional native language label `简体中文` in
  `web/src/i18n/provider.tsx`. Counts are literals, not UI coverage measurements.
- Added `.github/workflows/i18n.yml` for catalog checks/tests, TypeScript, and
  static export. Local TypeScript and static export (34 pages) pass; the workflow
  has not been run on GitHub. `git diff --check` passes.
- Browser checks passed on the production static export with mocked auth APIs:
  Chinese default, English persistence across reload, switching back, preserved
  login/setup password drafts, validation errors updating with locale, minimum
  password length, terms scroll/accept, raw backend errors, and disabled setup
  on unavailable backend. Login/terms and unavailable setup have no horizontal
  overflow at 390px. The sole console error was the intentionally mocked 503.
- Live authentication, chat/live-task state, date/number formatting, shared
  controls, and remaining screens are still pending. Browser tab title remains
  Chinese. No commits, pushes, or full upstream merge were made.

### Navigation, shared controls, and dashboard (2026-10-29)

- Added 204 messages (292 total) for the dashboard, account/password menus,
  preferences, navbar clock/version/egress display, and basic shared controls.
  Translations were written against this checkout without copying either fork.
- Dashboard chart/asset labels now recompute on locale changes. Locale changes
  preserve existing component state; no locale key or full-page reload was added.
- Added `src/i18n/formatting.ts` for date/number formats and DayPicker locales,
  including calendar accessibility labels. The provider restores the browser
  timezone after hydration; the initial static render uses UTC. Date/time wire
  formats and scheduling timezone choices remain unchanged.
- `StatusBadge` translates known statuses at display time. Unknown wire values
  stay raw; newly merged metadata without a translation falls back to its Chinese
  label. Existing pure `statusMeta()` callers and severity filters remain Chinese
  until their screens are covered. Original status metadata is never mutated.
- Dashboard tables scroll horizontally on narrow screens. Navbar version text
  is hidden below `sm` so the English header fits at 390px.
- Catalog checks and all 5 focused tests pass, including strict Chinese-literal
  inventory for 18 declared completed files and status fallback/metadata tests.
  TypeScript and static export (34 pages) pass. The advisory upstream inventory
  contains 4,879 remaining candidates; only the intentional native language name
  `简体中文` is new against the recorded baseline. This is not a coverage percentage.
- Browser checks on the production static export with mocked APIs pass for
  Chinese default, English persistence, switching back, populated dashboard
  labels/statuses and empty states, preserved chart version/range, password and Repeater drafts,
  schedule name/date/time drafts, Chinese/English calendar navigation labels,
  selected calendar month, clearing optional end time, table pagination, and
  localized mobile sidebar titles/controls.
  Raw task/finding/model text, protocol fields, and unknown statuses remain intact.
  At 390px the dashboard/header have no document overflow and the task table is
  horizontally scrollable. No app runtime errors occurred with complete fixtures;
  Chromium reports CSS preload warnings.
- Pending: settings, domain-specific widgets, remaining screens, browser tab
  title, live authentication, chat/live-task/SSE verification, and migration of
  existing per-screen date/status formatting. Fork update/deployment guards and
  English UI changes are committed separately. No upstream merge was made.

### Core screen coverage

- [x] Active navigation, login, and setup, including password dialog, preferences,
      egress banner, search, auth terms, and frontend validation.
- [x] Basic shared controls: copy defaults, status badges, table pagination,
      date/time pickers, calendar labels, and dialog/sheet/sidebar accessibility.
      Caller-supplied text and domain-specific shared widgets remain pending.
- [x] Dashboard, including chart labels/tooltips, empty states, relative time,
      counts, assets, approvals, and known status badges.
- [ ] Settings (apart from the manual-update card).
- [ ] Tasks and templates.
- [ ] Sessions, chat, and workspace.
- [ ] Assets, findings, and traffic: current basic lists and detail views.
- [ ] LLM records, agents, MCP, skills, tools, notifications, and approvals.
- [ ] Translate frontend-authored status labels and validation messages only;
      preserve backend errors/logs until Phase 3.
- [ ] Keep model prompts and agent-generated output unchanged until the separate
      output-language setting is implemented.

### Phase 1 checks

- [x] Catalog key parity, placeholder parity, and non-empty English values.
- [ ] Review changed Chinese catalog values for stale English translations even
      when keys and placeholders are unchanged.
- [ ] AST inventory reports new candidates against an explicit baseline; classify
      UI text, prompts, protocol values, identifiers, evidence, and user data.
      Record narrow exceptions and pending screen coverage. Do not block every
      upstream merge on untranslated new screens.
- [ ] Browser check: fresh session is Chinese; select English; reload; English
      remains; switch back; drafts and active state remain intact.
- [x] Run focused locale tests (`npm run test:i18n`), TypeScript, and static export
      for the current covered batch. Repeat for each subsequent batch and sync.

## Phase 2: Remaining screen coverage, including post-Autumn additions

Use `e6ec569..<recorded RuoJi6 SHA>` only to identify historical additions, not as
a separate implementation branch. Work against current screens and extend this
checklist during each sync. A screen is complete only when its UI states, dialogs,
validation, and empty/loading/error controls are covered; backend error text and
generated content remain explicit exclusions until their later phases.

- [ ] Findings consolidation, duplicate suggestions, cases, merge/reject flows,
      severity filters, search, and sorting.
- [ ] Finding side questions, retest controls, and reproduction screenshots.
- [ ] Repeater workspace, request editor, imports, drafts, history, filters, and
      replay errors.
- [ ] Asset graph and network topology modes, zones, paths, mapping, and viewport.
- [ ] Calendar scheduling, timelines, date ranges, status labels, and bulk actions.
- [ ] Remarks, worker-count settings, multi-model worker pools, and validation.
- [ ] Intelligence views, credential processing, and traffic evidence.
- [ ] Automatic task/chat titles: localize controls/status only; preserve generated
      content.
- [ ] Approval script review, side chat, history search, retries, Basic Auth,
      proxy tests, egress IP, and update settings.

### Phase 2 checks

- [ ] Run the AST inventory against the upstream diff and classify every new string.
- [ ] Add semantic keys and both catalog values for each accepted UI string.
- [ ] Verify English layouts, dates, numbers, filters, drafts, live tasks, Repeater
      state, API responses, SSE reconnects, and error flows.
- [ ] Run catalog checks, AST inventory, TypeScript, static build, and focused
      frontend checks. Run backend checks when backend behavior changes.
- [ ] Record any intentional Chinese text and its reason.

## Phase 3: Stable backend errors and status messages

- [ ] Add stable error codes/message IDs and structured parameters only where
      needed by covered screens. Keep the existing error string for compatibility.
- [ ] Translate known codes at the frontend display boundary. Preserve unknown
      errors and raw details; never regex-match arbitrary rendered errors.
- [ ] Reuse existing machine-readable statuses; never translate wire values or
      persisted evidence. Apply the same display mapping to relevant SSE events.
- [ ] Check old clients, unknown codes, interpolation, and live error/status flows.

No backend locale negotiation, cookies, Accept-Language headers, or SSE/download
language parameters are needed for this phase. If server-rendered localized
messages become necessary, scope that separately and resolve locale per request,
never through mutable process-global request state.

## Phase 4: Optional agent output language

Deferred until UI localization is stable; not required for the English UI release.

- [ ] Add an explicit output-language setting independent of the UI preference.
- [ ] Define how new runs capture that setting without changing active runs,
      existing reports, raw evidence, or user content.
- [ ] Preserve the original reasoning prompts; validate any output-language
      instruction against actual generated output before claiming coverage.

## Upstream maintenance loop

```text
fetch upstream
→ inspect upstream diff from UPSTREAM_BASE
→ merge the full upstream range, resolving conflicts without unrelated edits
→ run AST inventory
→ classify UI / backend message / prompt / user data / protocol literal
→ add semantic catalog keys manually
→ run drift and build checks
→ record remaining screen coverage and update UPSTREAM_BASE after verification
```

- [x] Keep CI small: catalog/placeholder checks, TypeScript, and static build.
      AST inventory reports new candidates; strict leakage checks apply only to
      declared completed UI coverage with reviewed exceptions.
- [ ] Review source wording changes as well as newly introduced literals: a clean
      Git merge and matching catalog keys do not prove translation freshness.
- [ ] Default to full upstream merges. Record exceptional cherry-picks separately;
      do not advance the full-sync baseline past commits not actually merged.
- [ ] Require an upstream commit range in sync commit messages.
- [ ] Never let an extractor overwrite curated translations.
- [ ] Never claim a feature is localized because it merely falls back to Chinese.
