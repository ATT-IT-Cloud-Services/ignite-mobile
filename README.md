# Ignite Client

Official **Ignite** client for web, desktop (Electron), and Android (Capacitor). One codebase, multiple targets — connected to the elizon hosting stack ([www.elizon.app](https://www.elizon.app) + [api.elizon.app](https://api.elizon.app)).

## Repository

| Context | Location |
|---|---|
| Development (monorepo) | `ignite-2` → `mobile/ignite/` |
| Mirror (standalone) | [`ATT-IT-Cloud-Services/ignite-mobile`](https://github.com/ATT-IT-Cloud-Services/ignite-mobile) |

Changes are made in the monorepo and mirrored to `ignite-mobile` via the GitHub Actions job **mirror-mobile**. CI artifacts (installers, APK) and releases are produced in the mirror repository under **Actions** / **Releases**.

## Stack

- **Runtime / bundler:** [Bun](https://bun.sh) 1.2.x
- **UI:** React 19, Tailwind CSS 4, Radix UI
- **Desktop:** Electron 43 + electron-builder 27 (MSIX beta)
- **Android:** Capacitor 8 (Node.js ≥ 22 for `cap sync`)
- **API:** REST against `https://api.elizon.app` (`src/lib/api.ts`, resources under `src/api/`)
- **Web:** pages, legal markdown, and brand assets from `https://www.elizon.app` (`src/lib/config.ts`)

## Requirements

| Platform | Required |
|---|---|
| Web / desktop | Bun 1.4.x |
| Desktop build (Linux CI) | `sharp` (devDependency, icons from WebP) |
| Android | Node.js 22+, JDK 21, Android SDK |
| macOS desktop | Xcode (local only; no iOS CI build) |

## Quick start (web)

```bash
bun install
bun dev          # Dev server with hot reload (http://localhost:3000)
```

Production bundle:

```bash
bun run build    # Output: dist/
bun start        # Serve dist/ statically
```

Default hosts (hardcoded in `src/lib/config.ts`):

| Role | URL |
|------|-----|
| API daemon | `https://api.elizon.app` |
| Web daemon | `https://www.elizon.app` |

Brand assets (logos, fonts, icons) and legal markdown are loaded from the web origin at runtime — not duplicated in this repo. Only the app launcher icon (`public/favicon.ico`) ships with the client. Electron desktop push polling uses `ELIZON_API_BASE` (default: API daemon).

## Desktop (Electron)

```bash
bun run desktop:dev      # Build + Electron window
bun run desktop:build    # All configured desktop targets
```

Platform-specific:

```bash
bun run desktop:build:linux       # AppImage → release/
bun run desktop:build:mac         # DMG → release/
bun run desktop:build:win:builder # NSIS + portable + MSIX → release/
bun run desktop:build:win:msix    # MSIX only (Microsoft Store / sideload)
```

Before each desktop build, `build/icon.png` is generated from `public/favicon.ico` (`bun run icons:desktop`), because electron-builder requires at least 256×256 — the bundled favicon only contains smaller sizes.

### Auto-Updates

Packaged desktop builds check [GitHub Releases](https://github.com/ATT-IT-Cloud-Services/ignite-mobile/releases) for newer versions via `electron-updater`:

- **Automatic check** ~5 seconds after startup (Windows NSIS installer, Linux AppImage)
- **macOS:** only notifies about a new version and opens the GitHub release — manual install via DMG
- **Manual check** in **Einstellungen → Über → Nach Updates suchen**
- **Not supported:** Windows portable build (`PORTABLE_EXECUTABLE_DIR`)

Each release includes `latest.yml` / `latest-linux.yml` / `latest-mac.yml` next to the installer artifacts (original electron-builder filenames). Bump `"version"` in `package.json` before merging to `main`, otherwise clients will not detect a newer build.

Windows also produces an MSIX package (and `.msixupload` for Partner Center). Store listing needs a matching `msix.publisher` / identity from Partner Center before submission — until then the build uses the Store placeholder identity.

Code signing is still disabled in CI; updates work, but Windows SmartScreen / macOS Gatekeeper may show warnings until signing is enabled.

## Android

```bash
bun run build
bunx cap sync android
cd android && ./gradlew assembleDebug
```

Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`

The Capacitor CLI requires **Node.js ≥ 22**. In CI, the Android build runs `./gradlew assembleDebug` inside the `android/` directory after `cap sync`.

## Native push notifications (iOS / Android)

Push uses `@capacitor/push-notifications` with FCM (Android) and APNs (iOS). Users enable it under **Einstellungen → Benachrichtigungen**; the iOS system dialog uses:

> Wir senden Ihnen Benachrichtigungen zu neuen Aktivitäten auf Ihrem Konto.

Credential templates and ops steps: [`docs/PUSH_SETUP.md`](docs/PUSH_SETUP.md).

Required local file after Firebase setup (Android FCM):

- `android/app/google-services.json` (gitignored — see `docs/PUSH_SETUP.md`)

## Version

The displayed version combines semver from `package.json` with the git commit:

```text
0.8.2 (ba3559d)
```

- Semver: `"version"` in `package.json`
- Buildnummer: `GITHUB_RUN_NUMBER`
- Commit: `GITHUB_SHA` in GitHub Actions or `git rev-parse --short=7 HEAD` locally
- Optional override: `APP_VERSION` in `.env` (semver part only)

Build-time injection happens in `build.ts` → `process.env.APP_VERSION` in `src/lib/config.ts`.

## Project structure

```text
src/                 React app (screens, features, i18n)
src/api/             API resources + error resolution (standalone, mirror-safe)
src/lib/             API client, config, platform helpers
electron/            Electron main/preload/static server
android/             Capacitor Android project
public/              Static assets (logos, icons)
scripts/             Build helpers (icons, version, release assets)
.github/workflows/   Standalone CI (build + package + release)
build.ts             Bun bundle (dist/)
```

## CI (GitHub Actions)

Workflow in the standalone repository (`ATT-IT-Cloud-Services/ignite-mobile`), triggered after the monorepo **mirror-mobile** job:

| Job | Artifact |
|---|---|
| web-build | `dist/` (web bundle) |
| desktop-linux | `release/*.AppImage` |
| desktop-windows | NSIS installer + portable `.exe` + MSIX |
| desktop-macos | `release/*.dmg` |
| android | Debug APK |
| release | GitHub Release (default branch only) |

Job artifacts are available under the workflow run.

Windows/macOS-Jobs laufen nur, wenn die Repository-Variablen `MOBILE_ENABLE_WINDOWS=true` bzw. `MOBILE_ENABLE_MACOS=true` gesetzt sind. Ohne diese Variablen werden die Jobs übersprungen.

### GitHub Releases

Auf jedem Push auf den Default-Branch erzeugt GitHub Actions ein [Release](https://github.com/ATT-IT-Cloud-Services/ignite-mobile/releases) über den Job `release`. Der Job veröffentlicht alle vorhandenen Paket-Artefakte.

- Tag: `v{Versionscode}-{Build}` (z. B. `v1.0.4-42`)
- Titel: `ignite-mobile {Versionscode} (build {Build})`
- Buildnummer: `GITHUB_RUN_NUMBER`

Pull-Request-Workflows veröffentlichen keine Releases.

## Monorepo development

In the `ignite-2` monorepo, the client is **mirror-standalone**: imports must not point at monorepo `packages/` or `apps/`. Shared files live under `src/api/` and `src/shared/`.

After changes under `mobile/ignite/**`, push to the default branch; the GitHub Actions job **mirror-mobile** updates `ATT-IT-Cloud-Services/ignite-mobile` automatically.

## License

Proprietary — elizon. Not for redistribution without permission.
