# CHANGELOG.md — Project Changes

> Chronological record of significant changes to the MyHelper project and its `/AI_OS` knowledge base. Newest first. Keep entries short; link to `DECISIONS.md` for rationale. Format loosely follows Keep a Changelog.

---

## [2026-07-12] — Governance snapshot synchronized for repository commit

### Reviewed and corrected

- Reviewed `CURRENT_STATE.md`, `TODO.md`, `CHANGELOG.md`, `SESSION_HANDOFF.md`, and `CLIENT_APPROVAL_ITEMS.md` against frontend baseline `4353eec5a2bdcc98805954febbfb4e3c8120c55b` and Preview deployment `5411075186`.
- Distinguished the pushed frontend application baseline from the local governance-only commit so the repository-state wording remains accurate after this documentation is committed.
- Preserved the release gates: browser QA remains incomplete, taxonomy migration remains unexecuted, Production remains unapproved, and protected `20260711` migration candidates remain unopened and excluded.

### Scope

- Governance documentation only. No application code, backend startup, database connection, migration execution, Vercel configuration change, or deployment.

## [2026-07-12] — Controlled taxonomy migration execution plan prepared; execution stopped

### Confirmed runner and tracker behavior

- `runner.js` discovers every `.js` filename in `backend/src/migrations/files`, sorts lexically, compares against target-database `migration_meta`, and runs every pending file. The checked-in JSON tracker is written after execution but is not consulted for pending-state decisions.
- Filename-only inspection found 28 discoverable migrations. Four are absent from the local tracker: `20260710000001_align_care_needs_taxonomy.js` and all three protected untracked `20260711` legal candidates. The protected candidates would be discovered by the normal runner; their contents were not opened or loaded.
- `server.js` checks and automatically executes all pending migrations before starting HTTP service. Normal backend startup and the broad `migrate/status/undo` commands are prohibited for the taxonomy release.

### Migration review

- Reviewed tracked migration commit `5292203` and SHA-256 `5a2895dbe1381fa1b7f685a91faba769ba6d1c7a1ca48d83a94e7a24c800aff5`.
- `up` deactivates `medication`, `personalHygiene`, and `mealPreparation`; reframes `mobility`; removes bathing wording from `dailyLiving`; and corrects French casing for `dailyLiving`/`housekeeping`. It targets stable keys and deletes no rows.
- Existing recipient `care_needs` and caregiver `skills` are JSON arrays of `care_needs.id`; because the migration preserves rows and IDs, existing selections remain logically referentially intact.
- Current migration and runner have no transaction boundary. `down` is not state-preserving: it unconditionally reactivates all three categories and restores seed-era text, so rollback is safe only if preflight proves that exact baseline and no intervening edits occur.

### Proposed isolation and stop state

- Proposed an external, reviewed exact-target executor that never imports the broad runner or scans the directory; it must verify the exact path/checksum and target host/port/database, inject one transaction into the migration’s `bulkUpdate` calls, and insert only the exact `migration_meta` marker in that transaction.
- No database connection was made. Target database identity, database `migration_meta`, live taxonomy rows, and backup evidence remain unconfirmed.
- Migration execution remains **NOT APPROVED** and was not attempted. No backend startup, protected-file access, CORS/environment change, Production deployment, legal-acceptance work, or SEO work occurred.

## [2026-07-12] — Homepage headline committed, pushed, and deployed to Preview

### Commit and push

- Committed only `frontend/src/locales/de/common.json`, `frontend/src/locales/en/common.json`, and `frontend/src/locales/fr/common.json` as `4353eec5a2bdcc98805954febbfb4e3c8120c55b` — `fix(frontend): refine nearby companion headline`.
- Pushed the commit to `origin/phase1a-client-review-v2`.
- Pre-commit validation passed: locale JSON; 1,016-key DE/EN/FR parity; TypeScript; production frontend build with all 36 routes generated; `git diff --check`.

### Preview deployment evidence

- GitHub commit status reports Vercel success with “Deployment has completed”.
- GitHub deployment ID: `5411075186`; environment: `Preview`; state: `success`; commit: `4353eec5a2bdcc98805954febbfb4e3c8120c55b`; created: `2026-07-12T08:37:09Z`.
- Exact generated Preview URL: `https://miteinander-1efdncyw2-info-39415777s-projects.vercel.app`.
- Branch Preview alias reported by the Vercel check: `https://miteinander-git-phase1a-client-r-3efb32-info-39415777s-projects.vercel.app`. Application QA must use the exact generated deployment URL unless alias freshness is independently confirmed.

