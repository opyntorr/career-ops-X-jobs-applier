import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://mx.indeed.com/viewjob?from=app-tracker-saved-appcard&hl=es&jk=fd175a2b45dd2b54&tk=1jsq6o2mp22vg000', { waitUntil: 'networkidle' });
  const content = await page.evaluate(() => document.body.innerText);
  console.log(content);
  await browser.close();
})();
