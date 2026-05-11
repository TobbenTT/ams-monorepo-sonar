"""Renderizar archivos .mmd a PDF usando Edge headless + Mermaid CDN."""
import os, subprocess, tempfile, time
from pathlib import Path

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
MMDS = list(Path("docs/architecture").glob("*.mmd"))

for mmd in MMDS:
    content = mmd.read_text(encoding='utf-8')
    pdf_out = mmd.with_suffix('.pdf')
    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @page {{ size: A2 landscape; margin: 10mm; }}
  body {{ margin:0; padding:10px; font-family: sans-serif; }}
  h1 {{ color: #064e3b; border-bottom: 3px solid #10b981; padding-bottom: 6pt; font-size: 18pt; }}
  .mermaid {{ font-size: 11px; }}
</style>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({{ startOnLoad: true, theme: 'default', maxTextSize: 200000, maxEdges: 1000, er: {{ minEntityWidth: 80 }} }});
</script>
</head><body>
<h1>{mmd.stem.replace('_', ' ').title()} — MAGEAM</h1>
<pre class="mermaid">
{content}
</pre>
</body></html>"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html)
        html_path = f.name
    cmd = [EDGE, '--headless=new', '--disable-gpu',
           f'--print-to-pdf={pdf_out.absolute()}',
           '--no-pdf-header-footer',
           '--virtual-time-budget=15000',
           f"file:///{html_path.replace(os.sep, '/')}"]
    print(f"Rendering {mmd.name}...")
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    Path(html_path).unlink(missing_ok=True)
    size = pdf_out.stat().st_size if pdf_out.exists() else 0
    print(f"  {'OK' if size > 0 else 'FAIL'} -> {pdf_out.name} ({size} bytes)")
