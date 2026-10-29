# Maintaining the English UI fork

This independently maintained fork follows RuoJi6/ARTEX. Chinese remains the
default; English is opt-in. English coverage includes active navigation,
login/setup (including terms and frontend validation), the password dialog,
preferences, navbar status controls, the dashboard, basic shared controls, and
the manual-update card. Settings and remaining application screens are pending;
see TODO.md for the exact coverage and verification limits.

Self-update checks, installation, manual rollback, and startup application of
staged binaries are disabled. Rebuild this fork for updates. Inherited release
and demo workflows are gated to the upstream repository; publishing from this
fork requires a separate review of image destinations and deployment settings.

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
npm run i18n:inventory -- --base 212f7c2807580d524bc23baf8dde8a1bf036a43c
npx tsc --noEmit
npm run build:static
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
differ by language. They cannot detect a stale but syntactically valid English
translation: review `git diff <previous-sync> -- web/messages/zh-CN.json` alongside
English and the upstream source diff. CI runs catalog tests, TypeScript, and the
static build. The focused tests enforce Chinese-literal checks only on the
completed files declared in `web/scripts/i18n.test.mjs`; the full-tree inventory
remains advisory while screen coverage is incomplete. Classify any new literals
in completed files before adding narrow exceptions or extending coverage.

Use `useLocaleFormatting()` from `web/src/i18n/formatting.ts` for new localized
date/number displays and calendar controls. The provider restores the browser
timezone after hydration. Keep scheduling timezone choices, stored dates, raw
HTTP, identifiers, and user/model content unchanged. Existing screen-specific
formatters still need migration. Status badges translate known wire values at
display time, retain unknown values verbatim, and fall back to the original
Chinese metadata if a newly merged status has no catalog entry. Other callers
of `statusMeta()` remain Chinese until explicitly migrated with their screens.

Auth, navigation, shared-control, and dashboard translations were written against
this checkout, without copying material
from ScopeWeaver or artex-global. Existing terms and restrictions are preserved
in both languages. Backend errors remain verbatim.
