import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const urls = [
  'https://mx.indeed.com/viewjob?jk=262f8df106f13040&hl=es',
  'https://mx.indeed.com/viewjob?jk=be43ba092d78fe86&hl=es',
  'https://mx.indeed.com/viewjob?jk=4add93a963fd9bee&hl=es'
];

const outDir = '/tmp/indeed-jds-batch2';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log('Abriendo navegador visible (headed mode)...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const u = new URL(url);
    const jk = u.searchParams.get('jk') || `job-${i+1}`;
    console.log(`[${i+1}/${urls.length}] Navegando a: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      console.log('Esperando renderizado / resolución de verificación...');
      
      let extracted = '';
      for (let attempt = 0; attempt < 15; attempt++) {
        await page.waitForTimeout(1000);
        const hasJdElem = await page.$('#jobDescriptionText, .jobsearch-JobComponent');
        if (hasJdElem) {
          extracted = await page.evaluate(() => {
            const jd = document.querySelector('#jobDescriptionText') || document.querySelector('.jobsearch-JobComponent') || document.body;
            return jd ? jd.innerText : '';
          });
          if (extracted && extracted.length > 100) break;
        }
      }

      if (!extracted || extracted.length < 100) {
        extracted = await page.evaluate(() => document.body ? document.body.innerText : '');
      }

      const title = await page.title();
      const filename = path.join(outDir, `${jk}.txt`);
      fs.writeFileSync(filename, `URL: ${url}\nTitle: ${title}\n\n${extracted}`);
      console.log(`Guardado ${jk}.txt (${extracted.length} caracteres).`);

    } catch (e) {
      console.error(`Error en ${url}:`, e.message);
    }
  }

  console.log('Extracción completada. Cerrando navegador...');
  await browser.close();
})();
