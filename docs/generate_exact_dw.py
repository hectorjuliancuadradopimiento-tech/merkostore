import os
import csv
import json

def generate_exact_dbdiagram_dw():
    # Rutas tanto en docs como en Desktop
    dirs = [
        os.path.join(os.path.dirname(__file__), "data_warehouse"),
        r"C:\Users\barri\Desktop\MERKOSTORE_DATA_WAREHOUSE_PBI"
    ]

    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # 1. Dim_Producto (exacto a dbdiagram.io)
    dim_producto = [
        ["id_producto", "nombre_producto", "categoria", "tipo_producto", "precio_regular", "tiene_descuento", "stock_disponible"],
        ["PRD-001", "Huevos Kikes AA x30", "Lácteos y Huevos", "DETAL", 24500, False, 35],
        ["PRD-002", "Café Sello Rojo 425g", "Abarrotes y Despensa", "DETAL", 21990, False, 20],
        ["PRD-003", "Harina Pan 1Kg", "Abarrotes y Despensa", "DETAL", 4800, False, 50],
        ["PRD-004", "Aceite Medalla de Oro 3Lt", "Abarrotes y Despensa", "DETAL", 19490, False, 14],
        ["PRD-005", "Azúcar Blanca 2.5Kg", "Abarrotes y Despensa", "DETAL", 9900, False, 28],
        ["PRD-006", "Arroz Diana 1Kg", "Abarrotes y Despensa", "DETAL", 4500, False, 45],
        ["PRD-007", "Leche Colanta Entera 900ml", "Lácteos y Huevos", "DETAL", 4200, False, 30],
        ["PRD-008", "Pan Bimbo Artesano 500g", "Panadería", "DETAL", 8500, False, 18],
        ["PRD-009", "Jabón Rey Barra 300g", "Cuidado del Hogar", "DETAL", 3200, False, 40],
        ["CMB-001", "Mercado Familiar Esencial", "Combos Mercados", "MERCADO", 44900, True, 10],
        ["CMB-002", "Mercado Desayuno Completo", "Combos Mercados", "MERCADO", 34500, True, 8],
        ["CMB-003", "Combo Aseo y Hogar", "Combos Mercados", "MERCADO", 28000, True, 6]
    ]

    # 2. Dim_Metodo_Pago (exacto a dbdiagram.io)
    dim_metodo_pago = [
        ["id_metodo_pago", "canal_origen", "metodo_pago", "tipo_entrega"],
        [1, "WhatsApp Web", "Nequi", "Domicilio Moto"],
        [2, "MerkoBot IA", "Daviplata", "Domicilio Moto"],
        [3, "Mostrador Tienda", "Efectivo", "Recogida Local"],
        [4, "WhatsApp Web", "Bancolombia QR", "Domicilio Moto"],
        [5, "Tienda Online", "Contraentrega Efectivo", "Domicilio Moto"]
    ]

    # 3. Dim_Cliente (exacto a dbdiagram.io)
    dim_cliente = [
        ["id_cliente", "nombre_cliente", "telefono", "barrio", "direccion"],
        [1, "María Camila Gómez", "3004567890", "El Recreo", "Mz 14 Lote 8"],
        [2, "Carlos Andrés Pérez", "3119876543", "La Castellana", "Calle 30 # 24-12"],
        [3, "Rosa Elena Martínez", "3201122334", "Ceballos", "Sector El Bosque # 10-05"],
        [4, "Jorge Luis Herrera", "3158877665", "Blas de Lezo", "Manzana B Casa 12"],
        [5, "Diana Patricia Polo", "3045566778", "San Fernando", "Cra 82 # 15-40"],
        [6, "Andrés Felipe Ruiz", "3123344556", "Santa Lucía", "Diag 32 # 55-20"],
        [7, "Consuelo Del Carmen", "3189900112", "Torices", "Calle de la Cruz # 42-18"],
        [8, "Manuel Salvador Díaz", "3012233445", "Manga", "Calle Real # 22-09"]
    ]

    # 4. Dim_Tiempo (exacto a dbdiagram.io)
    dim_tiempo = [
        ["id_tiempo", "fecha", "dia", "dia_semana", "mes", "nombre_mes", "trimestre", "año", "es_fin_semana"]
    ]
    for d in range(1, 21):
        dt_id = 20261100 + d
        dt_str = f"2026-11-{d:02d}"
        weekday_num = ((d + 6) % 7) + 1
        day_names = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        d_name = day_names[weekday_num - 1]
        is_wk = True if weekday_num in [6, 7] else False
        dim_tiempo.append([dt_id, dt_str, d, d_name, 11, "Noviembre", 4, 2026, is_wk])

    # 5. Fact_Ventas (exacto a dbdiagram.io)
    fact_ventas = [
        [
            "id_venta", "id_tiempo", "id_producto", "id_cliente", "id_metodo_pago",
            "cantidad_vendida", "precio_unitario", "costo_unitario", "ingreso_bruto",
            "monto_descuento", "costo_domicilio", "ingreso_neto", "margen_utilidad"
        ]
    ]

    # Datos transaccionales calibrados
    raw_sales = [
        (3, "CMB-001", 1, 1, 2, 44900, 31800, 0, 3000),
        (4, "CMB-002", 2, 2, 1, 34500, 25200, 0, 3000),
        (5, "PRD-001", 3, 3, 1, 24500, 14700, 0, 0),
        (5, "PRD-002", 3, 3, 1, 21990, 15000, 0, 0),
        (6, "PRD-004", 4, 1, 1, 19490, 13500, 0, 3000),
        (7, "CMB-001", 5, 2, 1, 44900, 31800, 0, 3000),
        (8, "CMB-003", 6, 1, 1, 28000, 18500, 0, 3000),
        (9, "PRD-001", 7, 3, 2, 24500, 14700, 0, 0),
        (10, "CMB-001", 1, 2, 2, 44900, 31800, 0, 3000),
        (11, "CMB-002", 4, 1, 2, 34500, 25200, 0, 3000),
        (12, "PRD-002", 2, 3, 2, 21990, 15000, 0, 0),
        (13, "PRD-003", 3, 3, 4, 4800, 3200, 0, 0),
        (14, "CMB-001", 8, 1, 1, 44900, 31800, 0, 3000),
        (14, "PRD-001", 8, 1, 1, 24500, 14700, 0, 3000),
        (15, "PRD-006", 5, 3, 3, 4500, 3100, 0, 0),
        (15, "PRD-007", 5, 3, 4, 4200, 2900, 0, 0),
        (16, "CMB-001", 2, 2, 2, 44900, 31800, 0, 3000),
        (17, "CMB-002", 3, 1, 1, 34500, 25200, 0, 3000),
        (17, "PRD-008", 3, 1, 2, 8500, 6000, 0, 3000),
        (18, "CMB-003", 4, 2, 2, 28000, 18500, 0, 3000),
        (18, "PRD-001", 6, 1, 2, 24500, 14700, 0, 3000),
        (19, "PRD-004", 7, 3, 2, 19490, 13500, 0, 0),
        (19, "PRD-005", 7, 3, 3, 9900, 6800, 0, 0),
        (19, "CMB-001", 1, 1, 1, 44900, 31800, 0, 3000),
        (20, "CMB-001", 2, 2, 2, 44900, 31800, 0, 3000),
        (20, "PRD-001", 3, 1, 1, 24500, 14700, 0, 3000),
        (20, "PRD-002", 4, 2, 1, 21990, 15000, 0, 3000),
        (20, "CMB-002", 5, 1, 2, 34500, 25200, 0, 3000),
        (20, "PRD-009", 6, 3, 4, 3200, 2100, 0, 0),
        (20, "PRD-003", 7, 3, 4, 4800, 3200, 0, 0),
        (20, "PRD-007", 8, 1, 2, 4200, 2900, 0, 3000),
        (20, "PRD-005", 8, 1, 2, 9900, 6800, 0, 3000),
        (20, "PRD-008", 1, 2, 1, 8500, 6000, 0, 3000),
        (20, "PRD-006", 2, 3, 2, 4500, 3100, 0, 0),
        (20, "PRD-009", 4, 1, 2, 3200, 2100, 0, 3000),
        (20, "PRD-003", 5, 1, 1, 4800, 3200, 0, 3000),
        (20, "PRD-006", 6, 2, 1, 4500, 3100, 0, 3000)
    ]

    v_id = 1
    total_ingreso = 0
    total_costo = 0

    for row in raw_sales:
        d, p_id, c_id, m_id, qty, p_unit, c_unit, desc, dom = row
        dt_id = 20261100 + d
        ing_bruto = qty * p_unit
        ing_neto = ing_bruto - desc
        costo_tot = qty * c_unit
        margen = ing_neto - costo_tot

        fact_ventas.append([
            v_id, dt_id, p_id, c_id, m_id,
            qty, p_unit, c_unit, ing_bruto,
            desc, dom, ing_neto, margen
        ])
        total_ingreso += ing_neto
        total_costo += costo_tot
        v_id += 1

    # Guardar en todas las carpetas
    files = {
        "Dim_Producto.csv": dim_producto,
        "Dim_Metodo_Pago.csv": dim_metodo_pago,
        "Dim_Cliente.csv": dim_cliente,
        "Dim_Tiempo.csv": dim_tiempo,
        "Fact_Ventas.csv": fact_ventas
    }

    for target_dir in dirs:
        for fname, data in files.items():
            fpath = os.path.join(target_dir, fname)
            try:
                with open(fpath, "w", newline="", encoding="utf-8") as f:
                    writer = csv.writer(f)
                    writer.writerows(data)
            except Exception as e:
                pass

    print(f"Archivos del Data Warehouse sincronizados con dbdiagram.io.")
    print(f"Total Facturado: $ {total_ingreso:,} COP | Registros: {v_id - 1}")

if __name__ == "__main__":
    generate_exact_dbdiagram_dw()
