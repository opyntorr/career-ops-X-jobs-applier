# Handoff Report: Survey Explorer 3 (Pipeline Infrastructure)

## 1. Observation

Direct observations from codebase inspection and verification commands:

1. **Original User Request Scope and Directives:**
   - Source: `/home/opyntorr/career-ops/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 52-124).
   - Task: Evaluate 30 job postings from `/home/opyntorr/Downloads/puestosIndeed.pdf`.
   - Geographic relocation: "Politica de Reubicacion Total: NO descartar ninguna vacante por ubicacion geografica; el candidato esta 100% abierto a mudarse a cualquier estado/ciudad de la Republica Mexicana por trabajo." (line 96).
   - Language rule: "Vacantes publicadas en ingles: Generar CV en ingles tecnico/profesional con formato Harvard. Vacantes publicadas en espanol: Generar CV en espanol sin textos residuales de macros en ingles (Summary, Graduating, Relevant coursework:)." (lines 101-102).

2. **Report Number Reservation (`reserve-report-num.mjs`):**
   - File: `/home/opyntorr/career-ops/reserve-report-num.mjs` lines 12-23 and 106-165.
   - Mechanism: Creates atomic sentinels named `reports/NNN-RESERVED.md` with `fs.writeFileSync(path, data, { flag: 'wx' })` mapping to `open(O_CREAT | O_EXCL)`.
   - Current state: Scanning `reports/` shows the highest occupied report slot is `256` (`reports/256-grupo-cosmic-tecnico-vending-2026-10-16.md`).
   - Next available report slot is `257`.
   - Reservation for 30 slots: Command `node reserve-report-num.mjs --count 30` reserves contiguous range `257-286` (within `MAX_COUNT = 50`).

3. **Report Structure & Scoring Rubric (`reports/` and `modes/`):**
   - Format: `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.
   - Reports feature: Title `# Evaluation: {Company} — {Role}`, Metadata Header (Date, URL, Via, Archetype, Score, Legitimacy, PDF), YAML `## Machine Summary` fence with `advertised_comp`, followed by Blocks A through G, Cover Letter Draft, and ATS Keywords.
   - Reference files: `modes/oferta.md` (lines 38-333), `modes/_shared.md` (lines 35-104), and `reports/256-grupo-cosmic-tecnico-vending-2026-10-16.md`.
   - Global score: Scale 1.0 to 5.0 (CV Match 40%, North Star 25%, Comp 15%, Culture 10%, Red flags adjustment).
   - Legitimacy tiers: `High Confidence`, `Proceed with Caution`, `Suspicious`.
   - CV generation threshold: `Score >= 3.0`.

4. **LaTeX Compilation and Harvard Template (`generate-latex.mjs`, `resume.cls`):**
   - File: `/home/opyntorr/career-ops/generate-latex.mjs`.
   - System LaTeX engine: `/usr/bin/pdflatex` is installed and verified. `tectonic` is absent.
   - Compilation call: `node generate-latex.mjs <input.tex> [output.pdf]`.
   - Validation checks: Section count >= 4 (`\section{`, `\sectionTitle{`, or `\begin{...Section}`), no CJK characters, document environment tags.
   - Hardcoded English strings in `templates/resume.cls`:
     - Line 124: `\newcommand{\summary}[1]{\sectionTitle{Summary} #1}`
     - Lines 146-157: `\educationItem` hardcodes `Graduating \commandkey{graduation}` and `Relevant coursework: \commandkey{coursework}`.
   - Successful Spanish override pattern observed in `output/cv-christian-omar-payan-torrontegui-tintec-255-es.tex` (lines 3-34):
     - `\renewcommand{\summary}[1]{\sectionTitle{Resumen Profesional} #1}`
     - Definition of `\educationItemEs` replacing English text with Spanish terms.
   - Page count test on `output/cv-christian-omar-payan-torrontegui-tintec-255-es.pdf` via `pdfinfo`: `Pages: 1`.

5. **Application Tracker (`data/applications.md`):**
   - Header: `| # | Date | Company | Role | Score | Status | PDF | Report | Notes |`
   - Canonical status: `Evaluated` for evaluated postings (per `templates/states.yml` and `merge-tracker.mjs` line 101).
   - Crucial format constraint from `verify-pipeline.mjs` line 190:
     `if (!/^\d+\.?\d*\/5$/.test(s) && s !== 'N/A' && s !== 'DUP')`
     All scores in the tracker MUST have the `/5` suffix (e.g. `4.2/5`). Bare numbers trigger verification errors.

6. **System Constraints:**
   - Emojis strictly prohibited across all project files, logs, and communications.
   - Zero emoji validation using Node.js ECMAScript regex `/\p{Extended_Pictographic}/u`.

---

## 2. Logic Chain

