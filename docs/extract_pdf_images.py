import re
import os

pdf_path = r"c:\Users\barri\Downloads\Informe_Metodologico_Merkostore1 (1).pdf"
out_dir = r"c:\Users\barri\Desktop\merkostore\docs\images"
os.makedirs(out_dir, exist_ok=True)

with open(pdf_path, "rb") as f:
    content = f.read()

# Buscar streams de imagenes JPEG
img_pattern = re.compile(rb"/Subtype\s*/Image.*?/Filter\s*/DCTDecode.*?stream\r?\n(.*?)\r?\nendstream", re.DOTALL)
matches = img_pattern.findall(content)
print(f"JPEGs encontrados: {len(matches)}")

for i, img_bytes in enumerate(matches):
    out_file = os.path.join(out_dir, f"extracted_img_{i+1}.jpg")
    with open(out_file, "wb") as img_f:
        img_f.write(img_bytes)
    print(f"Guardado: {out_file} ({len(img_bytes)} bytes)")
