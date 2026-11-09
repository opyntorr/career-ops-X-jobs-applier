# Survey Pipeline Infrastructure & Operational Playbook

## 1. Executive Summary & Context

This report provides the technical investigation and operational blueprint for processing the 30 job postings from `/home/opyntorr/Downloads/puestosIndeed.pdf` within `/home/opyntorr/career-ops`.

### Context & Scope Parameters
- Source document: `/home/opyntorr/Downloads/puestosIndeed.pdf` (30 vacancies).
- Relocation policy: The candidate maintains a 100% total relocation policy across all cities and states in Mexico; no job posting may be discarded or penalized due to geographic location.
- Language policy: Strict language mirroring. Postings written in English receive tailored CVs in English. Postings written in Spanish receive tailored CVs in Spanish with zero residual English macros.
- Core deliverables: Evaluation reports in `reports/` (Blocks A-G), tailored LaTeX CVs compiled to 1-page PDFs in `output/` for viable roles (score >= 3.0), and synchronization into `data/applications.md`.
- Strict constraints: No emojis anywhere in any generated file, script, log, or message. No `colcon build`. All operations confined to `/home/opyntorr/career-ops`.

---

## 2. Report Number Reservation Infrastructure (`reserve-report-num.mjs`)

### 2.1 Atomic Reservation Mechanism
File: `/home/opyntorr/career-ops/reserve-report-num.mjs`

The script avoids race conditions across parallel agents or batch workers using atomic file creation:
- Node.js `fs.writeFileSync(sentinelPath, '', { flag: 'wx' })`.
- POSIX equivalent: `open(O_CREAT | O_EXCL)`.
- Sentinel naming: `reports/NNN-RESERVED.md` (zero-byte marker).
- Contiguity: When reserving a range of size `count`, the script inspects `maxSlot()`, then tries to claim `base` through `base + count - 1`. If any slot collides, already claimed slots in the attempt are unlinked and the base advances past the collision (`MAX_RETRIES = 50`, `MAX_COUNT = 50`).

### 2.2 Current Report Number Status
- Highest numeric report in `reports/`: `256` (`256-grupo-cosmic-tecnico-vending-2026-10-16.md`).
- Current `maxSlot()`: `256`.
- Next single available report number: `257`.

### 2.3 Reserving 30 Report Numbers
To atomically reserve slots for the 30 job postings:

```bash
node reserve-report-num.mjs --count 30
```

- Expected output: `257-286`
- Range reserved: `257`, `258`, ..., `286` (30 contiguous slots).
- Sentinels created: `reports/257-RESERVED.md` through `reports/286-RESERVED.md`.

### 2.4 Cleanup & Releasing
Once each report file `reports/{###}-{company-slug}-{date}.md` is created:
- Release range:
  ```bash
  node reserve-report-num.mjs --release 257-286
  ```
- Or remove individual sentinels as each report is written:
  ```bash
  node reserve-report-num.mjs --release 257
  ```
- Stale cleanup (`--gc`): Cleans sentinels older than 4 hours (`MAX_SENTINEL_AGE_MS = 14400000`).

---

## 3. Evaluation Reports Structure & Rubric (`reports/`)

### 3.1 File Naming & Organization
- File format: `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`
  - `{###}`: 3-digit zero-padded number (e.g. `257`).
  - `{company-slug}`: Lowercase alphanumeric with hyphens (e.g. `totalenergies`, `omnia-securita`, `nurvai`).
  - `{YYYY-MM-DD}`: Current date (e.g. `2026-10-16`).

### 3.2 Report Header Schema
```markdown
# Evaluation: {Company} — {Role}

**Date:** {YYYY-MM-DD}
**URL:** {Posting URL or "Pasted JD text (puestosIndeed.pdf)"}
**Via:** {Direct / Platform / Headhunter}
**Archetype:** {Detected Archetype}
**Score:** {X.X}/5
**Legitimacy:** {High Confidence | Proceed with Caution | Suspicious}
**PDF:** [{pdf-filename}](../output/{pdf-filename})
```
*Note: If score < 3.0 or no PDF generated, PDF field is set to "None generated (score < 3.0)" or "Pending".*

