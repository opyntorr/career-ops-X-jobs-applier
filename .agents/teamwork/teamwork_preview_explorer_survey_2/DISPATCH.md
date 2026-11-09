# Dispatch: Explorer Survey 2 (Candidate Profile & Evaluation Architecture)

Investigate candidate profile, evaluation rubric, and report standards:
1. Examine `cv.md`, `config/profile.yml`, `modes/_profile.md`, `article-digest.md`.
2. Map candidate core strengths, experience, education, projects, skills, and target parameters.
3. Inspect existing evaluation reports in `reports/` to document the exact format, blocks A-G, legitimacy score calculation, scoring thresholds, and conventions.
4. Check report numbering script `reserve-report-num.mjs` and determine current next report ID.
Document everything in detail in your handoff report.
Remember: NO EMOJIS anywhere.

## 2026-10-18T05:31:52Z

Investigate candidate profile, evaluation rubric, and report standards:
1. Examine /home/opyntorr/career-ops/cv.md, /home/opyntorr/career-ops/config/profile.yml, /home/opyntorr/career-ops/modes/_profile.md, and /home/opyntorr/career-ops/article-digest.md.
   Extract the candidate's core background, technical skills, verified achievements, education, target salary, relocation policy, and boundaries (what is authentic vs what must never be fabricated).
2. Examine existing reports in /home/opyntorr/career-ops/reports/ (especially recent ones from report 030-035 onwards) to document:
   - File naming convention (reports/{###}-{company-slug}-{date}.md)
   - Exact structure and headings: Header, Blocks A-G, Legitimacy calculation, Scoring criteria and justification.
3. Check /home/opyntorr/career-ops/reserve-report-num.mjs:
   - How report reservation works.
   - What the current next available report number is.

Write findings to /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_2/handoff.md.
Rules:
- NEVER use emojis in any file, report, log or message.
- NEVER run colcon build.
- Do not modify source files.
- Communicate completion and summary via send_message to caller.
