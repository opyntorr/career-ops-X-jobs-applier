# Dispatch: E2E Test Writer (Validation Suite & Infrastructure)

Working directory: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_test_writer_e2e/
Project root: /home/opyntorr/career-ops

Task:
Design and implement an automated E2E test script `tests/verify-tec-batch.mjs` that verifies all acceptance criteria for the 14 Tecnologico de Monterrey job postings:
1. Reports Verification:
   - Exactly 14 reports exist in `reports/` with numbers 289 to 302.
   - Each report contains required sections: Header, YAML Machine Summary, Blocks A-G, Cover Letter Draft, Keywords extracted.
   - Machine Summary has valid keys including `advertised_comp`, `legitimacy_tier`, `score`.
2. LaTeX CV & PDF Verification:
   - For all viable roles (score >= 3.0), checks that both `.tex` and `.pdf` exist in `output/`.
   - Each PDF strictly has 1 page (`pdfinfo <pdf> | grep Pages` returns `Pages: 1`).
   - For Spanish CVs (`*-es.pdf`), verifies zero residual English macro strings (`SUMMARY`, `Graduating`, `Relevant coursework`).
3. Tracker Verification:
   - `data/applications.md` has table rows for reports 289 through 302.
   - Checks that all 9 columns are populated, status is `Evaluated`, links to PDF and Report are valid paths.
4. System Rules Verification:
   - Checks that NO files in `reports/` (289-302), `output/` (*-289* to *-302*), or `data/applications.md` contain emojis.
   - Runs cleanly and outputs JSON / summary results with exit code 0 when all criteria pass.

Also publish:
- `TEST_INFRA.md` at project root documenting test architecture, methodology, tiers, and invocation.
- `TEST_READY.md` at project root once the test suite is ready to run.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

NEVER use emojis anywhere.
NEVER run colcon build.

## 2026-10-18T05:42:31Z
You are teamwork_preview_test_writer_e2e.
Your working directory is: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_test_writer_e2e/
You must read /home/opyntorr/career-ops/.agents/teamwork/ORIGINAL_REQUEST.md (specifically the section "## 2026-10-18T05:29:39Z") and /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_test_writer_e2e/DISPATCH.md.

Task:
Build the automated test suite `tests/verify-tec-batch.mjs` and test documentation:
1. Create `tests/verify-tec-batch.mjs`:
   - Checks that all 14 reports (289 to 302) exist in `reports/`.
   - Validates each report has valid YAML summary, Blocks A-G, verbatim `advertised_comp`, non-null score, legitimacy rating.
   - For all viable roles (score >= 3.0), checks that output `.tex` and `.pdf` files exist in `output/`.
   - Verifies each PDF is strictly 1 page using `pdfinfo <pdf> | grep Pages`.
   - For Spanish CVs (`*-es.pdf`), validates that no residual English macros exist (`SUMMARY`, `Graduating`, `Relevant coursework`).
   - Checks that `data/applications.md` has table rows for reports 289 through 302 with correct column count (9), status `Evaluated`, valid markdown links to Report and PDF.
   - Verifies ZERO emojis exist across all reports 289-302, output CVs, and tracker entries.
   - Supports `--json` flag and summary mode, exiting with code 0 on pass or 1 on failure.
2. Publish `TEST_INFRA.md` at project root documenting test architecture, methodology, tiers, and invocation.
3. Publish `TEST_READY.md` at project root once the test suite is ready to run.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Rules:
- NEVER use emojis in any file, report, log or message.
- NEVER run colcon build.
- Write your completion handoff to /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_test_writer_e2e/handoff.md and notify caller via send_message.
