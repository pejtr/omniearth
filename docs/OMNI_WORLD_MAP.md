# OMNI WORLD MAP — shared 3D atlas

## Current implementation (v0.1 feature-branch prototype)
- `/world-map.html`: responsive, orbitable 3D WebGL globe, country lines from published World Atlas data, region markers, keyboard-accessible point selection, search, three project filters (TEAHUB, OMNI TRAVEL, OMNIEARTH+).
- `src/world-map-core.mjs`: portable WGS84-to-cartesian functions and strict public-field allowlist; unknown projects and known sensitive fields rejected. Included points are **approximate regional reference anchors**, not farm addresses or partner verification.
- `src/world-map.mjs` and `src/world-map.css`: standalone implementation that does not change the existing `index.html` 2D map experience. 3D is enhanced using pinned Three.js ESM via jsDelivr and TopoJSON world-atlas data; when the CDN or WebGL fails, a fully functional text list is preserved.
- `tests/world-map.test.mjs`: input validation, project filtering, private-field rejection and evidence boundary.

## Run & release gate
```sh
npm test
npm run check
npm start
# http://127.0.0.1:4174/world-map.html
```
Before production merge: verify actual browser interactions at 390 / 768 / 1440 px, interactive controls, WebGL failure fallback, attribution/licensing, CDN caching/cost, CSP and network access. Do not describe the globe as a live verified tea-farm database or claim TEAHUB production integration without real E2E evidence.

## Security and separation of concerns
- **Public OMNIEARTH MIT layer**: real regional geography, non-sensitive place names, WGS84, canonical public producer/place links only after evidence & permission checks.
- **Private TEAHUB/ONYX layer**: Aleš contacts, farmer contracts, exact wholesale costs, lead/customer data, QR claims, passport identities, purchase logs, advertising consents and accounting.
- Private records MUST NOT be imported or embedded in this public repository.
- No precise customer GPS or background tracking. No claim that a person visited a place from mere proximity.
- Verified producers require source proof and appropriate publication permission. Avoid promising real-time stock or legal food safety certification on public map.
- No tile scraping or unauthorized Google 3D imagery. World-atlas and TopoJSON licenses should be reviewed for production attribution.

## 3D engine for future reuse
```
OMNI WORLD MAP (public, low-cost UI)
  ├── TEAHUB regional and authorized producer layer
  ├── OMNI TRAVEL destinations
  ├── OMNIEARTH generic places
  └── future authorized project adapters
           │
           └── approved public projections only (allowlist, provenance)
PRIVATE ONYX RUNTIME (separate)
  ├── TEA LOT / PRODUCER / FOUNDER CRM
  ├── B2B deals / invoices
  ├── TEA PASSPORT identities / receipt claims
  └── opt-in marketing events / analytics
```

## Explicitly out of scope
A GTA-like walking city and autonomous NPC behavior is **deferred to ONYXGAMING**; no dependency, game engine, GPU expense or NPC agent introduced here. No payments, customer registration or ad tracking on public globe.

## Revenue rationale
Reusable discovery module supports producer storytelling and future lead capture but does not itself create paid orders. Highest P0 priority remains first legal, margin-positive tea supply deal with a verified producer. No new paid map API is approved by this PR.
