import { chromium } from 'playwright';

/**
 * scrape-mazatlan-computrabajo.mjs
 * Extrae vacantes técnicas, de software e ingeniería en Mazatlán desde Computrabajo.
 * Filtra estrictamente por localidad (Mazatlán o Remoto) y excluye puestos no técnicos.
 */

const searchQueries = [
  'programador',
  'sistemas',
  'ingeniero',
  'desarrollador',
  'electronica',
  'mecatronica',
  'mantenimiento-industrial',
  'automatizacion',
  'diseno-3d'
];

const NEGATIVE_TERMS = [
  'ventas',
  'credito',
  'crédito',
  'cobranza',
  'cajero',
  'almacenista',
  'enfermer',
  'guarderia',
  'guardería',
  'estancia',
  'abogado',
  'legal',
  'chofer',
  'repartidor',
  'cocinero',
  'mesero',
  'limpieza',
  'intendente',
  'promotor',
  'vendedor',
  'call center',
  'asociados' // Ej: "Desarrollador de Asociados" (ventas)
];

export async function scrapeComputrabajoMazatlan(options = { dryRun: false }) {
  console.log('[Computrabajo Mazatlán] Iniciando extracción dirigida...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const results = [];

  for (const q of searchQueries) {
    const url = `https://mx.computrabajo.com/trabajo-de-${q}-en-mazatlan`;
    console.log(`[Computrabajo Mazatlán] Buscando: "${q}" en Mazatlán...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);

      const items = await page.$$eval('article.box_offer', (articles) => {
        return articles.map((art) => {
          const titleEl = art.querySelector('h2.title a') || art.querySelector('a.js-o-link');
          const companyEl = art.querySelector('.link-company') || art.querySelector('p.fs16');
          const salaryEl = art.querySelector('span.salary') || art.querySelector('span.dBlock.bEmphasize');
          const fullText = art.innerText || '';

          const title = titleEl ? titleEl.innerText.trim() : '';
          const href = titleEl ? titleEl.getAttribute('href') : '';
          const company = companyEl ? companyEl.innerText.trim() : 'Empresa';
          const salary = salaryEl ? salaryEl.innerText.trim() : '';

          let fullUrl = href;
          if (href && href.startsWith('/')) {
            fullUrl = `https://mx.computrabajo.com${href}`;
          }

          // Detectar ubicación real en la tarjeta
          const isMazatlan = fullText.toLowerCase().includes('mazatlán') || fullText.toLowerCase().includes('mazatlan');
          const isRemoto = fullText.toLowerCase().includes('remoto');

          return {
            title,
            company,
            location: isMazatlan ? 'Mazatlán, Sin.' : (isRemoto ? 'Remoto' : 'Otra'),
            isMazatlan,
            isRemoto,
            url: fullUrl,
            salary,
            snippet: fullText.substring(0, 150).replace(/\n/g, ' '),
            source: 'Computrabajo Mazatlán'
          };
        }).filter(j => j.title && j.url);
      });

      for (const item of items) {
        // Solo aceptar si está en Mazatlán o es Remoto
        if (!item.isMazatlan && !item.isRemoto) continue;

        // Excluir puestos no técnicos
        const lowerTitle = item.title.toLowerCase();
        const hasNegative = NEGATIVE_TERMS.some(neg => lowerTitle.includes(neg));
        if (hasNegative) continue;

        if (!results.some(r => r.url === item.url)) {
          results.push(item);
        }
      }
    } catch (err) {
      console.warn(`  [!] Error buscando "${q}":`, err.message);
    }
  }

  await browser.close();
  console.log(`[Computrabajo Mazatlán] Total de vacantes técnicas válidas: ${results.length}`);
  return results;
}

if (process.argv[1]?.endsWith('scrape-mazatlan-computrabajo.mjs')) {
  scrapeComputrabajoMazatlan({ dryRun: process.argv.includes('--dry-run') })
    .then(jobs => {
      console.log(JSON.stringify(jobs, null, 2));
    })
    .catch(console.error);
}
