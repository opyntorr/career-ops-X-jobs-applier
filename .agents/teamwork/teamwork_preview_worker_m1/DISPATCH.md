# Dispatch: Worker Milestone 1 (Report Reservation & Batch 1 Evaluations)

Working directory: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_m1/
Project root: /home/opyntorr/career-ops

Task:
1. Reserve 14 report numbers by running:
   `node reserve-report-num.mjs --count 14`
   This will allocate slots 289 to 302. Verify the sentinels created.
2. Evaluate and generate complete evaluation reports for Batch 1 (Jobs 1-7):
   - Report 289: GC CORPORATIVO (ID: 149201) — Analista de Datos (Guadalajara, JAL)
     File: `reports/289-gc-corporativo-analista-datos-2026-10-18.md`
   - Report 290: HayCash (ID: 149172) — Analista Jr. de Innovacion, Procesos e IA (CDMX, $25,000 - $30,000/mes)
     File: `reports/290-haycash-analista-jr-innovacion-procesos-ia-2026-10-18.md`
   - Report 291: Abril Barrientos / Talento (ID: 149069) — Product Operation Analyst - Junior | Remote (Remote, $35,000 - $40,000/mes)
     File: `reports/291-abril-barrientos-product-operation-analyst-junior-2026-10-18.md`
   - Report 292: Insofos / Daptta (ID: 148915) — Ingeniero de diseno de maquinas CNC (Guadalajara, JAL, $25,000 - $27,000/mes)
     File: `reports/292-insofos-daptta-ingeniero-diseno-maquinas-cnc-2026-10-18.md`
   - Report 293: Baltra (ID: 148877) — AI Product Engineer (CDMX, $30,000 - $60,000/mes)
     File: `reports/293-baltra-ai-product-engineer-2026-10-18.md`
   - Report 294: Empresa de Cuidado Personal (ID: 148853) — Ingeniero Mecatronico de Procesos (Tlaxcala/Varias, $25,000 - $30,000/mes)
     File: `reports/294-empresa-cuidado-personal-ingeniero-mecatronico-procesos-2026-10-18.md`
   - Report 295: Empleador Confidencial Mty (ID: 148762) — Desarrollador de codigo con Inteligencia Artificial (Monterrey, NLE, $25,000 - $30,000/mes)
     File: `reports/295-confidencial-mty-desarrollador-codigo-ia-2026-10-18.md`

Requirements for Reports:
- Use unabridged JD data from `/home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_1/raw_postings_catalog.json` and `handoff.md`.
- Match against `/home/opyntorr/career-ops/cv.md`, `/home/opyntorr/career-ops/config/profile.yml`, `/home/opyntorr/career-ops/modes/_profile.md`.
- Follow exact 7-block standard from modern reports (e.g. `reports/288-nexaminds-ai-solutions-intern-2026-10-17.md`):
  * Header
  * Machine Summary YAML code block (`advertised_comp` MUST be verbatim JD text or null)
  * `## A) Role Summary`
  * `## B) Match with CV` (plus `### Gaps and Mitigations`)
  * `## C) Level and Strategy`
  * `## D) Comp and Demand` (First row Advertised JD)
  * `## E) Customization Plan`
  * `## F) Interview Plan` (STAR+R table)
  * `## G) Posting Legitimacy` (Tier: High Confidence, Proceed with Caution, or Suspicious, with observed signals)
  * `## Cover Letter Draft`
  * `## Keywords extracted`
- Language rule:
  * Spanish roles: report in Spanish.
  * English roles (Insofos CNC, Baltra AI Product Engineer): report in English or Spanish, but note English CV required.
- Release sentinels 289-295 after writing via `node reserve-report-num.mjs --release 289-295`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

NEVER use emojis anywhere.
NEVER run colcon build.


## 2026-10-18T05:42:31Z
You are teamwork_preview_worker_m1.
Your working directory is: /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_m1/
You must read /home/opyntorr/career-ops/.agents/teamwork/ORIGINAL_REQUEST.md (specifically the section "## 2026-10-18T05:29:39Z") and /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_m1/DISPATCH.md.

Task:
1. Reserve 14 report numbers by running:
   `node reserve-report-num.mjs --count 14`
   This will allocate slots 289 to 302.
2. Evaluate and generate complete evaluation reports for Batch 1 (Jobs 1-7):
   - Report 289: GC CORPORATIVO (ID: 149201) — Analista de Datos (Guadalajara, JAL)
     File: `reports/289-gc-corporativo-analista-datos-2026-10-18.md`
   - Report 290: HayCash (ID: 149172) — Analista Jr. de Innovacion, Procesos e IA (CDMX, $25,000 - $30,000/mes)
     File: `reports/290-haycash-analista-jr-innovacion-procesos-ia-2026-10-18.md`
   - Report 291: Abril Barrientos / Talento (ID: 149069) — Product Operation Analyst - Junior | Remote (Remote, $35,000 - $40,000/mes)
     File: `reports/291-abril-barrientos-product-operation-analyst-junior-2026-10-18.md`
   - Report 292: Insofos / Daptta (ID: 148915) — Ingeniero de diseno de maquinas CNC (Guadalajara, JAL, $25,000 - $27,000/mes)
     File: `reports/292-insofos-daptta-ingeniero-diseno-maquinas-cnc-2026-10-18.md`
   - Report 293: Baltra (ID: 148877) — AI Product Engineer (CDMX, $30,000 - $60,000/mes)
     File: `reports/293-baltra-ai-product-engineer-2026-10-18.md`
   - Report 294: Empresa de Cuidado Personal (ID: 148853) — Ingeniero Mecatronico de Procesos (Tlaxcala/Varias, $25,000 - $30,000/mes)
     File: `reports/294-empresa-cuidado-personal-ingeniero-mecatronico-procesos-2026-10-18.md`
   - Report 295: Empleador Confidencial Mty (ID: 148762) — Desarrollador de codigo con Inteligencia Artificial (Monterrey, NLE, $25,000 - $30,000/mes)
     File: `reports/295-confidencial-mty-desarrollador-codigo-ia-2026-10-18.md`

Input Sources:
- Unabridged JD catalog: `/home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_1/raw_postings_catalog.json` and `handoff.md`.
- Candidate Master CV: `/home/opyntorr/career-ops/cv.md`, `/home/opyntorr/career-ops/config/profile.yml`, `/home/opyntorr/career-ops/modes/_profile.md`.
- Reference standard report: `/home/opyntorr/career-ops/reports/288-nexaminds-ai-solutions-intern-2026-10-17.md`.

Report Format & Requirements:
- Header with title, date, URL, Via (Tec de Monterrey Bolsa de Trabajo), Archetype, Score, Legitimacy, PDF link.
- Machine Summary YAML block directly after header (must include `advertised_comp` with verbatim JD text or null, `score`, `legitimacy_tier`).
- `## A) Role Summary`
- `## B) Match with CV` (table + `### Gaps and Mitigations`)
- `## C) Level and Strategy`
- `## D) Comp and Demand` (first row Advertised JD)
- `## E) Customization Plan`
- `## F) Interview Plan` (STAR+R table)
- `## G) Posting Legitimacy`
- `## Cover Letter Draft`
- `## Keywords extracted`
- After writing reports 289-295, release sentinels: `node reserve-report-num.mjs --release 289-295`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Rules:
- NEVER use emojis in any file, report, log or message.
- NEVER run colcon build.
- Write your completion handoff to /home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_worker_m1/handoff.md and notify caller via send_message.
