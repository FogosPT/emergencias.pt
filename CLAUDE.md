# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`emergencias.pt` is a small React 18 SPA that visualises Portuguese civil-protection incidents (all incidents + FMA — *Fogos de Maior Amplitude*, "large-scale fires"). Deployed as **Cloudflare Pages**, serving the Vite `build/` output. A **Pages Function** in `functions/api/` proxies the Fogos.pt public API and injects the `X-API-Key` header — the frontend never talks to `api.fogos.pt` directly, and the key never reaches the browser.

Stack: **Vite 5** + React 18 + `react-router-dom` 6 + `@reduxjs/toolkit` 2 (with `react-redux` 9) + `react-leaflet` 4 + Tailwind 3 + Vitest. Pages Functions run on the Cloudflare Workers runtime. Project is ESM-only (`"type": "module"`).

## Commands

Run everything from this directory (`emergencias.pt/`), not from the workspace root. **Use Node 20** (enforced by `.nvmrc`; `nvm use` will pick it up).

- `npm install` — install deps
- `npm start` / `npm run dev` — Vite dev server on http://localhost:3000. **The `/api/*` proxy does not run under `npm run dev`** — hit the deployed Pages preview, or `npx wrangler pages dev build` after a build to exercise the function locally.
- `npm run build` — production build to `build/` (kept as `build/` deliberately so Cloudflare Pages settings don't need to change).
- `npm run preview` — serve the built `build/` locally.
- `npm test` — Vitest single-run (jsdom + testing-library).
- `npm run test:watch` — Vitest in watch mode.
- `npx vitest run src/store/incidentsSlice.test.js` — run one test file.

## Architecture

### Cloudflare Pages layout

- `build/` — static output (Vite), deployed as-is.
- `functions/api/v2/incidents/active.js` — Pages Function. Handles `GET /api/v2/incidents/active?...`, forwards the querystring to `https://api.fogos.pt/v2/incidents/active`, adds `X-API-Key: env.FOGOS_API_KEY`, sets `Cache-Control: public, max-age=15, s-maxage=30`. **Secret is configured in the Pages dashboard** (Settings → Environment variables → `FOGOS_API_KEY`, encrypted). Do **not** commit it.
- `.nvmrc` — pins Node 20. CF Pages defaults to Node 16 on legacy projects; without this the build fails.

Anything under `functions/` is auto-discovered by Pages — no wrangler config needed. When adding a new upstream endpoint, mirror the URL shape.

### Routing (`src/components/App.js`)

Five routes under `react-router-dom` v6, wrapped in `<Provider>` and `<BrowserRouter>` (the latter lives in `src/index.js`):

- `/` and `/lista` → `List`
- `/mapa` → `AllMap`
- `/fma` → `FMA`
- `/fma-mapa` → `FMAMap`

### Redux (`src/store/`)

Redux Toolkit with `configureStore`, three slices:

- `allIncidents` — feeds `List` and `AllMap` (fetched with `?all=1`)
- `fmaIncidents` — feeds `FMA` and `FMAMap` (fetched with `?fma=1&all=1`)
- `sideBar` — `{ open, incident }` for the map side panel

Both incidents slices are produced by a **`createIncidentsSlice(name, query)`** factory in `src/store/incidentsSlice.js`. It returns `{ slice, fetchThunk }`:
- `slice.reducer` — plug into `configureStore`
- `slice.actions.sort({ field, order })` — sort in-place
- `fetchThunk` — a `createAsyncThunk` that hits `/api/v2/incidents/active${query}` and normalises the payload to an array

Slice shape: `{ data, loading, error }`. Components consume via `useSelector((s) => s.allIncidents)` and dispatch `fetchThunk()` on mount + on a 60s interval (map views).

To add a new incidents view: create the slice with `createIncidentsSlice('foo', '?query=1')`, register `foo.slice.reducer` in `src/store/index.js`, and dispatch `foo.fetchThunk` from the component.

### Data flow

All fetches go through slice thunks, which hit **relative** URLs (`/api/v2/incidents/active?...`) so the Pages Function handles them. Never re-add absolute `https://api.fogos.pt` URLs to the frontend — that both leaks the key requirement and breaks local dev when the function is present.

### Map layer

Both `AllMap` and `FMAMap` are thin wrappers over `src/components/IncidentMap.js`, parameterised by `{ sliceName, fetchAction }`. Shared logic — status colours, glyph regex ladder, `L.divIcon` construction — lives in `src/components/mapIcons.js`. Add a new incident nature by extending `GLYPH_RULES` **before** the generic `Object.keys(GLYPHS)` fallback in `mapIcons.js`.

Legend is a toggle button (🛈) in the bottom-right of each map; click to open, click legend to close.

### Vite quirks worth knowing

- The project is `"type": "module"` at the package level. Config files (`postcss.config.js`, `tailwind.config.js`, `vite.config.js`) must use ESM (`export default`) — not `module.exports`.
- `.js` files inside `src/` may contain JSX; Vite is configured (`esbuild.loader = 'jsx'` in `vite.config.js`) to accept this so we don't have to rename hundreds of files. New files can be either `.js` or `.jsx` and both work.
- `index.html` lives at the **repo root**, not in `public/`. Only static asset files (favicon, manifest, ads.txt, robots.txt) stay in `public/` — they are served from `/`.

### Testing

Vitest with jsdom. Setup file: `src/test/setup.js` (only pulls in `@testing-library/jest-dom` matchers). Tests colocated next to source (`*.test.js`).

Two flavours in the repo:
1. **Slice tests** (`src/store/*.test.js`) — build a mini store with just that slice, drive it via dispatches, assert on `store.getState()`.
2. **Component tests** (`src/components/*.test.js`) — mock `global.fetch`, render inside `<Provider><MemoryRouter>`, use `waitFor` for async state.

The React Router v6 future-flag warnings during tests are cosmetic — ignore them until v7.

### Styling

- Tailwind 3 via PostCSS. Content globs in `tailwind.config.js` cover `./src/**/*.{js,jsx,ts,tsx}` and `./index.html`.
- `src/index.css` has the three `@tailwind` directives.
- Component-scoped CSS lives next to the components (`mapLayout.css`).

## Editing guidelines

- Keep the frontend fetching from `/api/...` — no absolute Fogos URLs.
- When adding a new Pages Function, follow the same shape as `functions/api/v2/incidents/active.js`.
- Prefer functional components + hooks. No class components remain.
- Reducers go through RTK's `createSlice`/`createAsyncThunk` — don't hand-roll action-type constants or plain switch reducers unless you have a specific reason.
- Config files stay ESM.
