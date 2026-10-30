# TODO: English option with Chinese default

## Decision

- Chinese (`zh-CN`) remains the default.
- English (`en`) is an explicit UI choice, persisted in localStorage.
- Maintain an independent fork of RuoJi6/ARTEX. No upstream pull request is planned.
- Keep upstream RuoJi6 history and source structure mergeable.
- Use next-intl and semantic keys; borrow reviewed translations and runtime
  safeguards from artex-global and ScopeWeaver without adopting either fork wholesale.
- Prefer ScopeWeaver wording for shared pre-Autumn screens, adapted to current
  behavior; use artex-global as a compatible next-intl implementation reference.
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

The dated batches below are historical records. Earlier completion claims did
not cover backend-provided labels or every nested UI state; the browser review
below corrects those gaps. Phase 4 remains optional and deferred;
it is not part of the English UI completion scope.

### Browser review after user feedback (2026-10-30)

- [x] Prefer reviewed ScopeWeaver wording for shared screens, preserving semantic
      keys, ICU arguments, current feature behavior and ARTEX branding.
- [x] Translate missing seeded Agent labels in MCP/Skills/Tools bindings, pinned
      chats and chat descriptions; add the current `asset_mapper` seed.
- [x] Translate Findings' backend-provided unlinked-assets group in the tree,
      search and breadcrumbs, preserving its filter sentinel and real asset names.
- [x] Translate unchanged bundled rule names/notes at display time and global
      prompt-variable help. Rule editors, tool descriptions and prompts stay raw.
- [x] Localize untouched new-task schedule names; preserve user edits, stored
      names, timezone choice and schedule payload values.
- [x] Complete playwright-cli route/tab/dialog review and 15 browser regressions;
      catalog/ICU checks, 21 unit checks and static export pass.
- [x] Fix the notification sheet width so English form text fits mobile.

Browser coverage: all 23 sidebar routes; all 12 task-detail tabs; seven asset
types; four Findings views and three case-detail tabs; LLM retry/rotation,
interception, notification and tool tabs; all five Settings sections and Agent
editor tabs. Nested checks include task creation/templates/categories/scheduling,
asset scope editors, evidence viewer/notes/picker/retest, traffic/LLM details,
workspace editing, MCP transports, all six notification types, search/preferences,
password change, login/terms and setup. Mobile checks use 390px and 768px widths;
desktop uses 1440px. Fixture browser artifacts are in
`/tmp/artex-wording-review/` for this session.

Review uses the actual static frontend on a loopback fixture server, with existing
demo data plus current backend seed labels. Notification/intelligence fixtures
fill API shapes absent from the old demo. The deployed instance requires login;
its private records were not changed or used as browser review fixtures. Mocked
UI coverage does not establish live execution, external provider availability,
real SSE reconnects or persistence. Saved content, prompts, tool schemas, raw
HTTP/evidence, generated output and uncoded backend errors can remain Chinese.

### Reference reuse correction (2026-10-30)

- The batches recorded below were written directly against current source;
  per-screen comparison with the reference forks was omitted. Avoiding a whole-
  fork merge does not justify rewriting translations that can be reused.
- Verified reference snapshots: artex-global
  `fdfb7a17b7da5e2de716c0e98475ec77a41c64c6`, common ancestor with our RuoJi6
  baseline `d0033724a63aefbbcc1ed022b0faf4dc4a1fce51` (2026-10-03);
  ScopeWeaver `407c8bbdb7855e683b2be8ffb288dd7776c835ac`, common ancestor
  `160fe13c243be361eeac5408c40a96e824fa842c` (2026-10-01). Neither snapshot
  directly descends from `e6ec569`, but the upstream Sessions file is identical
  at both common ancestors and `e6ec569`. Both references already localize it.
- For each subsequent screen, inspect artex-global's corresponding component
  and Chinese/English catalogs first; it already uses next-intl and semantic
  keys. Check ScopeWeaver for missing translations and runtime behavior. Compare
  each reference against its own common ancestor and current RuoJi6 source.
- Reuse reviewed translation entries and compatible localization edits; adapt
  placeholders/keys to our catalogs. Keep Chinese default and the existing
  provider. Write new translations for changed/new text or unsuitable reference
  wording, recording the reason. Review behavior changes separately from strings.
- [x] Review the completed Sessions batch against those references for reusable
      translations, terminology, and missed localization behavior. Record any
      copied material and required attribution in LOCALIZATION_SOURCES.md.

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
- [x] Language changes must not remount the app or clear chat/Repeater/form drafts.
      Recompute module-level labels and memoized UI values when locale changes.
- [x] Introduce shared date, number, relative-time, and calendar formatting;
      adopt it in the dashboard, navbar clock, pagination, and date controls.
- [x] Migrate remaining Phase 1 screens to the shared formatters. Preserve scheduling
      timezone semantics and wire date/time values; the standalone scheduling and
      Repeater workflows remain Phase 2.

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
      Caller-supplied content remains raw; core domain widgets are covered below.
- [x] Dashboard, including chart labels/tooltips, empty states, relative time,
      counts, assets, approvals, and known status badges.
