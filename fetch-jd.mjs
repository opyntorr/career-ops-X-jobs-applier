import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://micron.wd1.myworkdayjobs.com/External/job/Jalisco-Mexico/Sr-Engineer--Memory-CAD--Guadalajara_JR85768');
  await page.waitForLoadState('networkidle');
  
  // Wait a bit just in case
  await page.waitForTimeout(3000);
  
  const content = await page.innerText('body');
  console.log(content);
  
  await browser.close();
})();
