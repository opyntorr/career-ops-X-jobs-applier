import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://intel.wd1.myworkdayjobs.com/External/job/Mexico-Guadalajara/Pre-Si-Systems-Intern_JR0283302', { waitUntil: 'networkidle' });
  const content = await page.evaluate(() => document.body.innerText);
  console.log(content);
  await browser.close();
})();
