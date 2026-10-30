# Maintaining the English UI fork

This independently maintained fork follows RuoJi6/ARTEX. Chinese remains the
default; English is opt-in. English coverage includes all Phase 1 core screens in TODO.md: auth/navigation,
dashboard and Settings, task lists/templates/archives and every Task detail tab,
Chat, Workspace, Assets, basic Findings/Traffic lists and details, command/LLM
records, Agents/editor, LLM, MCP, Skills, Tools, Notifications, interception rules,
approvals, logs controls, and their core shared widgets. Transcript, side questions,
HTTP/evidence controls and file editors follow the locale. Advanced workflows in
Phase 2 still require their own coverage review; backend errors/logs, prompts,
reports, raw HTTP and user/model content remain unchanged.

Self-update checks, installation, manual rollback, and startup application of
staged binaries are disabled. Rebuild this fork for updates. Inherited release
and demo workflows are gated to the upstream repository; publishing from this
fork requires a separate review of image destinations and deployment settings.

## Why this approach

Follow RuoJi6 directly and keep a small Chinese-default, English-opt-in UI layer.
ScopeWeaver and artex-global are useful references; adopting either whole fork
would also couple maintenance to its product, backend, and language decisions.
For screens inherited from their shared ARTEX source, consult artex-global's
next-intl components and Chinese/English catalogs first, then ScopeWeaver. Reuse
reviewed translations and compatible localization edits, comparing each fork
against its own common ancestor and current source. Record reference commits and
required attribution in LOCALIZATION_SOURCES.md. The earlier batches were written
directly against current source; the Sessions review and remaining Phase 1 work
now reuse reviewed reference translations and compatible localization edits.
Semantic keys still require small JSX edits and conflict resolution during
upstream merges. Temporary Chinese in new screens is an accepted trade-off.

## Local build

Use Node.js 22 and the Go version declared in go.mod. From the repository root:

```bash
(cd web && npm ci && npm run build:static)
mkdir -p server/webui/dist
cp -a web/out/. server/webui/dist/
CGO_ENABLED=0 go build -tags embedui -o artex ./cmd/artex
```

Configure PostgreSQL and the application using config.example.json, then run
`./start.sh`. Stop a running application before replacing its binary. Back up
configuration and data before upgrades; database migrations may prevent rollback.

For a local Linux AMD64 Docker image, after the frontend build above:

```bash
mkdir -p dist/amd64
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -tags embedui -o dist/amd64/artex ./cmd/artex
docker build --platform linux/amd64 -t artex-english:local .
cp .env.example .env
```

Set a PostgreSQL password in `.env`, then run `docker compose up -d`.
For ARM64, use `arm64` for both the Go architecture/output directory and Docker
platform. Compose uses the locally built image with `pull_policy: never`.
Do not use the inherited upstream installer or upstream published binaries/images
for this fork. Rebuild the image and recreate the service for each update.

## Sync checklist

1. Start with a clean worktree; commit localization separately from upstream work.
2. Fetch `upstream` and choose the full commit SHA to integrate.
3. Compare that range with UPSTREAM_BASE.md, then merge it. Do not reformat
   upstream files while resolving localization conflicts.
4. Verify fork update guards and local image defaults survived the merge.
5. Inventory changed UI literals. Review changed Chinese catalog values for stale
   English even when semantic keys have not changed. Preserve prompts and data.
6. Run catalog checks, TypeScript, static export, focused locale browser checks,
   and backend tests for changed behavior. Record deferred screens in TODO.md.
7. Update UPSTREAM_BASE.md after verification. Include the upstream commit range
   in the sync commit message. A cherry-pick does not advance the full-merge base.

Translation changes use semantic keys in web/messages/{zh-CN,en}.json. Language
switches update the client provider without remounting the application. Static
HTML and the first hydration render use Chinese; localStorage restores an explicit
choice afterwards. A brief Chinese render on reload is an accepted trade-off.

## Localization checks

From `web/`:

```bash
npm run i18n:check
npm run test:i18n
npm run i18n:check -- --base HEAD
npm run i18n:inventory -- --base 212f7c2807580d524bc23baf8dde8a1bf036a43c
npx tsc --noEmit
npm run build:static
npx playwright install chromium
npm run test:i18n:browser
```

