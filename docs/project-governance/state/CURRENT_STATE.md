# CURRENT_STATE.md — Living Snapshot

> What exists **today**. Updated whenever the product or repository materially changes. This is a factual snapshot, not a plan.

**Last updated:** 2026-08-29
**Confidence:** The release snapshot below is verified from the canonical repository and Git history on 2026-07-12. Older live-site findings retain their original verification date. Items marked 🔍 remain pending confirmation.
**Information Governance (Phase 2A + ADR-008):** information is classified PUBLIC/INTERNAL/CONFIDENTIAL/SECRET per **`INFORMATION_CLASSIFICATION.md`** (`PROJECT_PRINCIPLES.md` §13). Client-identifying (CONFIDENTIAL) data has been redacted from `/AI_OS` planning docs and replaced with neutral placeholders (Client Representative, Legal Entity (Pending), Business Address (Pending), VAT ID (Pending), Contact (Pending)). Real identity remains only on the live legal pages (Impressum/Datenschutz/AGB) and other legally-required artifacts, which are unchanged. See `CONFIDENTIALITY_AUDIT.md` (applied record).

---

## PHASE 2B-0 — COMPLETE, PRODUCTION VERIFIED (2026-08-28)

> **This section supersedes any older statement below that says Production is NOT APPROVED, that SEO is planned only after legal-acceptance tracking, that `robots.txt` is empty, or that no sitemap/canonical/JSON-LD exists.** Those statements were accurate on 2026-07-12 and are retained for history only.

**PHASE 2B-0 STATUS: COMPLETE — PRODUCTION VERIFIED**

| Field | Value |
|---|---|
| Production commit | `b3f24d43f99a08eab27e8d41f17f192f3f94684c` (`b3f24d4`) |
| Production tree | `a53e0e5a94109c5411c566d9999f0e765ffb7b53` |
| Commit subject | `Merge Phase 2B-0 SEO authority foundation` |
| Branch | `main` |
| Production domain | `https://www.myhelper.me` |
| Vercel project | `miteinander` |
| Environment / status | Production — Ready / Latest / Current (owner-verified in the Vercel dashboard) |

Release chain merged into `main` (fast-forward; `cda4f1a` was **not** cherry-picked):

- `994cd5a` — `feat(frontend): add SEO baseline and unblock production build`
- `34780d0` — `fix(frontend): resolve homepage hydration mismatch`
- `cda4f1a` — `feat(seo): add German authority page and German-first SEO foundation`
- `b3f24d4` — `Merge Phase 2B-0 SEO authority foundation`

The same `b3f24d4` commit exists in Vercel as both the `phase2b0-production-integration` Preview and the `main` Production deployment.

### New live authority page

`/alltagsbegleitung-oder-pflegedienst` — informational comparison between Alltagsbegleitung and Pflegedienst.

### Live Production checks passed (2026-08-28)

- HTTP 200: `/`, `/alltagsbegleitung-oder-pflegedienst`, `/faq`, `/impressum`, `/datenschutz`, `/agb`, `/sitemap.xml`, `/robots.txt`
- `sitemap.xml` serves exactly 6 canonical production URLs
- Authority page canonical = `https://www.myhelper.me/alltagsbegleitung-oder-pflegedienst`; `robots` meta = `index, follow`
- Exactly one JSON-LD block on the authority page: `WebPage` + `BreadcrumbList` + `FAQPage`
- Visible FAQ / schema parity 6/6
- §45b wording correct and verbatim; no euro amount; no unsupported recognition or reimbursement claim
- Private/auth `X-Robots-Tag` noindex headers verified live on `/admin`, `/caregiver`, `/dashboard`, `/plans`, `/support`, `/login`, `/registrieren`, `/verify-email`, `/forgot-password`; public routes carry none
- Homepage `WebSite.inLanguage = "de"`; exactly one JSON-LD block
- Hydration fix live: no `Math.random` in served homepage HTML; all 7 care-need tags rendered
- Authority-page internal links live; footer link to the authority page present

### Manual Preview QA passed (owner)

Desktop and mobile. Comparison content is accessible on mobile via horizontal table scroll, and **both** the Alltagsbegleitung and the Ambulanter Pflegedienst columns are reachable.

### Accepted navigation disposition

The authority page has no global Navbar. This is **pre-existing secondary-page architecture** — `/faq`, `/impressum`, `/datenschutz` and `/agb` behave the same way, and `Navbar` is rendered only by `HomePageClient.tsx`. This is **not** a Phase 2B-0 regression. A shared public navigation/header remains a separate future milestone.