### Verification limitation and release state

- Chrome opened with the selected signed-in profile, but the ChatGPT Chrome Extension could not establish a control connection after the supported retry. Authenticated Vercel dashboard inspection therefore did not confirm Deployment Protection, signed-in project access, or the configured Preview `NEXT_PUBLIC_API_URL`; these remain pending and must not be inferred from unauthenticated access.
- Browser QA was not performed or claimed complete.
- Taxonomy migration remains **REVIEWED, NOT EXECUTED**; registration remains **BLOCKED** until taxonomy/API/CORS/browser gates pass; Production remains **NOT APPROVED**.
- No migration, backend startup, CORS/environment change, Production promotion, legal-acceptance implementation, or SEO work occurred.

## [2026-07-12] — Homepage headline implemented locally; registration taxonomy approved and reviewed

### Client decisions

- Approved replacing “Eine große Auswahl an Alltagsbegleiter:innen in Ihrer Nähe” with “Finden Sie passende Alltagsbegleiter:innen in Ihrer Nähe”.
- Approved locale equivalents: EN “Find suitable everyday companions near you”; FR “Trouvez des accompagnatrices et accompagnateurs du quotidien adaptés près de chez vous”.
- Approved removing the active registration categories `Medikamentengabe` (`medication`), `Körperpflege` (`personalHygiene`), and `Mahlzeitenzubereitung` (`mealPreparation`).
- Confirmed `backend/src/migrations/files/20260710000001_align_care_needs_taxonomy.js` as the canonical database-governed taxonomy implementation. Migration implementation is reviewed; execution is separately controlled and is not approved.

### Implemented and validated locally

- Changed only `frontend/src/locales/de/common.json`, `frontend/src/locales/en/common.json`, and `frontend/src/locales/fr/common.json` for the approved headline.
- Validation passed: locale JSON; 1,016-key DE/EN/FR parity; TypeScript; production frontend build with all 36 routes generated; `git diff --check`; scoped ESLint with 0 errors and 2 pre-existing warnings.
- Recipient and caregiver registration both consume the active database taxonomy through `GET /auth/care-needs`; no hard-coded frontend fallback service options were added.

### Release state and blockers

- Homepage headline change: **IMPLEMENTED LOCALLY, VALIDATED, NOT COMMITTED**.
- Frontend release candidate: **READY FOR COMMIT/PUSH APPROVAL**.
- Taxonomy migration: **REVIEWED, NOT EXECUTED**. Production registration continues to expose the old taxonomy until approved execution and verification.
- Registration: **BLOCKED**. Preview QA is **BLOCKED BY ACCESS/API/CORS CONFIGURATION**: the exact Preview `NEXT_PUBLIC_API_URL` is unverified, backend CORS does not accept the exact commit-specific Preview origin, and the correct Vercel deployment is protected by Vercel SSO.
- Both registration roles still require browser-level Preview QA. Production remains **NOT APPROVED**.
- Legal acceptance tracking remains the **NEXT AUTHORIZED BACKEND MILESTONE, NOT STARTED**. SEO remains planned after legal acceptance tracking and release stabilization.

### Controls preserved

- Nothing was staged, committed, pushed, deployed, or migrated during this documentation update.
- Any taxonomy execution plan must isolate `20260710000001_align_care_needs_taxonomy.js` and prevent the protected untracked `20260711` legal candidates from being auto-executed.

## [2026-07-12] — Governance synchronized with pushed frontend release state

### Verified

- Canonical repository: `/Users/stan/Desktop/miteinander`; branch: `phase1a-client-review-v2`.
- Local and origin HEAD: `4be46a38af68d41bd25eb5c249500593f39d4948`.
- Pushed commits: `8180199` (FAQ and MyHelper.me branding), `a414997` (membership/mobile refinements), and `4be46a3` (separate pricing and footer tagline).

### Recorded

- Frontend presentation is **READY FOR PREVIEW QA**, not approved for Production.
- Completed scope includes visible MyHelper.me branding, preserved Rhoda Fideler legal identity, `/faq` and footer link, Unsplash credit, DE/EN/FR parity, target-group cards, separate highlighted “8,99 € / Monat” pricing, “Monatlich kündbar” feature bullets, mobile clipping fixes, and “Gemeinsam mehr Lebensqualität.”
- TypeScript, scoped ESLint, production build, locale parity, and Git boundary/whitespace checks passed before the commits were created.
- Registration remains **BLOCKED** pending Preview `NEXT_PUBLIC_API_URL`, Preview CORS coverage, taxonomy review/execution approval, browser testing, and questionnaire/validation review.
- The live API responds for the production origin, but the live taxonomy still exposes inappropriate active categories including `Medikamentengabe` and `Körperpflege`; Production execution of `20260710000001_align_care_needs_taxonomy.js` is not confirmed.
- Legal-acceptance backend work is authorized as the next backend milestone but has not started. The three untracked `20260711` legal migration files remain unreviewed candidate artifacts, and migration execution is not authorized.

