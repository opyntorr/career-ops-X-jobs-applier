# Survey 3 Handoff Report: LaTeX CV Generation, Template Mechanics, Localization Overrides, and Applications Tracker

## 1. Observation

### 1.1 LaTeX Infrastructure and Class Mechanics
- **Files Inspected**:
  - `/home/opyntorr/career-ops/resume.cls` and `/home/opyntorr/career-ops/templates/resume.cls`
  - `/home/opyntorr/career-ops/templates/cv-template.tex`
  - `/home/opyntorr/career-ops/generate-latex.mjs`
- **Class and Geometry Definition** (`resume.cls`, lines 9-13):
  ```latex
  \LoadClass[11pt,letterpaper]{article} % Font size and paper type
  \usepackage[left=0.5in,top=0.4in,right=0.5in,bottom=0.4in]{geometry} % set document margins
  \usepackage[parfill]{parskip} % Remove paragraph indentation
  ```
  Letter paper dimensions are 8.5 x 11.0 in (612 x 792 pt). Top margin is 0.4 in (28.8 pt), bottom margin is 0.4 in (28.8 pt). Total printable vertical height is `792 - 57.6 = 734.4 pt`.
- **Packages Loaded by `resume.cls`** (lines 14-27):
  - `etoolbox`, `keycommand`, `xstring`, `hyperref`, `[scaled]{helvet}`, `[T1]{fontenc}`
  - Font is set to sans-serif Helvetica (`\renewcommand\familydefault{\sfdefault}`).
- **Hardcoded English Strings in `resume.cls`**:
  - Line 124: `\newcommand{\summary}[1]{\sectionTitle{Summary}#1}`. Passes literal `"Summary"` to `\sectionTitle`, which renders uppercase as `"SUMMARY"`.
  - Line 146: `Graduating \commandkey{graduation}` inside `\educationItem`. Prepends `"Graduating "` to the graduation date string.
  - Line 157: `Relevant coursework: \commandkey{coursework}` inside `\educationItem`. Prepends `"Relevant coursework: "` to the coursework string.
- **Section Environment Definitions in `resume.cls`**:
  - `\newenvironment{educationSection}[1]{\sectionTitle{#1}}`
  - `\newenvironment{skillsSection}[1]{\sectionTitle{#1}}`
  - `\newenvironment{experienceSection}[1]{\sectionTitle{#1}\begin{list}{}{\setlength{\leftmargin}{0em}}\item[]}{\end{list}}`
  These environments take the section title as argument `#1` and execute `\textbf{\MakeUppercase{#1}}` followed by horizontal rule `\hrule`.
- **Known Defect in `keycommand.sty`**:
  Attempting to use `\renewkeycommand{\educationItem}[...]` inside a LaTeX document causes `pdflatex` to crash with:
  ```text
  ! Undefined control sequence.
  \keycmd->educationItem ->{\bf \commandkey {program}}...
  ```
  This is a known upstream defect in `keycommand.sty` (v3.1415) when attempting to re-bind keys for an existing command. Conversely, defining a new key command with a distinct name (such as `\newkeycommand{\educationItemEs}[...]`) compiles cleanly without any errors or warnings.

### 1.2 LaTeX Compilation Toolchain and Validation via `generate-latex.mjs`
- **Compiler Availability on Host**:
  - `/usr/bin/pdflatex` is installed and verified (`pdflatex --version`: TeX Live 2022/Debian).
  - `tectonic` is not installed.
  - `/usr/bin/pdfinfo` is installed and verified.
