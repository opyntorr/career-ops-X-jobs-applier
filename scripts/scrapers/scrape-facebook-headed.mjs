import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const PIPELINE_PATH = resolve(rootDir, 'data', 'pipeline.md');
const FB_LOG_PATH = resolve(rootDir, 'data', 'facebook-mazatlan-leads.md');
const PROFILE_DIR = '/home/opyntorr/.gemini/antigravity-cli/brain/59daa672-f2d4-47a6-8357-c99e075218c6/scratch/browser-profile';

const targetGroups = [
  { id: '1083163351740685', name: 'EMPLEOS - MAZATLAN (+100k miembros)' },
  { id: '1572979269668383', name: 'Empleos solo empleos. Mazatlan Sinaloa' },
  { id: '323861214967341', name: 'Bolsa de Trabajo Contratación Inmediata Mazatlan' },
  { id: '317336152345592', name: 'BOLSA DE TRABAJO MAZATLAN' }
];

const searchTerms = [
  'ingeniero',
  'sistemas',
  'programador',
  'mantenimiento',
  'electronica',
  'mecatronica',
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
  /\bchofer\b/i,
  /\brepartidor\b/i,
  /\bcociner[oa]\b/i,
  /\bmeser[oa]\b/i,
  /\blimpieza\b/i,
  /\bintendente\b/i,
  /\bseguridad\s+privada\b/i,
  /\bguardia\b/i
];

export async function scrapeFacebookHeaded(options = { dryRun: false }) {
  console.log('======================================================');
  console.log('   FACEBOOK MAZATLAN — EXTRACCION EN MODO RENDERIZADO ');
  console.log('======================================================\n');
  console.log('Iniciando navegador Chromium visible...');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ['--disable-blink-features=AutomationControlled', '--disable-notifications']
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  const leads = [];

  for (const grp of targetGroups) {
    console.log(`\n------------------------------------------------------`);
    console.log(`Explorando Grupo: ${grp.name} (ID: ${grp.id})`);
    console.log(`------------------------------------------------------`);

    for (const term of searchTerms.slice(0, 4)) {
      const searchUrl = `https://www.facebook.com/groups/${grp.id}/search/?q=${encodeURIComponent(term)}`;
      console.log(`\n[FB Mazatlán] Buscando "${term}" en ${grp.name}...`);

      try {
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await page.waitForTimeout(3000);

        // Hacer scroll para cargar publicaciones
        for (let s = 0; s < 3; s++) {
          await page.evaluate(() => window.scrollBy(0, 800));
          await page.waitForTimeout(1500);
        }

        // Extraer publicaciones visibles
        const posts = await page.evaluate(() => {
          const articles = Array.from(document.querySelectorAll('div[role="feed"] div[role="article"], div[role="article"], div[data-ad-preview="message"]'));
          return articles.map(art => {
            const text = art.innerText || '';
            const links = Array.from(art.querySelectorAll('a[href*="/groups/"]')).map(a => a.href);
            const postLink = links.find(l => l.includes('/posts/') || l.includes('multi_permalinks=')) || '';

            return {
              text,
              postLink
            };
          });
        });

        console.log(`  -> Analizados ${posts.length} bloques de contenido.`);

        for (const p of posts) {
          const text = p.text;
          if (!text || text.length < 30) continue;

          // Excluir si tiene palabras negativas dominantes
          const isNegative = NEGATIVE_PATTERNS.some(pat => pat.test(text));
          if (isNegative) continue;

          // Buscar teléfonos (ej. 669...) y correos
          const phoneMatch = text.match(/(?:\+?52\s?)?(?:669[\s\-\.]?\d{3}[\s\-\.]?\d{4}|\d{10})/g);
          const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);

          // Verificar si ya lo tenemos
          const snippet = text.split('\n').filter(Boolean).slice(0, 3).join(' - ');
          if (!leads.some(l => l.snippet === snippet)) {
            leads.push({
              group: grp.name,
              term,
              postLink: p.postLink || `https://www.facebook.com/groups/${grp.id}/`,
              phones: phoneMatch ? Array.from(new Set(phoneMatch)) : [],
              emails: emailMatch ? Array.from(new Set(emailMatch)) : [],
              snippet,
              fullText: text
            });
          }
        }

      } catch (err) {
        console.warn(`  [!] Error en consulta "${term}":`, err.message);
      }
    }
  }

  await context.close();
  console.log(`\n[FB Mazatlán] Total de publicaciones/contactos capturados: ${leads.length}`);

  // Guardar reporte en data/facebook-mazatlan-leads.md
  if (leads.length > 0) {
    let reportContent = `# Oportunidades y Contactos Directos — Grupos Facebook Mazatlán\n\n`;
    reportContent += `Actualizado: ${new Date().toISOString()}\n\n`;
    reportContent += `| Grupo | Búsqueda | Contacto (WhatsApp/Email) | Resumen | Enlace |\n`;
    reportContent += `|---|---|---|---|---|\n`;

    for (const lead of leads) {
      const contact = [
        lead.phones.length ? `Tel/WA: ${lead.phones.join(', ')}` : '',
        lead.emails.length ? `Email: ${lead.emails.join(', ')}` : ''
      ].filter(Boolean).join('<br>') || 'En publicación';

      reportContent += `| ${lead.group} | ${lead.term} | ${contact} | ${lead.snippet.replace(/\|/g, '-')} | [Post](${lead.postLink}) |\n`;
    }

    writeFileSync(FB_LOG_PATH, reportContent, 'utf-8');
    console.log(`[OK] Guardado reporte de contactos en ${FB_LOG_PATH}`);
  }

  return leads;
}

if (process.argv[1]?.endsWith('scrape-facebook-headed.mjs')) {
  scrapeFacebookHeaded({ dryRun: process.argv.includes('--dry-run') }).catch(console.error);
}
