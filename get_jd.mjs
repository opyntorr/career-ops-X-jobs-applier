import { chromium } from 'playwright';
import fs from 'fs';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = process.argv[2] || 'https://mx.indeed.com/viewjob?from=app-tracker-saved-appcard&hl=es&jk=63ed74411d329096&tk=1jsq6o2mp22vg000';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for js to render text
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('jd.txt', text);
  await browser.close();
})();
