import { chromium } from 'playwright';

/**
 * scrape-facebook-groups-mazatlan.mjs
 * Extrae publicaciones abiertas de vacantes y empleos en Mazatlán desde Facebook
 * utilizando Google Dorking sobre grupos públicos y perfiles de reclutamiento abiertos.
 */

const dorkQueries = [
  'site:facebook.com/groups "Mazatlan" ("solicito ingeniero" OR "vacante sistemas" OR "programador" OR "mantenimiento")',
  'site:facebook.com/groups "Mazatlan" ("practicante" OR "servicio social" OR "becario" OR "electronica" OR "mecatronica")',
  'site:facebook.com "Bolsa de trabajo Mazatlan" ("ingeniero" OR "sistemas" OR "diseño 3d" OR "joyeria" OR "tecnico")',
  'site:facebook.com "Empleos Mazatlan" ("669" AND ("ingeniero" OR "programador" OR "mantenimiento" OR "sistemas"))'
];

export async function scrapeFacebookMazatlan(options = { dryRun: false }) {
  console.log('[Facebook Groups Mazatlán - Dorking] Iniciando prospección...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const results = [];

  for (const query of dorkQueries) {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    console.log(`[Facebook Groups] Consultando: ${query.substring(0, 55)}...`);

    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(2000);

      const links = await page.$$eval('.result', (elements) => {
        return elements.map(el => {
          const titleEl = el.querySelector('.result__title a');
          const snippetEl = el.querySelector('.result__snippet');
          const urlEl = el.querySelector('.result__url');

          const title = titleEl ? titleEl.innerText.trim() : '';
          const url = titleEl ? titleEl.getAttribute('href') : '';
          const snippet = snippetEl ? snippetEl.innerText.trim() : '';

          // Buscar teléfonos/WhatsApp típicos de Mazatlán (669...)
          const phoneMatch = snippet.match(/(?:\+?52\s?)?(?:669[\s\-\.]?\d{3}[\s\-\.]?\d{4}|\d{10})/);
          const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

          return {
            title,
            url,
            snippet,
            phone: phoneMatch ? phoneMatch[0] : null,
            email: emailMatch ? emailMatch[0] : null,
            source: 'Facebook Groups / Public Mazatlán'
          };
        }).filter(item => item.url && item.url.includes('facebook.com'));
      });

      console.log(`  -> Encontrados ${links.length} posts públicos indexados.`);
      for (const item of links) {
        if (!results.some(r => r.url === item.url)) {
          results.push(item);
        }
      }
    } catch (err) {
      console.warn(`  [!] Error en búsqueda Dorking:`, err.message);
    }
  }

  await browser.close();
  console.log(`[Facebook Groups Mazatlán] Total de publicaciones extraídas: ${results.length}`);
  return results;
}

if (process.argv[1]?.endsWith('scrape-facebook-groups-mazatlan.mjs')) {
  scrapeFacebookMazatlan({ dryRun: process.argv.includes('--dry-run') })
    .then(posts => {
      console.log(JSON.stringify(posts.slice(0, 5), null, 2));
    })
    .catch(console.error);
}
