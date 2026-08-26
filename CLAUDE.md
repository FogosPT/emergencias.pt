# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`emergencias.pt` is a small React 18 SPA that visualises Portuguese civil-protection incidents (all incidents + FMA — *Fogos de Maior Amplitude*, "large-scale fires"). It is deployed as **Cloudflare Pages**, serving the CRA `build/` output. A **Pages Function** in `functions/api/` proxies the Fogos.pt public API and injects the `X-API-Key` header — the frontend never talks to `api.fogos.pt` directly, and the key never reaches the browser.

Stack: CRA (`react-scripts` 5) + React 18 + `react-router-dom` 6 + `react-redux` 8 + classic Redux + thunk + `react-leaflet` 4 + Tailwind 3. Pages Functions run on the Cloudflare Workers runtime.

## Commands

Run everything from this directory (`emergencias.pt/`), not from the workspace root.

- `npm install` — install deps
- `npm start` — dev server at http://localhost:3000 (CRA + HMR). **The `/api/*` proxy does not run under `npm start`** — hit the deployed Pages preview, or run `npx wrangler pages dev build` after `npm run build` to exercise the function locally.
- `npm run build` — production build to `build/`. Cloudflare Pages deploys this folder + the `functions/` directory.
- `npm test` — CRA/Jest watch mode (no tests exist in `src/`).
- `CI=true npm run build` — mimics Pages' build; warnings become errors.

## Architecture

### Cloudflare Pages layout

- `build/` — static output, deployed as-is.
- `functions/api/v2/incidents/active.js` — Pages Function. Handles `GET /api/v2/incidents/active?...`, forwards the querystring to `https://api.fogos.pt/v2/incidents/active`, adds `X-API-Key: env.FOGOS_API_KEY`, sets `Cache-Control: public, max-age=15, s-maxage=30`. **Secret is configured in the Pages dashboard** (Settings → Environment variables → `FOGOS_API_KEY`, encrypted). Do **not** commit it.

When adding a new upstream endpoint, mirror the URL shape under `functions/api/…`. Anything under `functions/` is auto-discovered by Pages — no config needed.

### Routing (`src/components/App.js`)

Five routes under `react-router-dom` v6, wrapped in `<Provider>` and `<BrowserRouter>` (the latter lives in `src/index.js`):

- `/` and `/lista` → `List`
- `/mapa` → `AllMap` (all active incidents on a Leaflet map)
- `/fma` → `FMA`
- `/fma-mapa` → `FMAMap`

`NavBar` is always mounted.

### Redux store

`src/store.js` uses plain `createStore` + `redux-thunk` and picks up the Redux DevTools extension if present. Not migrated to Redux Toolkit — deliberate simplicity; do not introduce RTK without discussion.

`src/reducers/index.js` combines three slices:

- `allIncidents` — feeds `List` and `AllMap` (fetched with `?all=1`)
- `fmaIncidents` — feeds `FMA` and `FMAMap` (fetched with `?fma=1&all=1`)
- `sideBar` — `{ open, incident }` for the map side panel

Both incident slices share a reducer factory in `src/reducers/incidentsSlice.js` (`createIncidentsReducer`). Slice shape: `{ data, loading, error }`. Actions per slice: `.../pending`, `.../fulfilled`, `.../rejected`, `.../sort`. Adding a new incidents view? Add constants to `actions/types.js`, an action creator in `clientActions.js`, and register a new slice via `createIncidentsReducer` in `reducers/index.js`.

### Data flow

All fetches go through `src/actions/clientActions.js`, which hits **relative** URLs (`/api/v2/incidents/active?...`) so the Pages Function handles them. Never re-add absolute `https://api.fogos.pt` URLs to the frontend — that both leaks the key requirement and breaks local dev when the function is present.

Map views (`IncidentMap`) auto-refresh every 60 s.

### Map layer

Both `AllMap` and `FMAMap` are thin wrappers over `src/components/IncidentMap.js`, parameterised by `{ sliceName, fetchAction }`. Shared logic — status colours, glyph regex ladder, `L.divIcon` construction — lives in `src/components/mapIcons.js`. Add a new incident nature by extending `GLYPH_RULES` **before** the generic `Object.keys(GLYPHS)` fallback in `mapIcons.js`.

`react-leaflet` v4 requires React 18. Do not downgrade React without also downgrading `react-leaflet`.

### Styling

- Tailwind 3 via PostCSS. Content globs in `tailwind.config.js` cover `./src/**/*.{js,jsx,ts,tsx}` and `./public/index.html` — add new source roots there.
- `src/index.css` has the three `@tailwind` directives.
- Component-scoped CSS lives next to the components (`mapLayout.css`).

### Things that used to be here and are gone on purpose

- `src/serviceWorker.js` — CRA PWA scaffolding, was only ever `unregister()`ed.
- `src/components/Incident.js` — dead component, never routed.
- `src/reducers/incidentsReducer.js` + `src/reducers/clientReducer.js` — replaced by the slice factory; the former even imported action-type constants that never existed.
- `PropTypes` — dropped from the refactored components. If you want runtime prop validation, TypeScript is the next step, not re-adding PropTypes.
- `redux-devtools-extension` npm package — deprecated years ago; the DevTools connection is picked up from `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` directly.

## Editing guidelines

- Keep the frontend fetching from `/api/...` — no absolute Fogos URLs.
- When adding a new Pages Function, follow the same shape as `functions/api/v2/incidents/active.js`: read `env.FOGOS_API_KEY`, forward querystring, short cache header, JSON error envelope for failures.
- Prefer functional components + hooks. All class components have been removed.
- Reducers are plain switches — keep them small and side-effect-free.
- 30+ npm audit warnings on install come from CRA's transitive tree (`react-scripts` 5 is EOL). Do not chase them with `--force`; migrating off CRA is the real fix and is out of scope for now.
