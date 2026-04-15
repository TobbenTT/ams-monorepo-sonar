"""Fix MagORAI: remove dup logo + move diagnostica section."""
import re

path = '/root/magorai-landing/index.html'

with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix 1: Remove duplicate logo img, keep only text
html = html.replace(
    '<img src="/logos/magorai-logo.png" alt="MagORAI" onerror="this.style.display=\'none\'">\n      <div class="brand-text">Mag<span>ORAI</span></div>',
    'Mag<span>ORAI</span>'
)
# Also try single-line variant
html = html.replace(
    '<img src="/logos/magorai-logo.png" alt="MagORAI" onerror="this.style.display=\'none\'">',
    ''
)
html = html.replace('<div class="brand-text">Mag<span>ORAI</span></div>', 'Mag<span>ORAI</span>')

# Fix 2: Extract diagnostica section
pattern = r'<section class="section" style="background:var\(--secondary\);">.*?</section>'
match = re.search(pattern, html, re.DOTALL)
if match:
    diag_html = match.group(0)
    # Remove from current position
    html = html.replace(diag_html, '')
    # Insert after </section> that closes features (id="features")
    # Find the closing </section> after the features grid
    feat_end = '</div>\n  </section>\n\n  <section class="section" id="disciplines">'
    if feat_end in html:
        html = html.replace(
            feat_end,
            '</div>\n  </section>\n\n  ' + diag_html + '\n\n  <section class="section" id="disciplines">'
        )
        print('Moved diagnostica section after features')
    else:
        print('WARNING: could not find insertion point')
else:
    print('WARNING: diagnostica section not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print('DONE')
