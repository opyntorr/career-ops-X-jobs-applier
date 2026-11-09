#!/usr/bin/env node
/**
 * verify-tec-batch.mjs - Automated E2E verification test suite for the
 * 14 Tecnologico de Monterrey job postings batch (Reports 289 through 302).
 *
 * Verifies:
 * 1. Report existence and structure (Blocks A-G, YAML Machine Summary, Cover Letter Draft, Keywords).
 * 2. Advertised comp verbatim presence, valid legitimacy tier, non-null score.
 * 3. LaTeX CV (.tex) and PDF (.pdf) generation for all viable roles (score >= 3.0).
 * 4. Strict 1-page budget for all generated PDFs via pdfinfo.
 * 5. Elimination of residual English macros (SUMMARY, Graduating, Relevant coursework) in Spanish CVs.
 * 6. Application tracker synchronization in data/applications.md (9 columns, Evaluated status, valid links).
 * 7. Universal emoji absence across reports, output CVs, and tracker entries.
 *
 * Flags:
 *   --json             Output results in structured JSON format
 *   --summary          Output human-readable summary (default)
 *   --ids <list>       Comma-separated list of report IDs to test (e.g. --ids 288,289)
 *   --range <s-e>      Custom ID range to test (e.g. --range 289-302)
 *   --verbose          Display detailed check outputs
 *
 * Exit code: 0 on all checks passing, 1 if any check fails.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const REPORTS_DIR = join(ROOT, 'reports');
const OUTPUT_DIR = join(ROOT, 'output');
const TRACKER_FILE = join(ROOT, 'data', 'applications.md');

// Emoji detection regex - Unicode Extended_Pictographic property
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const EMOJI_GLOBAL_REGEX = /\p{Extended_Pictographic}/gu;

// Residual English macro patterns in Spanish CVs
const FORBIDDEN_SPANISH_MACROS = [
  { name: 'SUMMARY', regex: /\bSUMMARY\b/ },
  { name: 'Graduating', regex: /\bGraduating\b/ },
  { name: 'Relevant coursework', regex: /\bRelevant\s+coursework\b/i }
];

// Target batch report IDs where salary is explicitly disclosed in the prompt scope
const KNOWN_DISCLOSED_SALARY_IDS = [290, 291, 292, 293, 294, 295, 296, 298, 299, 300, 301];

/**
 * Parse command line arguments.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    json: false,
    summary: true,
    verbose: false,
    ids: null,
    startId: 289,
    endId: 302
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      options.json = true;
      options.summary = false;
    } else if (arg === '--summary') {
      options.summary = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--ids' && i + 1 < args.length) {
      options.ids = args[++i].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    } else if (arg === '--range' && i + 1 < args.length) {
      const parts = args[++i].split('-');
      if (parts.length === 2) {
        options.startId = parseInt(parts[0].trim(), 10);
        options.endId = parseInt(parts[1].trim(), 10);
      }
    }
  }

  return options;
}

/**
 * Scan text for emojis. Returns array of findings with line numbers.
 */
function findEmojis(text, contextName) {
  const findings = [];
  if (!text) return findings;

  const lines = text.split('\n');
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    if (EMOJI_REGEX.test(line)) {
      const matches = line.match(EMOJI_GLOBAL_REGEX) || [];
      findings.push({
        context: contextName,
        line: lineNum + 1,
        matches: Array.from(new Set(matches)),
        snippet: line.trim().slice(0, 80)
      });
    }
  }
  return findings;
}

/**
 * Find the report markdown file for a given report ID.
 */
function findReportFile(reportId) {
  if (!existsSync(REPORTS_DIR)) return null;

  const paddedId = String(reportId).padStart(3, '0');
  const files = readdirSync(REPORTS_DIR);

  // Look for active report (non-RESERVED)
  for (const file of files) {
    if (file.endsWith('.md') && !file.includes('-RESERVED')) {
      const match = file.match(/^0*(\d+)-/);
      if (match && parseInt(match[1], 10) === reportId) {
        return join(REPORTS_DIR, file);
      }
    }
  }

  // Check if reserved sentinel exists
  const reservedFile = join(REPORTS_DIR, `${reportId}-RESERVED.md`);
  const paddedReservedFile = join(REPORTS_DIR, `${paddedId}-RESERVED.md`);
  if (existsSync(reservedFile) || existsSync(paddedReservedFile)) {
    return { isReservedOnly: true, reportId };
  }

  return null;
}

