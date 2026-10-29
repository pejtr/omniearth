# Agent instructions — cross-project


## OMNIverse infrastructure — GLOBAL HARD RULE (2026-10-29)
**BEZ RAILWAY. ONLY CLOUDFLARE.** All new deployment/hosting/edge/APIs/storage/queues/cron and preview/production run on Cloudflare (Workers, Pages, R2, D1/KV/Queues etc. as appropriate). Never recommend or deploy Railway, including as fallback. Heavy GPU video jobs run on owned GPUs through secured Cloudflare Tunnel/Access or approved metered model APIs, not inside Cloudflare Workers. Existing Railway services are MIGRATION DEBT only: verify replacement, data, forms, billing, DNS, rollback and actual Cloudflare production before decommission; do not cause downtime. No GitHub Actions requirement: test/build directly, confirm SHA and E2E. Read the canonical cross-project policy: https://github.com/pejtr/OPTIMATEO/blob/main/docs/INFRASTRUCTURE_CLOUDFLARE_ONLY.md . This applies to ALL current/future OMNIverse work. Do not claim migration complete without proof.