### Documentation scope

- Removed five accidental untracked root-level governance duplicates and consolidated current state in `docs/project-governance/`.
- Added `state/SESSION_HANDOFF.md` as the canonical operational handoff.
- Documentation only: no application code, backend code, environment, database, deployment, staging, commit, or push action.

## [2026-07-09] — Phase 2A: footer social links wired (branch patch, NOT merged/deployed)

### Implemented (on branch `phase1a-client-review-v2`, as `AI_OS/phase2a-social-links.patch`)
- **New** `frontend/src/config/social.ts` — single source of truth for social URLs (Instagram + Facebook confirmed; LinkedIn one commented line, pending; **no Twitter**). Also exports `socialSameAs` for future `Organization` JSON-LD (SEO phase) — no duplication.
- **`frontend/src/components/Footer.tsx`** — consumes the config; **removed Twitter/X icon** (no account) and its unused import; wired real Instagram/Facebook hrefs with `target="_blank"` + `rel="noopener noreferrer"`. Design/classes/animation unchanged (ADR-005). Footer now shows 2 icons (IG, FB) until LinkedIn is added (→ 3, one-line change).
- QA: `git apply --check` clean on the current branch · `social.ts` `tsc --noEmit --strict` clean · patch contains **no client PII**.

### Not done (by design)
- **Not committed, not merged, not deployed.** Repo/Vercel push access is required to build the preview. LinkedIn URL still pending.

### Scope
- Implementation only — one config + one component; no backend/auth/API/schema/legal-page/SEO/translation change. Governance untouched (v1.1).

## [2026-07-09] — ADR-009 Single-Jurisdiction Language Strategy → AI_OS v1.1 (docs only, NO code)

### Added
- `DECISIONS.md` **ADR-009 — Single-Jurisdiction Language Strategy (Germany-only):** MyHelper operates only in Germany under German law; German/English/French are **interface languages of one German-jurisdiction platform, not country editions**; German is the legal source, EN/FR are translations/localizations of the German framework for users in Germany; cross-language legal pages are **not** separate legal regimes; expansion outside Germany requires a **new ADR + legal review first**. Explicitly reconciled with ADR-007 (order/quality) — no conflict (orthogonal: ADR-007 = language rollout, ADR-009 = jurisdiction).

### Changed (governance change under ADR-008 trigger: legal + business-model)
- `AI_OS_VERSION.md` → **v1.1** (additive, non-breaking; version log added).
- Jurisdiction rule added to `BUSINESS_MODEL.md` (§1a), `LEGAL_AUDIT.md` (§0c), `CONTENT_GUIDE.md` (§7c), `FAQ_STRATEGY.md` (§2), `CURRENT_STATE.md` (language status), `TODO.md` (language roadmap). ADR range updated to ADR-001…009 in `PROJECT_PRINCIPLES.md` hierarchy.

### Scope
- Documentation only — **no frontend/backend/legal-page drafting/SEO/translation/code, no commit, no deployment.** Governance stays frozen except this ADR-008-triggered addition.

## [2026-07-09] — Freeze completion: mode = IMPLEMENTATION (docs only, NO code)

### Changed
- `AI_OS_VERSION.md` — added a concise **Mission** section (legally compliant · business-accurate · secure · maintainable · documented; minimize rework).
- `CURRENT_STATE.md` — added a top **§0 PROJECT MODE** banner: Mode = IMPLEMENTATION · Governance = FROZEN (AI_OS v1.0) · Phase 2 — Legal Foundation · governance changes only via ADR-008 Change Control.
- `PROJECT_PRINCIPLES.md` §13 — trimmed to a pointer (removed the duplicated placeholder-vocabulary list and enumerated exceptions; detail stays in `INFORMATION_CLASSIFICATION.md`).

### Confirmed (no work generated)
- Versioning complete; governance stable; no further governance work recommended unless ADR-008-triggered. Project formally transitions planning → execution.

### Scope
- Documentation only — no frontend/backend/legal-page/SEO/translation/code changes, no commit, no deployment.