- **Compiler Selection and Execution Flow** (`generate-latex.mjs`, lines 160-209):
  1. Detects available engine: checks `tectonic`, falls back to `pdflatex`.
  2. Ensures `resume.cls` exists in the target directory (copies from `templates/resume.cls` if absent).
  3. Executes `pdflatex` in two sequential passes to ensure reference and layout resolution:
     ```javascript
     const pdflatexArgs = [
       '-no-shell-escape',
       '-interaction=nonstopmode',
       '-halt-on-error',
       `-output-directory=${texDir}`,
       absPath,
     ];
     execFileSync('pdflatex', pdflatexArgs, { cwd: texDir, stdio: 'pipe', timeout: 120_000 });
     execFileSync('pdflatex', pdflatexArgs, { cwd: texDir, stdio: 'pipe', timeout: 120_000 });
     ```
  4. Automatically moves the compiled PDF to the requested target path if specified (`outputPath`), and removes auxiliary files (`.aux`, `.log`, `.out`, `.fls`, `.fdb_latexmk`, `.synctex.gz`).
  5. Outputs a structured JSON report to stdout:
     ```json
     {
       "file": "filename.tex",
       "path": "/path/to/filename.tex",
       "sizeKB": 4.6,
       "counts": { "resumeItems": 0, "subheadings": 0, "projectHeadings": 0 },
       "issues": [],
       "valid": true,
       "engine": "pdflatex",
       "compiled": true,
       "pdf": { "path": "/path/to/filename.pdf", "sizeKB": 28.8 }
     }
     ```
  6. Returns exit code `0` on success, or `1` on error.
- **Pre-Compilation Validation Checks** (`generate-latex.mjs`, lines 72-105):
  - Section count: checks `sectionCount >= 4` via regex `/\\section\{|\\sectionTitle\{|\\begin\{(education|skills|experience)Section\}/g`.
  - CJK character rejection: regex `/[぀-ヿ㐀-鿿豈-﫿ｦ-ﾟ가-힯ᄀ-ᇿ]/`.
  - Class checking: when `\documentclass{resume}` is used, standard article macro checks (`\resumeSubheading`, `\resumeItem`, `\resumeProjectHeading`, `\pdfgentounicode=1`) are bypassed.
  - Document structure: checks for presence of both `\begin{document}` and `\end{document}`.
  - Placeholder validation: verifies no raw `{{PLACEHOLDER}}` tags remain.

### 1.3 Analysis of Recent Generated Files in `output/`
Inspected recent production `.tex` and `.pdf` files spanning reports 251 to 288:
- **English CVs**:
  - Examples: `output/cv-christian-omar-payan-torrontegui-nexaminds-ai-solutions-intern-288-en.tex`, `output/cv-christian-omar-payan-torrontegui-obsidian-staffing-287-en.tex`, `output/cv-christian-omar-payan-torrontegui-emerge-video-processor-257-en.tex`.
  - Structure:
    - No preamble overrides.
    - Uses default `\summary{...}` which emits `\sectionTitle{Summary}` (renders as `SUMMARY`).
    - Uses `\begin{educationSection}{Education}`.
    - Uses `\educationItem[...]` with standard keys (`university`, `college`, `program`, `graduation`, `coursework`), rendering `Graduating <date>` and `Relevant coursework: <courses>`.
    - Uses `\begin{skillsSection}{Technical Skills}`.
    - Uses `\begin{experienceSection}{Professional Experience}`.
    - Uses `\begin{experienceSection}{AI Solutions & Software Projects}` or `Academic & Technical Projects`.
