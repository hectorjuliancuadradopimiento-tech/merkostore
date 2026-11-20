import zlib
import re

with open(r"docs\template_informe.pdf", "rb") as f:
    pdf_bytes = f.read()

# Buscar los diccionarios de las imagenes para obtener /Width y /Height
matches = list(re.finditer(rb"<<.*?/Type\s*/XObject.*?/Subtype\s*/Image.*?/Width\s*(\d+).*?/Height\s*(\d+).*?>>\s*stream\r?\n(.*?)\r?\nendstream", pdf_bytes, re.DOTALL))
print(f"Total imagenes encontradas con dimensiones: {len(matches)}")

for idx, m in enumerate(matches):
    w = int(m.group(1))
    h = int(m.group(2))
    raw_stream = m.group(3)
    print(f"Img {idx+1}: {w}x{h}, raw len={len(raw_stream)}")
