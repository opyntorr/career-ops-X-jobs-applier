import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = process.argv[2];
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait a bit just in case
  await page.waitForTimeout(3000);
  
  const title = await page.title();
  const text = await page.evaluate(() => document.body.innerText);
  
  console.log('--- START JD ---');
  console.log('TITLE:', title);
  console.log(text);
  console.log('--- END JD ---');
  
  await browser.close();
})();
