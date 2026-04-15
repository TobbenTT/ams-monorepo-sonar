"""Fix MagORAI landing: add language switcher."""
import sys

path = sys.argv[1] if len(sys.argv) > 1 else '/root/magorai-landing/index.html'

with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add CSS for lang switcher
css_add = ' .btn-lang{background:transparent;border:1px solid var(--border);color:var(--muted);padding:8px 16px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;} .btn-lang:hover,.btn-lang.active{border-color:var(--success);color:var(--success);} .lang-switcher{display:flex;gap:8px;}'
html = html.replace(
    '.footer a{color:var(--success);text-decoration:none;}',
    '.footer a{color:var(--success);text-decoration:none;}' + css_add
)

# 2. Add lang switcher in navbar (before diagnostic link)
old_nav = '<a href="https://scorecard.magorai.com" class="btn btn-outline">'
new_nav = (
    '<div class="lang-switcher">'
    '<button class="btn-lang active" id="btn-es" onclick="setLang(\'es\')">ES</button>'
    '<button class="btn-lang" id="btn-en" onclick="setLang(\'en\')">EN</button>'
    '</div> '
    '<a href="https://scorecard.magorai.com" class="btn btn-outline" id="nav-diag">'
)
html = html.replace(old_nav, new_nav, 1)

# 3. Add IDs to nav links
html = html.replace(
    '<a href="#disciplines">Disciplinas',
    '<a href="#disciplines" id="nav-disc">Disciplinas'
)
html = html.replace(
    '<a href="#features">Capacidades',
    '<a href="#features" id="nav-feat">Capacidades'
)

# 4. Add translation script before </body>
script = '''
<script>
function setLang(lang) {
  document.querySelectorAll(".btn-lang").forEach(function(b){b.classList.remove("active");});
  document.getElementById("btn-"+lang).classList.add("active");
  var d = document.getElementById("nav-diag");
  var disc = document.getElementById("nav-disc");
  var feat = document.getElementById("nav-feat");
  if (d) d.textContent = lang==="en" ? "Free Diagnostic" : "Diagn\\u00f3stico Gratuito";
  if (disc) disc.textContent = lang==="en" ? "Disciplines" : "Disciplinas";
  if (feat) feat.textContent = lang==="en" ? "Capabilities" : "Capacidades";
}
</script>
'''
html = html.replace('</body>', script + '</body>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print('DONE - lang switcher added')
