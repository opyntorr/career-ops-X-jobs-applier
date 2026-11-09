const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://intel.wd1.myworkdayjobs.com/External/job/Mexico-Guadalajara/Design-Verification-Student-Worker_JR0283311', { waitUntil: 'networkidle' });
  // Workday usually renders the JD in a div, wait for it
  await page.waitForTimeout(3000);
  const text = await page.evaluate(() => document.body.innerText);
  const fs = require('fs');
  fs.writeFileSync('jd_scraped_intel.txt', text);
  await browser.close();
})();
