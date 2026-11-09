# Project: Mazatlan Job Postings Technical Evaluation and Specialized LaTeX CVs

## Architecture
- Analysis & Scoring: Evaluation of 5 job postings against candidate profile (cv.md, config/profile.yml, modes/_profile.md) using oferta.md 7-block schema (Blocks A-F + G).
- Number Reservation: Atomic acquisition of report numbers 252-256 via reserve-report-num.mjs.
- CV Generation: Harvard format (resume.cls) 1-page LaTeX CVs in Spanish for viable technical roles with zero residual English macros.
- PDF Compilation: Compilation via node generate-latex.mjs and validation via pdfinfo (Pages: 1).
- Tracking: Registration in data/applications.md under status Evaluated with valid report and PDF links.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Report Reservation | Reserve 5 report slots atomically (252-256) | M1 | Survey |
| 2 | Evaluation Reports | Author 5 complete reports in reports/ (Blocks A-F + G) | M1 | Survey |
| 3 | Release Sentinels | Release 252-256 sentinels once reports exist | M1 | Survey |
| 4 | LaTeX CV Generation | Create 3 tailored Spanish .tex files in output/ for viable roles | M2 | Survey |
| 5 | PDF Compilation | Compile 3 CVs via generate-latex.mjs & verify Pages: 1 | M2 | Survey |
| 6 | Tracker Update | Prepend 5 entries to data/applications.md | M3 | Survey |
| 7 | Independent Gate Verification | Reviewers, Challengers, Auditor verification | M4 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Evaluation Reports & Reservation | Reports 252-256 in reports/ | none | IN_PROGRESS |
| M2 | Specialized LaTeX CVs & Compilation | 3 Spanish 1-page CVs in output/ | M1 | IN_PROGRESS |
| M3 | Applications Tracker Registration | data/applications.md updated | M1, M2 | IN_PROGRESS |
| M4 | Gate & Forensics Verification | Reviewers, Challengers, Auditor | M1, M2, M3 | PLANNED |

## Code Layout
- `reports/252-grupo-cosmic-promotor-tecnologia-2026-10-16.md`
- `reports/253-atento-promotor-telefonia-2026-10-16.md`
- `reports/254-ver-de-verdad-laboratorio-optico-2026-10-16.md`
- `reports/255-tintec-tecnico-impresoras-2026-10-16.md`
- `reports/256-grupo-cosmic-tecnico-vending-2026-10-16.md`
- `output/cv-christian-omar-payan-torrontegui-ver-de-verdad-254-es.tex` & `.pdf`
- `output/cv-christian-omar-payan-torrontegui-tintec-255-es.tex` & `.pdf`
- `output/cv-christian-omar-payan-torrontegui-grupo-cosmic-vending-256-es.tex` & `.pdf`
- `data/applications.md`
