# Career-Ops Test Infrastructure and Verification Architecture

## 1. Executive Summary & Verification Philosophy

Career-Ops is an AI-assisted job search automation platform operating across Unix and POSIX CLI environments. Because evaluations, CV generation, and tracker operations drive real-world career applications, rigorous verification is mandatory to guarantee:

1. **Absolute Truthfulness and Veracity**: Never fabricate accomplishments, never attribute third-party projects to the candidate, and preserve exact metrics from `cv.md`.
2. **Strict Layout Invariants**: Every generated LaTeX/PDF CV must conform to the 1-page Harvard layout budget (`Pages: 1` verified by `pdfinfo`).
3. **Multilingual Purity**: Job applications and CVs produced in Spanish must contain zero residual English template macros (`SUMMARY`, `Graduating`, `Relevant coursework:`). English-language postings receive tailored English CVs.
4. **Data Contract Integrity**: Machine summaries, evaluation blocks (A-G), cover letter drafts, and tracker entries (`data/applications.md`) must align symmetrically with exact 9-column formatting and valid relative paths.
5. **System Cleanliness & Anti-Pollution**: Zero emojis across all generated markdown reports, LaTeX sources, compiled PDFs, and tracker files. No unauthorized build tools (e.g. `colcon build`) or external filesystem pollution.

---

## 2. Test Architecture Overview

The testing framework is built without heavyweight third-party frameworks so that verification can execute in any clean checkout using only Node.js and standard Linux binary utilities (`pdfinfo`, `pdftotext`).

```
career-ops/
├── tests/
│   ├── verify-tec-batch.mjs         # E2E acceptance test suite for Tec de Monterrey 14-batch
│   ├── helpers.mjs                  # Shared assertion helpers (legacy)
│   ├── browser-extract.test.mjs     # Browser extraction test suite
│   ├── stats.test.mjs               # Lifetime stats aggregation tests
│   └── providers/                   # Portal scanner provider tests
├── verify-pipeline.mjs              # Tracker and pipeline health check
├── doctor.mjs                       # System prerequisites and onboarding audit
├── TEST_INFRA.md                    # Test architecture and methodology documentation
└── TEST_READY.md                    # Test readiness publication
```

---

## 3. Four-Tier Verification Methodology

The automated test suite `tests/verify-tec-batch.mjs` implements four sequential verification tiers:

### Tier 1: Static Schema & Structural Invariants

- **Report Markdown Existence**: Confirms that for each report in the target range (289 to 302), a real markdown report (`reports/{###}-{company-slug}-{date}.md`) exists and is not merely an empty or unfulfilled reservation sentinel (`{###}-RESERVED.md`).
- **Header Metadata**: Verifies `# Evaluation:` title, `**Date:**`, `**URL:**`, `**Via:**`, `**Archetype:**`, `**Score:**`, `**Legitimacy:**`, and `**PDF:**` header lines.
- **YAML Machine Summary**: Extracts and parses the `## Machine Summary` YAML block using `js-yaml`:
  - `score`: Numeric value between 0.0 and 5.0, non-null.
  - `legitimacy_tier`: String indicating posting confidence (e.g., `High Confidence`, `Proceed with Caution`, `Suspicious`).
  - `advertised_comp`: String preserving verbatim salary compensation from the posting (e.g., `$25,000 - $30,000 por mes` or `null`/`Not stated` if undisclosed in the source JD).
  - `company` and `role`: Non-empty strings.
- **Evaluation Blocks A through G**: Validates presence of:
  - Block A: Role Summary (domain, function, seniority, culture screen, TL;DR)
  - Block B: Match with CV (requirements matrix, gaps and mitigations)
  - Block C: Level and Strategy (detected level, positioning strategy)
  - Block D: Comp and Demand (advertised comp row, market data)
  - Block E: Customization Plan (top CV & profile adjustments)
  - Block F: Interview Plan (STAR+R stories with Reflection)
  - Block G: Posting Legitimacy (freshness, description quality, signals table)
- **Drafts and Keywords**:
  - `## Cover Letter Draft` section present and populated.
  - Keywords extracted block present (`Keywords extracted` or `JD keywords to mirror` or `Palabras clave extraidas`).

### Tier 2: Output Artifact & Page Budget Validation

- **Viability Threshold**: Evaluates whether `score >= 3.0`.
- **LaTeX Source and PDF Pairs**: For all viable roles, verifies that:
  - Compiled PDF exists: `output/{cv-name}.pdf`
  - LaTeX source exists: `output/{cv-name}.tex`
- **Strict 1-Page Budget**:
  - Executes `pdfinfo <pdf>`.
  - Parses `Pages: (\d+)`.
  - Asserts that page count is strictly 1. Multi-page CVs are rejected as violations of the Harvard format constraint.
- **Multilingual Macro Elimination (Spanish CVs)**:
  - For postings requiring Spanish CVs (`*-es.pdf` / `*-es.tex`):
  - Extracts text stream using `pdftotext <pdf> -`.
  - Scans for forbidden residual English template macros from standard `resume.cls`:
    - `SUMMARY` (untranslated section header)
    - `Graduating` (untranslated date prefix from `\educationItem`)
    - `Relevant coursework` (untranslated coursework prefix)
  - Checks `.tex` source code to verify proper redefinition (`\renewcommand{\summary}{...}` and `\educationItemEs`).