## [2026-07-09] — AI_OS v1.0 frozen: Stable Governance Baseline (docs only, NO code)

### Added
- `AI_OS/AI_OS_VERSION.md` — declares **AI_OS v1.0 (Stable Governance Baseline)**: version metadata, compatibility, breaking-change policy, future versioning (v1.1/v1.2/v2.0), **Governance Change Control** (5 triggers), document **classification** (Stable/Living/Operational/Historical), and **archival recommendations** (planning only).

### Changed
- `PROJECT_PRINCIPLES.md` — one added sentence: *"Governance is intentionally stable. Expand it only when a documented business, legal, security, or architectural need exists."*

### Review findings (no rewrite performed)
- One genuine obsolete duplicate: **root `/PROJECT_MASTER.md`** (pre-/AI_OS "Website Optimization" charter, says "12 principles") superseded by `AI_OS/PROJECT_MASTER.md` → flagged as #1 archival candidate (not removed).
- Remaining overlaps (audit vs policy vs matrix) are acceptable under the pointer philosophy; no rule duplication to remove.

### Scope
- Documentation/governance only — **no frontend/backend/legal-page/SEO/translation/code changes, no commit, no deployment, nothing archived or deleted.** From here, governance is change-controlled and implementation becomes the primary focus.

## [2026-07-09] — ADR-008: Information Governance model + Phase 2B roadmap (docs only, NO code)

### Added
- `AI_OS/INFORMATION_CLASSIFICATION.md` — reusable, project-agnostic policy: four levels **PUBLIC · INTERNAL · CONFIDENTIAL · SECRET**, generalized core rules, exceptions (legal pages/contracts/invoices/accounting keep real identity), placeholder vocabulary, classification procedure, **anti-reintroduction rule** for AI systems, and the **Phase 2B — Repository Information Classification Audit** roadmap (planning only).
- `DECISIONS.md` **ADR-008** — adopts the classification model; keeps `CONFIDENTIALITY_AUDIT.md` as the Phase 2A applied record (chose not to rename it).

### Changed
- `PROJECT_PRINCIPLES.md` §13 generalized from "Confidentiality of Client Identity" → **"Information Governance"** (points to `INFORMATION_CLASSIFICATION.md`, no duplication). Governance hierarchy L3 → ADR-001…008; L4 domain policies now include `INFORMATION_CLASSIFICATION.md`.
- Placeholder terminology refined **"Business Owner" → "Client Representative"** (owner ≠ legal representative) across `LEGAL_AUDIT.md`, `LEGAL_GAP_ANALYSIS.md`, `LEGAL_CLIENT_QUESTIONS.md`, `CURRENT_STATE.md`, `CLIENT_REVIEW/CLIENT_REVIEW_SUMMARY.md`, `CONFIDENTIALITY_AUDIT.md`.
- `CURRENT_STATE.md`, `TODO.md` updated with the governance/Phase 2B references.

### Scope
- Documentation/governance only — **no frontend/backend/legal-page/code changes, no commit, no deployment.** History preserved; no ADR rewritten.

## [2026-07-09] — Phase 2A confidentiality cleanup (docs only, NO code)

### Added
- `PROJECT_PRINCIPLES.md` **Principle 13 — Confidentiality of Client Identity** (neutral placeholders in planning docs; real identity only on the legally-required legal pages).
- `AI_OS/CONFIDENTIALITY_AUDIT.md` — full inventory of occurrences found, replacements made, items intentionally left unchanged, and reasoning.

### Changed (redaction — AI_OS planning docs only)
- Replaced client-identifying data (owner name, business/trade name, street address, VAT ID, phone, private email) with neutral placeholders (**Legal Entity (Pending) · Client Representative · Business Address (Pending) · VAT ID (Pending) · Contact (Pending)**) across `LEGAL_AUDIT.md`, `LEGAL_GAP_ANALYSIS.md`, `LEGAL_CLIENT_QUESTIONS.md`, `CURRENT_STATE.md`, `CLIENT_REVIEW/CLIENT_REVIEW_SUMMARY.md`, and this file. Re-grep confirms **zero PII tokens remain** in `/AI_OS`.

### Intentionally unchanged
- **Legal pages** (Impressum, Datenschutz, AGB) — legally require the real identity (§ 5 DDG etc.); not touched (source code, not present in this workspace).
- Developer credit "Atika Solutions" — third-party agency name, not client PII.

### Scope
- Documentation cleanup only — **no frontend/backend/legal-page/code changes, no commit, no deployment.**

## [Unreleased]

