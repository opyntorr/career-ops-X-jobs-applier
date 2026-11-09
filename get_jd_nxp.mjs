import { chromium } from 'playwright';
import fs from 'fs';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = process.argv[2];
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); // Wait for js to render text
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('jd_nxp.txt', text);
  await browser.close();
})();
