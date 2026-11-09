# Dispatch: Batch 2 Implementation Worker (Jobs 16-30)

Working directory: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl2_2

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
- Evaluation reports for Jobs 16 through 30: `reports/272-*` to `reports/286-*`
- Tailored LaTeX files for viable roles in Jobs 16-30: `output/272-*` to `output/286-*`
- Compiled PDF files for viable roles in Jobs 16-30: `output/272-*` to `output/286-*`
You do NOT touch Jobs 1-15 (owned by worker 1).
You do NOT modify `data/applications.md` (owned by tracker sync worker).

## Step-by-Step Instructions

1. **Wait or Verify Reservation of slots 272-286**:
   Slots 257-286 are reserved by the batch reservation script. Ensure slots 272 to 286 are designated for your batch.

2. **Generate 15 Evaluation Reports (Jobs 16 to 30)**:
   Date: `2026-10-16`
   File format: `reports/{###}-{company_slug}-{YYYY-MM-DD}.md`
   - Job 16: `reports/272-neumo-holdings-jr-software-engineer-mx-2026-10-16.md` (Score: 4.2/5, Legitimacy: Verified, Viable)
   - Job 17: `reports/273-acute-talent-data-scientist-ai-2026-10-16.md` (Score: 2.2/5, Legitimacy: Verified, Non-viable)
   - Job 18: `reports/274-datamatic-software-ai-developer-2026-10-16.md` (Score: 3.8/5, Legitimacy: Verified, Viable)
   - Job 19: `reports/275-contpaqi-arquitecto-pruebas-automatizadas-2026-10-16.md` (Score: 2.4/5, Legitimacy: Verified, Non-viable)
   - Job 20: `reports/276-consede-becario-automatizacion-excel-2026-10-16.md` (Score: 4.3/5, Legitimacy: Verified, Viable)
   - Job 21: `reports/277-master-loyalty-group-analista-datos-bi-2026-10-16.md` (Score: 3.6/5, Legitimacy: Verified, Viable)
   - Job 22: `reports/278-master-loyalty-group-desarrollador-bbdd-2026-10-16.md` (Score: 3.6/5, Legitimacy: Verified, Viable)
   - Job 23: `reports/279-mojohire-devops-engineer-2026-10-16.md` (Score: 2.3/5, Legitimacy: Verified, Non-viable)
   - Job 24: `reports/280-neumo-holdings-jr-software-engineer-2026-10-16.md` (Score: 3.8/5, Legitimacy: Verified, Viable)
   - Job 25: `reports/281-alten-mexico-body-design-release-engineer-jr-2026-10-16.md` (Score: 3.7/5, Legitimacy: Verified, Viable)
   - Job 26: `reports/282-amwest-funding-data-analyst-2026-10-16.md` (Score: 3.8/5, Legitimacy: Verified, Viable)
   - Job 27: `reports/283-kpmg-mexico-staff-desarrollo-automatizacion-ia-2026-10-16.md` (Score: 5.0/5, Legitimacy: Verified, Viable)
   - Job 28: `reports/284-grupo-panama-desarrollador-escritorio-2026-10-16.md` (Score: 3.8/5, Legitimacy: Verified, Viable)
   - Job 29: `reports/285-amwest-funding-backend-developer-2026-10-16.md` (Score: 3.8/5, Legitimacy: Verified, Viable)
   - Job 30: `reports/286-grupo-pissa-tecnico-soporte-campo-2026-10-16.md` (Score: 3.4/5, Legitimacy: Verified, Viable)

   Every report must contain:
   - Header with ID, Company, Role, Date, Status (Evaluated), Score, Legitimacy
   - Machine Summary YAML fence with `advertised_comp`
   - Blocks A through G (Posting Details, Technical Fit, Dimension Scoring, Red Flags / Risks, Interview Prep, Cover Letter Draft, Posting Legitimacy)
   - Zero emojis!
   - Full relocation willingness noted where applicable (relocation is NOT a negative factor).

3. **Generate Tailored LaTeX CVs and Compile to PDF**:
   For the 12 viable roles (Jobs 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30):
   - Language rules:
     - English postings: Jobs 16, 24, 25, 26, 29 -> English Harvard CV.
     - Spanish postings: Jobs 18, 20, 21, 22, 27, 28, 30 -> Spanish Harvard CV.
     - In Spanish CVs, strictly eliminate English residual macros (`Summary`, `Graduating`, `Relevant coursework:`, etc.). Redefine macros or use custom commands in LaTeX so that all section headers, degree notes, and bullet points are in Spanish.
   - Absolute veracity: use real projects from cv.md (Laboratorio de Manufactura Avanzada, mini PCs, Cisco Packet Tracer, Excel 100-hr course, mechatronics/robotics degree). Never fabricate claims.
   - Compile using `node generate-latex.mjs output/{name}.tex output/{name}.pdf`.
   - Verify every PDF has strictly 1 page using `pdfinfo output/{name}.pdf | grep Pages`.
   - Adjust spacing (`\vspace`, font sizes, bullet counts) if needed so it fits on exactly 1 page.

4. **Sentinel cleanup**:
   Release the reservation sentinels for your batch: `node reserve-report-num.mjs --release 272-286`.

5. **Deliverable & Handoff**:
   Write `handoff.md` in `/home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl2_2/handoff.md` detailing all files created, verification commands executed, and report back via `send_message`.
   NEVER use emojis.


## 2026-10-16T06:29:48Z
Read /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl2_2/DISPATCH.md and execute your mission. Slots 272-286 are already reserved for you. Generate evaluation reports for Jobs 16-30 (reports 272-286), generate tailored LaTeX CVs and compile 1-page PDFs for the 12 viable roles matching posting language without English residual macros in Spanish CVs. Verify all PDFs are 1 page and zero emojis. Produce handoff.md in /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl2_2 and report back via send_message. NEVER use emojis.