- [x] Active Settings screen, including Basic Auth, category/search controls,
      traffic/proxy/screenshot/OPSEC settings, constraints, intelligence, automatic
      titles, search providers, Python, worker pools, and chat send shortcuts.
      Raw backend warnings, skip reasons, and errors remain Phase 3 exclusions.
- [x] Task template picker/manager, including CRUD, overwrite confirmation,
      validation, and empty/loading controls; shared LLM profile-chain, task-rule,
      and inline remark/name controls. Caller-supplied labels remain the caller's
      responsibility.
- [x] Tasks list, creation form, categories, and archives; verification limits
      are recorded in the parallel Tasks batch below.
- [x] Task detail header/navigation, archive/pause controls, and LLM-chain editor;
      Overview (goals, constraints, scope, task rules, coverage, usage, heartbeat,
      and intents); Report controls and shared Markdown screenshot controls.
- [x] Task Sessions shell: session list/segments, connection state, token metrics,
      Main/Worker composers, uploads, Worker controls and deletion dialogs,
      model-resolution labels, and Worker asset badges. Transcript and shared
      side-question/approval widgets are included in the completion record below.
- [x] Remaining task detail tabs and their shared widgets: sessions, exploration
      graph, broadcasts, findings, intelligence, retests, traffic, assets,
      coverage graph, and interception approvals, including Transcript and
      side-question/approval widgets.
- [x] Sessions, chat, and workspace, including shared Todo, @mention, Transcript,
      session controls, file editors, and side-question/approval widgets.
- [x] Assets, findings, and traffic: current basic lists and detail views.
- [x] LLM records, agents, MCP, skills, tools, notifications, and approvals.
- [x] Translate frontend-authored status labels and validation messages only;
      preserve backend errors/logs until Phase 3.
- [x] Keep model prompts and agent-generated output unchanged until the separate
      output-language setting is implemented.

### Settings coverage (2026-10-29)

- Added 199 semantic messages (491 total). Translations were written against this
  checkout without copying either reference fork. Rich descriptions preserve
  emphasis, protocol/tool names, and the literal JSON probe example.
- Category labels, search keywords, known egress-check labels, deleted/unavailable
  model labels, worker validation, and send-mode choices follow the current locale.
  Unknown egress-check labels and backend warnings/skip reasons/errors remain raw.
- Basic Auth stores an error key plus raw detail so an existing error changes
  language. Its card stays mounted while hidden by category/search. Locale changes
  do not reload settings or replace form drafts. The settings-load failure toast
  uses an effect event so translation changes do not rerun the loading effect.
- Catalog checks, all 5 focused tests, TypeScript, and static export (34 pages)
  pass. Strict Chinese-literal inventory now covers 21 completed files. Advisory
  inventory against the recorded upstream baseline reports 4,578 remaining
  candidates; the only added candidate is the intentional native language label
  in the locale selector. Candidate counts are not a coverage percentage.
- Browser checks passed on the production static export with mocked APIs:
  Chinese default, English persistence, switching back, category/search updates,
  preserved Basic Auth/proxy/API-key/pool/search drafts, no locale-triggered
  settings reload, existing errors updating with locale, all four search-provider
  choices, plural search results, worker validation and save payloads, raw model
  names/backend text, unknown egress labels, rich JSON, and persisted send-mode
  wire values. All five settings categories fit at 390px without document or
  content overflow. Failed settings/Basic Auth loads retain disabled save guards.
  No application runtime errors occurred; console errors were the mocked 503s.
- Live backend persistence, actual search/proxy connectivity, and active agent
  behavior remain unverified. Browser tab title, tasks/templates, chat/live-task
  state, and remaining screens are pending. No commit, push, or upstream merge was
  made in this batch; UPSTREAM_BASE is unchanged.

### Templates and shared task controls (2026-10-29)

- Added 97 semantic messages (588 total) for template selection/management,
  overwrite/delete dialogs, LLM fallback chains, task block/allow rules, and
  inline remark/schedule-name editors. Translations were written against this
  checkout without copying either reference fork.
- Template/category loading does not depend on locale. Inline validation and
  save errors store message IDs plus raw detail, so existing errors follow the
  current locale without replacing drafts. Backend details and user content
  remain verbatim; emitted toast messages retain their event-time language.
- Rule labels translate at display time, retaining upstream metadata and a
  fallback for newly merged untranslated kinds. Rules use a small grid so
  English labels and editable patterns fit narrow task drawers. Wire actions,
  kinds, patterns, notes, and template fields keep their original values.
- Added the missing Base UI `itemToStringLabel` callback to the profile picker.
  Name/model search previously filtered the raw ID; the display-label callback
  now follows locale, while selected IDs and API payloads are unchanged.
- Catalog checks, all 6 focused tests, and TypeScript pass. Strict Chinese-literal
  checks cover 24 completed files plus a separate rule-editor check that permits
  only its seven original metadata labels and validates Chinese catalog parity.
  Advisory inventory reports 4,487 remaining candidates against UPSTREAM_BASE;
  only the intentional native language label is added. This is not a coverage
  percentage.