### Planned
- Reposition site copy + metadata from "Pflege" to Alltagsbegleitung.
- Legal pages review (Impressum, Datenschutz, AGB, Widerruf).
- Technical SEO foundations (robots, sitemap, per-page metadata, canonicals).
- Full repository deep-analysis pass to clear *Pending Repository Analysis* items.

## [2026-07-09] — Phase 2 legal-foundation audit + FAQ strategy (docs only, NO code)

### Added
- `AI_OS/LEGAL_GAP_ANALYSIS.md` — per-page gap analysis (Impressum / Datenschutz / AGB) vs. confirmed model + verified app + DSGVO/DDG/TDDDG/BGB. 9 findings (G-01…G-09); 3 release-blocking 🔴.
- `AI_OS/LEGAL_CLIENT_QUESTIONS.md` — 32-question checklist the client/counsel must answer before any legal text is written.
- `AI_OS/FAQ_STRATEGY.md` — German FAQ strategy: 11 sections, proposed **questions only** (no answers), each tagged 🟢/🟡/🔴 for answer-readiness. Legal-safety constrained.

### Findings (verified from live preview legal pages)
- **Datenschutzerklärung is a stub** (cookies + non-existent "Kontaktformular" only) — omits accounts, Stripe, Socket.IO messaging, email, hosting, profile images, support, reviews, rights, legal bases, retention. 🔴 (G-01)
- **AGB still uses "Pflege/Pflegekräfte/Pflegeleistungen"** (§3/§5) — contradicts Alltagsbegleitung reposition (extends CA-02); and **lacks** price/payment/Widerruf/cancellation/final provisions for the paid 8,99 € membership. 🔴 (G-02/G-03/G-09)
- **Impressum** near-complete: entity **the Client Representative / Legal Entity (Pending) / Business Address (Pending)**, **USt-IdNr. VAT ID (Pending)**; cites outdated **§ 5 TMG → § 5 DDG**; legal form/register to confirm. 🟡 (G-05/G-06)
- Contact is **mailto/phone only** (no contact form); homepage **email-capture form undisclosed** in privacy policy. (G-04)

### Registers updated
- `CLIENT_APPROVAL_ITEMS.md` (CA-21…CA-24), `RISK_REGISTER.md` (R-20…R-22), `LEGAL_AUDIT.md`, `CURRENT_STATE.md`, `TODO.md`.

### Scope
- Audit + planning only — **no legal page rewritten, no production code changed**, German only (ADR-007). Awaiting client facts + counsel before any legal implementation.

## [2026-07-09] — Governance finalized: PROJECT_PRINCIPLES.md created (docs only)

### Added
- `AI_OS/PROJECT_PRINCIPLES.md` — highest-level governance: 12 principles (Business Accuracy, Legal First, Security by Default, Privacy by Design, Design Preservation, Documentation First, Language Strategy, Implementation Strategy, Client Approval, AI Collaboration, Quality over Speed, Release Policy) + governance hierarchy. Each principle points to its detail doc (no duplication).
- `PROJECT_MASTER.md` references it as the supreme document.

### Scope
- Documentation only — no code/translation changes; no commit.

## [2026-07-09] — ADR-007 updated: French Frozen→Deferred + Localization policy (docs only)

### Changed
- **ADR-007** now: German = ACTIVE DEVELOPMENT, English = NEXT PHASE, **French = DEFERRED** (was Frozen). Added **Localization policy** (localization > literal translation; literal prohibited), **Expected Difference policy**, **business rationale**, and European-expansion roadmap.
- Updated `PROJECT_MASTER.md` §2a, `CURRENT_STATE.md`, `TODO.md` (new Phase 1/2/3 roadmap), `CONTENT_GUIDE.md` (§7c localization policy); reconciled `CONTENT_AUDIT.md` (Frozen→Deferred).

### Scope
- Documentation only — no code/translation/frontend/backend changes; no commit.

## [2026-07-09] — ADR-007 Language Rollout Strategy adopted (documentation only)

### Added / Changed
- **ADR-007** in `DECISIONS.md`: German = ACTIVE, English = PLANNED (Phase 2, localized not literal), French = FROZEN (Phase 3). Order de→en→fr; cross-language differences = **EXPECTED DIFFERENCE** (not bugs).
- Updated `PROJECT_MASTER.md` (§2a), `CURRENT_STATE.md`, `TODO.md` (language roadmap). Reconciled `CONTENT_AUDIT.md` Phase 4 and `RISK_REGISTER.md` R-12 (en/fr work deferred, divergence expected).