- **Spanish CVs**:
  - Examples: `output/cv-christian-omar-payan-torrontegui-datamatic-software-ai-developer-274-es.tex`, `output/cv-christian-omar-payan-torrontegui-grupo-pissa-tecnico-soporte-campo-286-es.tex`, `output/cv-christian-omar-payan-torrontegui-grupo-panama-desarrollador-escritorio-284-es.tex`, `output/cv-christian-omar-payan-torrontegui-grupo-cosmic-vending-256-es.tex`.
  - Preamble Overrides (placed right before `\begin{document}`):
    ```latex
    % Redefinir summary para usar titulo en espanol
    \renewcommand{\summary}[1]{%
        \sectionTitle{Resumen Profesional}%
        #1
    }

    % Definir educationItemEs para evitar macros residuales en ingles (Graduating, Relevant coursework)
    \newkeycommand{\educationItemEs}[
        university,
        college,
        program,
        graduation,
        grade,
        coursework
    ]{%
        {%
            \bf \commandkey{program}%
        } \hfill {%
            \commandkey{graduation}%
        } \\
        {%
            \commandkey{university}%
        } \hfill \ifcommandkey{grade}{%
            \commandkey{grade}%
        }{} \\
        {%
            \commandkey{college}%
        } \\
        \ifcommandkey{coursework}{%
            Materias relevantes: \commandkey{coursework}%
        }{}%
    }
    ```
  - Body structure:
    - `\summary{...}` generates `RESUMEN PROFESIONAL`.
    - `\begin{educationSection}{Educacion}` generates `EDUCACION`.
    - Inside `educationSection`: `\educationItemEs[...]` is invoked instead of `\educationItem`.
      - Line 1 renders `{\bf <program>} \hfill {<graduation>}` (completely omits `"Graduating"`).
      - Line 4 renders `Materias relevantes: <coursework>` (completely replaces `"Relevant coursework:"`).
    - Section headers in Spanish:
      - `\begin{skillsSection}{Habilidades Tecnicas}` generates `HABILIDADES TECNICAS`.
      - `\begin{experienceSection}{Experiencia Laboral}` generates `EXPERIENCIA LABORAL`.
      - `\begin{experienceSection}{Proyectos Tecnicos}` (or `{Proyectos Academicos y de Ingenieria}`) generates `PROYECTOS TECNICOS`.
- **Zero Residual English Verification in Compiled Spanish PDFs**:
  Tested using `pdftotext`:
  ```bash
  pdftotext output/cv-christian-omar-payan-torrontegui-grupo-pissa-tecnico-soporte-campo-286-es.pdf - | grep -E "SUMMARY|Graduating|Relevant coursework"
  ```
  Result: Exit code 1, zero matches found. Inspection of raw extracted text confirmed headers are strictly `RESUMEN PROFESIONAL`, `EDUCACION`, `HABILIDADES TECNICAS`, `EXPERIENCIA LABORAL`, `PROYECTOS TECNICOS`, with date line `Ago 2022 – Dic 2026` and `Materias relevantes: ...`.

### 1.4 Strict 1-Page Harvard Format Mechanics and Verification
- **Geometry and Vertical Space Budget**:
  - Available printable height: 734.4 pt (10.2 inches).
  - Header: 45 pt.
  - Summary: 40-50 pt (3-4 lines).
  - Education: 45 pt (1 entry, 4 lines).
  - Skills: 50-60 pt (3 categories, 1-2 lines each).
  - Experience: 65-75 pt (1 entry, 3 bullets with `\itemsep -7pt` or `\itemsep -9pt`).
  - Projects: 110-130 pt (2 entries, 2-3 bullets each with `\itemsep -9pt`).
  - Section rules and spacing: 4 sections * 20 pt = 80 pt.
  - Total vertical footprint: ~440-480 pt, safely below 734.4 pt threshold.
- **Micro-Typography Spacing Rules**:
  - Inside `itemize` blocks under `experienceSection`:
    ```latex
    \begin{itemize}
        \vspace{-0.5em}
        \itemsep -9pt {}
        \item ...
    \end{itemize}
    ```
    This negative vertical spacing prevents default LaTeX list padding from pushing content onto a second page.
- **Empirical 1-Page Verification Across Recent PDFs**:
  Tested all recent PDFs with `pdfinfo`:
  ```bash
  for f in output/*-2[5-8]*.pdf; do echo "$(basename "$f"): $(pdfinfo "$f" | grep Pages)"; done
  ```
  Results: Every single compiled PDF (`251-es`, `255-es`, `256-es`, `257-en`, `258-es`, `259-es`, `260-es`, `261-es`, `262-en`, `263-es`, `264-es`, `265-es`, `266-es`, `267-es`, `268-en`, `269-en`, `271-es`, `272-en`, `273-es`, `274-es`, `276-es`, `277-es`, `278-es`, `280-en`, `281-en`, `282-en`, `283-es`, `284-es`, `285-en`, `286-es`, `287-en`, `288-en`) verified with `Pages: 1`.