- Static export (34 pages) passes. Browser checks on the production static
  export with mocked APIs pass for Chinese default, English persistence,
  template CRUD and API failures, overwrite/cancel dialogs, frontend validation,
  raw template/rule payloads, existing remark errors following locale, preserved
  drafts, and no locale-triggered template/category/profile reloads. Profile
  name search, multiple selection, reordering, removal, and locale labels pass.
  Template manager and rule editors fit 390/768/1024/1440px, including the narrow
  create-task drawer. Open-modal locale changes were exercised through the
  existing sidebar selector with forced browser interaction; this does not
  establish that the selector is user-accessible while a modal is open.
  The shared schedule-name editor also passes required/length validation,
  language changes on existing errors, draft preservation, and raw save checks.
  No application runtime errors occurred; console errors were mocked 503s.
- Tasks list/creation, categories, archives, detail tabs, caller-supplied labels,
  and live backend behavior remain pending. No commit, push, or upstream merge
  has been made; UPSTREAM_BASE is unchanged.

### Category management implementation (2026-10-29)

- Added 41 semantic messages (629 total) for the task category management sheet,
  create/rename/delete results, delete confirmation, task counts, empty states,
  and drag handles/drop targets/previews. Written against current source without
  copying either reference fork. Category/task names and raw backend error details
  remain verbatim; API calls, IDs, and drag/drop behavior are unchanged.
- Locale-dependent labels compute during render. Existing state and loading
  effects have no locale dependency; no remount key or reload was introduced.
- Added a narrow AST leakage check for the four category-management functions;
  the rest of the tasks page remains outside completed coverage.
- Catalog checks (629 messages), all 7 focused tests, TypeScript, static export
  (34 pages), and `git diff --check` pass.
  Advisory inventory reports 4,438 remaining candidates against UPSTREAM_BASE;
  only the intentional native language label is added. Counts are not coverage.
  Browser checks for category CRUD, drag/drop, locale changes with an open sheet,
  draft preservation, and mobile layout remain pending; this is implementation
  progress, not completed category screen coverage.
- Next: category picker, bulk category move (including parent toasts), task list,
  creation form, archives, and detail tabs. No commit, push, or upstream merge
  was made; UPSTREAM_BASE is unchanged.

### Parallel Tasks batch (2026-10-29)

- Three agents localized task list/delete controls, archives, and task creation/
  pickers in separate function ranges. Catalog fragments were integrated by one
  owner. Added 290 semantic messages (919 total), written against current source
  without copying either reference fork.
- Covered task filters/sorting, counts, known statuses, row actions, concurrency,
  cleanup options, archive/restore/delete dialogs, categories, creation controls,
  company/source/category pickers, and inline scheduling controls. Display dates
  and numbers use the shared formatters. Loading/polling effects remain independent
  of locale; user data, IDs, backend details, and API payloads remain raw.
- Source/category/company pickers now provide Base UI's display-label callback so
  searching names and scope text works while selections still submit IDs.
- Narrow fixes found during browser checks: TimeSelect accepts a portal container
  so time options in the create drawer receive mouse clicks; task-delete and
  archive-confirm/delete dialogs consume already-reported API rejections and stay
  open for retry.
- Strict AST coverage now checks the full task-list page. Reviewed Chinese
  exceptions are original status/scope metadata, the upload manifest supplied to
  workers, the persisted default schedule name, and the existing backend archive-
  missing message check. Metadata parity/raw fallback tests cover unknown values
  and prototype names. These exceptions are not translated UI coverage.
- Catalog validation (919 messages), all 8 focused tests, and TypeScript pass.
  Advisory inventory reports 4,090 remaining candidates against UPSTREAM_BASE;
  only the intentional native language label is new. Counts are not coverage.
- Browser tests on the production static export with mocked APIs pass for task
  filters/sort/selection, rename/concurrency drafts, live duration, pause/resume,
  pinning, single/bulk cleanup, category CRUD/drag/drop/bulk move, create/picker
  validation, archive filters/restore/delete/retry, errors, and raw payloads.
  Chinese default, English persistence, switching back, and draft/state retention
  pass; locale changes do not reload screen data. Weekly/specific-date scheduling
  controls keep ISO dates, time values, timezone choices, and selected IDs intact.
  Actual mouse selection of start/end time works in the create drawer after the
  portal fix. Layouts fit 390/768/1024/1440px and wide tables scroll separately.
- Open-modal locale checks use forced interaction with the existing desktop
  sidebar selector; this does not make the selector user-accessible while a modal
  is open. Category confirmation retains upstream behavior that may close its
  parent sheet on cancel/completion; the tests reopen it for subsequent actions.
- Final static export (34 pages) and `git diff --check` pass. Initial archive
  blockers, confirm/cancel, API failure/retry, and successful tab switching also
  pass browser checks. All final task browser suites report no application runtime
  errors; console errors are intentionally mocked 503s, with CSS preload warnings.
  Live backend persistence,
  file upload execution, actual scheduling, and active agent/SSE behavior remain
  unverified. Task detail tabs and all other pending screens retain their backlog.
  No commit, push, or upstream merge was made; UPSTREAM_BASE is unchanged.

### Task detail header, Overview, and Report (2026-10-29)