### Sequencing note (supersedes the 2026-07-12 plan)

The 2026-07-12 documents state that SEO begins only after legal-acceptance tracking and release stabilization. In practice the German-first SEO foundation (Phase 2A + 2B-0) shipped first, by owner decision. The legal-acceptance backend milestone and the taxonomy migration remain **unstarted and unexecuted**, exactly as previously recorded. Registration blockers below are unchanged by Phase 2B-0.

### Hosting correction

Production `https://www.myhelper.me` is served by **Vercel** (verified live: `server: Vercel`, `x-vercel-id`, `x-nextjs-prerender`). The older "Production hosting: Strato" note in §1 below is superseded.

### Known non-blockers carried forward

1. Public secondary pages have no shared global header.
2. The mobile comparison table requires horizontal scrolling; all content is reachable. A subtle "Seitlich wischen…" affordance may be considered later.
3. Historical badge-removal anomaly: `7b080e4` removed certain `DifferenceSection` badges/tags, but a later historical merge restored the branch-side state. Predates Phase 2B-0; not modified.
4. Duplicate `carerecipient.dashboard.unreadMessages` dictionary key is pre-existing and equivalent; not Phase 2B-0.
5. The existing pricing / public-vs-AGB contradiction remains intentionally unresolved.

---

## 0. PROJECT MODE

| Field | Value |
|---|---|
| **Current Mode** | **IMPLEMENTATION** |
| **Governance** | **FROZEN — AI_OS v1.0** (`AI_OS_VERSION.md`) |
| **Primary Focus** | Preview QA and registration release blockers |
| **Current Phase** | Frontend release validation before Production |
| **Governance Changes** | Allowed **only** through ADR-008 Change Control (documented legal / architecture / business-model / security / major AI-workflow trigger). Otherwise none — continue implementation. |

### Authorization update — 2026-07-11 (client decision)

- ✅ **Client approval received for the legal acceptance tracking system** (backend: legal documents, acceptance history, indexes).
- **Frontend release remains the ACTIVE milestone** — full frontend scope must be implemented, independently reviewed, committed, pushed, deployed to Preview, manually verified, and approved for client delivery **before any backend work begins**.
- **Backend legal acceptance tracking is the NEXT authorized milestone** — it starts only after frontend release completion. The three untracked files `backend/src/migrations/files/20260711000001–3_*` are **unreviewed candidate artifacts, not approved implementation**; a fresh backend governance and architecture review (compatibility, reversibility, document lifecycle, immutable/append-only evidence, no client-controlled hashes, Terms-vs-Privacy semantics, deterministic hashing, startup validation, rollback and execution plan, tests) is required before they are used.
- ⛔ **Migration execution is NOT yet authorized** (neither the committed care-needs taxonomy migration run-state nor the candidate legal migrations).
- **No backend implementation starts until frontend release completion.**

### Verified release snapshot — 2026-07-12

- Repository: `/Users/stan/Desktop/miteinander`
- Branch: `phase1a-client-review-v2`
- Frontend application baseline (last pure frontend-code commit): `4353eec5a2bdcc98805954febbfb4e3c8120c55b`. Current `origin/phase1a-client-review-v2` tip: `6a97c2c` (adds the EN/FR registration wording commit on top of the frontend baseline; push range `4353eec..6a97c2c`). The local governance-only commit containing this snapshot may be newer than the pushed tip.
- Pushed commits:
  - `6a97c2c` — `feat(i18n): update EN and FR registration terminology`
  - `8180199` — `feat(frontend): add FAQ and align MyHelper.me branding`
  - `a414997` — `fix(frontend): refine membership cards and mobile copy`
  - `4be46a3` — `fix(frontend): separate pricing and refine footer tagline`
  - `4353eec` — `fix(frontend): refine nearby companion headline`
- Homepage headline change: **COMMITTED, PUSHED, PREVIEW DEPLOYED**.
- Frontend release candidate: **DEPLOYED TO PREVIEW; BROWSER QA NOT COMPLETE**.
- Taxonomy migration: **REVIEWED, NOT EXECUTED**.
- Preview QA: **BLOCKED BY DASHBOARD ACCESS/API/CORS CONFIGURATION**.
- Production deployment: **NOT APPROVED**.
- Registration: **BLOCKED**.
- Legal-acceptance backend: **AUTHORIZED AS NEXT BACKEND MILESTONE, BUT NOT STARTED**.
- SEO: **PLANNED AFTER LEGAL ACCEPTANCE TRACKING** and release stabilization.
- No files are staged. The headline commit is pushed and its exact-SHA Preview deployment completed successfully.

