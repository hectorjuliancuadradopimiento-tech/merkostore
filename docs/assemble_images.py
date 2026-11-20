import zlib
import struct
import binascii

def make_png(width, height, rgb_bytes, alpha_bytes, output_path):
    # Generar un PNG valido combinando RGB + Alpha -> RGBA
    rgba_bytes = bytearray(width * height * 4)
    for i in range(width * height):
        rgba_bytes[i*4 + 0] = rgb_bytes[i*3 + 0]
        rgba_bytes[i*4 + 1] = rgb_bytes[i*3 + 1]
        rgba_bytes[i*4 + 2] = rgb_bytes[i*3 + 2]
        rgba_bytes[i*4 + 3] = alpha_bytes[i]

    # Formatear filas con filtro 0 (None)
    raw_data = bytearray()
    for row in range(height):
        raw_data.append(0) # filter byte
        start = row * width * 4
        end = start + width * 4
        raw_data.extend(rgba_bytes[start:end])

    compressed = zlib.compress(raw_data)

    def chunk(tag, data):
        length = struct.pack(">I", len(data))
        crc = struct.pack(">I", binascii.crc32(tag + data) & 0xffffffff)
        return length + tag + data + crc

    png_data = bytearray(b"\x89PNG\r\n\x1a\n")
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0) # 8-bit RGBA
    png_data.extend(chunk(b"IHDR", ihdr))
    png_data.extend(chunk(b"IDAT", compressed))
    png_data.extend(chunk(b"IEND", b""))

    with open(output_path, "wb") as f:
        f.write(png_data)
    print(f"Creado PNG: {output_path} ({width}x{height})")

# Descomprimir streams
with open("docs/images/raw_image_1.bin", "rb") as f:
    alpha_header = zlib.decompress(f.read())
with open("docs/images/raw_image_2.bin", "rb") as f:
    rgb_header = zlib.decompress(f.read())

make_png(1275, 267, rgb_header, alpha_header, "docs/images/comfenalco_header.png")

with open("docs/images/raw_image_3.bin", "rb") as f:
    alpha_footer = zlib.decompress(f.read())
with open("docs/images/raw_image_4.bin", "rb") as f:
    rgb_footer = zlib.decompress(f.read())

make_png(1275, 124, rgb_footer, alpha_footer, "docs/images/comfenalco_footer.png")

# Renombrar arbol
import shutil
shutil.copy("docs/images/extracted_img_1.jpg", "docs/images/arbol_problema.jpg")
print("Arbol copiado a docs/images/arbol_problema.jpg")
