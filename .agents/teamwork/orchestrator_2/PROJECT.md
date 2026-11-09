# Project: 30 Job Postings Evaluation & Processing Pipeline

## Architecture
- Input: `/home/opyntorr/Downloads/puestosIndeed.pdf` (77 pages, 30 distinct job listings)
- Profile Truth: `cv.md`, `config/profile.yml`, `modes/_profile.md`
- Report Generator & Rubric: Standard career-ops Block A-G evaluation structure with legitimacy analysis and advertised compensation machine summary
- CV Generation Engine: `templates/cv-template.tex`, `resume.cls`, compiled with `node generate-latex.mjs`
- Tracker Sink: `data/applications.md`
- Verification Suite: `pdfinfo` (1-page strict check), Node.js Unicode regex (zero emoji check), `node verify-pipeline.mjs`

## Feature Inventory
| # | Job Title | Company | Location | Comp / Stated Salary | Language | Viable (Score >= 3.0) | Assigned Milestone | Source |
|---|-----------|---------|----------|----------------------|----------|-----------------------|--------------------|--------|
| 1 | Video Processor | Emerge | Remote / Mexico | Non-disclosed | English | No (2.0) | M1, M3 | survey |
| 2 | Auxiliar Mecatronico | CONSTRUOBRA | Mazatlan, Sin. | $3,000 / week ($12,000/mo) | Spanish | Yes (3.6) | M1, M2, M3 | survey |
| 3 | AI Vision Specialist Jr | TotalEnergies | Remote / Mexico | Non-disclosed | Spanish | Yes (4.8) | M1, M2, M3 | survey |
| 4 | Ingeniero/a de Vision por Computadora Junior | OMNIA SECURITA | Polanco, CDMX | $15,000 - $18,000 / mo | Spanish | Yes (4.6) | M1, M2, M3 | survey |
| 5 | AI/ML Engineer - Computer Vision & Robotics | Nurvai | Guadalajara, Jal. | $40,000 - $45,000 / mo | Spanish | Yes (4.9) | M1, M2, M3 | survey |
| 6 | Remote Robot Operator (Teleoperation) | Sunscreen Inc. | Remote / Mexico | $15 - $20 USD / hr | English | Yes (4.5) | M1, M2, M3 | survey |
| 7 | Programador de robot | KATCON | Santa Catarina, N.L. | $17,000 - $21,000 / mo | Spanish | Yes (3.4) | M1, M2, M3 | survey |
| 8 | Ingeniero Electronico Jr. / Desarrollo IoT | WASSER CONTROL | Morelos | $9,000 - $9,200 / mo | Spanish | Yes (4.4) | M1, M2, M3 | survey |
| 9 | Practicante de IoT | Denso Mexico | Guanajuato / Mexico | Non-disclosed | Spanish | Yes (4.2) | M1, M2, M3 | survey |
| 10 | Ingeniero Mecatronico | SOLMIN TECH | Coahuila | $15,000 - $20,700 / mo | Spanish | Yes (4.8) | M1, M2, M3 | survey |
| 11 | Soporte Tecnico Especializado | Pegasus Control | Guadalajara / Tlaquepaque | Non-disclosed | Spanish | Yes (3.5) | M1, M2, M3 | survey |
| 12 | Ingeniero/a de Industria 4.0 | Bosch Group | Guadalajara, Jal. | Non-disclosed | English | Yes (3.5) | M1, M2, M3 | survey |
| 13 | Industrial IoT (IIoT) Engineer | Mattel | Nuevo Leon | Non-disclosed | English | Yes (3.5) | M1, M2, M3 | survey |
| 14 | Embedded Software Engineer (Edge Platform) | Aptiv plc | Mexico / Remote | Non-disclosed | English | No (2.5) | M1, M3 | survey |
| 15 | Analista en Inteligencia Artificial Junior | Master Loyalty Group | Home Office | Non-disclosed | Spanish | Yes (4.1) | M1, M2, M3 | survey |
| 16 | Jr. Software Engineer - MX | Neumo Holdings LLC | Guadalajara / Home Office | Non-disclosed | English | Yes (4.2) | M1, M2, M3 | survey |
| 17 | Data Scientist (AI) | Acute Talent | Home Office | Non-disclosed | Spanish | No (2.2) | M1, M3 | survey |
| 18 | AI Developer | Datamatic Software | Home Office | Non-disclosed | Spanish | Yes (3.8) | M1, M2, M3 | survey |
| 19 | Arquitecto de pruebas automatizadas | CONTPAQi | Guadalajara, Jal. | Non-disclosed | Spanish | No (2.4) | M1, M3 | survey |
| 20 | Becario de Automatizacion (Excel) | CONSEDE | Home Office | Non-disclosed | Spanish | Yes (4.3) | M1, M2, M3 | survey |
| 21 | Analista de Datos / BI Analyst | Master Loyalty Group | Home Office | Non-disclosed | Spanish | Yes (3.6) | M1, M2, M3 | survey |
| 22 | (DBO) Desarrollador en BBDD | Master Loyalty Group | Home Office | Non-disclosed | Spanish | Yes (3.6) | M1, M2, M3 | survey |
| 23 | DevOps Engineer | MojoHire | Guadalajara / Remote | Non-disclosed | English | No (2.3) | M1, M3 | survey |
| 24 | Jr. Software Engineer | Neumo Holdings LLC | Guadalajara / Remote | Non-disclosed | English | Yes (3.8) | M1, M2, M3 | survey |
| 25 | Body Design and Release Engineer Jr | ALTEN MEXICO | Automotriz / Saltillo | Non-disclosed | English | Yes (3.7) | M1, M2, M3 | survey |
| 26 | Data Analyst | Amwest Funding Mexico | Mazatlan, Sin. | Non-disclosed | English | Yes (3.8) | M1, M2, M3 | survey |
| 27 | Staff en Desarrollo y Automatizacion con IA | KPMG Mexico | Zapopan / Medio tiempo | Non-disclosed | Spanish | Yes (5.0) | M1, M2, M3 | survey |
| 28 | Desarrollador de Escritorio | Grupo Panama | Mazatlan, Sin. | $20,000 / mo | Spanish | Yes (3.8) | M1, M2, M3 | survey |
| 29 | Backend Developer | Amwest Funding Mexico | Marina Mazatlan, Sin. | $22,000 - $25,000 / mo | English | Yes (3.8) | M1, M2, M3 | survey |
| 30 | Tecnico de Soporte en Campo | GRUPO PISSA | Sinaloa | $500 - $900 / day | Spanish | Yes (3.4) | M1, M2, M3 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Batch Report Generation | Reserve slots 257-286, generate all 30 reports in reports/ with Blocks A-G, legitimacy, advertised comp, zero emojis | Survey complete | IN_PROGRESS |
| M2 | Specialized LaTeX CV & PDF Compilation | For 25 viable roles: generate .tex, compile .pdf via generate-latex.mjs, strictly 1-page Harvard layout, zero English residual macros for Spanish CVs, 100% authentic cv.md experience | M1 in progress / interface defined | PLANNED |
| M3 | Application Tracker Synchronization | Update data/applications.md with 30 rows, score format X.X/5, canonical status Evaluated, report/PDF links, verify-pipeline.mjs pass | M1, M2 | PLANNED |
| M4 | Verification, Challenger & Integrity Audit Gate | Reviewers, Challengers, and Forensic Auditor verification across all deliverables | M1, M2, M3 | PLANNED |

