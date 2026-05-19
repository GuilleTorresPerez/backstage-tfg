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
| Header backgrounds (`/images/header-background*`) | Out of scope until the logo/asset slice (sibling issue).         |
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

## Verification

- Unit tests covering the mapping logic live at
  `packages/app/src/theme/desyTheme.test.ts`. Run with
  `yarn workspace app test --watchAll=false --testPathPatterns desyTheme`.
- The smoke test `App.test.tsx` continues to pass with the theme wired in.
- Visual verification: `yarn start` renders the sidebar in DESY corporate
  blue (dark variant) and shows no light/dark toggle in the user settings
  menu (single registered theme).