### Homepage headline release increment — client decision 2026-07-12

- Client-approved German replacement: “Finden Sie passende Alltagsbegleiter:innen in Ihrer Nähe” (replaces “Eine große Auswahl an Alltagsbegleiter:innen in Ihrer Nähe”).
- Implemented locale equivalents:
  - DE: “Finden Sie passende Alltagsbegleiter:innen in Ihrer Nähe”
  - EN: “Find suitable everyday companions near you”
  - FR: “Trouvez des accompagnatrices et accompagnateurs du quotidien adaptés près de chez vous”
- Commit `4353eec5a2bdcc98805954febbfb4e3c8120c55b` changes only:
  - `frontend/src/locales/de/common.json`
  - `frontend/src/locales/en/common.json`
  - `frontend/src/locales/fr/common.json`
- Validation passed: locale JSON; 1,016-key DE/EN/FR parity; TypeScript; production frontend build with all 36 routes generated; `git diff --check`; scoped ESLint with 0 errors and 2 pre-existing warnings.
- The commit was pushed to `origin/phase1a-client-review-v2` on 2026-07-12.
- GitHub deployment ID `5411075186` reports Preview state `success` for the exact commit. Generated Preview URL: `https://miteinander-1efdncyw2-info-39415777s-projects.vercel.app`.
- GitHub also exposes the branch Preview alias `https://miteinander-git-phase1a-client-r-3efb32-info-39415777s-projects.vercel.app`; QA must use the exact generated deployment URL above, not an unverified stale alias.
- Deployment Protection, signed-in project access, and the configured Preview `NEXT_PUBLIC_API_URL` could not be confirmed because the ChatGPT Chrome Extension could not connect to the signed-in Chrome session after the supported retry. Do not infer their values from an unauthenticated session.

### Completed frontend presentation

- Visible branding is aligned to MyHelper.me; the legal operator identity remains Rhoda Fideler.
- FAQ route `/faq` exists and is linked from the footer.
- Unsplash is included in the image credits.
- DE/EN/FR locale-key parity was maintained.
- Homepage target-group cards show “Monatlicher Mitgliedsbeitrag” and a prominent “8,99 € / Monat” in a separate highlighted price section below the feature list; “Monatlich kündbar” remains a feature bullet.
- Mobile clipping was fixed for “Persönliche Alltagsbegleitung” and “Faire Konditionen”.
- Footer slogan is “Gemeinsam mehr Lebensqualität.”
- TypeScript, scoped ESLint, the production build, locale parity, and Git boundary/whitespace checks passed.

### Registration diagnosis and blockers

- The exact Preview `NEXT_PUBLIC_API_URL` remains unverified in the authenticated Vercel dashboard.
- Backend CORS does not currently accept the exact commit-specific Vercel Preview origin.
- Deployment Protection and signed-in project access remain unverified in this session; prior handoff reported Vercel SSO, but authenticated Chrome inspection could not be completed.
- Browser testing of both Preview registration flows remains pending until access and connectivity are available.
- The live API returns care-need records successfully for the production origin.
- The client approved removal of the active registration categories `Medikamentengabe` (`medication`), `Körperpflege` (`personalHygiene`), and `Mahlzeitenzubereitung` (`mealPreparation`) on 2026-07-12.
- The tracked migration `backend/src/migrations/files/20260710000001_align_care_needs_taxonomy.js` is the reviewed canonical database-governed taxonomy implementation. It deactivates those three categories and retains/reframes the remaining everyday-support taxonomy.
- **Taxonomy migration execution is not approved and has not occurred.** Production registration still exposes the old categories until the migration is executed through an approved plan and the active taxonomy is verified.
- Recipient and caregiver registration use the same active database-governed source through `GET /auth/care-needs`.
- No hard-coded frontend fallback service options were added.
- Do not hide API, environment, or database failures with invented static frontend options.
- Registration questionnaire and validation review remains pending.
- Any execution plan must isolate `20260710000001_align_care_needs_taxonomy.js` and ensure the protected untracked `20260711` legal candidates cannot be discovered or auto-executed by the migration runner.

### Registration wording alignment increment — 2026-07-12 (commit `6a97c2c`)

