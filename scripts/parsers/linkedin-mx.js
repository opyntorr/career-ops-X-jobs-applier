const { chromium } = require('playwright');

async function scrapeLinkedIn(query, location = 'Mexico') {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
    });
    
    const page = await context.newPage();
    const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&f_TPR=r604800`; // r604800 = Past week
    
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Scroll down a few times to trigger lazy loading
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(1000);
        }
        
        const jobs = await page.evaluate(() => {
            const results = [];
            const cards = document.querySelectorAll('ul.jobs-search__results-list > li');
            
            cards.forEach(card => {
                const titleEl = card.querySelector('.base-search-card__title');
                const companyEl = card.querySelector('.base-search-card__subtitle');
                const locationEl = card.querySelector('.job-search-card__location');
                const linkEl = card.querySelector('.base-card__full-link');
                
                if (titleEl && linkEl) {
                    // Extract exact URL without tracking params
                    let url = linkEl.href;
                    if (url.includes('?')) {
                        url = url.split('?')[0]; 
                    }
                    
                    results.push({
                        title: titleEl.innerText.trim(),
                        company: companyEl ? companyEl.innerText.trim() : 'LinkedIn Company',
                        location: locationEl ? locationEl.innerText.trim() : 'Mexico',
                        url: url
                    });
                }
            });
            return results;
        });
        
        console.log(JSON.stringify(jobs, null, 2));
    } catch(e) {
        console.error(JSON.stringify({ error: e.message }));
    } finally {
        await browser.close();
    }
}

const query = process.argv[2] || "Mecatronica";
scrapeLinkedIn(query);
