import { chromium } from 'playwright';
import fs from 'fs';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = 'https://intel.wd1.myworkdayjobs.com/External/job/Mexico-Guadalajara/Electrical-Validation-Engineering-Intern--Client-IO_JR0284202';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); 
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('jd2.txt', text);
  await browser.close();
})();
