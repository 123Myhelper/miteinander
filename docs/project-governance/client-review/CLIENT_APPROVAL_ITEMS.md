# CLIENT_APPROVAL_ITEMS.md — Approval Queue

> Central register of everything that must **wait for explicit client approval** before implementation. Governed by the **Project Legal Safety Policy** (`LEGAL_AUDIT.md` §0): *legal compliance outranks SEO, marketing, and content.* Nothing in this list is implemented until the client signs off.

**Last updated:** 2026-07-12

**Classification:**
- **🔴 HIGH LEGAL RISK** — acute exposure (implies regulated nursing/medical/qualification, etc.). **Release-blocking:** no related page/feature/content ships until resolved or explicitly approved (`LEGAL_AUDIT.md` §0 Release Rule).
- **LEGAL REVIEW REQUIRED** — could misrepresent the business or create liability/false expectations; needs client (and where noted, counsel) sign-off.
- **CLIENT DECISION** — business/product choice, no acute legal risk.
- **TECH APPROVAL** — authority-limited technical change (auth/schema/API/config) per `CLIENT_REQUIREMENTS.md` §4.

**Status:** Open · Approved · Rejected · Deferred.

> **Release gate:** items marked 🔴 HIGH LEGAL RISK below (CA-01, CA-06, CA-07) block release of any page/feature containing them until resolved or client-approved.

---

## Current release decision snapshot — 2026-07-12

- Homepage headline change: **COMMITTED, PUSHED, PREVIEW DEPLOYED** as `4353eec5a2bdcc98805954febbfb4e3c8120c55b`.
- Frontend release candidate: **DEPLOYED TO PREVIEW; BROWSER QA NOT COMPLETE**. Exact generated URL: `https://miteinander-1efdncyw2-info-39415777s-projects.vercel.app`.
- Taxonomy migration: **REVIEWED, NOT EXECUTED**.
- Preview QA: **BLOCKED BY DASHBOARD ACCESS/API/CORS CONFIGURATION**. Deployment Protection, signed-in project access, and Preview `NEXT_PUBLIC_API_URL` remain unverified because authenticated Chrome control could not connect; prior SSO status was not reconfirmed.
- Production deployment: **NOT APPROVED**.
- Registration: **BLOCKED** pending Preview API/CORS configuration, taxonomy verification, questionnaire review, and end-to-end testing.
- Legal-acceptance backend: **AUTHORIZED AS NEXT BACKEND MILESTONE, BUT NOT STARTED**.
- SEO: **PLANNED AFTER LEGAL ACCEPTANCE TRACKING** and release stabilization.
- Taxonomy migration execution and legal migration execution are **NOT AUTHORIZED**.
- The files `backend/src/migrations/files/20260711000001–3_*` are unreviewed candidate artifacts, not approved implementation evidence.

## Required release approvals — separate gates

1. **Approved and completed 2026-07-12:** staged, committed, and pushed only the three locale changes as `4353eec`.
2. **Approved and completed 2026-07-12:** Git-integrated Preview deployment ID `5411075186` completed successfully.
3. **Plan prepared; execution approval still blocked:** exact-module/checksum/transaction isolation is proposed for only `backend/src/migrations/files/20260710000001_align_care_needs_taxonomy.js`. Approval requires explicit target DB host/port/name, verified backup, database `migration_meta`, and live preflight rows. Normal backend startup/broad runner is prohibited because it discovers all protected candidates.
4. **Awaiting approval:** narrowly scoped Preview API/CORS configuration change for the exact commit-specific Preview origin.
5. **Awaiting approval:** begin browser QA for both registration roles after Vercel SSO access and Preview connectivity are available.

## Legal review required

