from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})

    page.goto('http://localhost:8501/hierarchy', timeout=30000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)

    # Get the full structure of the radio component
    radio_html = page.evaluate("""
        () => {
            const radios = document.querySelectorAll('[data-testid="stRadio"]');
            if (radios.length > 0) {
                // Get the full outer HTML of first radio, but just the first label
                const r = radios[0];
                const labels = r.querySelectorAll('label');
                let result = '';
                if (labels.length > 0) {
                    result += 'LABEL outerHTML: ' + labels[0].outerHTML.substring(0, 1000) + '\\n\\n';
                    // Check for input elements
                    const inputs = labels[0].querySelectorAll('input');
                    result += 'Inputs inside label: ' + inputs.length + '\\n';
                    // Check all child elements
                    const children = labels[0].children;
                    result += 'Direct children: ' + children.length + '\\n';
                    for (let i = 0; i < children.length; i++) {
                        result += '  Child ' + i + ': tag=' + children[i].tagName + ' class=' + children[i].className + ' testid=' + (children[i].dataset.testid || '') + '\\n';
                    }
                }
                return result;
            }
            return 'No radio found';
        }
    """)
    print(radio_html)

    browser.close()