- Committed and pushed to `origin/phase1a-client-review-v2`: `6a97c2c` — `feat(i18n): update EN and FR registration terminology`. Push range `4353eec..6a97c2c`.
- Changed only `frontend/src/locales/en/common.json` and `frontend/src/locales/fr/common.json` (8 `register` namespace keys each).
- German registration wording was **not** changed — it was already aligned with Alltagsbegleitung terminology.
- EN and FR registration-flow wording was updated from nursing/clinical terminology (e.g. "caregiver", "Nurse", "Medical Assistant", "soignant") toward everyday-support/companion terminology, matching the existing German wording.
- Wording-only change: all translation keys, role values, field names, IDs, API contracts, component logic, and form behavior were preserved unchanged.
- Validation passed: JSON parsing (EN/FR), DE/EN/FR locale-key parity, `register.careNeed`/`register.skill` sub-objects confirmed byte-identical to prior HEAD, `git diff --check`. No tracked working-tree changes remained after commit and push.
- **Unresolved, separate issue — not addressed by this commit:** the live `GET /api/care-needs` response still returns `medication` (`Medikamentengabe`) and `personalHygiene` (`Körperpflege`) as active selectable options in both registration roles; `mealPreparation` (`Mahlzeitenzubereitung`) is not currently returned. This wording patch does not hide, filter, rename, or deactivate any API-supplied option — resolving the active taxonomy remains gated on the separately-tracked `20260710000001_align_care_needs_taxonomy.js` migration execution approval (see above).
- This increment does **not** change the status of: Production deployment (still NOT APPROVED), browser/Preview QA (still NOT COMPLETE), registration overall (still BLOCKED), taxonomy migration (still REVIEWED, NOT EXECUTED), legal pages, the P0 security checklist, or client final acceptance.

### Protected untracked candidate artifacts

The following files are unreviewed candidate artifacts. They must not be opened, edited, staged, executed, or committed without a separately approved backend task:

- `backend/src/migrations/files/20260711000001_create_legal_documents_table.js`
- `backend/src/migrations/files/20260711000002_create_legal_acceptances_table.js`
- `backend/src/migrations/files/20260711000003_add_legal_indexes.js`

### Controlled taxonomy migration planning — 2026-07-12

- The normal migration runner discovers every filename ending in `.js` under `backend/src/migrations/files`, sorts filenames lexically, subtracts names recorded in the target database table `migration_meta`, and executes every remaining migration in order.
- The directory currently contains 28 discoverable `.js` files. The local tracker omits four: the approved tracked taxonomy migration plus all three protected `20260711` legal candidates. The protected candidates would therefore be discovered by the normal runner and could be auto-executed if they are not already recorded in the target database.
- The checked-in `migrations/tracker/migrations.json` is not used to decide pending state; target-database `migration_meta` is authoritative. It records only the 24 `20260203` migrations locally, so Production execution state for the taxonomy migration remains unconfirmed until a read-only `migration_meta` query is run against an explicitly confirmed target.
- Backend startup is unsafe for this task: `server.js` calls `getPendingMigrations()` and then `migrate()` before starting HTTP service. `npm run migrate`, `npm run migrate:status`, and `npm run migrate:undo` are also unsafe because they use the broad runner and/or last-migration semantics.
- The tracked taxonomy migration checksum is SHA-256 `5a2895dbe1381fa1b7f685a91faba769ba6d1c7a1ca48d83a94e7a24c800aff5`.
- The migration targets stable `care_needs.key` values, deletes no rows, preserves IDs and existing JSON ID selections, and changes only `care_needs` visibility/content plus the eventual `migration_meta` marker. Its current `up`/`down` methods and runner are not transactional.
- Safest proposed isolation: a reviewed one-off executor outside the migration directory that imports only the exact tracked migration by absolute path, verifies its checksum and the explicit database host/port/name, injects one transaction into every `bulkUpdate`, records only the exact migration marker in the same transaction, and never imports the broad runner or scans the directory.
- Execution is **NOT APPROVED** and is not yet safe: the target database, backup evidence, live preflight rows, and database `migration_meta` state remain unconfirmed.

---

## 1. Deployment