### Scope
- Documentation only — no frontend/backend/translation changes; no commit.

## [2026-07-09] — Client wording refinements (de homepage; working copy, NOT committed)

### Changed (`locales/de/common.json` only)
- `app.feature3`: "Aktivitäten im Blick" → **"Alltag gemeinsam organisieren"** (clearer/friendlier).
- `difference.tagHygiene`: "Unterstützung im Haushalt" → **"Leichte Haushaltshilfe"** (clear light household assistance).
- QA: 3× JSON valid; i18n parity 911 keys (de=en=fr); `tsc` pass; 0 backend files changed. Client preview + patch updated.

## [2026-07-09] — CA-19 applied: meal-prep homepage wording removed (working copy, NOT committed)

### Changed (frontend only; backend/DB untouched)
- Removed `difference.tagMealPrep` from `locales/{de,en,fr}/common.json` and its entry in `components/DifferenceSection.tsx` (+ dropped now-unused `ChefHat` import). No food replacement (BR-01). Homepage difference tags 8 → 7.
- QA: 3× JSON valid; i18n parity 911 keys (de=en=fr); `tsc --noEmit` pass; no `tagMealPrep` refs; no meal wording on homepage; **0 backend files changed**.
- Updated client preview (`CLIENT_REVIEW/homepage-textvorschau.html`), patch (`phase1a-homepage.patch`, now 6 files), and CA-19 → done.
- **Remaining for CA-20 (not approved):** `mealPreparation` care-need labels (register) + backend seed record.

## [2026-07-09] — BR-01: meal preparation excluded from scope (search + docs; removal pending)

### Added / Changed
- New business rule **BR-01** ("Meal preparation is outside the confirmed MyHelper service scope for insurance and liability reasons") in `BUSINESS_MODEL.md`; excluded terms in `CONTENT_GUIDE.md`; note in `LEGAL_AUDIT.md` §0b; risk **R-19**; approval items **CA-19/CA-20**.

### Reported (full repo search, no code changed yet)
- 9 i18n strings (`difference.tagMealPrep`; `mealPreparation` care-need ×2 blocks × de/en/fr) + `DifferenceSection.tsx:45` + backend seed care-need `20260203000007_seed_default_care_needs.js` (lines 83–89).

### Pending
- CA-19 wording removal (content, ready on approval); CA-20 care-need + seed removal (DB — recommend & wait + data migration). No food replacement per instruction.

## [2026-07-09] — Phase 1A local QA + client review package

### Added
- `AI_OS/CLIENT_REVIEW/homepage-textvorschau.html` — client-ready wording preview (real palette/fonts; before→after; 3 confirm phrases flagged).
- `AI_OS/LOCAL_QA_REPORT.md` — tsc ✅, my-files ESLint ✅, JSON ✅, i18n parity ✅; build/live render not runnable in sandbox (no Google-Fonts network — environmental); pre-existing vs Phase 1A issues separated (88 baseline lint problems in other files).
- `AI_OS/CLIENT_VISUAL_REVIEW.md` — visual/responsive/text/layout observations + recommendations.

