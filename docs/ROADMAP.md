# OMNIEARTH+ implementation roadmap
## v0.3 — Open-source demo (current)
- Responsive 2D map; explicit synthetic demo events and drive.
- Paris, Prague, Pardubice; point selection and native official map handoffs.
- GPS opt-in locally, stop/revoke and visible uncertainty.
- Real-place search takes visitor to Google/Mapy provider.
- Unit tests and community docs. No live courier GPS, no camera video.

## Traffic intelligence (proposed)
- Check rights and availability for Czech ŘSD/NDIC DATEX II / TPEG feed (pilot best-effort, not a universal real-time feed) and accessible public road-closures datasets.
- Check Waze for Cities partnership eligibility; not a publicly unrestricted API.
- Add traffic-jam / closure / construction filters **only with genuine source data and event timestamp**. If unavailable, mark source inactive; never invent traffic.
- Provide legal stationary speed-limit / known fixed camera notices through appropriately licensed data where supported. Do not provide covert patrol-vehicle trails or unverified dark-web tips.
- Separate provider-key operational backend, rate limits and cost controls.

## OMNISHOP optional future
- Only after explicit signed operator agreement: front-facing vehicle cameras, safety, consent/legitimate basis, driver notices, privacy impact review, face/plate redaction BEFORE upload, access control, no default public streams.
- Test with one approved company-owned vehicle and opt-in prototype.
- No current OMNISHOP courier integration.

## Premium + monetization
- The open MIT UI drives transparent adoption and B2B partnerships.
- Licensed deploy/support may be paid; no claim of profit absent invoice/settlement.
- KATASTR-ONLINE.cz paid reports and private CRM/payment logic remain entirely outside OSS and are not publicly exposed.
- Travel links are referrals, not evidence of paid commissions.

## Acceptance for v1
- Public demo GitHub, screenshot proof, CI tests and privacy docs.
- Cross-device visual QA; correct map provider attribution and low-traffic tile policy.
- One authorized data source with provenance and redaction before labeling any event LIVE.
- All billable API keys and partner contracts require explicit approval.
