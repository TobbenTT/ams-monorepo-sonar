from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})

    # Navigate to the Streamlit app
    page.goto('http://localhost:8501', timeout=30000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    # Take initial screenshot
    page.screenshot(path='/tmp/hierarchy_01_home.png', full_page=True)

    # Look for the Hierarchy link in the sidebar
    # Streamlit sidebar navigation uses anchor tags
    sidebar_links = page.locator('a').all()
    print(f"Found {len(sidebar_links)} links on the page")
    for link in sidebar_links:
        text = link.text_content()
        href = link.get_attribute('href')
        if text and text.strip():
            print(f"  Link: '{text.strip()}' -> {href}")

    # Navigate directly to the hierarchy page
    page.goto('http://localhost:8501/hierarchy', timeout=30000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)

    # Take screenshot of hierarchy page
    page.screenshot(path='/tmp/hierarchy_02_page.png', full_page=True)
    print("Screenshot saved to /tmp/hierarchy_02_page.png")

    # Check page content
    content = page.content()
    if "Plant Hierarchy" in content or "hierarchy" in content.lower():
        print("SUCCESS: Hierarchy page content detected")
    else:
        print("WARNING: Hierarchy page content not found in DOM")

    # Look for key elements
    tabs = page.locator('[role="tab"]').all()
    print(f"Found {len(tabs)} tabs")
    for tab in tabs:
        print(f"  Tab: '{tab.text_content()}'")

    browser.close()