/**
 * Get PDF page count using pdfinfo.
 */
function getPdfPageCount(pdfPath) {
  try {
    const stdout = execFileSync('pdfinfo', [pdfPath], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 10000
    });
    const match = stdout.match(/Pages:\s+(\d+)/);
    if (!match) return { pages: null, error: 'Could not parse Pages from pdfinfo output' };
    return { pages: parseInt(match[1], 10), error: null };
  } catch (err) {
    return { pages: null, error: err.message };
  }
}

/**
 * Extract plain text from PDF using pdftotext.
 */
function extractPdfText(pdfPath) {
  try {
    const stdout = execFileSync('pdftotext', [pdfPath, '-'], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 10000
    });
    return { text: stdout, error: null };
  } catch (err) {
    return { text: null, error: err.message };
  }
}

/**
 * Find output files (.pdf and .tex) for a report ID.
 */
function findOutputFiles(reportId, reportPdfLink) {
  let pdfFile = null;
  let texFile = null;

  // First try extracting directly from the report's PDF field
  if (reportPdfLink) {
    const match = reportPdfLink.match(/\(([^)]+)\)/);
    const candidatePath = match ? match[1] : reportPdfLink;
    if (candidatePath && candidatePath !== '-') {
      const normalizedPath = candidatePath.replace(/^\.\.\//, '');
      const fullPdfPath = resolve(ROOT, normalizedPath);
      if (existsSync(fullPdfPath)) {
        pdfFile = fullPdfPath;
        const candidateTex = fullPdfPath.replace(/\.pdf$/, '.tex');
        if (existsSync(candidateTex)) {
          texFile = candidateTex;
        }
      } else {
        // Record path even if missing for error reporting
        pdfFile = fullPdfPath;
        const candidateTex = fullPdfPath.replace(/\.pdf$/, '.tex');
        if (existsSync(candidateTex)) {
          texFile = candidateTex;
        }
      }
    }
  }

  // Fallback: search output directory for matching report number
  if ((!pdfFile || !existsSync(pdfFile)) && existsSync(OUTPUT_DIR)) {
    const paddedId = String(reportId).padStart(3, '0');
    const files = readdirSync(OUTPUT_DIR);
    for (const f of files) {
      if ((f.includes(`-${reportId}-`) || f.includes(`-${paddedId}-`) || f.endsWith(`-${reportId}.pdf`) || f.endsWith(`-${paddedId}.pdf`)) && f.endsWith('.pdf')) {
        pdfFile = join(OUTPUT_DIR, f);
        const correspondingTex = join(OUTPUT_DIR, f.replace(/\.pdf$/, '.tex'));
        if (existsSync(correspondingTex)) {
          texFile = correspondingTex;
        }
        break;
      }
    }
  }

  // If tex is still missing, search output for any .tex matching the ID
  if ((!texFile || !existsSync(texFile)) && existsSync(OUTPUT_DIR)) {
    const paddedId = String(reportId).padStart(3, '0');
    const files = readdirSync(OUTPUT_DIR);
    for (const f of files) {
      if ((f.includes(`-${reportId}-`) || f.includes(`-${paddedId}-`) || f.endsWith(`-${reportId}.tex`) || f.endsWith(`-${paddedId}.tex`)) && f.endsWith('.tex')) {
        texFile = join(OUTPUT_DIR, f);
        break;
      }
    }
  }

  return { pdfFile, texFile };
}

/**
 * Parse application tracker table rows.
 */
