import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { scrapeIndeedMazatlan } from './scrape-mazatlan-indeed.mjs';
import { scrapeComputrabajoMazatlan } from './scrape-mazatlan-computrabajo.mjs';
import { scrapeFacebookMazatlan } from './scrape-facebook-groups-mazatlan.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');

const PIPELINE_PATH = resolve(rootDir, 'data', 'pipeline.md');
const SCAN_HISTORY_PATH = resolve(rootDir, 'data', 'scan-history.tsv');

// Palabras clave positivas con soporte de límites de palabra para términos cortos
const POSITIVE_PATTERNS = [
  /\bingenier/i,
  /\bsistemas/i,
  /\bprogramad/i,
  /\bdesarrollad/i,
  /\bsoftware/i,
  /\b(ia|ai)\b/i,
  /\bmantenimiento/i,
  /\belectroni/i,
  /\bmecatroni/i,
  /\bautomatiz/i,
  /\b(red|redes)\b/i,
  /\btelecom/i,
  /\bdiseñ/i,
  /\b3d\b/i,
  /\bcad\b/i,
  /\bjoyer/i,
  /\bsoporte/i,
  /\b(ti|it)\b/i,
  /\bpracticante/i,
  /\bbecario/i,
  /\bintern\b/i
];

const NEGATIVE_PATTERNS = [
  /\bventas\b/i,
  /\bcr[eé]dito/i,
  /\bcobranza\b/i,
  /\bcajer[oa]\b/i,
  /\balmacenista\b/i,
  /\benfermer[oa]\b/i,
  /\bguarder[ií]a\b/i,
  /\bestancia\b/i,
  /\babogad[oa]\b/i,
  /\blegal\b/i,
  /\bchofer\b/i,
  /\brepartidor\b/i,
  /\bcociner[oa]\b/i,
  /\bmeser[oa]\b/i,
  /\blimpieza\b/i,
  /\bintendente\b/i,
  /\bpromotor[a]?\b/i,
  /\bvendedor[a]?\b/i,
  /\bcall\s*center\b/i,
  /\basociados\b/i
];

function isRelevant(title, text = '') {
  const combined = `${title} ${text}`;
  const hasNegative = NEGATIVE_PATTERNS.some(p => p.test(combined));
  if (hasNegative) return false;
  return POSITIVE_PATTERNS.some(p => p.test(combined));
}

async function runDiscovery() {
  console.log('====================================================');
  console.log('   PROSPECCIÓN MULTICANAL DE EMPLEOS — MAZATLÁN     ');
  console.log('====================================================\n');

  const dryRun = process.argv.includes('--dry-run');

  // Cargar scan history para dedup
  let historyUrls = new Set();
  if (existsSync(SCAN_HISTORY_PATH)) {
    const lines = readFileSync(SCAN_HISTORY_PATH, 'utf-8').split('\n');
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts[1]) historyUrls.add(parts[1].trim());
    }
  }

  // Ejecutar scrapers concurrentemente
  const [indeedJobs, compuJobs, fbPosts] = await Promise.all([
    scrapeIndeedMazatlan({ dryRun }).catch(e => { console.error('Indeed error:', e.message); return []; }),
    scrapeComputrabajoMazatlan({ dryRun }).catch(e => { console.error('Computrabajo error:', e.message); return []; }),
    scrapeFacebookMazatlan({ dryRun }).catch(e => { console.error('Facebook error:', e.message); return []; })
  ]);

  const allFound = [...indeedJobs, ...compuJobs, ...fbPosts];
  console.log(`\n[Consolidación] Total de registros encontrados: ${allFound.length}`);

  const filtered = allFound.filter(item => {
    if (!item.url) return false;
    if (historyUrls.has(item.url)) return false;
    return isRelevant(item.title, item.snippet || '');
  });

  console.log(`[Consolidación] Registros técnicos relevantes: ${filtered.length}\n`);

  for (const item of filtered) {
    console.log(`- [${item.source}] ${item.title} | ${item.company || 'N/A'}`);
    if (item.phone) console.log(`    Tel/WhatsApp: ${item.phone}`);
    if (item.email) console.log(`    Email: ${item.email}`);
    console.log(`    Link: ${item.url}\n`);
  }

  if (dryRun) {
    console.log('[Dry Run] Modo prueba activado. No se modificó data/pipeline.md');
    return;
  }

  if (filtered.length > 0 && existsSync(PIPELINE_PATH)) {
    let pipelineContent = readFileSync(PIPELINE_PATH, 'utf-8');
    const newEntries = filtered.map(item => {
      const note = [
        item.company,
        item.source,
        item.salary,
        item.phone ? `Tel: ${item.phone}` : '',
        item.email ? `Email: ${item.email}` : ''
      ].filter(Boolean).join(' | ');

      return `- [ ] ${item.url} | ${item.company || 'Empresa'} | ${item.title} | ${item.location || 'Mazatlán, Sin.'}`;
    }).join('\n');

    if (pipelineContent.includes('## Pending')) {
      pipelineContent = pipelineContent.replace('## Pending\n', `## Pending\n${newEntries}\n`);
    } else {
      pipelineContent += `\n## Pending\n${newEntries}\n`;
    }

    writeFileSync(PIPELINE_PATH, pipelineContent, 'utf-8');
    console.log(`[Éxito] Se agregaron ${filtered.length} vacantes a data/pipeline.md`);
  }
}

runDiscovery().catch(console.error);
