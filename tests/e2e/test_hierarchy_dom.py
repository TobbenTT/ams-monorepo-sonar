from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})

    page.goto('http://localhost:8501/hierarchy', timeout=30000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)

    # Get the DOM structure of the radio group for the tree
    radio_html = page.evaluate("""
        () => {
            const radios = document.querySelectorAll('[data-testid="stRadio"]');
            if (radios.length > 0) {
                const r = radios[0];
                // Get first label's inner structure
                const labels = r.querySelectorAll('label');
                if (labels.length > 0) {
                    return labels[0].innerHTML;
                }
            }
            return 'No radio found';
        }
    """)
    print("Radio label HTML:", radio_html[:500])

    # Get all tabs and click on Grid Views
    page.locator('text=Grid Views').click()
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/hierarchy_03_grids.png', full_page=True)
    print("Grid Views screenshot saved")

    # Click on Statistics tab
    page.locator('text=Statistics').click()
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/hierarchy_04_stats.png', full_page=True)
    print("Statistics screenshot saved")

    # Click on Vendor Build tab
    page.locator('text=Vendor Build').click()
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/hierarchy_05_vendor.png', full_page=True)
    print("Vendor Build screenshot saved")

    browser.close()
