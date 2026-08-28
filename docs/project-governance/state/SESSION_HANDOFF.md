# SESSION_HANDOFF.md — Current Operational Handoff

**Last updated:** 2026-08-28

## Phase 2B-0 — COMPLETE, PRODUCTION VERIFIED

**PHASE 2B-0 STATUS: COMPLETE — PRODUCTION VERIFIED (2026-08-28)**

| Field | Value |
|---|---|
| Production commit | `b3f24d43f99a08eab27e8d41f17f192f3f94684c` (`b3f24d4`) |
| Production tree | `a53e0e5a94109c5411c566d9999f0e765ffb7b53` |
| Commit subject | `Merge Phase 2B-0 SEO authority foundation` |
| Branch | `main` |
| Vercel project | `miteinander` |
| Environment / status | Production — Ready / Latest / Current (owner-verified) |
| Production domain | `https://www.myhelper.me` |
| New live page | `/alltagsbegleitung-oder-pflegedienst` |

> **Supersedes the 2026-07-12 statement "Production deployment: NOT APPROVED".** Production is deployed and verified for the SEO foundation scope. Registration and backend milestones below are unchanged and remain blocked/unstarted.

## Repository State

- Canonical repository: `/Users/stan/Desktop/miteinander`
- Working directory branch: `phase1a-client-review-v2` at `cda4f1a8511617e438369ba3698ce8a391bb3a98`
- **`phase1a-client-review-v2` is now BEHIND `main`.** `main` (`b3f24d4`) is the merge of that branch's tip into the prior main. Do not treat the working branch as the release head.
- Local tracked worktree: clean. Staging area: empty.
- Remote branches (none deleted, all retained):
  - `origin/main` — `b3f24d43f99a08eab27e8d41f17f192f3f94684c`
  - `origin/phase1a-client-review-v2` — `cda4f1a8511617e438369ba3698ce8a391bb3a98`
  - `origin/phase2b0-production-integration` — `b3f24d43f99a08eab27e8d41f17f192f3f94684c`
- Production hosting is **Vercel** (verified live via `server: Vercel` / `x-vercel-id`). Older "Strato" notes are superseded.

## Phase 2B-0 Release Chain

- `994cd5a` — `feat(frontend): add SEO baseline and unblock production build`
- `34780d0` — `fix(frontend): resolve homepage hydration mismatch`
- `cda4f1a` — `feat(seo): add German authority page and German-first SEO foundation`
- `b3f24d4` — `Merge Phase 2B-0 SEO authority foundation` (Production)

`cda4f1a` must never be cherry-picked alone — the two prerequisite commits are hard build dependencies (`@/lib/seo`, `@/components/JsonLd`, `robots.ts`, `sitemap.ts`).

## Verified Live in Production (2026-08-28)

- HTTP 200: `/`, `/alltagsbegleitung-oder-pflegedienst`, `/faq`, `/impressum`, `/datenschutz`, `/agb`, `/sitemap.xml`, `/robots.txt`
- `sitemap.xml` = exactly 6 canonical production URLs
- Authority page: correct H1, breadcrumb, production canonical, `index, follow`, one JSON-LD block (`WebPage` + `BreadcrumbList` + `FAQPage`), 6/6 visible-FAQ/schema parity
- §45b wording verbatim; no euro amount; no unsupported recognition or reimbursement claim
- `X-Robots-Tag` noindex live on all private/auth paths; absent on public paths
- Homepage: one JSON-LD block, `WebSite.inLanguage = "de"`, hydration fix live, all 7 care-need tags rendered
- Manual Preview QA (owner): desktop and mobile passed; comparison content reachable on mobile by horizontal table scroll, including the **Ambulanter Pflegedienst** column

## Accepted Dispositions — Do Not Reopen

- **No global Navbar on secondary pages.** Pre-existing architecture: `Navbar` renders only in `HomePageClient.tsx`; `/faq`, `/impressum`, `/datenschutz`, `/agb` behave identically. Not a Phase 2B-0 regression. Shared public navigation is a separate future milestone.
- **Mobile comparison table scrolls horizontally.** All content is accessible. A subtle "Seitlich wischen…" affordance may be considered later.
- **Historical badge-removal anomaly** (`7b080e4`) predates Phase 2B-0 and was not modified.
- **Duplicate `carerecipient.dashboard.unreadMessages` key** is pre-existing and equivalent.
- **Pricing / public-vs-AGB contradiction** remains intentionally unresolved.

## Product and Legal Boundaries — Carry Forward

MyHelper.me is a **Vermittlungsplattform** for Alltagsbegleitung and everyday support. It must **not** be represented as a Pflegedienst or medical provider.

Never claim: MyHelper recognition under §45a · helper recognition · automatic reimbursement · guaranteed Entlastungsbetrag eligibility · vetting · certifications · ratings · geographic availability without evidence · future pricing.

Correct §45b wording begins exactly:

> "Pflegebedürftige in häuslicher Pflege haben nach § 45b SGB XI Anspruch auf einen Entlastungsbetrag."

