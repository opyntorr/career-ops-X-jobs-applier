import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const PIPELINE_PATH = resolve(rootDir, 'data', 'pipeline.md');
const SCAN_HISTORY_PATH = resolve(rootDir, 'data', 'scan-history.tsv');
const PROFILE_DIR = '/home/opyntorr/.gemini/antigravity-cli/brain/59daa672-f2d4-47a6-8357-c99e075218c6/scratch/browser-profile';

const queries = [
  'ingeniero',
  'sistemas',
  'programador',
  'electronica',
  'mecatronica',
  'mantenimiento',
  'diseno 3d'
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
  /\bcall\s*center\b/i
];

export async function scrapeIndeedHeaded(options = { dryRun: false }) {
  console.log('======================================================');
  console.log('   INDEED MAZATLAN — EXTRACCION EN MODO RENDERIZADO   ');
  console.log('======================================================\n');
  console.log('Iniciando navegador Chromium visible...');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  const allJobs = [];

  for (const q of queries) {
    const url = `https://mx.indeed.com/jobs?q=${encodeURIComponent(q)}&l=Mazatl%C3%A1n%2C+Sin.&fromage=30`;
    console.log(`\n[Indeed Mazatlán] Consultando: "${q}"...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });

      // Verificar si hay Cloudflare / Captcha
      let title = await page.title();
      let isChallenge = title.includes('Just a moment') || title.includes('Attention Required') || (await page.$('#challenge-running, #challenge-form, iframe[src*="cloudflare"]')) !== null;

      if (isChallenge) {
        console.log('\n------------------------------------------------------');
        console.log('[ACCION REQUERIDA] Cloudflare detectado en Indeed.');
        console.log('Por favor resuelve la casilla "No soy un robot" en la ventana abierta.');
        console.log('Esperando resolución hasta 60 segundos...');
        console.log('------------------------------------------------------\n');

        for (let wait = 0; wait < 30; wait++) {
          await page.waitForTimeout(2000);
          title = await page.title();
          const hasCards = (await page.$('.job_seen_beacon, #mosaic-provider-jobcards')) !== null;
          if (hasCards && !title.includes('Just a moment')) {
            console.log('[OK] Verificacion superada con exito.');
            break;
          }
        }
      } else {
        await page.waitForTimeout(2500);
      }

      // Extraer tarjetas de empleo
      const pageJobs = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.job_seen_beacon'));
        return cards.map(card => {
          const titleEl = card.querySelector('h2.jobTitle a') || card.querySelector('h2.jobTitle span');
          const linkEl = card.querySelector('h2.jobTitle a');
          const companyEl = card.querySelector('[data-testid="company-name"]') || card.querySelector('.companyName');
          const locationEl = card.querySelector('[data-testid="text-location"]') || card.querySelector('.companyLocation');
          const salaryEl = card.querySelector('.salary-snippet-container') || card.querySelector('.metadata div');
          const snippetEl = card.querySelector('.job-snippet') || card.querySelector('.underShelfFooter');

          const title = titleEl ? titleEl.innerText.trim() : '';
          const company = companyEl ? companyEl.innerText.trim() : 'Empresa';
          const location = locationEl ? locationEl.innerText.trim() : 'Mazatlán, Sin.';
          const salary = salaryEl ? salaryEl.innerText.trim() : '';
          const snippet = snippetEl ? snippetEl.innerText.trim() : '';

          let href = linkEl ? linkEl.getAttribute('href') : '';
          let fullUrl = '';
          if (href) {
            if (href.startsWith('/')) {
              fullUrl = 'https://mx.indeed.com' + href;
            } else {
              fullUrl = href;
            }
          }

          return { title, company, location, salary, snippet, url: fullUrl, source: 'Indeed Mazatlán' };
        }).filter(j => j.title && j.url);
      });

      console.log(`  -> Encontradas ${pageJobs.length} vacantes para "${q}".`);

      for (const job of pageJobs) {
        // Excluir puestos no técnicos
        const isNegative = NEGATIVE_PATTERNS.some(p => p.test(job.title));
        if (isNegative) continue;

        if (!allJobs.some(j => j.url === job.url)) {
          allJobs.push(job);
        }
      }

    } catch (err) {
      console.warn(`  [!] Error buscando "${q}":`, err.message);
    }
  }

  await context.close();
  console.log(`\n[Indeed Mazatlán] Total de vacantes técnicas únicas: ${allJobs.length}`);

  // Cargar scan history para dedup
  let historyUrls = new Set();
  if (existsSync(SCAN_HISTORY_PATH)) {
    const lines = readFileSync(SCAN_HISTORY_PATH, 'utf-8').split('\n');
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts[1]) historyUrls.add(parts[1].trim());
    }
  }

  const newJobs = allJobs.filter(j => !historyUrls.has(j.url));
  console.log(`[Indeed Mazatlán] Vacantes nuevas no registradas: ${newJobs.length}`);

  for (const j of newJobs) {
    console.log(`- ${j.title} | ${j.company} | ${j.salary || 'Sueldo no especificado'}`);
    console.log(`  ${j.url}\n`);
  }

  if (!options.dryRun && newJobs.length > 0 && existsSync(PIPELINE_PATH)) {
    let content = readFileSync(PIPELINE_PATH, 'utf-8');
    const entries = newJobs.map(j => `- [ ] ${j.url} | ${j.company} | ${j.title} | ${j.location}`).join('\n');
    if (content.includes('## Pending')) {
      content = content.replace('## Pending\n', `## Pending\n${entries}\n`);
    } else {
      content += `\n## Pending\n${entries}\n`;
    }
    writeFileSync(PIPELINE_PATH, content, 'utf-8');
    console.log(`[OK] Se agregaron ${newJobs.length} ofertas a data/pipeline.md`);
  }

  return allJobs;
}

if (process.argv[1]?.endsWith('scrape-mazatlan-indeed-headed.mjs')) {
  scrapeIndeedHeaded({ dryRun: process.argv.includes('--dry-run') }).catch(console.error);
}