- Added 158 semantic messages (1,077 total), written against this checkout
  without copying either reference fork. Task detail tab labels, header actions,
  LLM-chain controls, Overview forms/stats, Report controls, and shared Markdown
  screenshot controls now follow locale. The other tabs' contents remain pending.
- Overview uses shared date/number formatting, including compact token counts,
  percentages, and model-call counts. Scope/rule labels translate at display time;
  unknown metadata stays raw and known untranslated metadata retains its Chinese
  fallback. Form fallback errors store message IDs; raw backend details stay raw.
  The English ICP placeholder retains `京ICP备12345678号-1` as an example of
  the identifier format. Mobile headings/rule patterns wrap to stay readable.
- Loading/polling effects remain independent of locale. Report text, screenshot
  alt text supplied by the user, capture timestamps, goals, constraints, scope
  values, patterns, notes, model names, IDs, and API payloads remain unchanged.
  The shared image renderer keeps stable component definitions; locale changes
  preserve open-image zoom and do not refetch authenticated screenshots.
- Catalog validation, all 10 focused tests, TypeScript, static export (34 pages),
  and `git diff --check` pass. Strict AST checks now cover the detail shell,
  Overview, Report, and Markdown renderer, with narrow exceptions for original
  tab/scope/rule metadata and the original hidden image-load diagnostic.
  Advisory inventory reports 3,928 remaining candidates against UPSTREAM_BASE;
  only the intentional native language label is new. Counts are not coverage.
- Browser checks pass on the production static export with mocked APIs: Chinese
  default, English persistence, switching back, form/edit draft retention, goal/
  constraint/scope/rule CRUD, rule toggles, raw payloads/errors/unknown metadata,
  formatted counts, pause, archive confirmation/cancel and failure, archive locks,
  terminal task controls, LLM reordering/save/reset/retry and exhausted/default/
  deleted-profile states, Report/empty/missing states, and raw Markdown copying.
  Screenshot zoom/reset, raw alt text, zoom-state retention, and no locale-driven
  report/image/stable-data reloads pass. Layout checks at 390/768/1024/1440px
  pass; populated mobile cards have no clipped horizontal content and the tab
  bar scrolls independently. No application runtime errors occurred; expected
  resource errors are mocked 503s/404s.
- Open-image locale checks use forced interaction with the sidebar selector
  hidden from the modal's accessibility tree. This verifies state retention,
  not that users can reach the selector while a modal is open. Verification
  artifacts for this local run are under `/tmp/artex-detail-i18n/`.
- Next: remaining detail tabs/shared widgets, starting with sessions and chat.
  Live backend persistence, actual archive execution, agent/SSE behavior, and
  other pending screens remain unverified. No commit, push, or upstream merge
  was made; UPSTREAM_BASE is unchanged.

### Session/chat shared controls (2026-10-29)

- Added 33 semantic messages (1,110 total) for Todo popovers and @mention
  category/result controls, loading/empty/error states, pagination, keyboard
  hints, and accessibility defaults. Written against current source without
  copying either reference fork.
- Mention category labels translate at display time. English category selection
  inserts the existing parser alias (including `api` and `domain`), while Chinese
  selection keeps its original label. Record names/descriptions, selected token
  text/chip labels, and backend error details remain raw. The original Chinese
  wire token format, parser, and API parameters are unchanged.
- Todo stores a failure flag instead of translated text. Its effect uses the
  latest fetcher without depending on inline callback identity; changing locale
  must not reload an open popup. It still reloads on open or sequence changes.
- Extended strict AST coverage to both widgets and added a protocol compatibility
  test for all nine mention kinds/aliases and raw selected tokens. Catalog checks,
  all 11 focused tests, and TypeScript pass. Advisory inventory has 3,902 remaining
  candidates; only the intentional native language label is new against
  UPSTREAM_BASE. Counts are not coverage.
- Static export (34 pages) passes after the Todo effect change. Browser checks
  on the production export with mocked APIs pass for Chinese default, English
  persistence, switching back, open-picker/draft/selected-token retention, raw
  record/error content, category selection, keyboard selection, empty/loading
  states, paginated results, failed-page retry, and reference removal. Locale
  changes do not issue new mention requests. English picker layouts fit
  390/768/1024/1440px without horizontal clipping.
- Todo browser checks pass for raw list content, empty/parse-error states, and
  localized existing errors. Three explicit opens issue exactly three detail
  requests; locale changes issue none. No application runtime errors occurred;
  expected resource errors are mocked 503s. Artifacts are under
  `/tmp/artex-chat-controls/`. Sessions/chat screens, live backend mention
  resolution, agent execution, and SSE remain unverified. This batch covers only
  these two shared widgets. No commit, push, or upstream merge was made;
  UPSTREAM_BASE is unchanged.

### Task Sessions shell and controls (2026-10-30)

- Added 108 semantic messages (1,218 total), written against current source
  without copying either reference fork. Covered session groups/fixed titles,
  Main Agent segments/new-session dialog, live/reconnecting labels, Main/Worker
  composers, attachments, Worker pause/resume/delete controls, deletion reasons,
  empty/loading/error/retry states, model-resolution fallbacks, and asset badges.
