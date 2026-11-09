import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://mx.linkedin.com/jobs/view/software-development-engineer-internship-guadalajara-at-amazon-4334953021', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const content = await page.evaluate(() => document.body.innerText);
  console.log(content);
  await browser.close();
})();