| ID | Item | Where | Risk | Recommended safe wording / action | Status |
|---|---|---|---|---|---|
| CA-01 🔴 | **Service catalogue lists regulated nursing acts** — Körperpflege, Palliativpflege, Medikamentengabe, Pflegedokumentation | `difference` tags; `app.feature3`; `seed_default_care_needs` migration | **HIGH LEGAL RISK** — implies licensed medical/nursing care MyHelper (non-Pflegedienst) may not provide | Remove/replace with everyday-support activities; confirm lawful catalogue with counsel. Seed = DB change (also TECH). (R-17) | Open |
| CA-01b 🔴 | **Registration taxonomy removal** — deactivate `Medikamentengabe` (`medication`), `Körperpflege` (`personalHygiene`), and `Mahlzeitenzubereitung` (`mealPreparation`) | `20260710000001_align_care_needs_taxonomy.js`; shared `GET /auth/care-needs` source for both registration roles | Prevents prohibited categories from remaining active without frontend hiding or fallback options | Use the reviewed tracked migration through exact-module/checksum/transaction isolation; never use the broad runner while protected candidates are present | **Approved 2026-07-12; plan prepared; execution blocked on target/backup/preflight evidence and separate approval** |
| CA-01a | **Homepage service-wording replacements — CLIENT CONFIRMATION REQUIRED** (proposed in Phase 1A patch, not committed): "Medikamentengabe → **Begleitung zu Terminen**"; "Körperpflege → **Unterstützung im Haushalt**"; "Pflegedokumentation → **Aktivitäten im Blick**" | `difference` tags, `app.feature3` | Must accurately describe confirmed services | **Client to confirm each phrase** before commit (per Phase 1A condition, 2026-07-09) | Awaiting client confirmation |
| CA-02 | **Legal-page wording** — `serviceDescriptionText`, `liabilityText` use "Pflegekräfte / Pflegeleistungen / Pflegevereinbarungen" | `locales/*/common.json` `terms`/`imprint`/`privacy` | Load-bearing legal text; must match real model + limit liability correctly | Reposition to Alltagsbegleitung **with counsel sign-off**; keep only legally necessary terms | Open |
| CA-03 | **Reimbursement / Entlastungsbetrag** claims | any future copy/FAQ | Implying §45b SGB XI reimbursement without recognition = false entitlement | **No reimbursement claim** until client confirms recognition | Open |
| CA-04 | **"#1 Plattform" superlative** | `hero.badge` "Die #1 Plattform für Pflege in Deutschland" | Unsubstantiated superlative → UWG (unfair competition) risk + Pflege mis-positioning | Drop "#1"; e.g. "Die Plattform für Alltagsbegleitung in Deutschland" | Open |
| CA-05 | **Absolute guarantee "100% Datenschutz"** | `hero.feature2` | Absolute privacy guarantee is challengeable; no system is 100% | Soften: "Datenschutz nach DSGVO" / "Höchste Datenschutzstandards" | Open |
| CA-06 🔴 | **"verifiziert" / "qualifizierte" / "Zertifizierungen"** on user-entered credentials | `difference`, `recipient`, `caregiver` profiles, admin | **HIGH LEGAL RISK** — implies MyHelper vets/certifies helpers; if self-reported, misleads (implies professional qualifications) | State clearly what "verifiziert" means (e.g. email/ID only) or remove; do not imply vetted qualifications unless a real process exists | Open |
| CA-07 🔴 | **"Kompetente / qualifizierte Pflegekräfte", "unterschiedliche Qualifikationen"** | `difference.card2Title`, `recipient` search | **HIGH LEGAL RISK** — implies assured professional competence/qualification | Neutral wording ("Alltagsbegleiter:innen in Ihrer Nähe"); no competence guarantee | Open |
| CA-18 | **"die perfekte …" soft outcome promise** | `hero.subtitle`, `concept.step4Desc` | Mild outcome guarantee | Prefer "die **passende** Unterstützung/Begleitung" | Open |
| CA-08 | **Testimonials / reviews** displayed publicly | `Review` model, profile modals | Reviews must be genuine (UWG bans fake testimonials) | Confirm all displayed reviews are real & from actual matches; no seeded/mock reviews in prod (see R-09) | Open |
| CA-21 🔴 | **Datenschutzerklärung is a stub** — omits accounts, Stripe, messaging, email, hosting, profile images, support, reviews, rights, legal bases, retention (DSGVO Art. 13/14) | `/datenschutz` | **HIGH LEGAL RISK** — incomplete privacy policy | Rebuild to match real processing after client confirms processors/retention (`LEGAL_CLIENT_QUESTIONS.md`) + counsel. `LEGAL_GAP_ANALYSIS.md` G-01 / R-20 | Awaiting facts + counsel |
| CA-22 🔴 | **AGB "Pflege" wording** (§3/§5) + **missing membership/payment/Widerruf/cancellation** for the paid 8,99 € contract | `/agb` | **HIGH LEGAL RISK** — mischaracterises service (regulated term) + consumer-law gaps (Fernabsatz, § 312k) | Reposition to Alltagsbegleitung (extends CA-02) **and** add consumer terms + Widerrufsbelehrung; counsel sign-off. `LEGAL_GAP_ANALYSIS.md` G-02/G-03/G-09 / R-21/R-22 | Awaiting facts + counsel |
| CA-23 | **Datenschutz accuracy** — describes a "Kontaktformular" that does not exist; homepage email-capture ("Benachrichtigen") form undisclosed | `/datenschutz`, homepage | Inaccurate + undisclosed processing | Correct contact description; disclose the app-notify opt-in (consent + withdrawal). `LEGAL_GAP_ANALYSIS.md` G-04 | Awaiting facts |
| CA-24 | **Impressum updates** — "§ 5 TMG" → "§ 5 DDG"; confirm legal form/register; verify EU-ODR clause | `/impressum` | Outdated citation + incomplete entity data | Update citation; client confirms legal form (sole proprietor vs. company); counsel confirms ODR. `LEGAL_GAP_ANALYSIS.md` G-05/G-06/G-08 | Awaiting client confirm |

