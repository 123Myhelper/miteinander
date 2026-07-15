# TODO.md — Backlog

**Last updated:** 2026-07-12
Priority: **P0** blocker/legal · **P1** high · **P2** medium · **P3** later.
Status: ☐ open · ◐ in progress · ☑ done.

---

## Immediate release sequence — approved order

1. ☑ Stage, commit, and push the three validated locale changes as `4353eec5a2bdcc98805954febbfb4e3c8120c55b`.
2. ☑ Confirm the exact-SHA Preview deployment: ID `5411075186`, state `success`, URL `https://miteinander-1efdncyw2-info-39415777s-projects.vercel.app`.
3. ☐ Complete authenticated Vercel dashboard inspection and verify Deployment Protection, signed-in project access, and the exact Preview `NEXT_PUBLIC_API_URL`.
4. ☐ Obtain approval for and apply a narrowly scoped Preview API/CORS configuration change for the exact commit-specific Preview origin.
5. ☑ Review the committed care-needs taxonomy migration: `backend/src/migrations/files/20260710000001_align_care_needs_taxonomy.js`.
6. ◐ Controlled single-migration plan prepared: exact-module/checksum/transaction isolation avoids the broad runner. Before approval, explicitly confirm target DB host/port/name, backup evidence, database `migration_meta`, and live preflight rows.
7. ☐ Execute the taxonomy migration only after explicit execution approval.
8. ☐ Verify the active taxonomy after migration; `Medikamentengabe`, `Körperpflege`, and `Mahlzeitenzubereitung` must no longer be active registration options.
9. ☐ Obtain approval to begin browser QA, then test recipient and caregiver registration against their shared `GET /auth/care-needs` taxonomy without submitting unauthorized real data.
10. ☐ Complete remaining registration wording and validation corrections and obtain client Preview approval.
11. ☐ Begin the separately authorized legal-acceptance backend milestone.
12. ☐ Stabilize the release, then begin SEO only after legal acceptance tracking.
13. ☐ Promote to Production only after all release gates pass, then perform Production QA and obtain final client acceptance.

**Release status:** homepage headline change is **COMMITTED, PUSHED, PREVIEW DEPLOYED**; the frontend release candidate is **DEPLOYED TO PREVIEW, BROWSER QA NOT COMPLETE**; taxonomy migration is **REVIEWED, NOT EXECUTED**; Preview QA is **BLOCKED BY DASHBOARD ACCESS/API/CORS CONFIGURATION**; Production is **NOT APPROVED**; registration is **BLOCKED**. Legal-acceptance tracking is the **NEXT AUTHORIZED BACKEND MILESTONE, NOT STARTED**. SEO is planned only after legal acceptance tracking and release stabilization.

### Registration release blockers

- ☑ Commit and push the three locale changes; exact-SHA Preview deployment completed successfully.
- ☑ EN/FR registration-flow wording aligned to Alltagsbegleitung/everyday-support terminology (commit `6a97c2c`, pushed to `origin/phase1a-client-review-v2`, push range `4353eec..6a97c2c`); German was already aligned and left unchanged. Wording-only — no keys/IDs/API/behavior changed. Does not resolve the still-open item below (questionnaire/validation review) or the live API-supplied `medication`/`personalHygiene` options, which remain active and unchanged.
- ☐ Restore the ChatGPT Chrome Extension connection and complete authenticated inspection of the exact generated deployment; do not substitute an unauthenticated session or stale alias.
- ☐ Verify Deployment Protection, signed-in project access, and the exact Preview `NEXT_PUBLIC_API_URL` in the Vercel dashboard.
- ☐ Add only the exact commit-specific Preview origin to backend CORS through an explicitly approved backend/environment change.
- ☐ Execute the reviewed taxonomy migration only through an explicitly approved, isolated plan; Production still exposes `Medikamentengabe`, `Körperpflege`, and `Mahlzeitenzubereitung` until execution and verification.
- ☐ Never use backend startup, `npm run migrate`, `npm run migrate:status`, or `npm run migrate:undo` for this release: all three protected `20260711` candidates are discoverable by the broad runner.
- ☐ Confirm the taxonomy migration is absent from the explicitly targeted database’s `migration_meta`; the local JSON tracker is not authoritative.
- ☐ Capture a verified database backup plus preflight snapshot of the six affected stable keys and existing recipient/caregiver ID references before requesting execution approval.
- ☐ Browser-test both Preview registration roles after access/API/CORS/taxonomy gates are cleared.
- ☐ Review registration questions, service-choice wording, and validation behavior.
- Do not introduce static frontend fallback options to hide an API, environment, or database failure.

