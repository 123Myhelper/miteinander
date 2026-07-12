# SESSION_HANDOFF.md — Current Operational Handoff

**Last updated:** 2026-07-12

## Repository State

- Canonical repository: `/Users/stan/Desktop/miteinander`
- Branch: `phase1a-client-review-v2`
- Frontend application baseline: `4353eec5a2bdcc98805954febbfb4e3c8120c55b`
- Origin tip: `4353eec5a2bdcc98805954febbfb4e3c8120c55b`
- Local HEAD may be newer only by the governance-document commit containing this handoff; no newer application change is implied.
- Local tracked worktree: clean.
- Staging area: empty.
- Production deployment: **NOT APPROVED**

## Latest Pushed Commits

- `8180199` — `feat(frontend): add FAQ and align MyHelper.me branding`
- `a414997` — `fix(frontend): refine membership cards and mobile copy`
- `4be46a3` — `fix(frontend): separate pricing and refine footer tagline`
- `4353eec` — `fix(frontend): refine nearby companion headline`

All listed commits are pushed to `origin/phase1a-client-review-v2`. None is pending push.

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

Obtain the required approvals in order. Do not stage, commit, push, deploy, change configuration, run a migration, or begin browser QA before the corresponding approval.

Required separate approvals:

1. ✅ Approval to stage, commit, and push the three locale changes — completed as `4353eec`.
2. ✅ Approval to deploy the resulting frontend commit to Preview — Git-integrated deployment completed successfully.
3. Controlled execution plan prepared; approval remains pending until target DB identity, backup, database marker, and live preflight evidence are confirmed.
4. Approval for a narrowly scoped Preview API/CORS configuration change.
5. Approval to begin browser QA after access to the Vercel SSO-protected Preview is available.

After those gates, verify the migrated active taxonomy, test both registration roles, complete remaining questionnaire/validation corrections, obtain client Preview approval, begin legal acceptance tracking, stabilize the release, and only then begin SEO. Promote to Production only after every release gate passes.