- Fixed-session metadata stays in its upstream form; titles translate only at
  display time. Worker titles, activity/output, model names, asset labels/source
  summaries, inherited source IDs, user-entered reasons, and backend details
  remain raw. Asset label helpers accept an optional display translator, retain
  Chinese fallback for known untranslated metadata, and preserve unknown values.
  Other screens using these helpers keep their existing behavior.
- Token counts use shared locale formatting. Stable token metric keys avoid
  replacing their nodes when labels change. Loading errors retain raw detail or
  an empty failure marker and localize during render. Loading/polling/SSE effects
  keep their original dependencies; localization adds no reload or remount key.
  Toasts retain the language of the triggering event.
- Catalog checks, all 13 focused tests, TypeScript, static export (34 pages), and
  `git diff --check` pass. Added strict AST checks for the Sessions source with
  narrow exceptions for original role/fixed-session metadata, plus display/raw
  fallback and metadata-preservation tests. Advisory inventory against
  UPSTREAM_BASE has 3,780 candidates; only the intentional native language label
  is new. Counts are literals, not coverage percentages.
- Browser checks on the production static export with mocked APIs pass for
  Chinese default, English persistence, switching back, retained Main/Worker and
  deletion drafts, retained attachments, stable composer DOM, and unchanged
  history/segment request counts across locale changes. Mocked EventSource
  instances survive locale changes; new activity renders, and live/error labels
  update without opening another stream. This does not verify real SSE transport,
  automatic reconnect, authentication, or backend cursor compensation.
- Worker browser checks pass for Unicode codepoint limits, failed-send retry
  with the same request ID, raw message/reason payloads, pause/resume, soft/hard
  deletion and rich-text semantics, deleted/inherited read-only history, older
  Worker loading, raw unknown asset-source labels, and asset tooltips. Main send
  failures restore drafts; new-session cancel/failure retains drafts and success
  intentionally clears them. Switching segments reuses the stream. History
  failure/retry, existing errors following locale, empty states, and model
  unnamed/unavailable/raw-reason fallbacks also pass.
- Layouts fit 390/768/1024/1440px without document or session-panel horizontal
  overflow; mobile session selection/collapse and the deletion dialog pass.
  No application runtime errors occurred; resource errors are mocked 503s.
  Open-dialog locale checks use forced interaction with the sidebar selector
  hidden from the modal accessibility tree; they verify state retention, not
  user access to that selector. Artifacts: `/tmp/artex-sessions-i18n/`.
- This batch covers the Sessions shell and its direct controls. Transcript,
  side-question button/workspace, approval-focus/detail widgets, top-level chat,
  workspace, and other pending tabs remain incomplete. Next: those shared
  Transcript/side-question/approval widgets, then chat and remaining detail tabs.
  Actual uploads, agent execution, deletion cascades, and live backend/SSE
  integration remain unverified. No commit, push, or upstream merge was made;
  UPSTREAM_BASE is unchanged.

### Phase 1 checks

- [x] Catalog key parity, placeholder parity, and non-empty English values.
- [x] Review changed Chinese catalog values for stale English translations even
      when keys and placeholders are unchanged.
- [x] AST inventory reports new candidates against an explicit baseline; classify
      UI text, prompts, protocol values, identifiers, evidence, and user data.
      Record narrow exceptions and pending screen coverage. Do not block every
      upstream merge on untranslated new screens.
- [x] Browser check: fresh session is Chinese; select English; reload; English
      remains; switch back; drafts and active state remain intact.
- [x] Run focused locale tests (`npm run test:i18n`), TypeScript, and static export
      for the current covered batch. Repeat for each subsequent batch and sync.

### Phase 1 completion (2026-10-30)

- All Phase 1 implementation and localization checks are complete. The pending
  notes in earlier dated batches describe their state at the time. Phase 2's
  advanced workflows remain a separate backlog; localizing a shared widget does
  not establish complete coverage of every workflow that uses it.
- Reused reviewed artex-global localization edits and semantic catalogs for the
  remaining core screens, adapting them to current RuoJi6 behavior. Reused selected
  ScopeWeaver side-question wording and completed the earlier Sessions comparison.
  Exact reference commits, common ancestors, source groups, deviations, and
  AGPL-3.0 attribution are in LOCALIZATION_SOURCES.md. No whole-fork merge or
  rollback to Autumn was performed.
- Completed Chat/Workspace, all Task detail tabs, Transcript, exploration graph,
  side questions and approvals; Assets and basic Findings/Traffic detail views;
  Commands and LLM records; Agents/editor, LLM/retries, MCP, Skills, Tools,
  Notifications, interception/asset rules, and logs controls. Current-only core
  widgets (intelligence, credentials, traffic history and reproduction controls)
  use semantic messages while their persisted/generated content remains raw.
- Dates and numbers on core screens use shared locale formatting. Static HTML is
  Chinese, English remains an explicit localStorage choice, and title/description
  render with the same locale. No locale route, remount key or translated wire
  payload is introduced. Standalone scheduling/Repeater formatting remains Phase 2.