## P0 — Security (do first; see `SECURITY_AUDIT.md`)

- ☐ **P0** Scan **full git history** for secrets (`gitleaks`/`trufflehog`); **rotate** any hit. F-06
- ☐ **P0** Confirm **CORS** is origin-restricted (not `*`) and **RBAC/IDOR** checks exist on all PII endpoints. F-11/F-12
- ☐ **P0** Add **rate limiting** to login/registration/password-reset/payment endpoints (none seen in deps). F-15
- ☐ **P0** Verify **Stripe webhook signature** and **Socket.IO connection auth**. F-16/F-17
- ☐ **P0** Confirm **no PII in logs/errors** and **no secrets in frontend bundle** (only `NEXT_PUBLIC_*` + Stripe publishable). F-19/F-24
- ☐ **P1** Shorten **JWT lifetime** (7d → short access + refresh) and move tokens to `httpOnly` cookies. F-07
- ☐ **P1** Run **`npm audit`** (both apps); add **security headers** on frontend. F-23/F-20

## P0 — Legal & positioning (do first)

- ◐ **P0** **Legal-page audit DONE (Phase 2)** → `LEGAL_GAP_ANALYSIS.md` (G-01…G-09). Next: client answers `LEGAL_CLIENT_QUESTIONS.md` (32 Qs) + counsel, then rewrite. **No text written yet.**
- ◐ **P0** Confirm operating **legal entity** form/register → finalize **Impressum** (entity + USt-ID verified; § 5 TMG→DDG; form/register TBC). G-05/G-06, CA-24
- ☐ **P0** Rebuild **Datenschutzerklärung** (stub) against real processing — Stripe, accounts, messaging, email, hosting, cookies §25, rights/legal bases/retention. G-01, R-20, CA-21
- ☐ **P0** Reposition **AGB** Pflege→Alltagsbegleitung **and** add membership/payment/**Widerrufsbelehrung**/cancellation/final provisions. G-02/G-03/G-09, R-21/R-22, CA-22
- ☑ **P1** **FAQ:** implemented at `/faq` with approved DE/EN/FR content and linked from the footer. Optional `FAQPage` JSON-LD remains a later SEO task.
- ☐ **P0** Confirm **AVVs** (data processing agreements) with Stripe, Strato, and email/SMTP provider.
- ☐ **P0** Remove any **unverified reimbursement/medical claims** (Entlastungsbetrag) until legally confirmed. `BUSINESS_MODEL.md`
- ☑ **P0** Complete the reviewed frontend presentation increment on `phase1a-client-review-v2`; commits through `4be46a3` are pushed. **Next gate:** Vercel Preview QA and client approval. `DECISIONS.md` ADR-002

### Language roadmap (ADR-007) — localization, not translation

> **Jurisdiction (ADR-009):** all three languages describe **one Germany-only, German-law platform**. EN/FR are interface localizations of the German legal framework for users in Germany — **not** country editions; no other-country legal wording. **Expansion outside Germany = new ADR + legal review before any implementation.**

**Phase 1 — German — ACTIVE:** Homepage · SEO · Metadata · Open Graph · Structured Data · Legal wording · Accessibility · Content optimisation.

**Phase 2 — English Localization (NEXT PHASE, after German approved):** review existing content · rewrite for native English speakers · SEO · Metadata · Open Graph · Structured Data · hreflang · client review. *Do not touch EN in Phase 1.*

**Phase 3 — French Localization (DEFERRED):** review existing content · rewrite for native French speakers · SEO · Metadata · Open Graph · Structured Data · hreflang · client review. *No FR work in Phase 1/2; excluded from reports until Phase 3.*

Each phase gated by client approval → production. Cross-language differences = **EXPECTED DIFFERENCE**, not bugs. **Localization > literal translation** (literal prohibited).
- ◐ **P0** Verify the exact-SHA Preview for commit `4353eec`: deployment succeeded, but authenticated dashboard inspection and browser QA remain pending. Do not promote it to Production while registration is blocked.
- ◐ **P0** Apply the client-approved registration taxonomy decision from 2026-07-12: deactivate `medication`, `personalHygiene`, and `mealPreparation` through `20260710000001_align_care_needs_taxonomy.js`. Migration reviewed; execution and Production verification remain pending. Broader service-catalogue/legal wording review remains open. `RISK_REGISTER.md` R-17

