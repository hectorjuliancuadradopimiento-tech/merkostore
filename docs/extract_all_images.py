import re
import os

pdf_path = r"docs\template_informe.pdf"
out_dir = r"docs\images"

with open(pdf_path, "rb") as f:
    data = f.read()

# Buscar todos los objetos XObject Image
obj_pattern = re.compile(rb"<<.*?/Type\s*/XObject.*?/Subtype\s*/Image.*?>>\s*stream\r?\n(.*?)\r?\nendstream", re.DOTALL)
matches = obj_pattern.findall(data)
print(f"XObject Images encontrados: {len(matches)}")

for i, raw_stream in enumerate(matches):
    fname = os.path.join(out_dir, f"raw_image_{i+1}.bin")
    with open(fname, "wb") as out:
        out.write(raw_stream)
    print(f"Stream {i+1}: {len(raw_stream)} bytes")
