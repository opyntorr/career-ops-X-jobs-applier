# Dispatch: Explorer Survey 3 (CV Generation Pipeline, LaTeX, & Tracker)

Investigate LaTeX CV generation, template mechanics, and tracker:
1. Examine `templates/cv-template.tex`, `resume.cls`, `generate-latex.mjs`.
2. Review recent `.tex` files in `output/` to inspect:
   - Language separation (Spanish vs English): how macros like `Summary`, `Graduating`, `Relevant coursework:` are redefined in Spanish CVs to ensure zero residual English text.
   - Harvard format and strict 1-page compliance: margins, section spacing, line budgets.
   - Verification commands: `node generate-latex.mjs <tex> <pdf>` and `pdfinfo <pdf> | grep Pages`.
3. Examine `data/applications.md` to see its current structure, existing row format, and how reports and PDFs are linked.
Document everything in detail in your handoff report.
Remember: NO EMOJIS anywhere.

## 2026-10-18T05:31:52Z
Investigate LaTeX CV generation, template mechanics, and tracker:
1. Examine /home/opyntorr/career-ops/templates/cv-template.tex, /home/opyntorr/career-ops/resume.cls, and /home/opyntorr/career-ops/generate-latex.mjs.
2. Review recent .tex and .pdf files in /home/opyntorr/career-ops/output/ to determine:
   - How English vs Spanish CVs are generated and structured.
   - Specifically, how Spanish CVs avoid residual English macros like "Summary", "Graduating", "Relevant coursework:". What exact macro definitions or LaTeX tweaks are used?
   - How strict 1-page Harvard format is achieved and verified (pdfinfo).
   - How compilation is invoked (`node generate-latex.mjs <tex> <pdf>`).
3. Examine /home/opyntorr/career-ops/data/applications.md to document:
   - The table format, column headers, status values, link conventions for Report and PDF.

Write your findings to /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_3/handoff.md.
Rules:
- NEVER use emojis in any file, report, log or message.
- NEVER run colcon build.
- Do not modify source files.
- Communicate completion and summary via send_message to caller.