No euro amount. General statutory information must remain structurally separated from MyHelper.me-specific claims.

## German-First SEO Strategy

Phase 2 remains German/Germany-first. Do **not** create EN/FR authority pages merely for symmetry.

Authority architecture:

| Route | Intent | Status |
|---|---|---|
| `/alltagsbegleitung` | definition / pillar | future |
| `/alltagsbegleitung-oder-pflegedienst` | comparison | **LIVE** |
| `/alltagsbegleitung-finden` | commercial / finding | future |

Before implementing another authority page, review search intent and internal-link architecture to avoid cannibalization.

## Deferred / Future Items

Shared public navigation architecture · mobile comparison swipe affordance · `/alltagsbegleitung` pillar page · `/alltagsbegleitung-finden` commercial page · possible `/so-funktioniert-es`, `/sicherheit-und-vertrauen`, `/leistungen` · raster 1200×630 OG image · broader breadcrumb architecture · editorial responsibility / §18 MStV decision · Article schema decision · `Service.areaServed` reconciliation · pricing contradiction resolution · city/local pages only when substantiated · legitimate off-page citations later · analytics/tracking · cookie/privacy work · Search Console follow-up after natural recrawl.

**Do not resubmit the sitemap or request indexing merely because Phase 2B-0 deployed.**

## Completed Frontend Scope

- Visible brand presentation is aligned to MyHelper.me.
- Rhoda Fideler remains the legal operator identity.
- FAQ page exists at `/faq` and is linked from the footer.
- Unsplash is included in the image credits.
- DE/EN/FR locale-key parity was maintained.
- Homepage target-group cards were added.
- Each card keeps “Monatlich kündbar” in the feature list and shows “Monatlicher Mitgliedsbeitrag” with a prominent “8,99 € / Monat” in a separate highlighted section below it.
- Mobile clipping was fixed for “Persönliche Alltagsbegleitung” and “Faire Konditionen”.
- Footer slogan is “Gemeinsam mehr Lebensqualität.”
- TypeScript, scoped ESLint, production build, locale parity, and Git boundary/whitespace checks passed.

Pushed frontend presentation increment status: **READY FOR PREVIEW QA**.

## Homepage Headline Release Increment

Client decision date: **2026-07-12**.

- Old DE: “Eine große Auswahl an Alltagsbegleiter:innen in Ihrer Nähe”
- Approved/implemented DE: “Finden Sie passende Alltagsbegleiter:innen in Ihrer Nähe”
- Implemented EN: “Find suitable everyday companions near you”
- Implemented FR: “Trouvez des accompagnatrices et accompagnateurs du quotidien adaptés près de chez vous”
- Validation passed: locale JSON; 1,016-key DE/EN/FR parity; TypeScript; production frontend build with all 36 routes generated; `git diff --check`; scoped ESLint with 0 errors and 2 pre-existing warnings.
- Commit: `4353eec5a2bdcc98805954febbfb4e3c8120c55b` — `fix(frontend): refine nearby companion headline`.
- The commit contains only the three locale files, is pushed to `origin/phase1a-client-review-v2`, and has no pending staged changes.
- Exact-SHA Preview: deployment ID `5411075186`; state `success`; URL `https://miteinander-1efdncyw2-info-39415777s-projects.vercel.app`; created `2026-07-12T08:37:09Z`.
- Branch Preview alias: `https://miteinander-git-phase1a-client-r-3efb32-info-39415777s-projects.vercel.app`; do not use it for QA unless freshness is independently verified.

Current status:

- Homepage headline change: **COMMITTED, PUSHED, PREVIEW DEPLOYED**.
- Frontend release candidate: **DEPLOYED TO PREVIEW; BROWSER QA NOT COMPLETE**.
- Preview QA: **BLOCKED BY DASHBOARD ACCESS/API/CORS CONFIGURATION**.

## Registration Diagnosis

Registration is **BLOCKED** and is not Production-ready.

- The exact Preview `NEXT_PUBLIC_API_URL` remains unverified in the authenticated Vercel dashboard.
- Backend CORS does not currently accept the exact commit-specific Vercel Preview origin.
- Deployment Protection and signed-in project access remain unverified. Chrome opened with the selected profile, but the ChatGPT Chrome Extension could not connect after the supported retry; do not use an unauthenticated session to infer these facts.
- Browser testing of both Preview registration flows is pending.
- The live API returns care-need records for the production origin.
- On 2026-07-12 the client approved removing the active categories `Medikamentengabe` (`medication`), `Körperpflege` (`personalHygiene`), and `Mahlzeitenzubereitung` (`mealPreparation`).
- `backend/src/migrations/files/20260710000001_align_care_needs_taxonomy.js` is the reviewed canonical database-governed taxonomy implementation. It deactivates those categories and retains/reframes the remaining everyday-support taxonomy.
- Taxonomy status: **REVIEWED, NOT EXECUTED**. Execution is not approved; Production still exposes the old categories until approved execution and verification.
- Recipient and caregiver registration use the same active database-governed source through `GET /auth/care-needs`.
- No frontend hard-coded fallback service options were added.
- Registration questionnaire wording and validation still require review.
- Never hide an API, environment, or database failure with invented static frontend options.
- On 2026-07-12, EN/FR registration-flow wording was aligned to everyday-support/companion terminology as commit `6a97c2c` (pushed; push range `4353eec..6a97c2c`); German was already aligned and left unchanged. This was wording-only (locale JSON values only, no keys/roles/fields/IDs/API/behavior changed) — it does not resolve any blocker above and does not touch the live API-supplied `medication`/`personalHygiene` options (still active) or `mealPreparation` (not currently returned).

