import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(process.argv[2], { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const text = await page.evaluate(() => {
    return document.body.innerText;
  });
  const title = await page.title();
  
  fs.writeFileSync('jd_scraped.txt', title + "\n\n" + text);
  await browser.close();
})();