## Interface Contracts
### Report Generation (M1) -> CV Generation (M2)
- Report Numbers: Reserved slots 257 to 286 mapped 1:1 to Jobs 1 through 30.
- Report Path: `reports/{report_num}-{company_slug}-{YYYY-MM-DD}.md`
- PDF Output Path: `output/{report_num}-{company_slug}-{role_slug}.pdf` (and corresponding `.tex` in `output/`)
- Score >= 3.0 triggers mandatory CV generation in M2. Score < 3.0 records `-` in PDF column.

### Language Rules
- If posting in English (Jobs 6, 12, 13, 16, 24, 25, 26, 29): CV in English Harvard format (`Summary`, `Experience`, `Education`, `Technical Skills`, `Relevant Projects`).
- If posting in Spanish (Jobs 2, 3, 4, 5, 7, 8, 9, 10, 11, 15, 18, 20, 21, 22, 27, 28, 30): CV in Spanish Harvard format (`Perfil Profesional`, `Experiencia Laboral`, `Educacion`, `Habilidades Tecnicas`, `Proyectos Relevantes`).
- NO residual English macros (`Summary`, `Graduating`, `Relevant coursework:`, `Bachelor of Science`) in Spanish CVs.

### Code and Output Layout
- Reports: `/home/opyntorr/career-ops/reports/`
- LaTeX & PDFs: `/home/opyntorr/career-ops/output/`
- Tracker: `/home/opyntorr/career-ops/data/applications.md`
- State & Teamwork: `/home/opyntorr/career-ops/.agents/teamwork/`
