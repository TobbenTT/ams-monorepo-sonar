from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})

    page.goto('http://localhost:8501/hierarchy', timeout=30000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)

    radio_html = page.evaluate("""
        () => {
            const radios = document.querySelectorAll('[data-testid="stRadio"]');
            let result = 'Total stRadio groups: ' + radios.length + '\\n\\n';
            if (radios.length > 0) {
                const r = radios[0];
                // Full inner HTML (first 3000 chars)
                result += 'stRadio outerHTML (first 3000): \\n' + r.outerHTML.substring(0, 3000) + '\\n\\n';

                // Look for all divs with role=radiogroup
                const groups = r.querySelectorAll('[role="radiogroup"]');
                result += 'radiogroup divs: ' + groups.length + '\\n';

                // Look for input type=radio
                const inputs = r.querySelectorAll('input[type="radio"]');
                result += 'input[type=radio]: ' + inputs.length + '\\n';

                if (inputs.length > 0) {
                    // Get the parent of first radio input
                    const firstInput = inputs[0];
                    result += 'First input parent tag: ' + firstInput.parentElement.tagName + '\\n';
                    result += 'First input parent class: ' + firstInput.parentElement.className + '\\n';
                    result += 'First input parent outerHTML (500): ' + firstInput.parentElement.outerHTML.substring(0, 500) + '\\n';
                }
            }
            return result;
        }
    """)
    with open('/tmp/radio_dom.txt', 'w', encoding='utf-8') as f:
        f.write(radio_html)
    print("Saved to /tmp/radio_dom.txt")

    browser.close()