## P1 — Repository deep analysis (clears the 🔍 items)

- ◐ **P1** Clone repo; inventory `frontend/src/app` route tree and forms.
- ☐ **P1** Inventory `backend/src` routes, Sequelize models/migrations → build the **personal-data inventory**.
- ☐ **P1** Confirm **Strato serving model** for Next.js (SSR vs. static vs. proxy). `TECHNICAL_AUDIT.md` §4
- ☐ **P1** Verify built output **self-hosts fonts** (no `fonts.googleapis.com` at runtime). ADR-003
- ☐ **P1** Verify **cookie banner** blocks non-essential cookies pre-consent and records consent. `LEGAL_AUDIT.md`
- ☐ **P1** Check **Stripe.js** client cookies vs. consent gating.

## P1 — Technical SEO foundations

> Begin SEO only after the legal acceptance tracking milestone and release stabilization.

- ☐ **P1** Rewrite **root + per-page metadata** (unique title/description) via Next.js Metadata API. `SEO_STRATEGY.md`
- ☐ **P1** Add real **`robots.ts`** (disallow app/auth/API; allow public) with `Sitemap:` line.
- ☐ **P1** Add dynamic **`sitemap.ts`** for public pages.
- ☐ **P1** Ensure **legal pages** are crawlable with unique metadata.
- ☐ **P1** Set **canonicals** + redirects (apex→www, http→https); **noindex/redirect the Vercel preview**.

## P2 — Structured data, security, performance

- ☐ **P2** Add JSON-LD: `Organization`/`LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`. `SEO_STRATEGY.md` — `Organization.sameAs` reads the single social config (`SOCIAL_MEDIA_REFERENCE.md`).
- ◐ **P2** **Footer social links** — ✅ implemented on branch as `phase2a-social-links.patch` (config `social.ts` + Footer; Twitter removed; IG/FB wired). **NOT merged/deployed** (needs repo/Vercel push). **Remaining:** add LinkedIn (one commented line in `social.ts`) when provided → re-generate/apply in one pass. `SOCIAL_MEDIA_REFERENCE.md`
- ☐ **P2** Add/verify **security headers** on frontend (CSP, HSTS, X-Content-Type-Options, Referrer-Policy). `TECHNICAL_AUDIT.md`
- ☐ **P2** Run **`npm audit`** (both apps); patch/pin vulnerabilities.
- ☐ **P2** Confirm **JWT storage** strategy (httpOnly cookie preferred) + expiry/refresh.
- ☐ **P2** **Core Web Vitals** pass on key templates (LCP/CLS/INP); avoid shift from toasts/cookie banner.
- ☐ **P2** Provide a proper **1200×630 OG image**; consider `summary_large_image`.

## P2 — Information Governance (ADR-008)

- ☑ **P2** Adopt classification model + generalize Principle 13 → `INFORMATION_CLASSIFICATION.md` (done, docs only).
- ☐ **P2** **Phase 2B — Repository Information Classification Audit** (planning done; execution **blocked on repo access**). Scope: `frontend/`, `backend/`, `public/`, README, comments, seed data, migrations, GitHub Actions, Docker, scripts, docs outside `/AI_OS`. **Exclude** legally-required legal pages. Output `PHASE_2B_CLASSIFICATION_AUDIT.md` (findings only; no repo changes). Ties to R-06 (secret scan). `INFORMATION_CLASSIFICATION.md` §9

## P3 — Later / future phase (do not start unless requested)

- ☐ **P3** Accessibility audit to WCAG 2.2 AA across templates.
- ☐ **P3** Document environment variables (`.env.example`) and secret handling.
- ☐ **P3** Future phase only: GA4, GTM, Search Console, GEO/AEO, AI chatbot. `DECISIONS.md` ADR-004

---

### Open questions blocking work
1. Operating legal entity behind MyHelper? (blocks Impressum/AGB)
2. Any reimbursement (Entlastungsbetrag) recognition? (blocks related claims)
3. Does the demand side pay? Full revenue model? (`BUSINESS_MODEL.md`)
4. Geographic strategy — nationwide vs. regional? (affects location SEO)
5. Is `miteinander.vercel.app` a live surface or preview only?
