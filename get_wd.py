from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://intel.wd1.myworkdayjobs.com/External/job/Mexico-Guadalajara/Pre-Si-Systems-Intern_JR0283302", wait_until="networkidle")
    print("TITLE:", page.title())
    print("TEXT:", page.locator("body").inner_text())
    browser.close()
