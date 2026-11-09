import { chromium } from 'playwright';
import fs from 'fs';

const LIVENESS_CONTEXT_OPTIONS = {
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'en-US',
};

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext(LIVENESS_CONTEXT_OPTIONS);
    const page = await context.newPage();
    await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    const text = await page.evaluate(() => {
      return document.body.innerText;
    });
    const title = await page.title();
    
    fs.writeFileSync('jd_scraped_headed.txt', title + "\n\n" + text);
  } catch (err) {
    console.error(err);
  } finally {
    if (browser) await browser.close();
  }
})();
