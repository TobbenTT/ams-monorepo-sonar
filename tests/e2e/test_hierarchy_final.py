from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})

    page.goto('http://localhost:8501/hierarchy', timeout=30000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)

    # Screenshot Explorer tab (default)
    page.screenshot(path='/tmp/hierarchy_final_01_explorer.png', full_page=True)
    print("1. Explorer tab captured")

    # Click on a tree item to expand - click on "Grinding" area
    # First let's try clicking on one of the radio options to expand an area
    radio_labels = page.locator('[data-baseweb="radio"]').all()
    print(f"   Found {len(radio_labels)} tree radio items")

    # Click Grid Views tab
    tabs = page.locator('[role="tab"]').all()
    for tab in tabs:
        txt = tab.text_content()
        if "Grid" in txt:
            tab.click()
            break
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/hierarchy_final_02_grids.png', full_page=True)
    print("2. Grid Views tab captured")

    # Click Statistics tab
    for tab in tabs:
        txt = tab.text_content()
        if "Statistics" in txt:
            tab.click()
            break
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/hierarchy_final_03_stats.png', full_page=True)
    print("3. Statistics tab captured")

    # Click Vendor Build tab
    for tab in tabs:
        txt = tab.text_content()
        if "Vendor" in txt:
            tab.click()
            break
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/hierarchy_final_04_vendor.png', full_page=True)
    print("4. Vendor Build tab captured")

    browser.close()
    print("\nDone! All screenshots saved to /tmp/")