- Built-in agent labels translate only when they match the unchanged current
  Chinese seeds. Custom/edited labels and all prompt text remain raw. Scope
  validation uses stable local codes with a legacy Chinese wrapper; Skill overwrite
  uses HTTP 409 rather than matching backend text. Unknown display values and
  backend error details stay verbatim. The original Chinese approval/mention and
  report parsing formats remain compatible.
- Corrected locale-dependent loading callbacks, retained raw expanded Transcript
  parts, and updated graph labels without replacing the canvas. Fixed a Coverage
  viewport lifecycle race found by browser checks: skip events before rendering
  and clear the graph ref before G6 destroys its transform context.
- Catalog validation passes for 3,482 messages, with ICU/placeholder parity and no
  unchanged-English drift candidates against fork HEAD
  `28c74f31507ca6681a440661cfdd8fa67496e135`. Reviewed copied/current Chinese wording
  against the reference/source changes; the drift check is advisory, not a
  semantic translation validator. All 18 focused tests, TypeScript and static
  export (34 pages) pass. Strict core AST coverage and reviewed exceptions are in
  web/scripts/i18n-coverage.json. Advisory inventory against UPSTREAM_BASE reports
  1,140 literals; only the intentional native language label is newly introduced.
  Remaining literals include Phase 2, mock data, prompts and protocol values; the
  count is not a UI coverage percentage.
- Browser checks use the production static export and populated mock HTTP APIs.
  Checked all 12 Task detail tabs and 17 core routes; checked fresh Chinese,
  English persistence, switching back, title/description, Chat/Workspace and
  Agent/Skill/MCP/LLM/Tool/Notification draft and DOM retention, and absence of
  locale-driven stable-data/detail reloads. Natural upstream polling continues.
  Checked raw HTTP/finding data, expanded approvals, notification channel fields,
  status-based Skill overwrite, and graph canvas retention/cleanup. Mock
  EventSource retention/activity checks from the Sessions batch remain applicable.
- Twelve core pages have no document-level horizontal overflow at
  390/768/1024/1440px; wide tables retain their own scrolling. Open-dialog locale
  checks programmatically use the existing selector hidden by the modal; they
  verify retained state, not user access to that selector inside a modal.
- Browser fixtures do not verify real backend persistence, actual skill/worker
  execution, authentication, network SSE reconnects or backend cursor recovery.
  These remain integration checks, not unimplemented English UI. Artifacts for
  this completion run are in /tmp/artex-phase1/; earlier focused browser artifacts
  are recorded in their historical batches. No commit, push, deployment or full
  upstream merge was made. UPSTREAM_BASE remains unchanged.

### Phase 1 review fixes (2026-10-30)

- Fixed 11 timestamp displays that had lost time-of-day precision when replacing
  `toLocaleString()` with an unconfigured formatter. Traffic evidence/picker,
  retests, finding conversations, prompt versions, Transcript tooltips, broadcasts,
  exploration details, task findings and case events now use `timestamp` explicitly.
- Side question SSE parse failures store a local error code and translate during
  render. Raw backend errors stay verbatim, even when their text matches a local
  Chinese message. Added the hook to the strict Chinese-literal coverage guard.
- Corrected the ScopeWeaver reference description: its custom runtime performs
  catalog key lookup, not matching of rendered Chinese text.
- Added a reproducible three-test Chromium smoke suite in `web/e2e/i18n.spec.ts`
  and wired it into CI after static export. It covers default/persisted locale,
  Side question draft/DOM/stream retention and subsequent stream activity, local
  error translation, raw content/errors, and traffic evidence/picker timestamps
  in both languages. It reuses demo fixtures and needs no live backend or secrets.
- Verified locally: 3,482 catalog messages, 19 focused tests, TypeScript, static
  export (34 pages), all three browser tests, and `git diff --check`. CI execution
  on GitHub remains unverified. Mocked streams do not establish real transport
  reconnect, authentication or backend persistence. Those integration limits and
  the Phase 2 backlog remain unchanged; no full upstream merge or push was made.

## Phase 2: Remaining screen coverage, including post-Autumn additions

Use `e6ec569..<recorded RuoJi6 SHA>` only to identify historical additions, not as
a separate implementation branch. Work against current screens and extend this
checklist during each sync. A screen is complete only when its UI states, dialogs,
validation, and empty/loading/error controls are covered; backend error text and
generated content remain explicit exclusions until their later phases.

- [x] Findings consolidation, duplicate suggestions, cases, merge/reject flows,
      severity filters, search, and sorting.
- [x] Finding side questions, retest controls, and reproduction screenshots.
- [x] Repeater workspace, request editor, imports, drafts, history, filters, and
      replay errors. UI strings use the `repeater` namespace; request/response
      text, stored tab/group names, and backend response errors stay raw; the
      unchanged default group seed translates only at display time.
- [x] Asset graph and network topology modes, zones, paths, mapping, and viewport.
- [x] Calendar scheduling, timelines, date ranges, status labels, and bulk actions.
- [x] Remarks, worker-count settings, multi-model worker pools, and validation.
      Settings worker-count/pool controls and validation are covered in Phase 1;
      template worker-count controls and shared inline remark/name editors are
      covered too. Task-specific forms use tasksCreate/tasksList/taskDetail messages;
      Schedules caller labels are covered in the completion batch below.
