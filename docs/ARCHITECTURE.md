# OMNIEARTH+ / architecture
```
PUBLIC MIT REPO
  Static geospatial map viewer (synthetic observations only)
  ├── external native Google Maps / Mapy.com search & routing
  ├── opt-in browser geolocation (volatile local memory)
  └── optional public links to OMNI TRAVEL and OPTIMATEO
         │ (no authenticated APIs or private records in OSS)
         ▼
PRIVATE OMNIVERSUM / ONYX OS (separate system)
  ├── KATASTR-ONLINE.cz premium source code, paid reports and property data
  ├── ONYX PAY + secure CRM + lawful customer consents
  ├── prospective OMNISHOP opt-in couriers (NO feeds connected)
  └── audited and authorized licensed observation providers
```

## Live data? Not yet
No real-time traffic, 3D Google Earth, 360° street video, camera access, police-vehicle positions or paid map APIs are included. All visible sample markers are synthetic. Never market this showcase as an operational traffic or emergency information provider.

## Private premium boundary
KATASTR-ONLINE.cz is a proprietary business. This repository publishes **none** of its source code, authenticated API implementation, database structure, lead records or premium cadastral datasets. A future commercial integration may only use approved server-to-server interfaces in the *private* ONYX runtime, with payment and consent checks. Never copy private cadastral owner contacts to the open project.

## Sources and rules
- OSM street tiles: best-effort [OSMF policy](https://operations.osmfoundation.org/policies/tiles/), low-volume demos only. A public commercial tile plan is needed before distribution at scale.
- Google: [Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) handoff, not embedded 3D maps.
- Mapy.com: [URL functions](https://developer.mapy.com/) handoff, not an embedded vendor basemap.
- Live traffic: candidate official [ŘSD / NDIC data](https://tpeg.dopravniinfo.cz/pilot/) and [Waze for Cities](https://www.waze.com/wazeforcities/) if approved; licensing, access token, quota and regional coverage must be verified.
- No unauthorized API scraping, hiding map attributions or selling third-party traffic data without rights.

## Security and privacy
Public source is MIT. Real feeds require server authentication, legal basis, purpose limitation, source provenance, retention controls, redaction tested before publication, abuse reporting, and human release process. Client Boolean values such as publicAuthorized cannot substitute authentication. No covert employee tracking and no republishing personal information.

The app does not persist or transmit browser GPS; external provider links receive coordinates only after an intentional click. Users are free to decline GPS and manually select a map point.
