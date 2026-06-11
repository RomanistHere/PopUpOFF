# Releasing PopUpOFF

Everything ships from one branch and one source tree. The old per-browser
branches (`firefox`, `firefox-old`) are dead - do not use them.

## The short version

```bash
# 1. bump the version in manifest.json AND package.json (keep them equal)
# 2. update the changelog in README.md (and popupoff.org)
npm ci
npm run lint && npm run build && npm run lint:firefox && npm test
# 3. package and upload (see below)
git tag <version> && git push origin <version>
```

## What runs when (CI)

Every push to `master`/`develop` and every pull request runs
`.github/workflows/ci.yml`:

| job              | what it does                                                        |
| ---------------- | ------------------------------------------------------------------- |
| `lint-and-build` | eslint → `scripts/build.mjs` → `web-ext lint` on the Firefox build  |
| `e2e`            | Playwright tests against the built Chrome extension                  |

Each run uploads the `extension-builds` artifact (the whole `dist/` folder),
downloadable from the run page for ~90 days. For an upload to the stores,
prefer building locally from a tagged commit so you know exactly what went in.

## Building

```bash
npm run build
```

produces:

- `dist/chrome` - byte-for-byte the repo source (the root `manifest.json` is the Chrome one)
- `dist/firefox` - same source with a derived manifest:
  - `background.scripts` event page instead of `service_worker` (Firefox doesn't run background service workers)
  - `browser_specific_settings.gecko`: the published AMO id `{154cddeb-4c8b-4627-a478-c7e5b427ffdf}`, `strict_min_version` 128.0, `data_collection_permissions: none`
  - `gecko_android` enabled
  - `source=chrome` link params rewritten to `source=firefox`

To try a build: `chrome://extensions` → Load unpacked → `dist/chrome`,
or `npx web-ext run --source-dir dist/firefox` for Firefox.

## Packaging and store upload

**Chrome Web Store:**

```bash
cd dist/chrome && zip -r ../popupoff-chrome-$(node -p "require('../../package.json').version").zip . && cd -
```

Upload the zip in the [CWS developer dashboard](https://chrome.google.com/webstore/devconsole).

**Firefox (AMO):**

```bash
npx web-ext build --source-dir dist/firefox --artifacts-dir dist
```

Upload the produced zip in the [AMO developer hub](https://addons.mozilla.org/developers/).
The add-on id is baked into the manifest, so it updates the existing listing.
If reviewers ask for source code: the build is an unminified file copy plus a
manifest transform - submit a link to the tagged commit and the commands
`npm ci && npm run build`.

**Edge / Opera:** the `dist/chrome` zip works for both stores.

## Pre-upload smoke checklist

Automated tests cover the heuristics' contract; before an upload still check by hand:

- [ ] a cookie-wall news site in all four modes
- [ ] Moderate keeps a legitimate sticky header
- [ ] the keyboard shortcut applies the configured mode and shows the notification
- [ ] options page: save an ignored selector, confirm the element survives Aggressive
- [ ] settings export → import round-trip
- [ ] **update path**: in a throwaway profile, install the current store version,
      save a few site modes, then load this build over it - saved sites,
      anti-paid list and stats must survive

## Notes specific to 2.1.4

- **Storage migration**: on update, per-site modes (`websites1/2/3`), the
  anti-paid list and stats move from `storage.sync` to `storage.local`
  automatically (`migrateStorage` in `background/background.js`, idempotent).
  No user action needed; old settings backups still import.
- **Dropped `tabs` permission**: Chrome applies permission reductions silently,
  the extension stays enabled after the update.
- **Firefox**: first release produced by this pipeline (MV3, event page).
  Give the update path one extra-careful pass in a real Firefox profile,
  including that host permissions remain granted after the update.
- **Shortcut**: the default stays Alt+X (Cmd+Shift+X on macOS) via the
  `commands` API; users can rebind it in the browser's shortcut settings.