These blockers were intentionally not fixed in the completed frontend presentation increment.

## Backend Milestone State

- Legal-acceptance backend: **AUTHORIZED AS NEXT BACKEND MILESTONE, BUT NOT STARTED**.
- Legal migration execution: **NOT AUTHORIZED YET**.
- SEO: **PLANNED AFTER LEGAL ACCEPTANCE TRACKING** and release stabilization.
- The three `20260711` migration candidates below are unreviewed artifacts, not approved implementation.
- The migration runner discovers pending migration files automatically. Any approved taxonomy execution plan must ensure the protected `20260711` candidates cannot be discovered or auto-executed.

## Taxonomy Migration Execution Plan State

- Status: **PLAN PREPARED; EXECUTION NOT APPROVED**.
- Approved tracked migration: `backend/src/migrations/files/20260710000001_align_care_needs_taxonomy.js`; SHA-256 `5a2895dbe1381fa1b7f685a91faba769ba6d1c7a1ca48d83a94e7a24c800aff5`.
- Broad-runner risk is proven: 28 `.js` filenames are discoverable; the local tracker omits the taxonomy migration and all three protected `20260711` candidates. The normal runner would discover them all and execute every filename absent from target-database `migration_meta`.
- The local JSON tracker is not authoritative. Production pending/executed state must be checked read-only in the explicitly confirmed target database’s `migration_meta`.
- `server.js` auto-runs pending migrations before HTTP startup. Do not start the backend or use `npm run migrate`, `npm run migrate:status`, or `npm run migrate:undo`.
- Migration effects: stable-key updates in `care_needs`; no deletes; IDs preserved; existing recipient/caregiver JSON ID selections preserved. Current `up`, `down`, and runner are not transactional.
- `down` unconditionally reactivates the three prohibited keys and restores seed-era text. Use it only if preflight snapshot proves that exact original state and no intervening edits occurred; otherwise restore from the verified backup/snapshot.
- Proposed safe isolation: reviewed one-off executor outside `migrations/files`, exact absolute import only, checksum pin, explicit DB identity assertion, transaction-injected `bulkUpdate`, same-transaction `migration_meta` insert, no broad-runner import or directory scan.
- Remaining prerequisites: explicitly confirmed DB host/port/name, verified backup, database marker query, six-row preflight snapshot, reference counts, final execution approval.

## Protected Untracked Files

Do not open, edit, stage, execute, commit, move, or delete these files without a separately authorized task:

- `.DS_Store`
- `backend/src/migrations/files/20260711000001_create_legal_documents_table.js`
- `backend/src/migrations/files/20260711000002_create_legal_acceptances_table.js`
- `backend/src/migrations/files/20260711000003_add_legal_indexes.js`

## Prohibited Actions

- Do not deploy or promote to Production.
- Do not run any migration or change database state.
- Do not start the backend while protected untracked migration candidates are present; backend startup discovers and auto-runs pending migrations.
- Do not start the legal-acceptance backend milestone before the frontend release gates are cleared.
- Do not stage, commit, push, amend, rebase, squash, or force-push without explicit authorization.
- Do not change CORS or environment variables without a narrowly approved configuration task.
- Do not change application code merely to refresh governance documentation.
- Do not create another governance workspace at repository root; `docs/project-governance/` is canonical.

## Exact Next Recommended Task

**Phase 2B-0 is closed. Do not begin implementing another authority page immediately.**

The next session should perform a **strategic assessment only**:

1. Assess Phase 2C priority between the two remaining German authority intents — `/alltagsbegleitung` (definition/pillar) and `/alltagsbegleitung-finden` (commercial/finding) — and decide which, if either, should come next.
2. Review search intent and internal-link architecture across the live authority page and the two candidates to avoid cannibalization, including whether the pillar page should exist before the commercial page.
3. Decide whether the deferred shared public navigation/header milestone should precede further authority pages, since each new page compounds the missing-header situation.
4. Only after that assessment and explicit owner approval, plan and implement the next page.

Unchanged and still gated, independent of SEO work:

- Registration remains **BLOCKED** (Preview `NEXT_PUBLIC_API_URL`, CORS, browser QA, questionnaire/validation review).
- Taxonomy migration remains **REVIEWED, NOT EXECUTED**; execution is not approved.
- Legal-acceptance backend remains **AUTHORIZED AS NEXT BACKEND MILESTONE, NOT STARTED**.
- Migration execution and backend startup remain prohibited while the protected `20260711` candidates are present.
