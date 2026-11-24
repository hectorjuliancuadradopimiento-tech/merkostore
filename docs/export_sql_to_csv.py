# -*- coding: utf-8 -*-
import re
import csv
import os
import zipfile

with open('docs/merkostore_cloud_db.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

dirs = [
    'docs/data_warehouse',
    r'C:\Users\barri\Desktop\MERKOSTORE_DATA_WAREHOUSE_PBI'
]

tables = ['Dim_Tiempo', 'Dim_Producto', 'Dim_Cliente', 'Dim_Metodo_Pago', 'Fact_Ventas']
parsed_data = {}

for t in tables:
    pattern = rf'INSERT INTO {t}\s*\((.*?)\)\s*VALUES\s*(.*?);'
    m = re.search(pattern, sql, re.DOTALL | re.IGNORECASE)
    if m:
        cols = [c.strip() for c in m.group(1).split(',')]
        val_block = m.group(2).strip()
        row_matches = re.findall(r'\((.*?)\)(?:,|\s*$)', val_block, re.DOTALL)
        rows = []
        for rm in row_matches:
            vals = []
            for item in re.split(r",(?=(?:[^\']*\'[^\']*\')*[^\']*$)", rm):
                val = item.strip().strip("'")
                vals.append(val)
            rows.append(vals)
        parsed_data[t] = (cols, rows)
        print(f'{t}: {len(cols)} columnas, {len(rows)} filas')

for d in dirs:
    try:
        os.makedirs(d, exist_ok=True)
        for t, (cols, rows) in parsed_data.items():
            out_file = os.path.join(d, f'{t}.csv')
            with open(out_file, 'w', newline='', encoding='utf-8') as out_f:
                w = csv.writer(out_f)
                w.writerow(cols)
                w.writerows(rows)
        print(f'Guardado exitoso en: {d}')
    except Exception as e:
        print(f'Aviso para {d}: {e}')

# Crear archivo ZIP en el Escritorio
zip_path = r'C:\Users\barri\Desktop\MERKOSTORE_CSVS_DATA_WAREHOUSE.zip'
try:
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for t in tables:
            csv_path = os.path.join('docs/data_warehouse', f'{t}.csv')
            zf.write(csv_path, arcname=f'{t}.csv')
    print('Archivo ZIP creado en el Escritorio:', zip_path)
except Exception as e:
    print('Aviso ZIP:', e)