Use the SHA recorded in UPSTREAM_BASE.md for each sync, before advancing it.
The inventory compares the current working tree with that commit. Without
`--base`, it reports all Chinese string/template literals and JSX text under
`web/src`. Comments are excluded. Results are candidates, not proof of UI
leakage: prompts, data, identifiers, and protocol literals need manual review.
It does not scan Go/backend messages or rewrite source. New occurrences and
changed wording are reported; moving a file can report its strings again.
The native language name `简体中文` in `src/i18n/provider.tsx` is intentional.

Catalog checks validate key parity, ICU syntax, argument types/names (including
nested plurals), rich-text tags, and non-empty messages. Plural categories may
differ by language. The optional --base check reports changed Chinese values
whose English value is unchanged. It needs a fork commit containing both catalogs.
This advisory cannot establish semantic freshness: review `git diff <previous-sync> -- web/messages/zh-CN.json` alongside
English and the upstream source diff. CI runs catalog tests, TypeScript, and the
static build and the browser smoke suite. The focused tests enforce Chinese-literal checks only on the
completed files declared in `web/scripts/i18n.test.mjs` and
`web/scripts/i18n-coverage.json`; the full-tree inventory
remains advisory while screen coverage is incomplete. Classify any new literals
in completed files before adding narrow exceptions or extending coverage.

The browser smoke suite in `web/e2e/i18n.spec.ts` serves the current `web/out`
export on localhost and mocks HTTP/SSE using the existing demo fixtures. Rebuild
after source changes before running it. It checks Chinese default and persisted
locale choice, Side question draft/DOM/stream retention, local versus raw backend
errors, and timestamp precision in traffic evidence and its picker. It requires
no backend or credentials and does not verify real SSE reconnects or persistence.
CI installs Chromium and runs the same suite after its static build.

Use `useLocaleFormatting()` from `web/src/i18n/formatting.ts` for new localized
date/number displays and calendar controls. The provider restores the browser
timezone after hydration. Keep scheduling timezone choices, stored dates, raw
HTTP, identifiers, and user/model content unchanged. Existing screen-specific
formatters in standalone scheduling/Repeater workflows remain Phase 2. Status badges translate known wire values at
display time, retain unknown values verbatim, and fall back to the original
Chinese metadata if a newly merged status has no catalog entry. Other callers
of `statusMeta()` remain Chinese until explicitly migrated with their screens.

Early auth, navigation, dashboard, Settings and task-list batches were written
against this checkout. Subsequent core screens reuse artex-global translations
and compatible next-intl edits; selected wording comes from ScopeWeaver. Exact
commits, source groups, adaptations and AGPL-3.0 attribution are recorded in
LOCALIZATION_SOURCES.md. Existing terms and restrictions are preserved
in both languages. Backend errors, warnings, and skip reasons remain verbatim.

The task-list inventory permits original status/company-scope metadata for
fallback, upload-manifest instructions for workers, the persisted Chinese default
schedule name, and the existing backend archive-missing message check. These are
explicit exceptions, not translated UI. Browser verification uses mocked APIs;
live task execution, scheduling, uploads, and SSE still require integration checks.

Task-detail inventory also permits the original tab/scope/rule metadata and the
hidden image-load diagnostic in the Markdown renderer. Report content, supplied
screenshot alt text, capture timestamps, and all editable task data stay raw.
Locale changes update screenshot controls without resetting zoom or fetching
images again. Browser checks cover mocked Overview CRUD, LLM-chain changes,
Report display/copy/zoom, header states, and mobile layouts; actual backend
archive execution and active agent behavior remain unverified.

Mention picker labels use semantic keys while English category selection inserts
existing parser aliases. Keep `web/src/lib/chat-mentions.ts` and its Chinese wire
tokens unchanged when translating UI: selected token text/chip labels, record
content, and backend errors remain raw. Todo fetches on open or sequence changes,
using the latest callback without reloading for locale or parent label changes.

Task Sessions keeps its fixed-session metadata and history/SSE state independent
of display translations. Session titles translate at render time; Worker intent
titles, output, asset names/source summaries, reasons, IDs, and backend errors
remain raw. Asset label helpers optionally translate at the display boundary;
existing callers retain Chinese labels until their screens are migrated. Token
counts use the shared formatter. Browser checks cover mocked Main/Worker controls,
uploads, failure/retry, deletion dialogs, segment switching, draft/attachment
retention, and narrow layouts. Mocked EventSource instances stay open across
locale changes and deliver activity; real transport reconnects and backend cursor
compensation remain integration checks. Transcript, side-question and approval
widgets are now included in Phase 1; the earlier Sessions batch exclusions are
superseded by the completion record in TODO.md.
