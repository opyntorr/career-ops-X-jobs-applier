import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ]
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
  });
  const page = await context.newPage();
  
  // Extra stealth script
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  try {
    console.log('Navigating...');
    await page.goto('https://mx.indeed.com/viewjob?jk=be43ba092d78fe86&hl=es', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    const content = await page.content();
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Title:', title);
    console.log('Body length:', bodyText.length);
    fs.writeFileSync('/tmp/test_indeed_out.txt', `Title: ${title}\nURL: ${page.url()}\n\n${bodyText}`);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