## Client decision (business/product)

| ID | Item | Where | Recommended | Status |
|---|---|---|---|---|
| CA-09 | **Terminology glossary** (Pflegekraft→Alltagsbegleiter:in, Pflegebedürftige→Betreute:r, Pflegebedürfnisse→Unterstützungsbedarf) | all locales | Approve once; apply per phase | Open |
| CA-10 | **Content reposition phasing** (Phases 1–6) | `CONTENT_AUDIT.md` §9 | Approve to begin Phase 1 (de homepage) | Open |
| CA-11 | **Use MyHelper.me as the visible brand while preserving Rhoda Fideler as legal operator** | public frontend and legal presentation | Handle search intent in SEO, not positioning; never replace the legal identity with the brand | Approved and applied on review branch |
| CA-26 | **Homepage headline** — replace “Eine große Auswahl an Alltagsbegleiter:innen in Ihrer Nähe” with “Finden Sie passende Alltagsbegleiter:innen in Ihrer Nähe”; natural EN/FR equivalents required | `locales/{de,en,fr}/common.json` `difference.bannerTitle` | Use the approved DE wording and localized equivalents without changing locale keys | **Approved 2026-07-12; committed/pushed as `4353eec`; Preview deployment succeeded; browser QA pending** |

## Meal preparation removal (BR-01)

| ID | Item | Type | Action | Status |
|---|---|---|---|---|
| CA-19 | Remove meal-prep **wording** — homepage `tagMealPrep` + `DifferenceSection.tsx` line (de/en/fr) | Content | Applied on the review branch with no food replacement; database-governed active registration option handled separately by CA-20 | Approved & applied |
| CA-20 | Remove `Mahlzeitenzubereitung` as an **active registration option** | ⛔ TECH/DATA | Deactivate stable key `mealPreparation` through the reviewed `20260710000001_align_care_needs_taxonomy.js`; do not add a food-related replacement or frontend fallback; preserve the database row/history | **Approved 2026-07-12; migration reviewed; execution not authorized** |

## Tech approval (authority-limited — `CLIENT_REQUIREMENTS.md` §4)

| ID | Item | Risk | Ref | Status |
|---|---|---|---|---|
| CA-12 | Add rate limiting (auth/API) | 🟠 brute force | R-04 | Open |
| CA-13 | Git-history secret scan + rotate | 🟠 | R-06 | Open |
| CA-14 | JWT → httpOnly cookie + short expiry | 🟠 | R-03 | Open |
| CA-15 | Fail-fast on missing prod secrets | 🟠 | R-07 | Open |
| CA-16 | Remove mock users / seed from prod | 🟡 | R-09 | Open |
| CA-17 | Profile images → object storage (schema) | 🟡 | R-08 | Open |
| CA-25 | Legal-document and acceptance-history backend milestone | 🔴 legal evidence integrity; schema and migration risk | Authorized as the next backend milestone after frontend Preview approval; fresh architecture/reversibility/test review required; migration execution separately approved | Approved to begin later; not started; execution not authorized |

---

## Handling protocol
1. When new risk is found: **STOP**, do not implement.
2. Log here + in `RISK_REGISTER.md`; for legal items, also `LEGAL_AUDIT.md`.
3. Classify (LEGAL REVIEW REQUIRED / CLIENT DECISION / TECH APPROVAL).
4. Recommend the **legally safer** option.
5. Wait for explicit client approval; record the decision + date here.