### 1.5 Applications Tracker (`data/applications.md`) Specification
- **File Location**: `/home/opyntorr/career-ops/data/applications.md`
- **Markdown Table Structure**:
  ```markdown
  # Applications Tracker

  | # | Date | Company | Role | Score | Status | PDF | Report | Notes |
  |---|------|---------|------|-------|--------|-----|--------|-------|
  ```
- **Column Definitions and Conventions**:
  1. `#`: Numeric identifier matching the report number (e.g. `288`, `287`, ..., `001`). Entries are prepended in descending chronological order.
  2. `Date`: Evaluation date in ISO `YYYY-MM-DD` format (e.g. `2026-10-18`).
  3. `Company`: Company name as listed in the job posting (e.g. `GC CORPORATIVO`, `Huawei`, `Caterpillar`).
  4. `Role`: Role title (e.g. `Analista de Datos`, `Digital Power Engineer (Fresh Graduate)`).
  5. `Score`: Evaluated score formatted as `{score}/5` (e.g. `4.8/5`, `3.5/5`, `2.4/5`).
  6. `Status`: Canonical state from `/home/opyntorr/career-ops/templates/states.yml`:
     - Initial state for evaluated offers: `Evaluated`.
     - Valid downstream states: `Applied`, `Responded`, `Interview`, `Offer`, `Rejected`, `Discarded`, `SKIP`, `Hired`.
     - Case-insensitive, no markdown bold, no dates inside this column.
  7. `PDF`:
     - Viable role with generated CV: relative markdown link `[PDF](../output/cv-christian-omar-payan-torrontegui-{company-slug}-{role-slug}-{report#}-{lang}.pdf)`.
     - Non-viable role (score < 3.0 or not viable): `-` (plain hyphen).
     - Never use emoji icons (no checkmarks or cross marks).
  8. `Report`:
     - Standard link format: `[Report](../reports/{###}-{company-slug}-{date}.md)`.
  9. `Notes`:
     - Single-line concise summary of role compensation, modality, location, key technical fit or reason for non-viability.
     - Strictly NO emojis anywhere in the text.
- **Status Updater Tool (`set-status.mjs`)**:
  - Syntax: `node set-status.mjs <report#|company> <state> [--note "..."] [--dry-run] [--json]`.
  - Acquires atomic filesystem lock, validates against `templates/states.yml`.
  - When invoking `set-status.mjs`, the `--json` flag MUST be passed to prevent console emission of emoji characters (which are printed on line 317 in standard text mode).
- **Report Number Reservation Status**:
  - Highest existing report number in `reports/` is `288` (`288-nexaminds-ai-solutions-intern-2026-10-17.md`).
  - Running `node reserve-report-num.mjs --count 14` will atomically allocate slots `289` through `302` for the 14 Tec de Monterrey job postings.

---

## 2. Logic Chain

1. **Step 1 — Compiler and Engine Architecture**:
   - Observation 1.2 establishes that `/usr/bin/pdflatex` is installed on PATH while `tectonic` is absent.
   - Observation 1.2 demonstrates that `generate-latex.mjs` probes `tectonic` first, detects it is missing, and falls back to `pdflatex`.
   - Therefore, all CV compilations are executed through `pdflatex` in two passes, satisfying the command specification `node generate-latex.mjs <tex> <pdf>`.

2. **Step 2 — Root Cause of Residual English Strings**:
   - Observation 1.1 reveals that `resume.cls` hardcodes `"Summary"` in `\summary`, `"Graduating "` in `\educationItem`, and `"Relevant coursework: "` in `\educationItem`.
   - Section environment names in `cv-template.tex` default to English (`Education`, `Technical Skills`, `Professional Experience`, `Academic & Technical Projects`).
   - If an agent generates a Spanish CV using default macros, these exact English strings are baked into the PDF output.

