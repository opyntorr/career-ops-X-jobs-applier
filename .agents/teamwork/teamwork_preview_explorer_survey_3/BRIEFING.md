# BRIEFING — 2026-10-18T05:35:00Z

## Mission
Investigate LaTeX CV generation, template mechanics, Spanish localization overrides, strict 1-page Harvard layout verification, and applications tracker conventions for the 14 Tec de Monterrey job postings.

## [LOCKED] My Identity
- Archetype: explorer
- Roles: investigator, synthesizer
- Working directory: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_3
- Original parent: b0fb22c8-0ec5-49d6-b90b-43fc06443598
- Milestone: Survey 3: LaTeX infrastructure, 1-page constraints, Spanish localization, applications tracker

## [LOCKED] Key Constraints
- Read-only investigation — do NOT implement
- Never use emojis anywhere in any output, code, or message
- Never do colcon build
- Confine all work to /home/opyntorr/career-ops

## Current Parent
- Conversation ID: 83b162d7-a15a-4913-b395-ac1704ff3c14
- Updated: 2026-10-18T05:31:52Z

## Investigation State
- **Explored paths**:
  - resume.cls and templates/resume.cls
  - templates/cv-template.tex
  - generate-latex.mjs
  - output/ recent .tex and .pdf files (251-es to 288-en)
  - data/applications.md
  - templates/states.yml
  - set-status.mjs and reserve-report-num.mjs
- **Key findings**:
  - English CVs use default resume.cls macros with no preamble overrides.
  - Spanish CVs avoid residual English macros by redefining \summary with \sectionTitle{Resumen Profesional} and defining a new macro \educationItemEs using \newkeycommand to completely drop "Graduating" and replace "Relevant coursework:" with "Materias relevantes:".
  - Attempting \renewkeycommand on \educationItem fails due to internal bugs in keycommand.sty; \educationItemEs compiles cleanly with zero errors.
  - Strict 1-page compliance is maintained via -0.5em / -7pt to -9pt item separation and verified using pdfinfo <file.pdf> | grep Pages.
  - Invocation syntax is `node generate-latex.mjs <tex> <pdf>` utilizing pdflatex in two passes.
  - Tracker format in data/applications.md requires columns: `#`, `Date`, `Company`, `Role`, `Score`, `Status`, `PDF`, `Report`, `Notes`. Valid states are defined in templates/states.yml. Emojis are strictly banned.
  - Highest existing report number is 288; upcoming 14 reports for Tec de Monterrey will occupy slots 289-302.
- **Unexplored areas**:
  - None within Survey 3 scope.

## Key Decisions Made
- Confirmed exact preamble macro overrides for Spanish CVs (\renewcommand{\summary} and \newkeycommand{\educationItemEs}).
- Verified 1-page constraint across all recent outputs (251-288) using pdfinfo.
- Documented markdown link formatting for tracker rows ([PDF](../output/...), [Report](../reports/...)) avoiding emoji icons.

## Artifact Index
- /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_3/DISPATCH.md — incoming dispatch log
- /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_3/BRIEFING.md — persistent working memory
- /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_3/progress.md — liveness heartbeat
- /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_3/handoff.md — final survey report
