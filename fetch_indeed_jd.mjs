import { chromium } from 'playwright';
import fs from 'fs';

const url = process.argv[2];
if (!url) {
  console.error("Please provide a URL");
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); // Wait for js to render text
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('jd_output.txt', text);
  await browser.close();
})();
