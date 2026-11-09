import { firefox } from 'playwright';
import fs from 'fs';

(async () => {
  try {
    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
      locale: 'es-MX',
    });
    const page = await context.newPage();
    console.log('Navigating with Firefox...');
    await page.goto('https://mx.indeed.com/viewjob?jk=be43ba092d78fe86&hl=es', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Title:', title);
    console.log('Body length:', bodyText.length);
    fs.writeFileSync('/tmp/test_indeed_ff.txt', `Title: ${title}\nURL: ${page.url()}\n\n${bodyText}`);
    await browser.close();
  } catch (e) {
    console.error('Error:', e);
  }
})();
