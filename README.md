# Salvera

A hospital and clinic management front end built on **Angular 21** — standalone components, zoneless change detection, and lazy-loaded feature routes. The application ships three role-scoped workspaces (Admin, Doctor, Patient) covering roughly 70 clinical and operational modules, a themable Angular Material + Bootstrap UI layer, multi-language/RTL support, PWA packaging, and an optional AI assistant that talks to OpenAI or Google Gemini.

> **Note on naming:** the repository is `Salvera-Angular`, but the codebase still carries the earlier `cliniva` product name in a few places — the npm package name, the build output path (`dist/cliniva`), the document title, demo credentials, and the `cliniva_ai_config` localStorage key. These are cosmetic and have not been renamed.

---

## Table of contents

- [Requirements](#requirements)
- [Getting started](#getting-started)
- [npm scripts](#npm-scripts)
- [Project structure](#project-structure)
- [Roles and authentication](#roles-and-authentication)
- [Feature modules](#feature-modules)
- [Data layer](#data-layer)
- [UI, theming and layout](#ui-theming-and-layout)
- [Internationalization and RTL](#internationalization-and-rtl)
- [AI assistant](#ai-assistant)
- [Charts, tables and exports](#charts-tables-and-exports)
- [PWA and service worker](#pwa-and-service-worker)
- [Build configuration](#build-configuration)
- [Testing and linting](#testing-and-linting)
- [Conventions](#conventions)

---

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0` (per Angular 21) |
| npm | 10+ |
| Angular CLI | `~21.0.2` (local devDependency — use `npx ng`) |
| TypeScript | `~5.9.3` |

The repo pins `legacy-peer-deps=true` in `.npmrc`; several charting and UI packages have not yet published Angular 21 peer ranges, so install with npm as configured rather than overriding it.

## Getting started

```bash
git clone https://github.com/ssmith129/Salvera-Angular.git
cd Salvera-Angular
npm install
npm start          # ng serve → http://localhost:4200
```

The dev server uses the `development` build configuration, which swaps `src/environments/environment.ts` for `src/environments/environment.development.ts`.

Sign in with any of the seeded demo accounts (the sign-in screen has buttons that pre-fill each one):

| Role | Username | Password | Lands on |
| --- | --- | --- | --- |
| Admin | `clinivaAdmin` | `admin@123` | `/admin/dashboard/main` |
| Doctor | `doctor` | `doctor@123` | `/doctor/dashboard` |
| Patient | `patient` | `patient@123` | `/patient/dashboard` |

Authentication is entirely client-side (see [Roles and authentication](#roles-and-authentication)) — there is no backend to run.

## npm scripts

| Script | What it does |
| --- | --- |
| `npm start` | `ng serve` — dev server with source maps and no optimization |
| `npm run build` | `ng build` — production build by default, output in `dist/cliniva` |
| `npm test` | `ng test` — Karma + Jasmine unit tests |
| `npm run lint` | `ng lint` — ESLint 9 flat config over `src/**/*.ts` and `src/**/*.html` |
| `npm run ng` | Passthrough to the local Angular CLI |

## Project structure

```
src/
├── app/
│   ├── admin/          33 admin feature modules (lazy routes)
│   ├── doctor/         18 doctor workspace pages
│   ├── patient/        19 patient portal pages
│   ├── apps/           chat, kanban, file manager, contacts grid, support, notifications, drag & drop
│   ├── authentication/ signin, signup, forgot password, two-factor, locked, 404, 500, maintenance, coming soon
│   ├── calendar/       FullCalendar scheduling + event dialogs
│   ├── charts/         ApexCharts, Chart.js, ECharts, ngx-charts, gauge demos
│   ├── config/         ConfigService — layout/theme defaults
│   ├── core/           guards, interceptors, models, app initializers, auth/token/AI services
│   ├── email/          inbox, compose, read
│   ├── extra-pages/    profile, pricing, invoice, FAQs, knowledge base, privacy, terms, blank
│   ├── forms/          form controls, validation, wizard, editors, advanced controls
│   ├── icons/          Material + Font Awesome catalogs
│   ├── layout/         main/auth shells, header, sidebars, page loader, AI chat, global search
│   ├── shared/         103 reusable widgets/components, table utilities, storage service
│   ├── tables/         basic, Material and ngx-datatable examples
│   ├── task/, timeline/, ui/, widget/, multilevel/, contacts/
│   ├── app.config.ts   application providers
│   └── app.routes.ts   root route table
├── assets/
│   ├── data/           static JSON fixtures backing every feature module
│   ├── i18n/           en, ar, de, es, fr, hi, pt, zh
│   ├── scss/           theme, components, pages, plugins, ui partials
│   └── fonts/, images/
├── environments/
├── index.html, main.ts, manifest.webmanifest, styles.scss
```

Roughly 1,190 TypeScript files, 570 templates, 565 stylesheets, and 55 route files.

TypeScript path aliases (`tsconfig.json`):

```ts
import { AuthService, Role } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { ConfigService } from '@config';
```

## Roles and authentication

Three roles are defined in `@core/models/role.ts`:

```ts
export enum Role {
  Admin = 'ADMIN',
  Doctor = 'DOCTOR',
  Patient = 'PATIENT',
}
```

- **`LoginService`** (`src/app/core/service/login.service.ts`) holds an in-memory user array and returns a locally generated JWT — no network call. Replace this service to wire a real identity provider.
- **`AuthService`** exposes `currentUser` as an Angular **signal**, persists the user to localStorage, and sorts roles by priority.
- **`AuthGuard`** protects the shell and each role branch. `/admin/**` requires `ADMIN`; `/doctor/**` allows `ADMIN` and `DOCTOR`; `/patient/**` allows `ADMIN` and `PATIENT`. Unauthorized visits redirect to `/authentication/signin`.
- **`StartupService`** runs as an `APP_INITIALIZER` and pushes the user's roles and permissions (`canAdd`, `canEdit`, `canDelete`, `canRead`) into **ngx-permissions** so templates can gate actions.
- **`errorInterceptorFn`** logs the user out and reloads on a `401` — with an explicit carve-out so failed calls to `openai.com` and `googleapis.com` don't sign the user out.

Routing uses `HashLocationStrategy`, so deployed URLs look like `/#/admin/dashboard/main` and no server rewrite rules are required.

## Feature modules

### Admin (`/admin/**`)

Dashboards (main, dashboard2, nurse) plus: appointments, doctors, staff, patients, accounts, rooms, departments, inventory, records, ambulance, pharmacy, blood bank, human resources, insurance, laboratory, EMR, documents & consent, feedback, telemedicine, equipment, radiology, waste management, quality & compliance, visitor management, reports & analytics, operation theatre, discharge, emergency, ICU, diet & nutrition, physiotherapy, and settings.

- **Reports & analytics** breaks down into executive summary, clinical, financial, HR, inventory, lab, patient statistics, pharmacy and radiology reports.
- **Settings** covers general, billing, notifications, operations, users & roles, and AI configuration.

### Doctor (`/doctor/**`)

Dashboard, appointments, consultations, patients, patient records, prescriptions, lab reports, surgeries, referrals, certificates, billing, analytics, inventory requests, tasks, telemedicine, doctors directory, settings, AI settings.

### Patient (`/patient/**`)

Dashboard, appointments, prescriptions, medical records, lab reports, billing, insurance, documents, vaccinations, health monitoring, health plans, lifestyle, family members, emergency, feedback, notifications, telemedicine, settings, AI settings.

### Cross-cutting apps

Calendar, tasks, contacts, email, chat, kanban, file manager, contact grid, notification center, support, drag & drop, plus a UI kit (`/ui`), form gallery (`/forms`), table gallery (`/tables`), chart gallery (`/charts`), widgets, timelines and icon catalogs.

## Data layer

Every module reads from static JSON fixtures in `src/assets/data/` (appointments, doctors, patients, rooms, medicines, blood stock, payroll, insurance claims, and so on) served over `HttpClient`. Swapping to a live API generally means editing the per-feature service that fetches the JSON and pointing `environment.apiUrl` at the real host — `src/environments/environment.ts` currently defaults `apiUrl` to `http://localhost:4200` in both configurations.

## UI, theming and layout

- **Angular Material 21** (Azure/Blue prebuilt base) + **Bootstrap 5.3** utilities + custom SCSS in `src/assets/scss/`.
- **Right sidebar theme panel** (`ConfigService` + `RightSidebarComponent`) toggles, and persists to localStorage:
  - 7 accent themes — white, black, purple, blue, cyan, green, orange
  - light / dark variant
  - solid or **glassmorphism** surface style, with 7 gradient presets (purple-blue, sunset, mint, candy, ocean, yellow, lush)
  - vertical or horizontal navigation, collapsed sidebar, light/dark sidebar
  - LTR / RTL direction
- **Header** carries a command-palette style global search dialog (keyboard navigable), notification list, language switcher, and user profile menu.
- **Feather icons** are tree-shaken: `app.config.ts` registers ~100 explicitly imported icons via `FeatherModule.pick()` instead of `allIcons`, which keeps roughly 140 KB out of the bundle.
- Components are standalone throughout and predominantly use `ChangeDetectionStrategy.OnPush` under `provideZonelessChangeDetection()`.

## Internationalization and RTL

`@ngx-translate/core` v17 with the HTTP loader reads `src/assets/i18n/{lang}.json`; the fallback language is `en`. Bundled locales: **English, Arabic, German, Spanish, French, Hindi, Portuguese, Chinese**.

RTL is handled by a custom `AppDirectionality` provided for Angular CDK's `Directionality` token, so Material overlays, dialogs and menus flip with the rest of the layout. Dates run through `DateFnsAdapter` with the `enGB` locale and a `yyyy-MM-dd` input format.

## AI assistant

`AiService` (`src/app/core/service/ai.service.ts`) stores provider settings under the `cliniva_ai_config` localStorage key and powers:

- the floating, draggable **AI chat assistant** in the main layout, and
- per-role **AI Settings** pages under Admin, Doctor and Patient.

Supported providers: **OpenAI** (`/v1/chat/completions`) and **Google Gemini** (`generativelanguage.googleapis.com/v1beta`). The config type also lists `claude`, but only OpenAI and Gemini have request implementations today — selecting anything else raises `Unsupported AI provider`. With no API key configured, `postPrompt()` returns a clearly labelled `[DEMO MODE]` response after a short delay, so the UI is fully explorable without credentials. A `testConnection()` helper round-trips a prompt to validate a key.

**Security note:** keys entered in AI Settings live in browser localStorage and calls go directly from the browser to the provider. That is acceptable for a demo, but for production you should proxy AI calls through your own backend and never ship provider keys to the client.

## Charts, tables and exports

**Charts:** ApexCharts (`ng-apexcharts`), Chart.js (`ng2-charts`, registered globally via `provideCharts(withDefaultRegisterables())`), ECharts (`ngx-echarts`), ngx-charts (Swimlane), and ngx-gauge.

**Tables:** Angular Material tables, `@swimlane/ngx-datatable`, and a shared **`MasterTableComponent`** that consolidates CRUD table behavior — sorting, pagination, selection, column show/hide, context menu, bulk delete, and Excel export — into a declarative `columnDefinitions` array. It cuts a typical CRUD page from ~600 lines to ~180. Full API reference and a migration checklist live in [`src/app/shared/components/master-table/README.md`](src/app/shared/components/master-table/README.md).

**Exports:** `exceljs` + `file-saver` back the shared `tableExportUtil`. `sweetalert2` handles confirmations, `ngx-editor` provides rich text, `ngx-mask` handles input masking, `ngx-dropzone-wrapper` handles uploads, and `@fullcalendar/angular` powers scheduling.

## PWA and service worker

`@angular/service-worker` is registered in `app.config.ts` with `registerWhenStable:30000` and is **enabled only in production builds** (`enabled: !isDevMode()`). `ngsw-config.json` prefetches the app shell (`index.html`, CSS, JS) and lazily caches images and fonts. Web app manifests live at `src/manifest.webmanifest` and `public/manifest.webmanifest`, with icons from 72×72 to 512×512 under `public/icons/`.

## Build configuration

- Builder: `@angular/build:application` (esbuild-based), entry `src/main.ts`.
- Output: `dist/cliniva`; production adds `outputHashing: "all"` and the service worker.
- Budgets: initial bundle warns at **4 MB** and errors at **6 MB**; any single component stylesheet warns at 30 KB and errors at 50 KB.
- `@angular/localize/init` is loaded as a polyfill; `extract-i18n` is wired up.
- `allowedCommonJsDependencies` whitelists the CommonJS-only libraries in use (ECharts, ApexCharts, Chart.js, exceljs, file-saver, sweetalert2, and others).

```bash
npm run build                    # production
npx ng build --configuration development
```

## Testing and linting

Unit tests run on **Karma + Jasmine** through the `@angular/build:karma` builder; the repo contains 287 spec files.

```bash
npm test
npx ng test --watch=false --browsers=ChromeHeadless
npm run lint
```

`eslint.config.js` is a flat config using `@angular-eslint` 21 and `typescript-eslint` 8, with the Angular template recommended rules. Notable strictness:

- `@typescript-eslint/no-explicit-any: 'error'` — `any` is not allowed
- unused variables must be prefixed with `_`
- component selectors: `app-` prefix, kebab-case; directive selectors: `app` prefix, camelCase

TypeScript runs in `strict` mode with `strictTemplates`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `noPropertyAccessFromIndexSignature` all enabled.

No end-to-end test runner is configured; `ng e2e` requires adding one first.

## Conventions

- **Standalone components only** — no NgModules for features; routes use `loadComponent`/`loadChildren`.
- **Signals and `inject()`** are preferred over constructor injection and `BehaviorSubject` state in newer code.
- **Zoneless change detection** — avoid patterns that rely on Zone.js patching; mark components `OnPush` and use signals or explicit change detection.
- **Subscription cleanup** via `UnsubscribeOnDestroyAdapter` (`subs.sink = …`) or `takeUntil`/`SubSink`.
- **SCSS** is the default component style language (`inlineStyleLanguage: "scss"`).
- Shared, reusable UI belongs in `src/app/shared/components/`; cross-cutting services in `src/app/core/service/`.
