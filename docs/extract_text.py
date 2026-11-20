import re

with open(r"docs\template_informe.pdf", "rb") as f:
    data = f.read()

# Extraer streams de texto
text_chunks = []
stream_pattern = re.compile(rb"stream\r?\n(.*?)\r?\nendstream", re.DOTALL)
import zlib

for m in stream_pattern.finditer(data):
    chunk = m.group(1)
    try:
        decomp = zlib.decompress(chunk)
        # Buscar cadenas de texto en operadores Tj o TJ
        # Formato simple para encontrar texto en streams de PDF
        lines = decomp.split(b"\n")
        for line in lines:
            if b"Tj" in line or b"TJ" in line:
                text_chunks.append(line.decode('latin1', errors='ignore'))
    except:
        pass

print(f"Líneas de texto extraídas: {len(text_chunks)}")
with open(r"docs\extracted_text.txt", "w", encoding="utf-8") as out:
    out.write("\n".join(text_chunks[:500]))