1. From Observation 1, the user provided 30 job postings in `puestosIndeed.pdf` and mandated a total relocation policy where zero positions are penalized for location, alongside language-matched CV generation.
2. From Observation 2, `maxSlot()` in `reports/` is currently 256. Reserving 30 report numbers via `node reserve-report-num.mjs --count 30` guarantees conflict-free contiguous slots `257-286` through atomic file creation with `{ flag: 'wx' }`.
3. From Observation 3, the established schema for evaluation reports requires Blocks A through G, Machine Summary with `advertised_comp`, Cover Letter Draft, and ATS Keywords. The scoring rubric maps viability at `>= 3.0`, triggering tailored CV generation.
4. From Observation 4, `templates/resume.cls` hardcodes `Summary`, `Graduating`, and `Relevant coursework:`. To satisfy the requirement of zero English residual macros in Spanish CVs, Spanish `.tex` files must re-declare `\summary` and declare `\educationItemEs` (or equivalent redefinitions) and use Spanish section headings (`Educacion`, `Habilidades Tecnicas`, `Experiencia Laboral`, `Proyectos Tecnicos`).
5. From Observation 4, `/usr/bin/pdflatex` is available on the host machine. Running `node generate-latex.mjs` validates and compiles `.tex` files into `.pdf`, and using compact vertical spacing (`\itemsep -9pt {}`, `\vspace{-0.5em}`) ensures the output strictly meets the 1-page Harvard layout confirmed by `pdfinfo`.
6. From Observation 5, tracker integration into `data/applications.md` requires descending rows, canonical `Evaluated` status, and strictly formatted scores ending in `/5` to pass `verify-pipeline.mjs`.
7. From Observation 6, automated checking with ECMAScript `/\p{Extended_Pictographic}/u` ensures zero emojis exist in generated reports, tex files, and tracker lines.

---

## 3. Caveats

1. The exact job postings text and language breakdown (English vs. Spanish) are contained in `/home/opyntorr/Downloads/puestosIndeed.pdf`. Survey Explorer 1 / Survey Explorer 2 inspect the PDF contents and candidate fit; this infrastructure report provides the operational mechanics, tools, and templates.
2. `verify-pipeline.mjs` currently shows historical errors on older legacy entries in `data/applications.md` (lines that used bare numbers without `/5` before slot 252). New rows (from 252 onward) correctly use `X.X/5` and do not produce errors.
3. Tectonic is not installed on the host system; however, `/usr/bin/pdflatex` is fully functional and supported natively by `generate-latex.mjs`.

---

## 4. Conclusion

The pipeline infrastructure in `/home/opyntorr/career-ops` is fully operational and verified to process the 30 job postings:
- Report numbers: Reserve slots `257-286` with `node reserve-report-num.mjs --count 30`.
- Evaluation reports: Standardize on Blocks A-G, Machine Summary with `advertised_comp`, and Cover Letter Draft in `reports/{257..286}-{slug}-2026-10-16.md`.
- LaTeX CVs: For viable roles (score >= 3.0), mirror the posting language. For Spanish CVs, apply the macro redefinition pattern (`\summary` and `\educationItemEs`). Compile with `node generate-latex.mjs`.
- Tracker sync: Prepend entries to `data/applications.md` with format `# | Date | Company | Role | Score/5 | Evaluated | [PDF](...) | [###](...) | Notes`.
- Verification: Validate with `pdfinfo output/*.pdf | grep Pages` (= 1), zero emoji scanner, and `node verify-pipeline.mjs`.

Detailed operational documentation is available in `survey_pipeline_infra.md`.

---

## 5. Verification Method

Independently verify the findings and toolchain with these commands:

1. Verify next available report slot:
   ```bash
   node -e '
   const fs = require("fs");
   const entries = fs.readdirSync("reports");
   let max = 0;
   for (const name of entries) {
     const m = name.match(/^(\d{3})-/);
     if (m) max = Math.max(max, parseInt(m[1], 10));
   }
   console.log("Current max slot:", max, "Next available:", max + 1);
   '
   ```
   Expected: `Current max slot: 256 Next available: 257`.

2. Test LaTeX compilation and 1-page check:
   ```bash
   node generate-latex.mjs output/cv-christian-omar-payan-torrontegui-tintec-255-es.tex output/cv-christian-omar-payan-torrontegui-tintec-255-es.pdf
   pdfinfo output/cv-christian-omar-payan-torrontegui-tintec-255-es.pdf | grep "^Pages:"
   ```
   Expected: `compiled: true`, `Pages:           1`.

3. Verify zero emojis in deliverables:
   ```bash
   node -e '
   const fs = require("fs");
   const regex = /\p{Extended_Pictographic}/u;
   const target = ".agents/teamwork/teamwork_preview_explorer_survey2_3/survey_pipeline_infra.md";
   const hasEmoji = regex.test(fs.readFileSync(target, "utf8"));
   console.log("survey_pipeline_infra.md emoji violation:", hasEmoji);
   if (hasEmoji) process.exit(1);
   '
   ```
   Expected: `survey_pipeline_infra.md emoji violation: false`.
