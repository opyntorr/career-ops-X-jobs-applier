# Dispatch: Batch 1 Implementation Worker (Jobs 1-15)

Working directory: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl2_1

> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A teamwork_preview_auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

## Context & Inputs
- User Request: /home/opyntorr/career-ops/.agents/teamwork/ORIGINAL_REQUEST.md (request dated 2026-10-16T06:16:15Z)
- Project Scope: /home/opyntorr/career-ops/.agents/teamwork/orchestrator_2/PROJECT.md
- Survey Postings Catalog: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey2_1/survey_postings.md
- Fit Analysis: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey2_2/survey_fit_analysis.md
- Pipeline Infra Playbook: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey2_3/survey_pipeline_infra.md
- Candidate Master Profile: /home/opyntorr/career-ops/cv.md, /home/opyntorr/career-ops/config/profile.yml, /home/opyntorr/career-ops/modes/_profile.md

## Scope & File Ownership
You exclusively own:
- Reservation of report numbers: run `node reserve-report-num.mjs --count 30` as your first step (this claims slots 257-286).
- Evaluation reports for Jobs 1 through 15: `reports/257-*` to `reports/271-*`
- Tailored LaTeX files for viable roles in Jobs 1-15: `output/257-*` to `output/271-*`
- Compiled PDF files for viable roles in Jobs 1-15: `output/257-*` to `output/271-*`
You do NOT modify `data/applications.md` (that is owned by the tracker sync worker).

## Step-by-Step Instructions

1. **Reserve 30 slots**:
   Run `node reserve-report-num.mjs --count 30`.
   Verify slots 257 to 286 are reserved.

2. **Generate 15 Evaluation Reports (Jobs 1 to 15)**:
   Date: `2026-10-16`
   File format: `reports/{###}-{company_slug}-{YYYY-MM-DD}.md`
   - Job 1: `reports/257-emerge-video-processor-2026-10-16.md` (Score: 2.0/5, Legitimacy: Verified, Non-viable)
   - Job 2: `reports/258-construobra-auxiliar-mecatronico-2026-10-16.md` (Score: 3.6/5, Legitimacy: Verified, Viable)
   - Job 3: `reports/259-totalenergies-ai-vision-specialist-jr-2026-10-16.md` (Score: 4.8/5, Legitimacy: Verified, Viable)
   - Job 4: `reports/260-omnia-securita-vision-computadora-jr-2026-10-16.md` (Score: 4.6/5, Legitimacy: Verified, Viable)
   - Job 5: `reports/261-nurvai-aiml-engineer-vision-robotics-2026-10-16.md` (Score: 4.9/5, Legitimacy: Verified, Viable)
   - Job 6: `reports/262-sunscreen-inc-remote-robot-operator-2026-10-16.md` (Score: 4.5/5, Legitimacy: Verified, Viable)
   - Job 7: `reports/263-katcon-programador-de-robot-2026-10-16.md` (Score: 3.4/5, Legitimacy: Verified, Viable)
   - Job 8: `reports/264-wasser-control-ingeniero-electronico-iot-2026-10-16.md` (Score: 4.4/5, Legitimacy: Verified, Viable)
   - Job 9: `reports/265-denso-practicante-iot-2026-10-16.md` (Score: 4.2/5, Legitimacy: Verified, Viable)
   - Job 10: `reports/266-solmin-tech-ingeniero-mecatronico-2026-10-16.md` (Score: 4.8/5, Legitimacy: Verified, Viable)
   - Job 11: `reports/267-pegasus-control-soporte-tecnico-especializado-2026-10-16.md` (Score: 3.5/5, Legitimacy: Verified, Viable)
   - Job 12: `reports/268-bosch-ingeniero-industria-40-2026-10-16.md` (Score: 3.5/5, Legitimacy: Verified, Viable)
   - Job 13: `reports/269-mattel-industrial-iot-engineer-2026-10-16.md` (Score: 3.5/5, Legitimacy: Verified, Viable)
   - Job 14: `reports/270-aptiv-embedded-software-engineer-2026-10-16.md` (Score: 2.5/5, Legitimacy: Verified, Non-viable)
   - Job 15: `reports/271-master-loyalty-group-analista-ia-jr-2026-10-16.md` (Score: 4.1/5, Legitimacy: Verified, Viable)

   Every report must contain:
   - Header with ID, Company, Role, Date, Status (Evaluated), Score, Legitimacy
   - Machine Summary YAML fence with `advertised_comp`
   - Blocks A through G (Posting Details, Technical Fit, Dimension Scoring, Red Flags / Risks, Interview Prep, Cover Letter Draft, Posting Legitimacy)
   - Zero emojis!
   - Full relocation willingness noted where applicable (relocation is NOT a negative factor).

3. **Generate Tailored LaTeX CVs and Compile to PDF**:
   For the 13 viable roles (Jobs 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15):
   - Language rules:
     - English postings: Job 6 (Sunscreen), Job 12 (Bosch), Job 13 (Mattel) -> English Harvard CV.
     - Spanish postings: Jobs 2, 3, 4, 5, 7, 8, 9, 10, 11, 15 -> Spanish Harvard CV.
     - In Spanish CVs, strictly eliminate English residual macros (`Summary`, `Graduating`, `Relevant coursework:`, etc.). Redefine macros or use custom commands in LaTeX so that all section headers, degree notes, and bullet points are in Spanish.
   - Absolute veracity: use real projects from cv.md (Laboratorio de Manufactura Avanzada, mini PCs, Cisco Packet Tracer, Excel 100-hr course, mechatronics/robotics degree). Never fabricate claims.
   - Compile using `node generate-latex.mjs output/{name}.tex output/{name}.pdf`.
   - Verify every PDF has strictly 1 page using `pdfinfo output/{name}.pdf | grep Pages`.
   - Adjust spacing (`\vspace`, font sizes, bullet counts) if needed so it fits on exactly 1 page.

4. **Sentinel cleanup**:
   Release the reservation sentinels for your batch: `node reserve-report-num.mjs --release 257-271`.

5. **Deliverable & Handoff**:
   Write `handoff.md` in `/home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl2_1/handoff.md` detailing all files created, verification commands executed, and report back via `send_message`.
   NEVER use emojis.


## 2026-10-16T06:29:03Z
**Context**: Reservation of report numbers 257 to 286
**Content**: Note that `reports/257-RESERVED.md` may have been left behind by an earlier test. Run `node reserve-report-num.mjs --release 257` before `node reserve-report-num.mjs --count 30` to ensure your 30 reserved slots are cleanly 257 through 286.
**Action**: Release 257 if present, then reserve 257-286 and proceed with generating reports and CVs for Jobs 1-15.