- [x] Intelligence views, credential processing, and traffic evidence.
- [x] Automatic task/chat titles: localize controls/status only; preserve generated
      content.
- [x] Approval script review, side chat, history search, retries, Basic Auth,
      proxy tests, egress IP, and update settings.
      Active Settings Basic Auth/proxy/egress/manual-update controls are covered
      in Phase 1; approval snapshots, side questions, history search and retries
      are covered by the shared core widgets.
- [x] Asset Sync data-source setup, project/task selection, filters, results, and errors.

### Phase 2 checks

- [x] Run the AST inventory against the upstream diff and classify every new string.
- [x] Add semantic keys and both catalog values for each accepted UI string.
- [x] Verify English layouts, dates, numbers, filters, drafts, live tasks, Repeater
      state, API responses, SSE reconnects, and error flows.
- [x] Run catalog checks, AST inventory, TypeScript, static build, and focused
      frontend checks. Run backend checks when backend behavior changes.
- [x] Record any intentional Chinese text and its reason.

### Repeater batch (2026-10-30)

- Localized the Repeater workspace, request library, filters, bulk actions,
  request/response panes, target dialog, history, line wrapping, copy labels,
  and storage-failure feedback. Existing drafts, history, raw HTTP, and response
  bodies are preserved across locale changes.
- Replaced parser UI strings with stable `RepeaterParseError` codes; the display
  editor and traffic-import boundaries translate known validation errors while
  backend errors remain verbatim. Original Chinese Error.message values remain
  compatible with existing callers. Toasts keep the triggering event's locale.
  Storage quota failures emit a local event handled by the persistent locale
  provider, including imports and sends that finish after leaving Repeater.
- Added two Repeater browser checks and a typed-error regression test. Catalog
  checks (3,574 messages), 19 focused i18n tests, 29 Repeater tests, TypeScript,
  static export (34 pages), all five browser tests, and `git diff --check` pass.
  Browser checks verify Chinese/English validation, draft/DOM retention, raw
  request payloads and response/backend-error text, reload persistence, history,
  filtering, storage failure feedback, and document width at 390/768/1440px.
  HTTP is mocked: actual backend replay, proxy/TLS behavior and every modal/bulk
  workflow are not browser-verified. Existing unit tests cover bulk operations,
  import byte preservation and in-flight request state.
- Strict AST coverage includes the five Repeater UI components. The only added
  inventory candidates against UPSTREAM_BASE are two default-group seed
  comparisons and the existing native language selector. Stored names stay raw;
  the unchanged `default` group seed has a translated display label. No storage
  schema migration is introduced. Raw/Pretty labels and HTTP units remain as-is.
- Both pinned reference forks lack this Repeater workflow; translations are new
  against current source. See LOCALIZATION_SOURCES.md. No upstream merge, commit,
  push, or backend behavior change was made; UPSTREAM_BASE is unchanged.

### Phase 2 completion and integration checks (2026-10-30)

- Completed standalone Schedules: form controls, calendar/time pickers, recurrence,
  overnight/end-date descriptions, timezone/status labels, timeline, search,
  pagination, selection and bulk feedback. Date-only values stay wall dates;
  next-window timestamps follow upstream timezone selection, including the
  browser fallback for `Local`/absent timezones. Language changes never change
  the scheduling timezone. Existing schedule names,
  remarks, IDs, history messages and unknown statuses remain raw. The old backend
  error text replacement is removed. Locale changes retain form DOM and drafts.
- Completed Asset Sync by reusing reviewed artex-global translations/edits.
  Current-translator refs keep automatic/manual reload callbacks stable across
  locale changes, preserving selected rows and URL/API-key drafts. Source names,
  warnings/errors, transport values and payloads remain unchanged. Counts and
  result lists use shared formatting; English controls wrap on narrow screens.
- Re-reviewed advanced Phase 2 workflows already implemented in Phase 1:
  Findings cases/suggestions/filters, side questions/retests/reproduction,
  coverage graph network/asset modes and mapping, task remark/worker forms,
  intelligence/credential/traffic widgets, automatic-title controls, approval
  scripts/history/retries and Settings controls. Their catalogs, display mappings,
  loading dependencies and raw-data exclusions cover the current source. Added a
  duplicate accept/reject browser regression with retained exclusions/reason state.
- Validation: 3,752 messages, 20 i18n tests, 29 Repeater tests, TypeScript,
  static export (34 pages), nine browser tests and diff whitespace checks pass.
  Catalog wording-drift check against fork HEAD reports no unchanged-English
  candidates. Strict coverage now includes Schedules and Asset Sync.
- Inventory against UPSTREAM_BASE has 815 candidates. Its only additions are the
  two unchanged Repeater default-name comparisons and the native locale label.
  Remaining Chinese is reviewed metadata/fallbacks, mock/test content, stored
  names, prompts/report/protocol parsing, backend messages, the hidden clipboard
  fallback label and the unused upstream UpdateCard. The active Settings screen
  imports the localized manual-update card. This count is not UI coverage.