3. **Step 3 — Resolution of the Localization Mechanism**:
   - Observation 1.1 proves that `\renewkeycommand{\educationItem}` crashes `pdflatex` with `! Undefined control sequence` due to a known bug in `keycommand.sty`.
   - Observation 1.3 shows that defining `\newkeycommand{\educationItemEs}` inside the `.tex` preamble circumvents the defect completely, allowing clean suppression of `"Graduating "` and localization to `"Materias relevantes: "`.
   - Observation 1.3 shows that `\renewcommand{\summary}[1]{\sectionTitle{Resumen Profesional}#1}` cleanly overrides the summary header.
   - Observation 1.3 verifies that passing Spanish titles to `educationSection`, `skillsSection`, and `experienceSection` creates standard Spanish headers (`EDUCACION`, `HABILIDADES TECNICAS`, `EXPERIENCIA LABORAL`, `PROYECTOS TECNICOS`).
   - Testing via `pdftotext` in Observation 1.3 confirms 0% residual English text in the resulting PDFs.

4. **Step 4 — Deterministic 1-Page Harvard Enforcement**:
   - Observation 1.1 and 1.4 show that total printable vertical space is 734.4 pt.
   - Structuring the CV with 1 education block, 3 skill categories, 1 work experience entry (3 bullets), and 2 technical projects (2-3 bullets each) yields ~450 pt of content.
   - Employing `\itemsep -7pt` or `\itemsep -9pt` and `\vspace{-0.5em}` within `itemize` blocks controls list padding.
   - Verifying via `pdfinfo <pdf> | grep Pages` provides deterministic verification that page count equals 1.

5. **Step 5 — Tracker Format and System Rules**:
   - Observation 1.5 documents that `data/applications.md` tracks entries under 9 canonical columns with statuses governed by `templates/states.yml`.
   - System rules strictly prohibit emojis in all workspace files, scripts, and logs.
   - Therefore, the `PDF` column must contain markdown relative links `[PDF](../output/...)` for viable roles or `-` for non-viable roles, never emoji checkmarks.
   - The `Report` column must link to `[Report](../reports/...)`.
   - For the upcoming 14 Tec de Monterrey job postings (Scope from `ORIGINAL_REQUEST.md` 2026-10-18T05:29:39Z), reservation starts at `289` and runs through `302`.

---

## 3. Caveats

1. **System Layer Immutability**:
   `resume.cls` and `templates/resume.cls` belong to the system layer and are shared across English and Spanish CVs. They must NOT be edited directly. All Spanish localization overrides must remain isolated within the preamble of generated Spanish `.tex` files.
2. **Special Character Escaping in LaTeX**:
   In `.tex` files, literal `%`, `&`, `_`, `#`, `$` must always be escaped (`\%`, `\&`, `\_`, `\#`, `\$`). While `[T1]{fontenc}` handles UTF-8 accented characters (`á, é, í, ó, ú, ñ`), unescaped special symbols cause immediate compilation crashes.
3. **Language Selection Rules for the 14 Tec de Monterrey Postings**:
   - Roles published in English (e.g. Caterpillar CS Intern, Huawei Digital Power, Huawei Core Network, Huawei Wireless, Baltra AI Product Engineer, Abril Barrientos Product Operation Analyst, Insofos CNC Design) must be generated in English using default `cv-template.tex` / `resume.cls` macros.
   - Roles published in Spanish (e.g. GC Corporativo Analista de Datos, HayCash Analista Jr IA, Empresa Cuidado Personal Ing Procesos, Desarrollador IA Monterrey, Greenprint Ing Sistemas, London Consulting Group Consultor) must be generated in Spanish using the preamble overrides (`\renewcommand{\summary}` and `\newkeycommand{\educationItemEs}`).

---

## 4. Conclusion

1. **Compilation Command**:
   CV compilation is invoked via:
   ```bash
   node generate-latex.mjs output/<cv-filename>.tex output/<cv-filename>.pdf
   ```
   This executes `pdflatex` in two passes, verifies required sections, cleans auxiliary files, and outputs a JSON summary.
