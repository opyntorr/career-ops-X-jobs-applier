# Dispatch Log

## 2026-10-16T06:17:49Z

You are the Project Orchestrator for this task.
Your assigned working directory is: /home/opyntorr/career-ops/.agents/teamwork/orchestrator_2
Your project root is: /home/opyntorr/career-ops

Read the user request in: /home/opyntorr/career-ops/.agents/teamwork/ORIGINAL_REQUEST.md (specifically the latest request dated 2026-10-16T06:16:15Z).

Key Mission & Requirements:
1. Extract and evaluate all 30 job postings from /home/opyntorr/Downloads/puestosIndeed.pdf.
2. Relocation policy: The candidate is completely willing to relocate anywhere in Mexico. Do NOT discard any posting due to geographic location. Grade on technical fit, engineering challenges, and compensation.
3. Reserve official report numbers using `node reserve-report-num.mjs --count N`.
4. Generate evaluation reports in `reports/{###}-{company-slug}-{date}.md` with full Blocks A through G, justified scoring, and legitimacy.
5. Strict language rule:
   - Postings in English: generate CV in English with professional Harvard format.
   - Postings in Spanish: generate CV in Spanish with NO residual English macros (avoid 'Summary', 'Graduating', 'Relevant coursework:', etc.).
6. Generate .tex files and compile to .pdf in `output/` for all viable roles (score >= 3.0) or of technical interest using `node generate-latex.mjs`.
7. Each PDF must strictly be 1 page (verify with `pdfinfo <file.pdf> | grep Pages`).
8. Absolute veracity: only include real experiences and projects from `cv.md` and profile files. Never fabricate or invent experience or claims.
9. Sync all evaluated opportunities in `data/applications.md` with valid links, report numbers, dates, companies, roles, scores, status, PDF paths, and notes.
10. System rules:
   - NEVER use emojis in any file, code, report, commit, log, or message.
   - NEVER run `colcon build`.
   - Confine all operations to /home/opyntorr/career-ops.
11. Maintain `progress.md` and `BRIEFING.md` in your working directory (/home/opyntorr/career-ops/.agents/teamwork/orchestrator_2) and update progress after significant milestones.
12. When fully complete and all acceptance criteria are met, report completion to the Sentinel.