- Mocked browser checks cover Chinese/English choice, layout at 390/768/1440px,
  preserved drafts/DOM/filter selections, exact schedule/sync/merge payloads,
  raw evidence and backend errors, timezone/date formatting, and typed errors.
  The prior Phase 1 graph/approval/retest/credential browser evidence still applies;
  this is not an exhaustive test of every modal or external integration.
- Live integration used the current Go backend, current static export and an
  isolated disposable PostgreSQL 16 instance. Verified setup/authentication,
  schedule create/reload and unchanged stored timezone/time, task pause/resume
  UI, retained composer draft and SSE connection across locale changes, automatic
  SSE reconnect with Last-Event-ID 4, and the real coded validation response.
  Repeater replayed a local HTTP fixture and preserved raw request/response and
  reload state; the isolated backend enabled ARTEX_REPEATER_ALLOW_LOCAL solely
  for that fixture after verifying the default loopback rejection.
- Database-backed Go tests pass without skips for calendar manual resume/FIFO,
  failure handling, run-now/restart/deadlines, window/timezone boundaries and
  unavailable-database auth handling. No external LLM was configured: generated
  output language, successful agent/tool execution, external ScopeSentry, TLS and
  recording-proxy integration are not claimed by these UI checks.
- Temporary backend/proxy/browser/database resources are cleaned up. Test scripts
  and Go logs are in /tmp/artex-locale-live; no credentials are recorded here.
  No commit, push, deployment or upstream merge is made. UPSTREAM_BASE stays
  unchanged. Phase 4 remains the optional, deferred output-language feature.

### Cross-check corrections (2026-10-30)

- Confirmed the `Local`/absent-timezone browser fallback already exists in RuoJi6
  at both UPSTREAM_BASE and `35a33b20f9d52010f99afcdf1411441da90208be`.
  Restored its direct Intl next-window formatter, substituting only the UI locale.
  Schedule execution still uses upstream Beijing/system timezone selection and
  the server's `TZ`/OS configuration, independently of UI language.
- Removed frontend Chinese upload/download error prefixes from the API helpers.
  Workspace and Chat/task uploads reuse existing localized UI messages with HTTP
  status details. Evidence downloads use an HTTP-status fallback; backend error
  text remains raw. No new catalog or error-code framework is needed.
- Added browser regressions for UTC/Local timezone display across language changes
  and Workspace/Chat upload/download failures in both locales. The existing
  Beijing schedule check now asserts the next-window time explicitly.
- Validation: 3,752 catalog messages, 20 i18n tests, TypeScript, static export
  (34 pages), all 11 mocked browser tests and seven direct API failure checks pass.
  Inventory now has 810 candidates, with the same three reviewed additions
  against UPSTREAM_BASE. Diff whitespace checks pass.

## Phase 3: Stable backend errors and status messages

The initial rollout is intentionally limited to schedule input validation, including
task creation with a schedule. Other backend errors retain the accepted raw fallback;
this phase does not claim a translated backend or introduce a global error rewrite.

- [x] Add stable error codes/message IDs and structured parameters only where
      needed by covered screens. Keep the existing error string for compatibility.
- [x] Translate known codes at the frontend display boundary. Preserve unknown
      errors and raw details; never regex-match arbitrary rendered errors.
- [x] Reuse existing machine-readable statuses; never translate wire values or
      persisted evidence. Existing shared status mappings cover SSE-driven
      task/session displays; schedule validation is HTTP-only.
- [x] Check old clients, unknown codes, interpolation, and live error/status flows.

No backend locale negotiation, cookies, Accept-Language headers, or SSE/download
language parameters are needed for this phase. If server-rendered localized
messages become necessary, scope that separately and resolve locale per request,
never through mutable process-global request state.

### Validation contract (2026-10-30)

- Thirteen schedule validation codes are emitted at their origin as typed errors.
  The HTTP response adds `error_code` and optional `error_params` while retaining
  the original `error` string and status. Old callers still receive the same
  Error.message; task creation uses the same contract for schedule validation.
- The API client preserves metadata in ApiError. Only Schedules and the task
  creation display boundary opt into recognized code translation. Unknown codes,
  old responses and malformed interpolation parameters fall back to raw messages.
  Existing HTTP-status consumers, including Skill overwrite, remain compatible.
- Database unit tests cover all codes, original messages, the numeric limit,
  overnight windows and one-time date normalization. HTTP handler tests verify
  the actual validation response and old-client JSON decoding. Browser checks
  cover coded/unknown errors and retained form drafts. No database migration,
  translated stored history, prompt change or locale-dependent API payload occurs.

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

- [x] Keep CI small: catalog/placeholder checks, TypeScript, static build, and
      the focused locale browser smoke suite.
      AST inventory reports new candidates; strict leakage checks apply only to
      declared completed UI coverage with reviewed exceptions.

These are recurring sync policies, not outstanding implementation tasks:

- Review source wording changes as well as newly introduced literals: a clean
  Git merge and matching catalog keys do not prove translation freshness.
- Default to full upstream merges. Record exceptional cherry-picks separately;
  do not advance the full-sync baseline past commits not actually merged.
- Require an upstream commit range in sync commit messages.
- Never let an extractor overwrite curated translations.
- Never claim a feature is localized because it merely falls back to Chinese.
