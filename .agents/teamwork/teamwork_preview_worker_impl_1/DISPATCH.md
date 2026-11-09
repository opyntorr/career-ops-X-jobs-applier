## 2026-10-16T05:29:58Z
You are teamwork_preview_worker_impl_1.
Your working directory is /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl_1/.

Read the following files before starting work:
1. /home/opyntorr/career-ops/.agents/teamwork/ORIGINAL_REQUEST.md
2. /home/opyntorr/career-ops/.agents/teamwork/orchestrator_1/PROJECT.md
3. /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_1/handoff.md
4. /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_2/handoff.md
5. /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_3/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Strict rules:
- Never use emojis anywhere in any file, report, log, code, or message.
- Never run colcon build.
- Confine all work to /home/opyntorr/career-ops.
- Never invent or fabricate experiences. Ground all CV claims in cv.md, profile.yml, and modes/_profile.md.

Deliverables to implement:
1. Report Reservation:
   Run `node reserve-report-num.mjs --count 5` to atomically reserve numbers 252-256.
2. 5 Evaluation Reports in reports/:
   - reports/252-grupo-cosmic-promotor-tecnologia-2026-10-16.md (Score ~2.4, retail discrepancy)
   - reports/253-atento-promotor-telefonia-2026-10-16.md (Score ~1.6, telephony sales discrepancy)
   - reports/254-ver-de-verdad-laboratorio-optico-2026-10-16.md (Score ~4.0, optical lab & precision edging)
   - reports/255-tintec-tecnico-impresoras-2026-10-16.md (Score ~4.2, printer electromechanics & troubleshooting)
   - reports/256-grupo-cosmic-tecnico-vending-2026-10-16.md (Score ~4.3, vending electromechanics & actuators)
   Each report must follow the canonical structure: header with Legitimacy tier, YAML Machine Summary, and Blocks A through G.
   After creating reports, run `node reserve-report-num.mjs --release 252-256`.
3. 3 Specialized 1-Page LaTeX CVs in output/:
   For the viable technical roles (254, 255, 256):
   - output/cv-christian-omar-payan-torrontegui-ver-de-verdad-254-es.tex
   - output/cv-christian-omar-payan-torrontegui-tintec-255-es.tex
   - output/cv-christian-omar-payan-torrontegui-grupo-cosmic-vending-256-es.tex
   Ensure:
   - Override \summary with \renewcommand{\summary}[1]{\sectionTitle{Resumen Profesional}#1}
   - Define \educationItemEs in preamble so no "Graduating" or "Relevant coursework:" is emitted.
   - Use Spanish section headers (Educacion, Habilidades Tecnicas, Experiencia Laboral, Proyectos Tecnicos).
   - Include the verified 100-hour bachillerato course in office/Excel and verified lab hardware/inventory support.
   - Compile with `node generate-latex.mjs <tex> <pdf>`.
   - Verify strict 1-page length with `pdfinfo <pdf> | grep Pages` (must be 1).
   - Verify zero residual English macros with `pdftotext <pdf> - | grep -E "SUMMARY|Graduating|Relevant coursework"`.
4. Applications Tracker:
   Prepend the 5 evaluated roles to data/applications.md with status Evaluated, scores, links to reports, and links to PDFs (or [N/A] for retail promoter roles). No emojis!
5. Write your complete verification, build results, and handoff report to:
   /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_impl_1/handoff.md.

When finished, send a brief message to the orchestrator notifying completion.
