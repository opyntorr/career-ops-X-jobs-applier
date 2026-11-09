# Dispatch: Tracker Sync & Pipeline Verification Worker

Working directory: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_tracker_sync

> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A teamwork_preview_auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

## Context & Inputs
- User Request: /home/opyntorr/career-ops/.agents/teamwork/ORIGINAL_REQUEST.md (request dated 2026-10-16T06:16:15Z)
- Project Scope: /home/opyntorr/career-ops/.agents/teamwork/orchestrator_2/PROJECT.md
- Pipeline Infra Playbook: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey2_3/survey_pipeline_infra.md
- Batch 1 Handoff: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl2_1/handoff.md
- Batch 2 Handoff: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl2_2/handoff.md
- Applications Tracker: /home/opyntorr/career-ops/data/applications.md

## Scope & File Ownership
You exclusively own:
- Updating `/home/opyntorr/career-ops/data/applications.md`
- Running pipeline verification: `node verify-pipeline.mjs`
- Checking repository-wide zero emojis across all newly generated files and modified tracker

## Step-by-Step Instructions

1. **Wait for Batch 2 completion**:
   Ensure all 30 reports (`reports/257-*` through `reports/286-*`) and all 25 compiled PDFs in `output/` exist.

2. **Synchronize `data/applications.md`**:
   Insert the 30 new rows at the top of the table in descending order (286 down to 257):
   Format:
   `| # | Date | Company | Role | Score | Status | PDF | Report | Notes |`
   - Report #: 286 down to 257
   - Date: `2026-10-16`
   - Company: Company name
   - Role: Role title
   - Score: Must strictly follow `X.X/5` (e.g. `3.8/5`, `5.0/5`)
   - Status: `Evaluated`
   - PDF: `[PDF](../output/{pdf_filename})` if viable (score >= 3.0), or `-` if non-viable
   - Report: `[Report](../reports/{report_filename})`
   - Notes: Concise notes on fit and relocation.
   Ensure table markdown formatting remains clean and aligned.

3. **Sentinel Cleanup**:
   Ensure no lingering `NNN-RESERVED.md` files exist for slots 257-286:
   Run `node reserve-report-num.mjs --release 257-286`.

4. **Run Verification Suite**:
   - Run `node verify-pipeline.mjs` and verify it reports all checks passing without errors.
   - Run a strict Unicode check for emojis (`\p{Extended_Pictographic}`) across:
     - `data/applications.md`
     - `reports/257-*` through `reports/286-*`
     - `output/` new `.tex` and `.pdf` files
   - Run `pdfinfo <pdf> | grep Pages` across all 25 newly generated PDFs to confirm 100% strictly 1 page.

5. **Deliverable & Handoff**:
   Write `handoff.md` in `/home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_tracker_sync/handoff.md` detailing changes, verification command outputs, and report back via `send_message`.
   NEVER use emojis.

## 2026-10-16T06:45:13Z
Read /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_tracker_sync/DISPATCH.md and execute your mission. Synchronize data/applications.md with all 30 evaluated postings (reports 286 down to 257) with canonical status Evaluated, scores in X.X/5 format, and correct PDF/Report links. Run node verify-pipeline.mjs, verify zero emojis across all files, and verify 1-page PDF count. Produce handoff.md in /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_tracker_sync and report back via send_message. NEVER use emojis.
