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
  'software',
  'sistemas',
  'mantenimiento'
];

export async function scrapeLinkedInMazatlan(options = { dryRun: false }) {
  console.log('======================================================');
  console.log('   LINKEDIN MAZATLAN — EXTRACCION EN MODO RENDERIZADO ');
  console.log('======================================================\n');
  console.log('Iniciando navegador Chromium visible...');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  const jobs = [];

  for (const q of queries) {
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=Mazatl%C3%A1n%2C%20Sinaloa%2C%20Mexico`;
    console.log(`\n[LinkedIn Mazatlán] Consultando: "${q}"...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(2500);

      // Scroll para cargar tarjetas
      for (let s = 0; s < 3; s++) {
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(1000);
      }

      const found = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.base-search-card, .job-search-card, li:has(.base-card)'));
        return cards.map(c => {
          const titleEl = c.querySelector('.base-search-card__title, .job-search-card__title, h3');
          const companyEl = c.querySelector('.base-search-card__subtitle, .job-search-card__subtitle, h4');
          const locEl = c.querySelector('.job-search-card__location');
          const linkEl = c.querySelector('a.base-card__full-link, a[href*="/jobs/view/"]');

          const title = titleEl ? titleEl.innerText.trim() : '';
          const company = companyEl ? companyEl.innerText.trim() : '';
          const location = locEl ? locEl.innerText.trim() : 'Mazatlán, Sinaloa, Mexico';
          let href = linkEl ? linkEl.href : '';

          if (href && href.includes('?')) {
            href = href.split('?')[0];
          }

          return { title, company, location, url: href };
        }).filter(j => j.title && j.url);
      });

      console.log(`  -> Encontradas ${found.length} ofertas para "${q}".`);
      for (const item of found) {
        if (!jobs.some(j => j.url === item.url)) {
          jobs.push(item);
        }
      }

    } catch (err) {
      console.warn(`  [!] Error buscando "${q}":`, err.message);
    }
  }

  await context.close();
  console.log(`\n[LinkedIn Mazatlán] Total vacantes extraídas: ${jobs.length}`);

  // Deduplicación
  let historyUrls = new Set();
  if (existsSync(SCAN_HISTORY_PATH)) {
    const lines = readFileSync(SCAN_HISTORY_PATH, 'utf-8').split('\n');
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts[1]) historyUrls.add(parts[1].trim());
    }
  }

  const newJobs = jobs.filter(j => !historyUrls.has(j.url));
  console.log(`[LinkedIn Mazatlán] Nuevas para pipeline: ${newJobs.length}`);

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

  return jobs;
}

if (process.argv[1]?.endsWith('scrape-linkedin-mazatlan.mjs')) {
  scrapeLinkedInMazatlan({ dryRun: process.argv.includes('--dry-run') }).catch(console.error);
}
