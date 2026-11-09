# Project: Evaluation of 14 Tecnologico de Monterrey Job Postings

## Architecture
- **Raw JD Source**: `/home/opyntorr/career-ops/.agents/teamwork/teamwork_preview_explorer_survey_1/raw_postings_catalog.json` and `handoff.md`.
- **Candidate Ground Truth**: `/home/opyntorr/career-ops/cv.md`, `/home/opyntorr/career-ops/config/profile.yml`, `/home/opyntorr/career-ops/modes/_profile.md`.
- **Report Reservation**: `node reserve-report-num.mjs --count 14` (Range: 289 to 302).
- **Reports Storage**: `reports/{###}-{company-slug}-{date}.md` (Blocks A-G, Machine Summary YAML with verbatim `advertised_comp`).
- **CV Output**: `output/cv-christian-omar-payan-torrontegui-{company-slug}-{role-slug}-{report#}-{lang}.tex` and `.pdf`.
  - Preamble localization for Spanish CVs (`\educationItemEs`, `\renewcommand{\summary}`).
  - Strict 1-page Harvard compliance (`pdfinfo <pdf> | grep Pages`).
- **Tracker**: `data/applications.md` (9 columns, canonical states from `templates/states.yml`, no emojis).
- **Validation**: Independent E2E test runner checking all deliverables against acceptance criteria.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Report Slot Reservation | Reserve report slots 289-302 via atomic reservation script | M1 | survey |
| 2 | Evaluation 1: GC CORPORATIVO (149201) | Analista de Datos (Spanish) evaluation & report | M1 | survey |
| 3 | Evaluation 2: HayCash (149172) | Analista Jr. de Innovacion, Procesos e IA (Spanish) evaluation & report | M1 | survey |
| 4 | Evaluation 3: Abril Barrientos / Talento (149069) | Product Operation Analyst - Junior (Spanish JD, English CV) evaluation & report | M1 | survey |
| 5 | Evaluation 4: Insofos/Daptta (148915) | Ingeniero de diseno de maquinas CNC (English JD) evaluation & report | M1 | survey |
| 6 | Evaluation 5: Baltra (148877) | AI Product Engineer (English) evaluation & report | M1 | survey |
| 7 | Evaluation 6: Empresa de Cuidado Personal (148853) | Ingeniero Mecatronico de Procesos (Spanish) evaluation & report | M1 | survey |
| 8 | Evaluation 7: Empleador Confidencial Mty (148762) | Desarrollador de codigo con IA (Spanish) evaluation & report | M1 | survey |
| 9 | Evaluation 8: Huawei Digital Power (148702) | Digital Power Engineer (Fresh Graduate) (English) evaluation & report | M2 | survey |
| 10 | Evaluation 9: Caterpillar (148409) | Computer Science Intern (English) evaluation & report | M2 | survey |
| 11 | Evaluation 10: Huawei Core Network (148341) | Core Network Support Engineer (Fresh Graduate) (English) evaluation & report | M2 | survey |
| 12 | Evaluation 11: Huawei Wireless (148340) | Wireless Support Engineer (Fresh Graduate) (English) evaluation & report | M2 | survey |
| 13 | Evaluation 12: Empleador Confidencial CDMX (148204) | Revenue Systems Lead (Automation & Data) (Spanish) evaluation & report | M2 | survey |
| 14 | Evaluation 13: Greenprint (148009) | Ingeniero en Sistemas (Spanish) evaluation & report | M2 | survey |
| 15 | Evaluation 14: London Consulting Group (148314) | Consultor de Operaciones y Transformacion Digital (Spanish) evaluation & report | M2 | survey |
| 16 | Specialized LaTeX CV Generation | 1-page Harvard CVs in output/ (.tex and .pdf) for viable roles | M3 | survey |
| 17 | Tracker Synchronization | Register all 14 applications in data/applications.md | M4 | survey |
| 18 | E2E Testing Suite & Architecture | Design opaque-box automated test suite verifying all 14 reports, PDFs, pages, tracker | M-E2E | survey |
| 19 | Quality Audit & Final Verification Gate | Independent Reviewer, Challenger, and Forensic Auditor verification | M5 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Report Reservation & Batch 1 Evaluation (Jobs 1-7) | Reserve 289-302; generate reports 289-295 (GC, HayCash, Abril Barrientos, Insofos, Baltra, Cuidado Personal, Confidencial Mty) | none | DONE |
| M2 | Batch 2 Evaluation (Jobs 8-14) | Generate reports 296-302 (Huawei Digital Power, Caterpillar, Huawei Core Net, Huawei Wireless, Confidencial CDMX, Greenprint, London Consulting) | M1 | DONE |
| M3 | Specialized 1-Page LaTeX CV Generation | Generate .tex and compile .pdf for viable roles with language matching and 1-page strict compliance | M1, M2 | DONE |
| M4 | Applications Tracker Synchronization | Update data/applications.md with rows 289-302 | M1, M2, M3 | IN_PROGRESS |
| M-E2E | E2E Testing Suite (Parallel Track) | Build automated test suite for all deliverables and publish TEST_READY.md | none | DONE |
| M5 | Quality Audit & Final Verification Gate | Reviewers, Challengers, and Forensic Auditor verification against all constraints | M3, M4, M-E2E | PLANNED |

## Interface Contracts
### Evaluation Reports ↔ LaTeX CV Generation
- Reports assign a quantitative score (1.0 to 5.0) and determine viability (score >= 3.0).
- Reports determine language of CV: English for English postings (Huawei, Caterpillar, Baltra, Abril Barrientos, Insofos), Spanish for Spanish postings.
- Customization plan (Block E) and top strengths provide tailored bullets for the CV.
- Truthful content only: all bullets must be backed by `cv.md`.

### Evaluation Reports & CV Output ↔ Applications Tracker
- Tracker row format: `| {###} | {Date} | {Company} | {Role} | {Score}/5 | Evaluated | {PDF link or -} | [Report](../reports/{file}.md) | {Notes} |`.
- Status is strictly `Evaluated`. No emojis in notes or anywhere in table.

### E2E Test Suite ↔ Final Verification Gate
- Test command: `node tests/verify-tec-batch.mjs`
- Checks:
  1. Exactly 14 reports exist with numbers 289 to 302.
  2. Each report contains Blocks A-G, YAML machine summary with `advertised_comp`, no emojis.
  3. All viable roles have compiled PDFs in `output/`.
  4. Each PDF has exactly 1 page verified via `pdfinfo`.
  5. Spanish PDFs have zero residual English tokens (`SUMMARY`, `Graduating`, `Relevant coursework`).
  6. `data/applications.md` contains valid rows and links for all 14 reports.

## Code Layout
- `reports/`: Markdown evaluation reports (`{###}-{company-slug}-{date}.md`).
- `output/`: LaTeX sources (`cv-christian-omar-payan-torrontegui-{slug}-{lang}.tex`) and compiled PDFs.
- `data/applications.md`: Application tracking table.
- `tests/verify-tec-batch.mjs`: E2E verification test suite.
- `.agents/teamwork/`: Metadata, plans, briefings, progress reports (never code or user deliverables).
