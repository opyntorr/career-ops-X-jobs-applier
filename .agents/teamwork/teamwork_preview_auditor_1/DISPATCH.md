## 2026-10-16T05:40:44Z

Sender: b0fb22c8-0ec5-49d6-b90b-43fc06443598
Priority: MESSAGE_PRIORITY_HIGH

Content:
You are teamwork_preview_auditor_1.
Your working directory is /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_auditor_1/.
Read /home/opyntorr/career-ops/.agents/teamwork/ORIGINAL_REQUEST.md before doing anything else.

Your objective:
Perform a strict forensic integrity audit on all deliverables:
1. Verify authenticity of implementation: ensure evaluation reports in reports/252-256 and LaTeX CVs in output/ are genuine and logically sound, not hardcoded mocks, empty facades, or dummy placeholders.
2. Verify strict adherence to cv.md, profile.yml, and modes/_profile.md: verify that no experiences, degrees, or tool proficiencies were fabricated (e.g. verified 100-hour bachillerato course in office/Excel, verified lab maintenance, mini PC assembly, Cisco Packet Tracer simulation).
3. Verify that generate-latex.mjs actually executes pdflatex and that the resulting PDFs are authentic, valid documents.
4. Verify strict compliance with constraints: zero emojis anywhere, zero colcon build invocations, all work strictly confined to /home/opyntorr/career-ops.
5. Check git status to ensure no unauthorized files or script modifications occurred.

Write your audit report to /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_auditor_1/handoff.md.
State your explicit verdict as either CLEAN or INTEGRITY VIOLATION.
When finished, send a brief message to the orchestrator notifying completion.