### 3.3 Machine Summary YAML Fence
Directly follows the header:
```yaml
## Machine Summary

```yaml
company: "{Company Name}"
role: "{Role Title}"
score: 4.2
legitimacy_tier: "High Confidence"
archetype: "Embedded Systems Engineer"
final_decision: "Apply"
hard_stops: []
soft_gaps:
  - "Specific requirement gap 1"
top_strengths:
  - "Verified strength matching CV 1"
  - "Verified strength matching CV 2"
risk_level: "Low"
confidence: "High"
next_action: "Generate specialized CV and proceed with application"
via: "Indeed"
company_confidential: false
advertised_comp: "$25,000 MXN"
```
```

### 3.4 Report Content Blocks (A through G)

#### Block A — Role Summary
- Markdown table:
  - Arquetipo / Archetype
  - Dominio / Domain (e.g. Computer Vision, Robotics, Embedded, IoT)
  - Funcion / Function (e.g. Firmware Development, Mechanical Design, Automation)
  - Seniority (Intern / Becario / Junior / Specialist)
  - Ubicacion / Location & Remote Policy
  - Culture Screen: Pass / Caution / Fail (based on requirements from `config/profile.yml`)
  - TL;DR: 1-sentence synthesis of role scope and engineering challenges.
- Geo-mismatch check: Check whether structured location and JD body conflict.

#### Block B — Match with CV
- Table comparing JD requirements directly against lines and projects in `cv.md`:
  - `Requisito de la Vacante | Coincidencia en CV (Linea / Proyecto)`
- Gaps y Mitigaciones: List each soft gap, technical severity (Baja / Media / Alta), and concrete mitigation based on adjacent projects.

#### Block C — Level and Strategy
- Nivel Detectado (Junior, Intern, Specialist, Intermediate).
- Estrategia de Posicionamiento: How the candidate bridges academic excellence, hands-on laboratory experience, and project proof points.
- Ventaja Competitiva: Distinctive engineering advantages (e.g., dual-core embedded architecture, ROS 2 integration, custom CAD/DFM).

#### Block D — Comp and Demand
- Comp Table:
  - First row MUST be the verbatim advertised figure from JD:
    `| Advertised (JD) | {verbatim figure or "not stated"} | JD |`
  - Subsequent rows: Market comparison (Glassdoor / Levels.fyi / National averages in MXN).
  - Benefits & perks mentioned.

#### Block E — Customization Plan
- Table with 5 strategic modifications for CV:
  `# | Seccion del CV | Estado Anterior | Modificacion para {Empresa} | Justificacion`
- Tailoring focus: Align skills, project order, and bullet points to JD keywords.

#### Block F — Interview Plan (STAR+R)
- Table with 3 to 6 STAR+R stories:
  `# | Requisito JD | Historia STAR+R | S | T | A | R | Reflexion`
- Reflection column highlights technical maturity, safety precautions, or architectural trade-offs learned.

#### Block G — Posting Legitimacy
- Assessment: `High Confidence`, `Proceed with Caution`, or `Suspicious`.
- Signals Analyzed:
  1. Freshness & Posting Age.
  2. Description Quality (specific technologies vs. generic buzzwords).
  3. Company Stability & Hiring Signals.
  4. Reposting Detection.
  5. Role Market Context.
  6. Employment Classification (statutory employee vs. contractor/1099/honorarios).

#### Post-Block Content
- Cover Letter Draft: Opening, Profile introduction, Key achievements from `cv.md`, Problems to solve, Closing.
- Keywords extracted: 10-20 ATS keywords.