### Note
- Real pixel screenshots not possible in sandbox (Google Fonts blocked → app can't render; no browser attached). Provided honest wording preview instead. No commit/push/merge/deploy.

## [2026-07-09] — Phase 1A committed to review branch; preview push BLOCKED on repo access

### Done
- Branch `phase1-homepage-review` created; commit **9dbc381** `feat(content): reposition homepage from Pflege to Alltagsbegleitung` (3 files). Patch: `AI_OS/0001-feat-content-reposition-homepage-from-Pflege-to-Allt.patch`.
- Added `AI_OS/CLIENT_REVIEW_CHECKLIST.md` + German client message (in final report).
- QA: `tsc --noEmit` pass; my 3 files ESLint-clean; JSON valid; 912 i18n keys (de=en=fr) intact.

### Blocked
- **Cannot push / trigger Vercel preview:** no write credentials to `github.com/123Myhelper/miteinander` (read-only clone). Vercel preview is push-triggered → needs the branch pushed by the repo owner or a token/collaborator grant. Unblock steps in final report.
- Full `next build` not runnable in sandbox (no network to Google Fonts at build time — environmental; Vercel builds fine).

### Waiting
- Repo push access → Vercel preview URL → client review → approval. **No merge, no production.**

## [2026-07-09] — Phase 1A approved-with-conditions; visual/scope review done (still NOT committed)

### Client decision
- ✅ Approved: remove Pflege positioning, drop "#1", "100% Datenschutz"→"Datenschutz nach DSGVO", Pflegekraft→Alltagsbegleiter:innen, "perfekte"→"passende", keep design, no global canonical.
- ⏳ **Client-confirmation required** before commit (CA-01a): service phrases *Begleitung zu Terminen*, *Unterstützung im Haushalt*, *Aktivitäten im Blick*.
- ⏳ Final visual review requested before commit.

### Review performed
- Overflow analysis: no hard clipping (no truncate/nowrap/fixed-width on changed strings); minor wrap-to-extra-line to eyeball on mobile (hero badge, feature chips, AppSection search line + name label, difference card2Title). Icon–label mismatch noted on 2 rebranded tags (Pill/Bath icons).
- Scope confirmed: 3 files only; legal pages + legal locale (terms/imprint/privacy) untouched; only homepage sections changed.

## [2026-07-09] — Phase 1A homepage repositioning IMPLEMENTED (working copy, NOT committed)

### Changed (3 files, de homepage only; awaiting approval + commit)
- `frontend/src/locales/de/common.json` — 20 value edits across hero/concept/difference/app/getStarted/footer (Pflege→Alltagsbegleitung; removed "#1", "100%", "besten", competence/qualification claims; perfekt→passend). Keys unchanged (912 before & after).
- `frontend/src/components/AppSection.tsx` — 3 hardcoded demo strings.
- `frontend/src/app/layout.tsx` — homepage metadata (description, keywords, OG/Twitter description) + added `metadataBase`. Global canonical intentionally NOT added (would mis-canonicalize legal pages).
- Added `CONTENT_REPLACEMENT_MATRIX.md` + `phase1a-homepage.patch`.

### QC passed
- Valid JSON; i18n key parity (de=en=fr, 912 keys, none added/removed); zero "Pflege" on homepage; no keys broken.

### Flagged for client sign-off (in patch, reversible)
- 🔴 competence/qualification/guarantee removals (CA-04/05/07); 🟠 service-tag rewrites (CA-01): Medikamentengabe→Begleitung zu Terminen, Körperpflege→Unterstützung im Haushalt, Pflegedokumentation→Aktivitäten im Blick.

### Not done (scope)
- en/fr homepage; canonical (Phase 2); full `next build` (no deps in sandbox — run in CI). **Not committed** per instruction.

## [2026-07-09] — Legal Safety Policy hardened (HIGH LEGAL RISK + Release Rule + Ethics)

### Changed
- `LEGAL_AUDIT.md` §0 expanded: fuller STOP triggers (nursing/medical/healthcare/insurance/entitlements/qualifications), 5-step process, **HIGH LEGAL RISK** tier, **Release Rule** (no ship with unresolved HIGH LEGAL RISK), **Contractor Protection**, **Ethical Communication** (no fear-based marketing / no pressuring vulnerable users), "do not interpret German law — use counsel".
- `CLIENT_APPROVAL_ITEMS.md`: added 🔴 HIGH LEGAL RISK tier + release gate; escalated **CA-01, CA-06, CA-07** to HIGH LEGAL RISK; added CA-18 ("perfekte" soft promise).
- `CONTENT_GUIDE.md` §7b Ethical communication; `AI_CONTEXT.md` legal reflex expanded; `RISK_REGISTER.md` legal-tier note (R-17, R-18 release-blocking).

### Verified
- Copy scan: **no fear/scarcity/urgency/pressure patterns** present (ethical baseline clean).

## [2026-07-09] — Legal Safety Policy adopted; approval queue opened

### Added
- `LEGAL_AUDIT.md` §0 — Project Legal Safety Policy (legal > SEO/marketing/content) + §0a marketing-claims audit.
- `AI_OS/CLIENT_APPROVAL_ITEMS.md` — approval queue (CA-01…CA-17), classifying LEGAL REVIEW REQUIRED / CLIENT DECISION / TECH APPROVAL. Linked from `PROJECT_MASTER`, `AI_CONTEXT`.
- `RISK_REGISTER.md` R-18 — marketing claims ("#1", "100% Datenschutz", "verifiziert/qualifiziert") trigger the policy.

### Flagged (LEGAL REVIEW REQUIRED, not changed)
- "#1 Plattform" superlative (UWG); "100% Datenschutz" absolute guarantee; verification/qualification/certification wording on user-entered data; nursing-act service tags; testimonial authenticity.

## [2026-07-09] — Phase 1 content/positioning audit (no code changed)

### Added
- `AI_OS/CONTENT_AUDIT.md` — full "Pflege"→Alltagsbegleitung inventory (116 de / 47 en / 111 fr hits + metadata + `AppSection.tsx` + email templates), A/B/C/D classification, concrete replacements, terminology glossary, 6-phase plan.
- `RISK_REGISTER.md` R-17 — service catalogue may overclaim regulated Pflege (Körperpflege/Palliativpflege/Medikamentengabe).

### Verified
- Copy is i18n JSON → repositioning is **content-only** (keys/data-model unchanged); no architecture/design/schema impact.

### Status
- **Awaiting client approval** of audit + terminology glossary + phasing. Nothing implemented.

## [2026-07-09] — Repository cloned & analyzed; constitution ratified

### Added
- `AI_OS/CLIENT_REQUIREMENTS.md` — authoritative client contract/constitution (scope, authority limits, success criteria).
- `AI_OS/RISK_REGISTER.md` — 15 logged risks (R-01…R-15) with severity, scope flag, recommendation, status; plus verified positive assurances.
- Document set is now **14** files; index updated in `PROJECT_MASTER`.

### Verified (repo cloned 2026-07-09)
- Trilingual (de/en/fr) Next.js app; four role areas (dashboard/caregiver/admin/support); legal pages `/impressum`, `/agb`, `/datenschutz` **exist**.
- Backend: 12 Sequelize models, RBAC (`roleGuard`) + JWT auth middleware, restricted CORS, **Stripe webhook signature verified**.
- Confirmed risks: **JWT in `localStorage` + 7-day expiry** (R-03), **no rate limiting** (R-04), insecure default secrets pattern (R-07), base64 profile images in DB (R-08), legal pages lack unique metadata (R-02).

### Notes
- Authority-limited fixes (auth, schema, API, config) are **documented and awaiting approval**, not auto-applied, per `CLIENT_REQUIREMENTS.md`.

## [2026-07-09] — Design-preservation policy recorded

### Added
- `DECISIONS.md` ADR-005: freeze the visual identity. Allowed changes limited to content, legal, SEO, accessibility, performance, bug fixes. Typography changes only if Google Fonts are externally loaded (they are self-hosted, so none needed). Linked into `AI_CONTEXT` and `CONTENT_GUIDE`.

## [2026-07-09] — Security audit added

### Added
- Created `AI_OS/SECURITY_AUDIT.md` (highest-priority living doc): personal-data inventory, attack-surface map, findings F-01…F-25, secrets policy, and the mandatory finding-report protocol. Linked from `PROJECT_MASTER`, `AI_CONTEXT`, `TODO`, `LEGAL_AUDIT`.

### Verified
- **No secrets committed at repo HEAD** — no `.env`, no Sequelize `config.json`; both `.gitignore` files exclude `.env*`; `.env.example` uses placeholders only.

### Flagged
- Git *history* not yet scanned (F-06); 7-day JWT (F-07); missing rate limiting (F-15); CORS/RBAC/webhook/Socket.IO auth pending source review.

## [2026-07-09] — /AI_OS initialized

### Added
- Created `/AI_OS` knowledge base with 11 documents: `PROJECT_MASTER`, `AI_CONTEXT`, `CURRENT_STATE`, `DECISIONS`, `BUSINESS_MODEL`, `CONTENT_GUIDE`, `SEO_STRATEGY`, `LEGAL_AUDIT`, `TECHNICAL_AUDIT`, `TODO`, `CHANGELOG`.
- Recorded decisions ADR-000 … ADR-004 in `DECISIONS.md`.

### Verified (from live site + repo manifests, 2026-07-09)
- Stack: Next.js 16 / React 19 / TS / Tailwind v4 frontend; Express 4 / MySQL (Sequelize) / Stripe / Socket.IO backend.
- Production on Strato; preview at `miteinander.vercel.app`.
- Fonts self-hosted via `next/font/google` (no runtime Google Fonts request) — compliant.
- Cookie-consent component present in root layout.

### Flagged
- Site metadata/copy positions MyHelper as "Pflege" — conflicts with Alltagsbegleitung positioning (content + SEO + legal). See ADR-002.
- `robots.txt` empty; no confirmed sitemap; legal pages appear client-rendered with generic metadata.
- Payments (Stripe) + auth + messaging → GDPR obligations to verify.

### Notes
- Many technical details remain *Pending Repository Analysis* until a full clone/inspection; tracked in `TODO.md` (P1).

---

### Entry template
```
## [YYYY-MM-DD] — <summary>
### Added / Changed / Fixed / Removed / Flagged
- <what changed> (link DECISIONS ADR-xxx if applicable)
```
