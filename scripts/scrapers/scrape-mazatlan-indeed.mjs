import { chromium } from 'playwright';

/**
 * scrape-mazatlan-indeed.mjs
 * Extrae vacantes técnicas y de ingeniería en Mazatlán desde Indeed.
 */

const queries = [
  'ingeniero',
  'sistemas',
  'programador',
  'mantenimiento',
  'electronica',
  'mecatronica',
  'automatizacion',
  'diseno 3d'
];

export async function scrapeIndeedMazatlan(options = { dryRun: false }) {
  console.log('[Indeed Mazatlán] Iniciando extracción...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const results = [];

  for (const q of queries) {
    const url = `https://mx.indeed.com/jobs?q=${encodeURIComponent(q)}&l=Mazatl%C3%A1n%2C+Sin.&fromage=30`;
    console.log(`[Indeed Mazatlán] Buscando: "${q}"...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      const jobCards = await page.$$eval('.job_seen_beacon', (cards) => {
        return cards.map((card) => {
          const titleEl = card.querySelector('h2.jobTitle a') || card.querySelector('h2.jobTitle span');
          const companyEl = card.querySelector('[data-testid="company-name"]');
          const locationEl = card.querySelector('[data-testid="text-location"]');
          const linkEl = card.querySelector('h2.jobTitle a');
          const salaryEl = card.querySelector('.salary-snippet-container') || card.querySelector('.metadata div');

          const title = titleEl ? titleEl.innerText.trim() : '';
          const company = companyEl ? companyEl.innerText.trim() : 'Empresa en Mazatlán';
          const location = locationEl ? locationEl.innerText.trim() : 'Mazatlán, Sin.';
          const href = linkEl ? linkEl.getAttribute('href') : '';
          const salary = salaryEl ? salaryEl.innerText.trim() : '';

          let fullUrl = href;
          if (href && href.startsWith('/')) {
            fullUrl = `https://mx.indeed.com${href}`;
          }

          return { title, company, location, url: fullUrl, salary, source: 'Indeed Mazatlán' };
        }).filter(j => j.title && j.url);
      });

      console.log(`  -> Encontradas ${jobCards.length} vacantes para "${q}".`);
      for (const card of jobCards) {
        if (!results.some(r => r.url === card.url)) {
          results.push(card);
        }
      }
    } catch (err) {
      console.warn(`  [!] Error buscando "${q}" en Indeed:`, err.message);
    }
  }

  await browser.close();
  console.log(`[Indeed Mazatlán] Total únicas extraídas: ${results.length}`);
  return results;
}

if (process.argv[1]?.endsWith('scrape-mazatlan-indeed.mjs')) {
  scrapeIndeedMazatlan({ dryRun: process.argv.includes('--dry-run') })
    .then(jobs => {
      console.log(JSON.stringify(jobs.slice(0, 5), null, 2));
    })
    .catch(console.error);
}