### 3.5 Scoring Rubric & Weights
Global score is calibrated on a 1.0 to 5.0 scale:
- Match con CV (40%): Alignment of programming languages, hardware platforms, toolchains.
- North Star Alignment (25%): Fit with primary candidate archetypes (Embedded, Robotics, 3D Printing, Mechatronics, Computer Vision).
- Compensation & Feasibility (15%): Advertised or market compensation competitiveness.
- Cultural Signals & Work Environment (10%): Formal organization, mentorship, engineering standards.
- Red Flags / Risk Adjustment (-10% to 0%): Excessive scope, ambiguity, unreconciled gaps.

Score Decision Thresholds:
- 4.5 - 5.0: Strong match; immediate application priority.
- 4.0 - 4.4: High match; highly viable.
- 3.0 - 3.9: Moderate match; viable for tailored technical application.
- Below 3.0: Discrepant or mismatched role (retail, pure sales, unrelated field).

LaTeX CV Generation Threshold: `Score >= 3.0` (viable roles).

---

## 4. LaTeX Compilation & Harvard CV Infrastructure

### 4.1 Compilation Engine & Tooling
- Compilation command: `node generate-latex.mjs <input.tex> [output.pdf]`
- Host engine: `/usr/bin/pdflatex` (TeX Live / pdfTeX version 3.141592653-2.6-1.40.22).
- Validation script: `generate-latex.mjs` executes two pdflatex passes to resolve cross-references and links, then removes auxiliary `.aux`, `.log`, and `.out` files.

### 4.2 Document Class (`resume.cls`)
The class file `templates/resume.cls` defines the document structure:
- Base class: `\LoadClass[11pt,letterpaper]{article}`
- Margins: `\usepackage[left=0.5in,top=0.4in,right=0.5in,bottom=0.4in]{geometry}`
- Font: Helvetica sans-serif (`\usepackage[scaled]{helvet}`)
- Environments: `educationSection`, `skillsSection`, `experienceSection`

### 4.3 Preventing English Residual Macros in Spanish CVs
Investigation of `templates/resume.cls` reveals hardcoded English strings in lines 123-159:
1. `\summary`:
   ```latex
   \newcommand{\summary}[1]{%
       \sectionTitle{Summary}%
       #1
   }
   ```
2. `\educationItem`:
   ```latex
   \newkeycommand{\educationItem}[university,college,program,graduation,grade,coursework]{%
       {\bf \commandkey{program}} \hfill {Graduating \commandkey{graduation}} \\
       {\commandkey{university}} \hfill ... \\
       {\commandkey{college}} \\
       Relevant coursework: \commandkey{coursework}%
   }
   ```

#### Required Fix for Spanish CVs
In Spanish `.tex` files, include explicit overrides before `\begin{document}`:

```latex
% Redefinir summary para titulo en espanol
\renewcommand{\summary}[1]{%
    \sectionTitle{Resumen Profesional}%
    #1
}

% Definir macro para item de educacion en espanol sin textos residuales en ingles
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

Section Titles for Spanish CVs:
- `\begin{educationSection}{Educacion}`
- `\begin{skillsSection}{Habilidades Tecnicas}`
- `\begin{experienceSection}{Experiencia Laboral}`
- `\begin{experienceSection}{Proyectos Tecnicos}`

Section Titles for English CVs:
- Standard `resume.cls` macros are used as-is:
  - `\summary{...}` produces `SUMMARY`
  - `\educationItem[...]` produces `Graduating ...` and `Relevant coursework: ...`
  - Sections: `Education`, `Technical Skills`, `Professional Experience`, `Academic & Technical Projects`.

### 4.4 Ensuring 1-Page Harvard Compliance
To guarantee strict 1-page output:
1. Header Spacing:
   - Use standard `\introduction[...]` block.
2. Summary:
   - Limit to 3-5 lines of dense, high-impact text.
3. Spacing overrides inside lists:
   - Insert `\vspace{-0.5em}` directly before `\begin{itemize}`.
   - Insert `\itemsep -9pt {}` as the first token inside `\begin{itemize}`.
4. Content Budgeting:
   - Education: 1-2 items (Tec de Monterrey B.S. + 100-Hour Office Course if requested).
   - Skills: 3 categories (e.g., Firmware & Embedded, Robotics & Perception, Tools & Fabrication).
   - Experience: 1 entry (Laboratorio de Manufactura Avanzada), 3 bullet points.
   - Projects: 2 entries (e.g. DigiMix + Port Bot OMRON or ORB-SAM-E), 2 bullet points each.
5. Verification:
   - Always verify page count using `pdfinfo`.

---

## 5. Application Tracker Integration (`data/applications.md`)

### 5.1 Tracker Structure & Column Order
File: `/home/opyntorr/career-ops/data/applications.md`

Markdown table header:
```markdown
# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
```

Columns Breakdown:
1. `#`: Numeric identifier matching report number (e.g. `257`).
2. `Date`: Evaluation date in `YYYY-MM-DD` format (e.g. `2026-10-16`).
3. `Company`: Hiring organization name. If confidential agency, use `?`.
4. `Role`: Exact role title.
5. `Score`: MUST include the `/5` suffix (e.g. `4.2/5`, `3.8/5`, `2.4/5`).
6. `Status`: Canonical status string (`Evaluated`).
7. `PDF`: Link `[PDF](../output/{filename}.pdf)` or `None` if score < 3.0.
8. `Report`: Relative link `[{###}](../reports/{###}-{slug}-{date}.md)`.
9. `Notes`: Concise context summary (salary, location, key technical match).

### 5.2 Critical Formatting Requirement (The `/5` Rule)
Investigation of `verify-pipeline.mjs` line 190 shows:
```javascript
if (!/^\d+\.?\d*\/5$/.test(s) && s !== 'N/A' && s !== 'DUP') {
  error(`#${e.num}: Invalid score format: "${e.score}"`);
}
```
Any score entered without `/5` (such as `4.2` instead of `4.2/5`) triggers a fatal pipeline verification error. All new entries must use `X.X/5`.

### 5.3 Row Ordering
- Rows in `data/applications.md` are maintained in descending numerical order (newest evaluations at the top, directly beneath the markdown separator `|---|...|`).

### 5.4 Batch TSV Synchronization Option
If parallel batch workers generate tracker entries, entries can be emitted as TSV files in `batch/tracker-additions/{batch-id}.tsv` and merged atomically using:
```bash
node merge-tracker.mjs
```
TSV column structure (9 columns):
```text
{num}\t{date}\t{company}\t{role}\t{score}\t{status}\t{pdf}\t{report}\t{notes}
```

---

## 6. Verification Criteria & Automation Commands

### 6.1 PDF 1-Page Verification
Every generated PDF must strictly consist of exactly one page.

Single file verification command:
```bash
pdfinfo output/cv-christian-omar-payan-torrontegui-{slug}.pdf | grep "^Pages:"
```
Expected output:
```text
Pages:           1
```

Batch verification script for all newly generated PDFs:
```bash
node -e '
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync("output").filter(f => f.endsWith(".pdf") && f.startsWith("cv-"));
let failed = 0;
for (const file of files) {
  const fullPath = path.join("output", file);
  const out = execSync(`pdfinfo "${fullPath}"`).toString();
  const m = out.match(/^Pages:\s+(\d+)/m);
  const pages = m ? parseInt(m[1], 10) : 0;
  if (pages !== 1) {
    console.error(`PAGE VIOLATION: ${file} has ${pages} pages (must be exactly 1)`);
    failed++;
  }
}
if (failed === 0) {
  console.log(`Page count verification passed: all ${files.length} PDFs are strictly 1 page.`);
} else {
  process.exit(1);
}
'
```

### 6.2 Zero Emoji Validation Method
System constraint: Emojis are strictly prohibited in all generated code, reports, logs, and tracker entries.

Validation script using ECMAScript Unicode property escape `\p{Extended_Pictographic}`:
```bash
node -e '
const fs = require("fs");
const path = require("path");

