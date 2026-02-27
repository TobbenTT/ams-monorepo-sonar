from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})

    page.goto('http://localhost:8501/hierarchy', timeout=30000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)

    # Check the aria-label of the radiogroup
    aria = page.evaluate("""
        () => {
            const groups = document.querySelectorAll('[role="radiogroup"]');
            let result = '';
            for (let i = 0; i < groups.length; i++) {
                result += 'Group ' + i + ': aria-label="' + groups[i].getAttribute('aria-label') + '"\\n';
            }
            return result;
        }
    """)
    print(aria)

    # Screenshot
    page.screenshot(path='/tmp/hierarchy_radio_fix.png', full_page=True)
    print("Screenshot saved")

    browser.close()
