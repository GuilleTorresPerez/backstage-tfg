# DESY tokens applied to the Backstage chrome

This document records the visual tokens extracted from the DESY design system
and applied to the Backstage portal of this prototype. It backs the
traceability requirement of the TFG memoria: every value below cites the
exact upstream source.

## Source pinned for reproducibility

- **Starter repository**: <https://bitbucket.org/sdaragon/desy-html-starter>
- **Starter commit**: `cd877721ed788dfc8952decc81d004a5989aed21`
- **`desy-html` resolved version**: `16.0.4` (from the starter's `package.json`)

Tokens live in the `desy-html` package, not in the starter. The starter
imports them via Vite's `loadBrandingConfig` and Tailwind. Concrete files
read for this port:

| Aspect       | Source file                                              |
| ------------ | -------------------------------------------------------- |
| Colors       | `node_modules/desy-html/src/css/styles.css`              |
| Typography   | `node_modules/desy-html/branding/branding.config.js`     |

Eyeballing values from <https://desy.aragon.es> or Figma is forbidden —
no citable provenance.

## Mapping table

All values land in `packages/app/src/theme/desyTokens.ts` and reach Backstage
via `buildDesyTheme(desyTokens)` (`packages/app/src/theme/desyTheme.ts`),
which wraps `createUnifiedTheme` from `@backstage/theme`.

| DESY token (upstream)         | Value      | Backstage / MUI key                    |
| ----------------------------- | ---------- | -------------------------------------- |
| `--color-primary-base`        | `#00607a`  | `palette.primary.main`                 |
| `--color-primary-dark`        | `#00475c`  | `palette.navigation.background` (sidebar) |
| `--color-neutral-base`        | `#92949b`  | `palette.secondary.main`               |
| `--color-alert-base`          | `#d22333`  | `palette.error.main`                   |
| `--color-warning-base`        | `#fdcb33`  | `palette.warning.main`                 |
| `--color-info-base`           | `#fa9902`  | `palette.info.main`                    |
| `--color-success-base`        | `#24d14c`  | `palette.success.main`                 |
| `--color-neutral-lighter`     | `#f6f6f5`  | `palette.background.default`           |
| `--color-white`               | `#ffffff`  | `palette.background.paper`             |
| `typography.fontFamily.sans`  | `"Open Sans", ui-sans-serif, system-ui, sans-serif` | `fontFamily` |
| `--color-primary-base` (reused) | `#00607a` | `pageTheme.<id>.colors` for the 9 canonical page types |

The `pageTheme` keys covered are: `home`, `documentation`, `tool`, `service`,
`website`, `library`, `other`, `app`, `apis`. All of them resolve to the same
single-color gradient `[#00607a]`, intentionally collapsing the default
9-color Backstage rainbow into a single DESY accent.

## Sidebar contrast note

`--color-primary-dark` (`#00475c`) is taken directly from the starter as the
sidebar background. It is used as-is — no manual darkening was applied for
the tracer bullet. If a contrast adjustment becomes necessary later, it
**must be recorded here** as a *derived value, not directly from the
starter*.

## Tokens explicitly NOT ported

| Out of scope                           | Reason                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------- |
| Spacing scale (`--spacing-*`)          | Outside chrome rebrand scope — MUI defaults retained.                    |
| Radii / border tokens                  | Same as above.                                                          |
| Shadows (`--shadow-*`)                 | Same as above.                                                          |
| Dark mode variants                     | DESY does not codify a dark variant; the portal is light-only and the user theme toggle is hidden by registering a single theme. |
| Heading colors (`--color-heading-*`)   | Headings inherit MUI typography defaults; collapsing them is out of the tracer-bullet slice. |
| Prose / `--tw-prose-*` overrides       | Apply to long-form content; the chrome rebrand targets the portal shell only. |
| Header backgrounds (`/images/header-background*`) | Out of scope for the chrome rebrand slice.                       |
| Font loading (`fontUrl` Google CDN)    | Not honoured — the DESY default points at Google Fonts CDN, which conflicts with GDPR/AEPD/ENS. The webfont files are now bundled locally via `@fontsource/open-sans` (see "Self-hosted font weights" below). |

## Self-hosted font weights

The corporate face is **Open Sans**, served from the `@fontsource/open-sans`
package and bundled with the `app` workspace — never fetched from
`fonts.googleapis.com`. Self-hosting is defensible against GDPR/AEPD/ENS and
the LG München ruling of 20.01.2022 (3 O 17493/20), which held that loading
Google Fonts from the CDN leaks user IP addresses to a third country without
consent.

The exact weights are derived from the starter's `branding.config.js`:

```js
fontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap'
```

That URL declares `ital,wght@0,400;0,600;0,700;1,400;1,600;1,700`, i.e. the
six faces 400 / 600 / 700 in both upright and italic. The Backstage chrome
imports exactly those six faces in `packages/app/src/index.tsx` and no others:

| Face         | Upstream role in DESY                                          |
| ------------ | -------------------------------------------------------------- |
| 400          | Body copy, default UI text.                                    |
| 600          | Emphasised text, table headers, control labels (semibold).     |
| 700          | Headings and strong inline emphasis.                           |
| 400-italic   | Inline italic body copy.                                       |
| 600-italic   | Emphasised semibold italic (mirrors 600 for symmetry).         |
| 700-italic   | Bold italic in headings or inline emphasis.                    |

Importing more weights would inflate the bundle with faces the design
system never references; importing fewer would force Backstage to
synthesise the missing weight from the closest neighbour, defeating the
"corporate face" guarantee. The set is locked by the regression test at
`packages/app/src/fonts.test.ts`.

## Logos / wordmark

The Backstage chrome logos are sourced from the pinned starter under
`branding/logos/`. The default Backstage spiral (fill `#7df3e1`) is gone;
no fill is hardcoded in the TSX or in `makeStyles` — fills travel inside
the SVG so the brand colours are part of the asset, not the styling.

| Variant   | Source file in the pinned starter                            | Component                                          | Used when                |
| --------- | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------ |
| Expanded  | `node_modules/desy-html/branding/logos/aragon-expanded.svg`  | `packages/app/src/components/Root/LogoFull.tsx`    | Sidebar is open          |
| Mini      | `node_modules/desy-html/branding/logos/aragon-mini.svg`      | `packages/app/src/components/Root/LogoIcon.tsx`    | Sidebar is collapsed     |

The responsive height set by `makeStyles` is preserved (30 px expanded,
28 px mini); width is `auto` so the SVG scales by its `viewBox`.

### Wordmark text fill — derived value

The starter's `aragon-expanded.svg` paints the "Gobierno de Aragón"
wordmark text in `#161615` (near-black) because DESY uses the wordmark on
a light header background. The Backstage chrome places the logo *inside*
the sidebar, which is `--color-primary-dark` (`#00475c`). `#161615` on
`#00475c` is well below WCAG AA contrast for text.

`LogoFull.tsx` therefore overrides the text fill to `#ffffff`. This is a
**derived value, not directly from the starter** — recorded here per the
same convention as the [Sidebar contrast note](#sidebar-contrast-note).
The cuatribarrada (yellow `rgb(252, 228, 0)` + red `#dd171b`) is kept
intact; it contrasts adequately with the dark sidebar on its own.

The mini variant (`LogoIcon.tsx`) needs no derivation — it contains only
the cuatribarrada, no near-black glyphs.

### Wordmark, not escudo

This prototype renders the DESY **wordmark** and not the institutional
**escudo de Aragón**. Reproducing the escudo without explicit authorisation
collides with Ley 2/1984, de 16 de abril, sobre los símbolos de Aragón.
The wordmark is the brand mark distributed in the public starter under
`branding/logos/`; it is the defensible choice for an academic prototype.
Tracked under issue [#74](https://github.com/GuilleTorresPerez/backstage-tfg/issues/74).

## PWA static assets

The browser tab, mobile home-screen shortcut and PWA install card all need to
reflect the DESY identity, not the Backstage default spiral. The favicon and
all PNG icons are derived from the `mini` wordmark shipped in `LogoIcon.tsx`
(slice #74). The Safari pinned-tab mask icon is a bars-only black silhouette
(Apple's mask-icon spec is a single-color silhouette; the user agent applies
the `color` attribute).

| File                                        | Size      | Source                                                                |
| ------------------------------------------- | --------- | --------------------------------------------------------------------- |
| `packages/app/public/favicon.ico`           | 32×32     | Single-entry ICO rasterised from the mini wordmark.                   |
| `packages/app/public/favicon-16x16.png`     | 16×16     | PNG rasterised from the mini wordmark.                                |
| `packages/app/public/favicon-32x32.png`     | 32×32     | PNG rasterised from the mini wordmark.                                |
| `packages/app/public/apple-touch-icon.png`  | 180×180   | PNG rasterised from the mini wordmark.                                |
| `packages/app/public/android-chrome-192x192.png` | 192×192 | PNG rasterised from the mini wordmark.                                |
| `packages/app/public/safari-pinned-tab.svg` | 32×32     | Bars-only black silhouette; same path data as the mini wordmark.      |

Each generated PNG embeds a tEXt comment chunk identifying it as the DESY
mini wordmark; the regression test at `packages/app/src/pwaAssets.test.ts`
greps for that marker so the Backstage default cannot be accidentally
reintroduced.

### Manifest and HTML chrome colors

`packages/app/public/manifest.json` carries `theme_color` =
`palette.primary.main` (`#00607a`) and `background_color` =
`palette.background.default` (`#f6f6f5`), both pulled directly from the
DESY tokens so any future palette change cascades. `manifest.name` /
`short_name` are `"Portal DESY"` / `"DESY"` — not the Backstage default.

The same `palette.primary.main` propagates to `index.html`:

- `<meta name="theme-color" content="#00607a">` (Android Chrome address bar).
- `<link rel="mask-icon" color="#00607a">` (Safari pinned-tab tint).

The cross-token consistency is locked by the same regression test.

### Regenerating the assets

```bash
packages/app/scripts/generate-pwa-assets.sh
```

The script invokes ImageMagick 7 (`magick`) on the host and writes the five
files above. It is idempotent and strips creation timestamps so re-runs only
diff when the SVG source changes.

## TechDocs chromatic adjustment

The Backstage chrome and the TechDocs surface live side by side: the chrome
runs in React with `createUnifiedTheme`, the docs run in MkDocs under the
`material` theme served by `techdocs-core`. Without coordination the
Material default indigo accent clashes with the DESY blue header of the
chrome — H1s and inline links read as a different brand.

The fix is the **minimum chromatic alignment** allowed by Material's public
configuration surface:

| File                              | Change                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `mkdocs.yml`                      | `theme.palette.primary: custom` (Material escape hatch for arbitrary hex).      |
| `mkdocs.yml`                      | `extra_css: [stylesheets/desy.css]` — the stylesheet ships with the docs site.  |
| `docs/stylesheets/desy.css`       | `--md-primary-fg-color: #00607a` (and the matching `--light`/`--dark`/`--accent` siblings). |

The hex `#00607a` is the same value as `palette.primary.main` in
`desyTokens.ts` (= `--color-primary-base` in the DESY upstream). The
regression test at `packages/app/src/techdocsTheme.test.ts` reads both
sources and asserts equality, so the two locations cannot drift.

### Limitation — TechDocs sin tema completo

The `material` MkDocs theme is **not** replaced by a DESY-aware MkDocs
theme. Only the accent CSS variables are overridden. The typography
(Roboto by default in Material, not Open Sans), the layout (Material's
left rail and top tabs, not DESY's institutional chrome), and the
component shapes (cards, admonitions, code blocks) remain Material's
defaults.

A custom MkDocs theme that mirrors DESY would have to reimplement
`techdocs-core`'s asset pipeline and addon hooks; that work is logged as
future work in the TFG memoria's *Limitaciones* section, not in this
tracer bullet.

## Verification

- Unit tests covering the mapping logic live at
  `packages/app/src/theme/desyTheme.test.ts`. Run with
  `yarn workspace app test --watchAll=false --testPathPatterns desyTheme`.
- The smoke test `App.test.tsx` continues to pass with the theme wired in.
- Visual verification: `yarn start` renders the sidebar in DESY corporate
  blue (dark variant) and shows no light/dark toggle in the user settings
  menu (single registered theme).