const emojiRegex = /\p{Extended_Pictographic}/u;
const dirs = ["reports", "output", "data"];
let violations = 0;

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      console.error(`EMOJI DETECTED: ${filePath}:${idx + 1}: ${line}`);
      violations++;
    }
  });
}

// Check newly generated reports
const reports = fs.readdirSync("reports").filter(f => f.match(/^(25[7-9]|2[6-8][0-9])-.*\.md$/));
reports.forEach(r => checkFile(path.join("reports", r)));

// Check newly generated tex files
const texFiles = fs.readdirSync("output").filter(f => f.endsWith(".tex"));
texFiles.forEach(t => checkFile(path.join("output", t)));

// Check tracker
checkFile("data/applications.md");

if (violations === 0) {
  console.log("Zero emoji verification passed: 0 emojis found in scanned target files.");
} else {
  console.error(`Zero emoji verification failed: ${violations} violation(s) found.`);
  process.exit(1);
}
'
```

### 6.3 LaTeX Residual Macro Check (Spanish CVs)
For Spanish CVs, ensure no residual English strings remain:
```bash
node -e '
const fs = require("fs");
const path = require("path");

const spanishTexFiles = fs.readdirSync("output").filter(f => f.endsWith("-es.tex"));
let violations = 0;

const residualPatterns = [
  /\\sectionTitle\{Summary\}/i,
  /Graduating\s+\\commandkey/i,
  /Relevant coursework:/i,
  /\\sectionTitle\{Education\}/i,
  /\\sectionTitle\{Technical Skills\}/i,
  /\\sectionTitle\{Professional Experience\}/i
];

for (const f of spanishTexFiles) {
  const content = fs.readFileSync(path.join("output", f), "utf8");
  for (const pat of residualPatterns) {
    if (pat.test(content)) {
      console.error(`RESIDUAL MACRO DETECTED in ${f}: matches ${pat}`);
      violations++;
    }
  }
}

if (violations === 0) {
  console.log(`Residual macro check passed across ${spanishTexFiles.length} Spanish CVs.`);
} else {
  process.exit(1);
}
'
```

### 6.4 Pipeline Integrity Verification
Run the standard pipeline health checker:
```bash
node verify-pipeline.mjs
```
Confirms canonical statuses, report link resolution, proper table column splits, and absence of pending unmerged TSVs.

---

## 7. Execution Checklist for the 30 Job Postings

1. Reserve report numbers:
   - Run `node reserve-report-num.mjs --count 30` to reserve slots `257-286`.
2. Extract and evaluate postings from `/home/opyntorr/Downloads/puestosIndeed.pdf`:
   - Identify language (English vs. Spanish).
   - Evaluate against `cv.md` and `config/profile.yml`. Apply total relocation policy.
   - Calculate score (1.0 - 5.0) and assign legitimacy tier.
3. Write evaluation reports in `reports/`:
   - Naming: `reports/{257..286}-{company-slug}-2026-10-16.md`.
   - Include Blocks A through G, Machine Summary, and Cover Letter Draft.
   - Clean up sentinel files with `node reserve-report-num.mjs --release 257-286`.
4. Generate LaTeX CVs for viable roles (score >= 3.0):
   - English postings: standard Harvard macros (`output/{cv-name}-en.tex`).
   - Spanish postings: redefined `\summary` and `\educationItemEs` (`output/{cv-name}-es.tex`).
   - Compile each with `node generate-latex.mjs output/{cv-name}.tex output/{cv-name}.pdf`.
5. Verify 1-page constraint:
   - Run `pdfinfo output/{cv-name}.pdf | grep Pages` on each output PDF.
6. Synchronize `data/applications.md`:
   - Prepend new entries in descending order.
   - Ensure all scores include `/5` suffix.
7. Run verification suites:
   - Zero emoji verification script.
   - Residual macro check script.
   - `node verify-pipeline.mjs`.
