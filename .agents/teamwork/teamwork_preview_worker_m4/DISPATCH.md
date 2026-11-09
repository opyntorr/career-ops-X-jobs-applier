# Dispatch: Worker Milestone 4 (Applications Tracker Synchronization)

Working directory: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_m4/
Project root: /home/opyntorr/career-ops

Task:
Synchronize `data/applications.md` with all 14 evaluated applications from the Tecnologico de Monterrey job board batch (Reports 289 through 302):
1. Prepend the 14 rows in descending order (302 down to 289) directly beneath the table header in `data/applications.md`.
2. Ensure strict 9-column formatting:
   `| # | Date | Company | Role | Score | Status | PDF | Report | Notes |`
   - Date: `2026-10-18`
   - Status: strictly `Evaluated`
   - PDF column:
     * Viable roles (score >= 3.0): `[PDF](../output/cv-christian-omar-payan-torrontegui-{slug}-{lang}.pdf)`
     * Non-viable role (Report 300): `-` (plain hyphen)
     * Never use emoji icons.
   - Report column: `[Report](../reports/{###}-{slug}-2026-10-18.md)`
   - Notes column: Concise single-line summary with location, salary, modality, and key technologies or reason for skip. NO EMOJIS anywhere.
3. Validate updates:
   - Run `node verify-pipeline.mjs`
   - Run `node tests/verify-tec-batch.mjs`
   - Check that all tests pass with exit code 0.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Rules:
- NEVER use emojis in any file, report, log or message.
- NEVER run colcon build.
- Write your completion handoff to /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_m4/handoff.md and notify caller via send_message.

## 2026-10-18T06:09:40Z
[Message] timestamp=2026-10-18T06:09:40Z sender=83b162d7-a15a-4913-b395-ac1704ff3c14 priority=MESSAGE_PRIORITY_HIGH content=You are teamwork_preview_worker_m4.
Your working directory is: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_m4/
You must read /home/opyntorr/career-ops/.agents/teamwork/ORIGINAL_REQUEST.md (specifically the section "## 2026-10-18T05:29:39Z") and /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_m4/DISPATCH.md.

Task:
Synchronize `data/applications.md` with all 14 evaluated applications from the Tecnologico de Monterrey job board batch (Reports 289 through 302):
1. Prepend the 14 rows in descending order (302 down to 289) directly beneath the table header in `data/applications.md`.
2. Format:
   `| # | Date | Company | Role | Score | Status | PDF | Report | Notes |`
   - Date: `2026-10-18`
   - Status: strictly `Evaluated`
   - PDF column:
     * Viable roles (score >= 3.0): `[PDF](../output/cv-christian-omar-payan-torrontegui-{slug}-{lang}.pdf)`
     * Non-viable role (Report 300): `-` (plain hyphen)
   - Report column: `[Report](../reports/{###}-{slug}-2026-10-18.md)`
   - Notes column: Concise single-line summary with location, salary, modality, and key technologies or reason for skip. Strictly NO EMOJIS anywhere.
3. Validate updates:
   - Run `node verify-pipeline.mjs`
   - Run `node tests/verify-tec-batch.mjs`
   - Check that all tests pass with exit code 0.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Rules:
- NEVER use emojis in any file, report, log or message.
- NEVER run colcon build.
- Write your completion handoff to /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_m4/handoff.md and notify caller via send_message.