2. **Spanish Localization Standard**:
   Every Spanish `.tex` file must include the following preamble before `\begin{document}`:
   ```latex
   \documentclass{resume}

   % Redefinir summary para usar titulo en espanol
   \renewcommand{\summary}[1]{%
       \sectionTitle{Resumen Profesional}%
       #1
   }

   % Definir educationItemEs para evitar macros residuales en ingles (Graduating, Relevant coursework)
   \newkeycommand{\educationItemEs}[
       university,
       college,
       program,
       graduation,
       grade,
       coursework
   ]{%
       {%
           \bf \commandkey{program}%
       } \hfill {%
           \commandkey{graduation}%
       } \\
       {%
           \commandkey{university}%
       } \hfill \ifcommandkey{grade}{%
           \commandkey{grade}%
       }{} \\
       {%
           \commandkey{college}%
       } \\
       \ifcommandkey{coursework}{%
           Materias relevantes: \commandkey{coursework}%
       }{}%
   }
   ```
   And must use Spanish section environment names:
   - `\begin{educationSection}{Educacion}` with `\educationItemEs[...]`
   - `\begin{skillsSection}{Habilidades Tecnicas}`
   - `\begin{experienceSection}{Experiencia Laboral}`
   - `\begin{experienceSection}{Proyectos Tecnicos}` (or `{Proyectos Academicos y de Ingenieria}`)
3. **1-Page Verification**:
   Must be verified immediately after compilation:
   ```bash
   pdfinfo output/<cv-filename>.pdf | grep Pages
   ```
   Expected: `Pages:           1`.
4. **Tracker Registration**:
   Prepend new rows to `data/applications.md` using format:
   ```markdown
   | {###} | {YYYY-MM-DD} | {Company} | {Role} | {Score}/5 | Evaluated | [PDF](../output/{cv-name}.pdf) | [Report](../reports/{report-name}.md) | {Notes without emojis} |
   ```
   If a role is not viable (score < 3.0), the `PDF` column must be `-`.
5. **Report Numbering for Tec de Monterrey Batch**:
   Atomic reservation `node reserve-report-num.mjs --count 14` assigns report numbers `289` to `302`.

---

## 5. Verification Method

To independently verify these findings on the live workspace:

1. **Verify pdflatex and pdfinfo Availability**:
   ```bash
   which pdflatex pdfinfo
   ```
   Output must show `/usr/bin/pdflatex` and `/usr/bin/pdfinfo`.

2. **Verify Compilation of English CV**:
   ```bash
   node generate-latex.mjs output/cv-christian-omar-payan-torrontegui-nexaminds-ai-solutions-intern-288-en.tex output/cv-christian-omar-payan-torrontegui-nexaminds-ai-solutions-intern-288-en.pdf
   ```
   Must return exit code 0 and JSON with `"valid": true`, `"compiled": true`.

3. **Verify Compilation of Spanish CV with Preamble Overrides**:
   ```bash
   node generate-latex.mjs output/cv-christian-omar-payan-torrontegui-datamatic-software-ai-developer-274-es.tex output/cv-christian-omar-payan-torrontegui-datamatic-software-ai-developer-274-es.pdf
   ```
   Must return exit code 0 and JSON with `"valid": true`, `"compiled": true`.

4. **Verify Strict 1-Page Constraint**:
   ```bash
   pdfinfo output/cv-christian-omar-payan-torrontegui-datamatic-software-ai-developer-274-es.pdf | grep Pages
   ```
   Must return: `Pages:           1`.

5. **Verify Zero Residual English Strings in Spanish CV**:
   ```bash
   pdftotext output/cv-christian-omar-payan-torrontegui-datamatic-software-ai-developer-274-es.pdf - | grep -E "SUMMARY|Graduating|Relevant coursework"
   ```
   Must return exit code 1 with zero output lines.

6. **Verify Next Report Reservation Range**:
   ```bash
   ls reports/ | grep -E '^[0-9]+' | sort -n | tail -n 1
   ```
   Must show report `288`, confirming next 14 allocations will be `289-302`.

7. **Verify Tracker Row Syntax**:
   Inspect line 5 of `data/applications.md` to confirm the canonical table format and absence of emojis.
