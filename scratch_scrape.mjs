import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(process.argv[2], { waitUntil: 'networkidle' });
  const content = await page.evaluate(() => document.body.innerText);
  console.log(content);
  await browser.close();
})();