function parseTrackerRows() {
  if (!existsSync(TRACKER_FILE)) return new Map();

  const content = readFileSync(TRACKER_FILE, 'utf-8');
  const lines = content.split('\n');
  const rowsMap = new Map();

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum].trim();
    if (!line.startsWith('|')) continue;

    const cells = line.split('|').map(c => c.trim());
    if (cells.length < 11) continue; // pipe at start and end creates leading/trailing empty cells

    // cells[0] is empty, cells[1] is '#', etc.
    const rawId = cells[1];
    const reportId = parseInt(rawId, 10);
    if (isNaN(reportId)) continue; // Header or separator line

    rowsMap.set(reportId, {
      lineNum: lineNum + 1,
      rawLine: line,
      columnsCount: cells.length - 2,
      id: reportId,
      date: cells[2],
      company: cells[3],
      role: cells[4],
      score: cells[5],
      status: cells[6],
      pdf: cells[7],
      report: cells[8],
      notes: cells[9]
    });
  }

  return rowsMap;
}

/**
 * Validate a single report and its downstream artifacts.
 */
function verifyReport(reportId, trackerRows) {
  const result = {
    id: reportId,
    reportFile: null,
    reportExists: false,
    headerValid: false,
    yamlSummaryValid: false,
    yamlData: null,
    score: null,
    legitimacyTier: null,
    advertisedComp: null,
    blocksValid: false,
    missingBlocks: [],
    coverLetterValid: false,
    keywordsValid: false,
    isViable: false,
    pdfExists: false,
    texExists: false,
    pdfFile: null,
    texFile: null,
    pdfPages: null,
    pdfPageCountValid: false,
    isSpanishCv: false,
    spanishMacroClean: true,
    spanishMacroErrors: [],
    trackerRowExists: false,
    trackerValid: false,
    trackerErrors: [],
    emojiFindings: [],
    errors: [],
    warnings: []
  };

  // 1. Check report existence
  const reportLookup = findReportFile(reportId);
  if (!reportLookup) {
    result.errors.push(`Report ${reportId}: Markdown report file does not exist in reports/`);
    return result;
  }

  if (reportLookup.isReservedOnly) {
    result.errors.push(`Report ${reportId}: Only reservation sentinel exists; full evaluation has not been written`);
    return result;
  }

  result.reportFile = reportLookup;
  result.reportExists = true;

  const content = readFileSync(result.reportFile, 'utf-8');
  if (content.trim().length < 200) {
    result.errors.push(`Report ${reportId}: Content too short (${content.length} bytes)`);
    return result;
  }

  // Check emojis in report markdown
  const reportEmojis = findEmojis(content, basename(result.reportFile));
  if (reportEmojis.length > 0) {
    result.emojiFindings.push(...reportEmojis);
    result.errors.push(`Report ${reportId}: Emoji detected in report markdown (${reportEmojis.length} occurrence(s))`);
  }

  // 2. Validate Header
  const hasTitle = /^#\s+Evaluaci[oó]n:/im.test(content) || /^#\s+Evaluation:/im.test(content);
  const hasDate = /\*\*Date:\*\*/i.test(content) || /\*\*Fecha:\*\*/i.test(content);
  const hasScoreHeader = /\*\*Score:\*\*/i.test(content) || /\*\*Puntuaci[oó]n:\*\*/i.test(content);
  const hasLegitimacyHeader = /\*\*Legitimacy:\*\*/i.test(content) || /\*\*Legitimidad:\*\*/i.test(content);
  const hasPdfHeader = /\*\*PDF:\*\*/i.test(content);

  result.headerValid = hasTitle && hasDate && hasScoreHeader && hasLegitimacyHeader && hasPdfHeader;
  if (!result.headerValid) {
    const missing = [];
    if (!hasTitle) missing.push('Title (# Evaluation:)');
    if (!hasDate) missing.push('**Date:**');
    if (!hasScoreHeader) missing.push('**Score:**');
    if (!hasLegitimacyHeader) missing.push('**Legitimacy:**');
    if (!hasPdfHeader) missing.push('**PDF:**');
    result.errors.push(`Report ${reportId}: Missing required header metadata: ${missing.join(', ')}`);
  }

  // Extract PDF link from header
  const pdfHeaderMatch = content.match(/\*\*PDF:\*\*\s*(.*)/i);
  const reportPdfLink = pdfHeaderMatch ? pdfHeaderMatch[1].trim() : null;

  // 3. Validate Machine Summary YAML
  const yamlMatch = content.match(/##\s+Machine\s+Summary\s*\n+```yaml([\s\S]*?)```/i);
  if (!yamlMatch) {
    result.errors.push(`Report ${reportId}: Missing YAML Machine Summary block under ## Machine Summary`);
  } else {
    try {
      const parsedYaml = yaml.load(yamlMatch[1]);
      if (typeof parsedYaml !== 'object' || parsedYaml === null) {
        result.errors.push(`Report ${reportId}: YAML Machine Summary parsed as non-object`);
      } else {
        result.yamlData = parsedYaml;

        // Validate score
        if (parsedYaml.score === null || parsedYaml.score === undefined || isNaN(Number(parsedYaml.score))) {
          result.errors.push(`Report ${reportId}: Machine Summary score is null or invalid`);
        } else {
          result.score = Number(parsedYaml.score);
        }

        // Validate legitimacy_tier
        if (!parsedYaml.legitimacy_tier || typeof parsedYaml.legitimacy_tier !== 'string' || parsedYaml.legitimacy_tier.trim() === '') {
          result.errors.push(`Report ${reportId}: Machine Summary legitimacy_tier is missing or empty`);
        } else {
          result.legitimacyTier = parsedYaml.legitimacy_tier.trim();
        }

        // Validate advertised_comp key presence
        if (!('advertised_comp' in parsedYaml)) {
          result.errors.push(`Report ${reportId}: Machine Summary advertised_comp key is missing`);
        } else {
          // If the role has an explicitly disclosed salary, verify it is non-null
          if (KNOWN_DISCLOSED_SALARY_IDS.includes(reportId) && (parsedYaml.advertised_comp === null || parsedYaml.advertised_comp === undefined || String(parsedYaml.advertised_comp).trim() === '')) {
            result.errors.push(`Report ${reportId}: Machine Summary advertised_comp must contain verbatim advertised compensation`);
          } else {
            result.advertisedComp = parsedYaml.advertised_comp !== null ? String(parsedYaml.advertised_comp).trim() : 'Not stated / null';
          }
        }

        // Validate company and role
        if (!parsedYaml.company) result.warnings.push(`Report ${reportId}: Machine Summary missing company key`);
        if (!parsedYaml.role) result.warnings.push(`Report ${reportId}: Machine Summary missing role key`);

        result.yamlSummaryValid = (result.score !== null && result.legitimacyTier !== null && result.advertisedComp !== null);
      }
    } catch (yamlErr) {
      result.errors.push(`Report ${reportId}: YAML parse error: ${yamlErr.message}`);
    }
  }

  // Determine viability (score >= 3.0)
  if (result.score !== null) {
    result.isViable = result.score >= 3.0;
  }

  // 4. Validate Required Blocks A through G
  const blockPatterns = [
    { block: 'A', regex: /##\s+A\)/i, name: 'A) Role Summary' },
    { block: 'B', regex: /##\s+B\)/i, name: 'B) Match with CV' },
    { block: 'C', regex: /##\s+C\)/i, name: 'C) Level and Strategy' },
    { block: 'D', regex: /##\s+D\)/i, name: 'D) Comp and Demand' },
    { block: 'E', regex: /##\s+E\)/i, name: 'E) Customization Plan' },
    { block: 'F', regex: /##\s+F\)/i, name: 'F) Interview Plan' },
    { block: 'G', regex: /##\s+G\)/i, name: 'G) Posting Legitimacy' }
  ];

  for (const bp of blockPatterns) {
    if (!bp.regex.test(content)) {
      result.missingBlocks.push(bp.name);
    }
  }

  result.blocksValid = result.missingBlocks.length === 0;
  if (!result.blocksValid) {
    result.errors.push(`Report ${reportId}: Missing required evaluation blocks: ${result.missingBlocks.join(', ')}`);
  }

  // Validate Cover Letter Draft
  const coverLetterRegex = /##\s+(?:Cover\s+Letter(?:\s+Draft)?|Carta\s+de\s+Presentaci[oó]n)/i;
  result.coverLetterValid = coverLetterRegex.test(content);
  if (!result.coverLetterValid) {
    result.errors.push(`Report ${reportId}: Missing ## Cover Letter Draft section`);
  }

  // Validate Keywords Extracted
  const keywordsRegex = /(?:##\s+Keywords(?:\s+extracted)?|\*\*JD\s+keywords\s+to\s+mirror\*\*|Keywords\s+extracted|Palabras\s+clave(?:\s+extra[ií]das)?)/i;
  result.keywordsValid = keywordsRegex.test(content);
  if (!result.keywordsValid) {
    result.errors.push(`Report ${reportId}: Missing Keywords extracted / JD keywords section`);
  }

  // Determine language orientation (Spanish CV vs English CV)
  const isSpanish = (reportPdfLink && reportPdfLink.includes('-es.')) ||
                    (result.reportFile && /-(?:es|espanol)\.md$/i.test(result.reportFile)) ||
                    (reportPdfLink && /-(?:es)\.pdf/i.test(reportPdfLink));
  result.isSpanishCv = Boolean(isSpanish);

  // 5. LaTeX and PDF Verification (for viable roles score >= 3.0)
  if (result.isViable) {
    const { pdfFile, texFile } = findOutputFiles(reportId, reportPdfLink);
    result.pdfFile = pdfFile;
    result.texFile = texFile;

    if (!pdfFile || !existsSync(pdfFile)) {
      result.errors.push(`Report ${reportId} (Score ${result.score} >= 3.0): Output PDF missing in output/ (${pdfFile ? basename(pdfFile) : 'unresolved'})`);
    } else {
      result.pdfExists = true;

      // Check PDF page count
      const { pages, error: pageErr } = getPdfPageCount(pdfFile);
      result.pdfPages = pages;
      if (pageErr) {
        result.errors.push(`Report ${reportId}: Failed to inspect PDF with pdfinfo: ${pageErr}`);
      } else if (pages !== 1) {
        result.errors.push(`Report ${reportId}: PDF has ${pages} page(s) (must be strictly 1 page)`);
      } else {
        result.pdfPageCountValid = true;
      }
    }

    if (!texFile || !existsSync(texFile)) {
      result.errors.push(`Report ${reportId} (Score ${result.score} >= 3.0): Output LaTeX source (.tex) missing in output/ (${texFile ? basename(texFile) : 'unresolved'})`);
    } else {
      result.texExists = true;

      // Check emojis in .tex file
      const texContent = readFileSync(texFile, 'utf-8');
      const texEmojis = findEmojis(texContent, basename(texFile));
      if (texEmojis.length > 0) {
        result.emojiFindings.push(...texEmojis);
        result.errors.push(`Report ${reportId}: Emoji detected in LaTeX source ${basename(texFile)} (${texEmojis.length} occurrence(s))`);
      }
    }

    // Spanish CV Macro Leak Check
    if (result.isSpanishCv) {
      if (pdfFile && existsSync(pdfFile)) {
        const { text: pdfText, error: pdfTextErr } = extractPdfText(pdfFile);
        if (pdfTextErr) {
          result.warnings.push(`Report ${reportId}: pdftotext extraction error: ${pdfTextErr}`);
        } else if (pdfText) {
          for (const macro of FORBIDDEN_SPANISH_MACROS) {
            if (macro.regex.test(pdfText)) {
              result.spanishMacroClean = false;
              result.spanishMacroErrors.push(`Found residual English macro string '${macro.name}' in compiled PDF text`);
            }
          }
        }
      }

      // Also inspect .tex file for un-redefined macro usage
      if (texFile && existsSync(texFile)) {
        const texContent = readFileSync(texFile, 'utf-8');
        if (/\\begin\{rSection\}\{SUMMARY\}/i.test(texContent)) {
          result.spanishMacroClean = false;
          result.spanishMacroErrors.push('Found raw \\begin{rSection}{SUMMARY} in LaTeX source');
        }
      }

      if (!result.spanishMacroClean) {
        for (const macroErr of result.spanishMacroErrors) {
          result.errors.push(`Report ${reportId} (Spanish CV): ${macroErr}`);
        }
      }
    }
  }

  // 6. Tracker Verification
  const trackerRow = trackerRows.get(reportId);
  if (!trackerRow) {
    result.errors.push(`Report ${reportId}: Row missing in data/applications.md`);
  } else {
    result.trackerRowExists = true;

    // Check emoji in tracker row
    const trackerEmojis = findEmojis(trackerRow.rawLine, `applications.md:line ${trackerRow.lineNum}`);
    if (trackerEmojis.length > 0) {
      result.emojiFindings.push(...trackerEmojis);
      result.errors.push(`Report ${reportId}: Emoji detected in tracker row line ${trackerRow.lineNum}`);
    }

    // Check 9 columns count
    if (trackerRow.columnsCount !== 9) {
      result.trackerErrors.push(`Column count is ${trackerRow.columnsCount} (expected 9)`);
    }

    // Check status is Evaluated
    if (trackerRow.status !== 'Evaluated') {
      result.trackerErrors.push(`Status is '${trackerRow.status}' (expected 'Evaluated')`);
    }

    // Check Report link points to existing report file
    const reportLinkMatch = trackerRow.report.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (!reportLinkMatch) {
      result.trackerErrors.push(`Report column is not a valid markdown link: '${trackerRow.report}'`);
    } else {
      const relPath = reportLinkMatch[2];
      const resolvedReport = resolve(dirname(TRACKER_FILE), relPath);
      if (!existsSync(resolvedReport)) {
        result.trackerErrors.push(`Report link target does not exist: '${relPath}'`);
      }
    }

    // Check PDF link
    if (result.isViable) {
      const pdfLinkMatch = trackerRow.pdf.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (!pdfLinkMatch) {
        result.trackerErrors.push(`PDF column is not a markdown link for viable role: '${trackerRow.pdf}'`);
      } else {
        const relPdfPath = pdfLinkMatch[2];
        const resolvedPdf = resolve(dirname(TRACKER_FILE), relPdfPath);
        if (!existsSync(resolvedPdf)) {
          result.trackerErrors.push(`PDF link target does not exist: '${relPdfPath}'`);
        }
      }
    }

    result.trackerValid = result.trackerErrors.length === 0;
    if (!result.trackerValid) {
      for (const tErr of result.trackerErrors) {
        result.errors.push(`Report ${reportId} (Tracker): ${tErr}`);
      }
    }
  }

  return result;
}

/**
 * Main execution routine.
 */
function runSuite() {
  const options = parseArgs();
  const trackerRows = parseTrackerRows();

  // Determine list of IDs to check
  let targetIds = [];
  if (options.ids && options.ids.length > 0) {
    targetIds = options.ids;
  } else {
    for (let i = options.startId; i <= options.endId; i++) {
      targetIds.push(i);
    }
  }

  const results = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const id of targetIds) {
    const res = verifyReport(id, trackerRows);
    results.push(res);
    totalErrors += res.errors.length;
    totalWarnings += res.warnings.length;
  }

  // Summary aggregation
  const summary = {
    totalChecked: targetIds.length,
    reportsFound: results.filter(r => r.reportExists).length,
    validReports: results.filter(r => r.reportExists && r.headerValid && r.yamlSummaryValid && r.blocksValid).length,
    viableRoles: results.filter(r => r.isViable).length,
    validPdfs: results.filter(r => r.isViable && r.pdfExists && r.pdfPageCountValid).length,
    validTexs: results.filter(r => r.isViable && r.texExists).length,
    spanishCvsChecked: results.filter(r => r.isSpanishCv).length,
    spanishMacroClean: results.filter(r => r.isSpanishCv && r.spanishMacroClean).length,
    trackerRowsPresent: results.filter(r => r.trackerRowExists).length,
    trackerRowsValid: results.filter(r => r.trackerValid).length,
    emojiViolations: results.reduce((acc, r) => acc + r.emojiFindings.length, 0),
    totalErrors,
    totalWarnings,
    passed: totalErrors === 0
  };

  // Output formatting
  if (options.json) {
    console.log(JSON.stringify({ summary, results }, null, 2));
  } else {
    console.log('='.repeat(72));
    console.log('TECNOLOGICO DE MONTERREY 14-BATCH ACCEPTANCE VERIFICATION SUITE');
    console.log('='.repeat(72));

    for (const r of results) {
      const statusTag = r.errors.length === 0 ? '[PASS]' : '[FAIL]';
      const company = r.yamlData?.company || 'Unknown Company';
      const role = r.yamlData?.role || 'Unknown Role';
      const scoreStr = r.score !== null ? `${r.score}/5` : 'N/A';
      const viableStr = r.isViable ? 'Viable (>=3.0)' : 'Non-viable';

      console.log(`\n${statusTag} Report ${r.id}: ${company} - ${role}`);
      console.log(`       Score: ${scoreStr} (${viableStr}) | Legitimacy: ${r.legitimacyTier || 'N/A'}`);
      console.log(`       Blocks A-G: ${r.blocksValid ? 'OK' : 'FAIL'} | Cover Letter: ${r.coverLetterValid ? 'OK' : 'FAIL'} | Keywords: ${r.keywordsValid ? 'OK' : 'FAIL'}`);

      if (r.isViable) {
        const pageStr = r.pdfPages !== null ? `${r.pdfPages} page(s)` : 'Missing PDF';
        const macroStr = r.isSpanishCv ? (r.spanishMacroClean ? 'Spanish clean' : 'SPANISH MACRO LEAK') : 'English CV';
        console.log(`       PDF: ${r.pdfExists ? 'OK' : 'FAIL'} (${pageStr}) | TeX: ${r.texExists ? 'OK' : 'FAIL'} | Macro: ${macroStr}`);
      }

      console.log(`       Tracker: ${r.trackerValid ? 'OK' : 'FAIL'} | Emojis: ${r.emojiFindings.length === 0 ? 'None' : `${r.emojiFindings.length} found`}`);

      if (r.errors.length > 0) {
        for (const err of r.errors) {
          console.log(`       -> ERROR: ${err}`);
        }
      }
    }

    console.log('\n' + '-'.repeat(72));
    console.log('BATCH VERIFICATION SUMMARY:');
    console.log(`  Total Reports Targeted:      ${summary.totalChecked}`);
    console.log(`  Reports Present:             ${summary.reportsFound}/${summary.totalChecked}`);
    console.log(`  Valid Full Reports:          ${summary.validReports}/${summary.totalChecked}`);
    console.log(`  Viable Roles (Score >= 3.0): ${summary.viableRoles}`);
    console.log(`  Valid Single-Page PDFs:      ${summary.validPdfs}/${summary.viableRoles}`);
    console.log(`  Valid LaTeX Sources (.tex):  ${summary.validTexs}/${summary.viableRoles}`);
    console.log(`  Spanish CV Macro Clean:      ${summary.spanishMacroClean}/${summary.spanishCvsChecked}`);
    console.log(`  Tracker Rows Valid:          ${summary.trackerRowsValid}/${summary.totalChecked}`);
    console.log(`  Emoji Violations:            ${summary.emojiViolations}`);
    console.log(`  Total Error Count:           ${summary.totalErrors}`);
    console.log('-'.repeat(72));

    if (summary.passed) {
      console.log('RESULT: ALL ACCEPTANCE CHECKS PASSED');
    } else {
      console.log('RESULT: ACCEPTANCE CHECKS FAILED - REVIEW ERRORS ABOVE');
    }
    console.log('='.repeat(72) + '\n');
  }

  process.exit(summary.passed ? 0 : 1);
}

runSuite();
