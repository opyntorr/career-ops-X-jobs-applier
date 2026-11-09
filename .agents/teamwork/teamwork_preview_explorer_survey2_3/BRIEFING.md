# BRIEFING — 2026-10-16T06:25:30Z

## Mission
Investigate operational pipeline tools, templates, and conventions in career-ops for processing 30 job postings.

## [LOCKED] My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey2_3
- Original parent: f9df9e51-9ee1-4623-a1d9-7e5d522472d6
- Milestone: survey2_pipeline_infra

## [LOCKED] Key Constraints
- Read-only investigation — do NOT implement
- Never use emojis anywhere (files, logs, messages)
- Never do colcon build
- Confine operations to /home/opyntorr/career-ops
- Use send_message to report back to parent

## Current Parent
- Conversation ID: f9df9e51-9ee1-4623-a1d9-7e5d522472d6
- Updated: 2026-10-16T06:25:30Z

## Investigation State
- **Explored paths**: ORIGINAL_REQUEST.md, DISPATCH.md, reserve-report-num.mjs, reports/, modes/oferta.md, modes/_shared.md, config/profile.yml, modes/_profile.md, generate-latex.mjs, templates/cv-template.tex, templates/resume.cls, data/applications.md, verify-pipeline.mjs.
- **Key findings**:
  1. Next report number is 257 (maxSlot = 256). To reserve 30 slots: node reserve-report-num.mjs --count 30 (range 257-286).
  2. Reports require Blocks A-G, YAML Machine Summary with advertised_comp, and Cover Letter Draft.
  3. generate-latex.mjs uses pdflatex. resume.cls hardcodes Summary, Graduating, and Relevant coursework. Spanish CVs must override \summary and define \educationItemEs to eliminate English residual macros.
  4. data/applications.md requires scores in X.X/5 format; bare numbers fail verify-pipeline.mjs.
  5. Verified pdfinfo 1-page check and zero emoji validation regex.
- **Unexplored areas**: None within this sub-scope.

## Key Decisions Made
- Documented full operational playbook in survey_pipeline_infra.md.
- Generated 5-component handoff in handoff.md.

## Artifact Index
- survey_pipeline_infra.md — Detailed analysis report on pipeline infrastructure
- handoff.md — 5-component handoff report for parent agent
- progress.md — Liveness and task completion tracking