### Tier 3: Cross-System Tracker & Data Contract Synchronization

- **Table Presence**: Verifies that each target report ID has an active row in `data/applications.md`.
- **9-Column Schema**: Verifies exact pipe-delimited format across all 9 columns:
  1. `#` (Report Number)
  2. `Date` (YYYY-MM-DD)
  3. `Company` (Company name)
  4. `Role` (Job title)
  5. `Score` (X.X/5)
  6. `Status` (`Evaluated`)
  7. `PDF` (Markdown link `[PDF](../output/...)` for viable roles, or `-` for non-viable)
  8. `Report` (Markdown link `[Report](../reports/{report}.md)`)
  9. `Notes` (Substantive takeaway note)
- **Link Target Validation**: Resolves all relative markdown links against the filesystem to confirm target reports and PDFs exist.

### Tier 4: System Rules & Anti-Pollution Invariants

- **Zero-Emoji Rule**: Executes an automated scan across all report files, LaTeX source files, compiled text, and tracker rows using the Unicode property `\p{Extended_Pictographic}`. Any match fails the suite.
- **No Build Pollution**: Ensures zero invocation of `colcon build` or extraneous external tools.

---

## 4. Target Batch Scope: Tecnologico de Monterrey (14 Postings)

The batch corresponds to the 14 job postings from the Tecnologico de Monterrey career portal:

| # | Company | Role | Target Lang | Advertised Salary | Viability |
|---|---|---|---|---|---|
| 289 | GC CORPORATIVO | Analista de Datos | Spanish | Undisclosed in JD | Viable (Score >= 3.0) |
| 290 | HayCash | Analista Jr. de Innovacion, Procesos e IA | Spanish | $25k-$30k/mes | Viable (Score >= 3.0) |
| 291 | Abril Barrientos / Talento | Product Operation Analyst - Junior | English | $35k-$40k/mes | Viable (Score >= 3.0) |
| 292 | Insofos/Daptta | Ingeniero de diseno de maquinas CNC | Spanish | $25k-$27k/mes | Viable (Score >= 3.0) |
| 293 | Baltra | AI Product Engineer | English | $30k-$60k/mes | Viable (Score >= 3.0) |
| 294 | Empresa Cuidado Personal | Ingeniero Mecatronico de Procesos | Spanish | $25k-$30k/mes | Viable (Score >= 3.0) |
| 295 | Empleador Confidencial Mty | Desarrollador de codigo con IA | Spanish | $25k-$30k/mes | Viable (Score >= 3.0) |
| 296 | Huawei | Digital Power Engineer (Fresh Graduate) | English | $22k-$25k/mes | Viable (Score >= 3.0) |
| 297 | Caterpillar | Computer Science Intern | English | Undisclosed in JD | Viable (Score >= 3.0) |
| 298 | Huawei | Core Network Support Engineer | English | $20k-$25k/mes | Viable (Score >= 3.0) |
| 299 | Huawei | Wireless Support Engineer | English | $20k-$25k/mes | Viable (Score >= 3.0) |
| 300 | Empleador Confidencial CDMX | Revenue Systems Lead | Spanish/English | $90k-$115k/mes | Viable (Score >= 3.0) |
| 301 | Greenprint | Ingeniero en Sistemas | Spanish | $20k-$25k/mes | Viable (Score >= 3.0) |
| 302 | London Consulting Group | Consultor de Operaciones y Transf. Digital | Spanish | Undisclosed in JD | Viable (Score >= 3.0) |

---

## 5. CLI Invocation Guide

### Standard Summary Mode

Executes all Tier 1-4 checks on reports 289 through 302 and prints a formatted terminal summary without emojis:

```bash
node tests/verify-tec-batch.mjs
```

### JSON Mode (for CI/CD and Orchestrator Integration)

Outputs structured machine-readable JSON to stdout:

```bash
node tests/verify-tec-batch.mjs --json
```

Sample JSON structure:
```json
{
  "summary": {
    "totalChecked": 14,
    "reportsFound": 14,
    "validReports": 14,
    "viableRoles": 14,
    "validPdfs": 14,
    "validTexs": 14,
    "spanishCvsChecked": 8,
    "spanishMacroClean": 8,
    "trackerRowsPresent": 14,
    "trackerRowsValid": 14,
    "emojiViolations": 0,
    "totalErrors": 0,
    "totalWarnings": 0,
    "passed": true
  },
  "results": [ ... ]
}
```

### Targeted Report Testing

To test specific report numbers (e.g. during incremental development):

```bash
node tests/verify-tec-batch.mjs --ids 289,290,291
```

To test a custom range:

```bash
node tests/verify-tec-batch.mjs --range 289-302
```

### Exit Codes

- `0`: All targeted reports, CVs, PDFs, tracker entries, and anti-pollution checks passed with zero errors.
- `1`: One or more validation checks failed. Error details are emitted to stdout/stderr.