- ✅ Live production site: `https://www.myhelper.me` (responds, Next.js, `lang="de"`).
- ✅ Preview deployment referenced by the repo: `https://miteinander.vercel.app`.
- ✅ Exact-SHA Preview for `4353eec5a2bdcc98805954febbfb4e3c8120c55b`: deployment ID `5411075186`, GitHub/Vercel state `success`, generated URL `https://miteinander-1efdncyw2-info-39415777s-projects.vercel.app`, created `2026-07-12T08:37:09Z`.
- 🔍 Authenticated Vercel dashboard verification remains pending for Deployment Protection, signed-in project access, and Preview `NEXT_PUBLIC_API_URL`.
- ✅ Production hosting: **Strato** (per owner). CI/CD path from GitHub → Strato: 🔍 to confirm.
- ✅ Public repository: `github.com/123Myhelper/miteinander`, 54 commits.

## 2. Frontend (verified from `frontend/package.json` + `src/app/layout.tsx`)

- ✅ Next.js **16.1.4**, React **19.2.3**, TypeScript 5, App Router under `src/app/`.
- ✅ Styling: Tailwind CSS **v4** (`@tailwindcss/postcss`).
- ✅ Data layer: TanStack React Query v5.
- ✅ Realtime: `socket.io-client` v4.
- ✅ UI libs: Framer Motion, lucide-react, Sonner (toasts), react-datepicker, react-easy-crop.
- ✅ Fonts: `next/font/google` → **DM Sans** + **Playfair Display** (self-hosted at build).
- ✅ Global providers mounted in root layout: `QueryProvider`, `AuthProvider`, `SocketProvider`, `LanguageProvider`.
- ✅ `CookieConsent` component mounted globally.
- ✅ Dev server runs on port 1003.
- ✅ **Routes verified:** public (`/`, `/faq`, `/login`, `/registrieren`, `/forgot-password`, `/verify-email`, `/plans`, `/plans/success`), legal (`/impressum`, `/agb`, `/datenschutz`), and four authenticated areas (`/dashboard`, `/caregiver`, `/admin`, `/support`). Trilingual de/en/fr. Full baseline map in `TECHNICAL_AUDIT.md`.

## 3. Backend (verified from `backend/package.json`)

- ✅ Node.js + Express **4**. Entry point `server.js`.
- ✅ Database: **MySQL** via `mysql2` + Sequelize **6** ORM, with migrations + seeders.
- ✅ Auth: JWT (`jsonwebtoken`) + password hashing (`bcryptjs`).
- ✅ Security middleware: `helmet`, `cors`, `express-validator`.
- ✅ Payments: **Stripe** (`stripe` v20).
- ✅ Email: `nodemailer`.
- ✅ Realtime: `socket.io` v4.
- ✅ Config via `dotenv`. License: ISC.
- ✅ **API + data model verified** (repo cloned 2026-07-09): controllers/routes for auth, caregiver, recipient, admin, support, message, notification, review, subscription; RBAC via `roleGuard`; 12 Sequelize models (CareGiver, CareRecipient, Admin, Support, Conversation, Message, Notification, Review, SupportTicket, SupportMessage, SettlementRequest, CareNeed). Details in `TECHNICAL_AUDIT.md` / `SECURITY_AUDIT.md`.

## 4. SEO / metadata (verified from live site + root layout)

