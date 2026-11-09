# TEST READY: Tecnologico de Monterrey 14-Batch Verification Suite

## Status: READY FOR EXECUTION

The automated end-to-end acceptance test suite for the 14 Tecnologico de Monterrey job postings (reports 289 through 302) is implemented, verified, and operational.

---

## 1. Test Suite Specifications

- **Executable Entrypoint:** `tests/verify-tec-batch.mjs`
- **Architecture Documentation:** `TEST_INFRA.md`
- **Target Batch Range:** Reports 289 to 302 (14 opportunities)
- **Execution Engine:** Native Node.js (ESM) + Poppler utilities (`pdfinfo`, `pdftotext`)
- **Dependency Footprint:** Minimal runtime (`js-yaml`, standard Node.js libraries)

---

## 2. Verified Acceptance Criteria

The test suite programmatically asserts the following criteria:

1. **Report Existence and Schema (Tier 1)**:
   - Confirms that active markdown report files exist for each ID in [289..302] in `reports/` (rejecting unfulfilled `*-RESERVED.md` sentinels).
   - Validates header metadata: title `# Evaluation:`, `**Date:**`, `**URL:**`, `**Via:**`, `**Archetype:**`, `**Score:**`, `**Legitimacy:**`, `**PDF:**`.
   - Validates `## Machine Summary` YAML block: non-null numeric score (0.0 to 5.0), valid `legitimacy_tier`, and verbatim `advertised_comp`.
   - Validates full evaluation Blocks A through G:
     - Block A: Role Summary
     - Block B: Match with CV
     - Block C: Level and Strategy
     - Block D: Comp and Demand
     - Block E: Customization Plan
     - Block F: Interview Plan
     - Block G: Posting Legitimacy
   - Validates `## Cover Letter Draft` and Keywords extracted blocks.

2. **LaTeX and PDF CV Deliverables (Tier 2)**:
   - For every viable role (`score >= 3.0`), asserts that both `output/{cv-name}.tex` and `output/{cv-name}.pdf` exist.
   - Executes `pdfinfo <pdf>` and strictly asserts `Pages: 1`. Multi-page CVs fail immediately.
   - For Spanish CVs (`*-es.pdf`), inspects extracted text and LaTeX source to verify zero residual English template macros:
     - No untranslated `SUMMARY` header.
     - No untranslated `Graduating` prefix.
     - No untranslated `Relevant coursework` label.

3. **Application Tracker Synchronization (Tier 3)**:
   - Verifies that all 14 rows exist in `data/applications.md`.
   - Asserts strict 9-column formatting per row.
   - Verifies status is set to `Evaluated`.
   - Resolves markdown relative links to both report files and output PDFs, verifying they point to existing files on disk.

4. **System Cleanliness & Anti-Pollution (Tier 4)**:
   - Scans all reports 289-302, output LaTeX files, and tracker lines for emojis using `\p{Extended_Pictographic}`. Zero emojis tolerated.
   - Strictly enforces no `colcon build` invocations.

---

## 3. Invocation Commands

### A. Run Full Batch Verification (Summary Mode)

```bash
node tests/verify-tec-batch.mjs
```

### B. Run Full Batch Verification (JSON Mode)

```bash
node tests/verify-tec-batch.mjs --json
```

### C. Run Specific Report Subsets (Incremental Testing)

```bash
node tests/verify-tec-batch.mjs --ids 289,290,291
node tests/verify-tec-batch.mjs --range 289-295
```

---

## 4. Exit Code Contract

- **Exit Code 0:** All 14 reports, viable CVs, single-page PDFs, tracker entries, and anti-pollution checks have passed.
- **Exit Code 1:** One or more acceptance criteria failed. Error diagnostics are output to stdout/stderr.