- ✅ Root metadata and visible brand copy are aligned to MyHelper.me. **Phase 2 Production promotion is COMPLETE** — Production is live at `07f52c2f2cf3b63fc49536e25bed9fe0a4c7a384` (tree `027ab4d052ae0d929c3fc6d6520313cfe259f908`), reverified 2026-08-29.
- ✅ The reviewed homepage is repositioned around Alltagsbegleitung and includes the approved responsive target-group membership cards.
- **Language status (ADR-007):** German remains the source language. Neutral EN/FR equivalents were added only where required to preserve locale-key parity for approved shared frontend changes; this does not authorize a broader EN/FR rewrite.
- **Jurisdiction (ADR-009):** MyHelper.me operates **only in Germany under German law**. German, English, and French are **interface languages of one German-jurisdiction platform**, not country editions. Expansion outside Germany requires a new ADR and legal review.
- ✅ **CA-19 implementation is committed:** the meal-preparation homepage tag is removed in de/en/fr. Database-governed care-needs taxonomy remains a separate migration/release concern.
- ◐ **Social media (verified live):** footer has 4 placeholder `href="#"` icons (Instagram, Facebook, LinkedIn, Twitter/X); no social references elsewhere. Confirmed accounts: Instagram + Facebook (canonical); **Twitter/X icon to be removed** (no account); **LinkedIn pending** = sole blocker. Wire in one pass via a single shared config when LinkedIn arrives → `SOCIAL_MEDIA_REFERENCE.md`.
- ✅ `robots.txt` is **populated**, served from `src/app/robots.ts`: allows `/`; disallows `/admin`, `/caregiver`, `/dashboard`, `/plans`, `/support`; carries `Host:` and `Sitemap:` lines. Reverified live 2026-08-29. *(Supersedes the earlier "returns empty" finding, which predates Phase 2B-0.)*
- ✅ Open Graph + Twitter tags present; social image is `logo.svg` (512×512); Twitter card type `summary` (small).
- ✅ `<html lang="de">` set (good for SEO/accessibility).
- ✅ **RESOLVED (reverified 2026-08-29).** Per-page unique titles, descriptions and canonical tags ship for every public route via `createPublicMetadata`; the legal pages carry their own metadata through their route `layout.tsx`, so the earlier "generic root metadata" observation no longer applies. `sitemap.xml` serves exactly **7 canonical public URLs** with commit-derived `lastmod` values. JSON-LD is live: `Organization` + `WebSite` + `Service` on `/`; `WebPage` + `BreadcrumbList` + `FAQPage` on both authority pages; `FAQPage` on `/faq`.
- ✅ **Search Console:** verified as a **Domain property via DNS TXT** on the apex, so apex, `www` and both protocols report into one dataset. Reverified 2026-08-29. *(Verification token value not recorded here — INTERNAL handling per `INFORMATION_CLASSIFICATION.md`.)*
- ✅ **Canonical host redirects:** apex → `www` and `http` → `https` both return `308`. Reverified 2026-08-29.
- 🔴 **No web analytics is installed** — no GA4, Vercel Analytics, Plausible, Matomo or PostHog anywhere in `frontend/src` or `package.json`, and no analytics script on the live homepage. Search Console therefore provides acquisition data only; **no post-click or conversion data exists**. Blocked behind TDDDG § 25 consent design and Datenschutzerklärung completion.

## 5. Privacy / legal (Phase 2 verified — see `LEGAL_GAP_ANALYSIS.md`)

- ✅ Cookie consent UI exists (`CookieConsent` component). Policy text lacks § 25 TDDDG detail; blocking behaviour still 🔍 (R-15).
- ✅ Fonts self-hosted via `next/font/google` (no runtime Google Fonts request — re-confirmed live in Phase 1A: zero `fonts.googleapis.com` calls).
- ✅ **Impressum content** (verified live): the Client Representative / Legal Entity (Pending) / Business Address (Pending) · Tel Contact (Pending) · Contact (Pending) · **USt-IdNr. VAT ID (Pending)** · redaktionell verantwortlich · EU-ODR clause · developer credit (Atika Solutions). Cites outdated **§ 5 TMG** (→ DDG); legal form/register not stated (G-05/G-06).
- 🔴 **Datenschutzerklärung content** (verified live): **stub** — overview, controller, generic cookies, and a non-existent "Kontaktformular" only. Omits accounts, Stripe, messaging, email, hosting, profile images, support, reviews, rights, legal bases, retention (G-01, R-20, CA-21).
- 🔴 **AGB content** (verified live): 5 §§ (Geltungsbereich, Vertragspartner, Leistungsbeschreibung, Registrierung, Haftung); **uses "Pflege/Pflegekräfte/Pflegeleistungen"** (§3/§5); no membership/payment/Widerruf/cancellation/final provisions (G-02/G-03, R-21/R-22, CA-22).
- ✅ **Contact:** mailto `Contact (Pending)` + phone; "Kontakt"/"Kontaktieren Sie uns" scroll to footer — **no contact form**. Homepage has an email-capture ("Benachrichtigen") app-notify form, currently undisclosed in the privacy policy (G-04).
- 🔍 Cookie categories/consent storage, Stripe.js client cookies, AVVs (Stripe/Strato/email) — pending client confirmation (`LEGAL_CLIENT_QUESTIONS.md`).

## 6. Open questions to resolve on full inspection

1. Does the built output confirm self-hosted fonts (no `fonts.googleapis.com` at runtime)?
2. Are Datenschutz/Impressum/AGB present, complete, and crawlable?
3. What does the Stripe integration store, and where is the data processing agreement?
4. Is there a `sitemap.xml` / `robots.ts` in the repo that isn't served on Strato?
5. What is the deploy pipeline from GitHub to Strato (and is Vercel a live surface or preview only)?

See `TODO.md` for the resulting action items.
