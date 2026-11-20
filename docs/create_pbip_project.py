import os
import json

def create_pbip():
    desktop_dir = r"C:\Users\barri\Desktop"
    pbip_file = os.path.join(desktop_dir, "Merkostore_PowerBI.pbip")
    model_dir = os.path.join(desktop_dir, "Merkostore_PowerBI.SemanticModel")
    report_dir = os.path.join(desktop_dir, "Merkostore_PowerBI.Report")
    dw_dir = r"C:\Users\barri\Desktop\MERKOSTORE_DATA_WAREHOUSE_PBI"

    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(report_dir, exist_ok=True)

    # 1. Merkostore_PowerBI.pbip
    pbip_content = {
        "version": "1.0",
        "artifacts": [
            {
                "report": {
                    "path": "Merkostore_PowerBI.Report"
                }
            }
        ],
        "settings": {
            "enableAutoRecovery": True
        }
    }
    with open(pbip_file, "w", encoding="utf-8") as f:
        json.dump(pbip_content, f, indent=2)

    # 2. definition.pbir
    pbir_content = {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/1.0.0/schema.json",
        "version": "4.0",
        "datasetReference": {
            "byPath": {
                "path": "../Merkostore_PowerBI.SemanticModel"
            },
            "byConnection": None
        }
    }
    with open(os.path.join(report_dir, "definition.pbir"), "w", encoding="utf-8") as f:
        json.dump(pbir_content, f, indent=2)

    # 3. report.json
    report_json_content = {
        "config": "{}",
        "layoutOptimization": 0,
        "resourcePackages": [],
        "sections": [
            {
                "displayName": "1. Resumen Ejecutivo y Ventas",
                "name": "ReportSection1",
                "width": 1280.0,
                "height": 720.0,
                "visualContainers": []
            },
            {
                "displayName": "2. Modelo Dimensional Estrella",
                "name": "ReportSection2",
                "width": 1280.0,
                "height": 720.0,
                "visualContainers": []
            }
        ]
    }
    with open(os.path.join(report_dir, "report.json"), "w", encoding="utf-8") as f:
        json.dump(report_json_content, f, indent=2)

    # 4. definition.pbism
    pbism_content = {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/semanticModel/definitionProperties/1.0.0/schema.json",
        "version": "4.0",
        "settings": {}
    }
    with open(os.path.join(model_dir, "definition.pbism"), "w", encoding="utf-8") as f:
        json.dump(pbism_content, f, indent=2)

    # 5. Helper M expression generator for local CSVs
    def make_m_expr(csv_name, types_list):
        escaped_path = os.path.join(dw_dir, csv_name).replace("\\", "\\\\")
        types_str = ", ".join([f'{{"{col}", {t}}}' for col, t in types_list])
        lines = [
            "let",
            f'    Source = Csv.Document(File.Contents("{escaped_path}"), [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.None]),',
            '    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),',
            f'    ChangedType = Table.TransformColumnTypes(PromotedHeaders, {{{types_str}}})',
            "in",
            "    ChangedType"
        ]
        return lines

    # Tables definition
    tables = [
        {
            "name": "Dim_Producto",
            "columns": [
                {"name": "Id_Producto", "dataType": "int64", "sourceColumn": "Id_Producto"},
                {"name": "SKU", "dataType": "string", "sourceColumn": "SKU"},
                {"name": "Nombre_Producto", "dataType": "string", "sourceColumn": "Nombre_Producto"},
                {"name": "Categoria", "dataType": "string", "sourceColumn": "Categoria"},
                {"name": "Tipo_Producto", "dataType": "string", "sourceColumn": "Tipo_Producto"},
                {"name": "Precio_Regular", "dataType": "int64", "sourceColumn": "Precio_Regular"},
                {"name": "Costo_Base", "dataType": "int64", "sourceColumn": "Costo_Base"},
                {"name": "Margen_Teorico_Pct", "dataType": "string", "sourceColumn": "Margen_Teorico_Pct"}
            ],
            "partitions": [
                {
                    "name": "Dim_Producto-Partition",
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": make_m_expr("Dim_Producto.csv", [
                            ("Id_Producto", "Int64.Type"),
                            ("SKU", "type text"),
                            ("Nombre_Producto", "type text"),
                            ("Categoria", "type text"),
                            ("Tipo_Producto", "type text"),
                            ("Precio_Regular", "Int64.Type"),
                            ("Costo_Base", "Int64.Type"),
                            ("Margen_Teorico_Pct", "type text")
                        ])
                    }
                }
            ]
        },
        {
            "name": "Dim_CanalVenta",
            "columns": [
                {"name": "Id_Canal", "dataType": "int64", "sourceColumn": "Id_Canal"},
                {"name": "Nombre_Canal", "dataType": "string", "sourceColumn": "Nombre_Canal"},
                {"name": "Medio_Pago_Predominante", "dataType": "string", "sourceColumn": "Medio_Pago_Predominante"},
                {"name": "Comision_Pct", "dataType": "string", "sourceColumn": "Comision_Pct"}
            ],
            "partitions": [
                {
                    "name": "Dim_CanalVenta-Partition",
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": make_m_expr("Dim_CanalVenta.csv", [
                            ("Id_Canal", "Int64.Type"),
                            ("Nombre_Canal", "type text"),
                            ("Medio_Pago_Predominante", "type text"),
                            ("Comision_Pct", "type text")
                        ])
                    }
                }
            ]
        },
        {
            "name": "Dim_EstadoPedido",
            "columns": [
                {"name": "Id_Estado", "dataType": "int64", "sourceColumn": "Id_Estado"},
                {"name": "Codigo_Estado", "dataType": "string", "sourceColumn": "Codigo_Estado"},
                {"name": "Descripcion", "dataType": "string", "sourceColumn": "Descripcion"},
                {"name": "Es_Venta_Efectiva", "dataType": "string", "sourceColumn": "Es_Venta_Efectiva"}
            ],
            "partitions": [
                {
                    "name": "Dim_EstadoPedido-Partition",
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": make_m_expr("Dim_EstadoPedido.csv", [
                            ("Id_Estado", "Int64.Type"),
                            ("Codigo_Estado", "type text"),
                            ("Descripcion", "type text"),
                            ("Es_Venta_Efectiva", "type text")
                        ])
                    }
                }
            ]
        },
        {
            "name": "Dim_Cliente",
            "columns": [
                {"name": "Id_Cliente", "dataType": "int64", "sourceColumn": "Id_Cliente"},
                {"name": "Nombre_Cliente", "dataType": "string", "sourceColumn": "Nombre_Cliente"},
                {"name": "Telefono", "dataType": "string", "sourceColumn": "Telefono"},
                {"name": "Barrio", "dataType": "string", "sourceColumn": "Barrio"},
                {"name": "Estrato", "dataType": "int64", "sourceColumn": "Estrato"},
                {"name": "Segmento", "dataType": "string", "sourceColumn": "Segmento"}
            ],
            "partitions": [
                {
                    "name": "Dim_Cliente-Partition",
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": make_m_expr("Dim_Cliente.csv", [
                            ("Id_Cliente", "Int64.Type"),
                            ("Nombre_Cliente", "type text"),
                            ("Telefono", "type text"),
                            ("Barrio", "type text"),
                            ("Estrato", "Int64.Type"),
                            ("Segmento", "type text")
                        ])
                    }
                }
            ]
        },
        {
            "name": "Dim_Tiempo",
            "columns": [
                {"name": "Id_Tiempo", "dataType": "int64", "sourceColumn": "Id_Tiempo"},
                {"name": "Fecha", "dataType": "string", "sourceColumn": "Fecha"},
                {"name": "Dia_Semana", "dataType": "string", "sourceColumn": "Dia_Semana"},
                {"name": "Num_Dia_Semana", "dataType": "int64", "sourceColumn": "Num_Dia_Semana"},
                {"name": "Semana_Ano", "dataType": "int64", "sourceColumn": "Semana_Ano"},
                {"name": "Mes", "dataType": "string", "sourceColumn": "Mes"},
                {"name": "Num_Mes", "dataType": "int64", "sourceColumn": "Num_Mes"},
                {"name": "Trimestre", "dataType": "string", "sourceColumn": "Trimestre"},
                {"name": "Ano", "dataType": "int64", "sourceColumn": "Ano"},
                {"name": "Es_FinDeSemana", "dataType": "string", "sourceColumn": "Es_FinDeSemana"}
            ],
            "partitions": [
                {
                    "name": "Dim_Tiempo-Partition",
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": make_m_expr("Dim_Tiempo.csv", [
                            ("Id_Tiempo", "Int64.Type"),
                            ("Fecha", "type text"),
                            ("Dia_Semana", "type text"),
                            ("Num_Dia_Semana", "Int64.Type"),
                            ("Semana_Ano", "Int64.Type"),
                            ("Mes", "type text"),
                            ("Num_Mes", "Int64.Type"),
                            ("Trimestre", "type text"),
                            ("Ano", "Int64.Type"),
                            ("Es_FinDeSemana", "type text")
                        ])
                    }
                }
            ]
        },
        {
            "name": "Fact_Ventas",
            "columns": [
                {"name": "Id_Venta", "dataType": "int64", "sourceColumn": "Id_Venta"},
                {"name": "Id_Tiempo", "dataType": "int64", "sourceColumn": "Id_Tiempo"},
                {"name": "Id_Producto", "dataType": "int64", "sourceColumn": "Id_Producto"},
                {"name": "Id_Cliente", "dataType": "int64", "sourceColumn": "Id_Cliente"},
                {"name": "Id_Canal", "dataType": "int64", "sourceColumn": "Id_Canal"},
                {"name": "Id_Estado", "dataType": "int64", "sourceColumn": "Id_Estado"},
                {"name": "Numero_Pedido", "dataType": "string", "sourceColumn": "Numero_Pedido"},
                {"name": "Cantidad", "dataType": "int64", "sourceColumn": "Cantidad"},
                {"name": "Precio_Unitario_COP", "dataType": "int64", "sourceColumn": "Precio_Unitario_COP"},
                {"name": "Costo_Unitario_COP", "dataType": "int64", "sourceColumn": "Costo_Unitario_COP"},
                {"name": "Ingreso_Bruto_COP", "dataType": "int64", "sourceColumn": "Ingreso_Bruto_COP"},
                {"name": "Costo_Total_COP", "dataType": "int64", "sourceColumn": "Costo_Total_COP"},
                {"name": "Utilidad_Bruta_COP", "dataType": "int64", "sourceColumn": "Utilidad_Bruta_COP"},
                {"name": "Margen_Pct", "dataType": "string", "sourceColumn": "Margen_Pct"},
                {"name": "Tiempo_Entrega_Min", "dataType": "int64", "sourceColumn": "Tiempo_Entrega_Min"}
            ],
            "measures": [
                {
                    "name": "Total Facturado COP",
                    "expression": "SUM(Fact_Ventas[Ingreso_Bruto_COP])",
                    "formatString": "$ #,##0"
                },
                {
                    "name": "Costo Total COP",
                    "expression": "SUM(Fact_Ventas[Costo_Total_COP])",
                    "formatString": "$ #,##0"
                },
                {
                    "name": "Margen Bruto COP",
                    "expression": "[Total Facturado COP] - [Costo Total COP]",
                    "formatString": "$ #,##0"
                },
                {
                    "name": "Margen Bruto %",
                    "expression": "DIVIDE([Margen Bruto COP], [Total Facturado COP], 0)",
                    "formatString": "0.0%"
                },
                {
                    "name": "Numero de Pedidos",
                    "expression": "DISTINCTCOUNT(Fact_Ventas[Numero_Pedido])",
                    "formatString": "#,##0"
                },
                {
                    "name": "Ticket Promedio AOV",
                    "expression": "DIVIDE([Total Facturado COP], [Numero de Pedidos], 0)",
                    "formatString": "$ #,##0"
                },
                {
                    "name": "Eficacia Domicilios OTIF",
                    "expression": "DIVIDE(CALCULATE(COUNTROWS(Fact_Ventas), Fact_Ventas[Id_Estado] = 1), COUNTROWS(Fact_Ventas), 0)",
                    "formatString": "0.0%"
                }
            ],
            "partitions": [
                {
                    "name": "Fact_Ventas-Partition",
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": make_m_expr("Fact_Ventas.csv", [
                            ("Id_Venta", "Int64.Type"),
                            ("Id_Tiempo", "Int64.Type"),
                            ("Id_Producto", "Int64.Type"),
                            ("Id_Cliente", "Int64.Type"),
                            ("Id_Canal", "Int64.Type"),
                            ("Id_Estado", "Int64.Type"),
                            ("Numero_Pedido", "type text"),
                            ("Cantidad", "Int64.Type"),
                            ("Precio_Unitario_COP", "Int64.Type"),
                            ("Costo_Unitario_COP", "Int64.Type"),
                            ("Ingreso_Bruto_COP", "Int64.Type"),
                            ("Costo_Total_COP", "Int64.Type"),
                            ("Utilidad_Bruta_COP", "Int64.Type"),
                            ("Margen_Pct", "type text"),
                            ("Tiempo_Entrega_Min", "Int64.Type")
                        ])
                    }
                }
            ]
        }
    ]

    relationships = [
        {
            "name": "Rel_Fact_Producto",
            "fromTable": "Fact_Ventas",
            "fromColumn": "Id_Producto",
            "toTable": "Dim_Producto",
            "toColumn": "Id_Producto"
        },
        {
            "name": "Rel_Fact_Tiempo",
            "fromTable": "Fact_Ventas",
            "fromColumn": "Id_Tiempo",
            "toTable": "Dim_Tiempo",
            "toColumn": "Id_Tiempo"
        },
        {
            "name": "Rel_Fact_Cliente",
            "fromTable": "Fact_Ventas",
            "fromColumn": "Id_Cliente",
            "toTable": "Dim_Cliente",
            "toColumn": "Id_Cliente"
        },
        {
            "name": "Rel_Fact_Canal",
            "fromTable": "Fact_Ventas",
            "fromColumn": "Id_Canal",
            "toTable": "Dim_CanalVenta",
            "toColumn": "Id_Canal"
        },
        {
            "name": "Rel_Fact_Estado",
            "fromTable": "Fact_Ventas",
            "fromColumn": "Id_Estado",
            "toTable": "Dim_EstadoPedido",
            "toColumn": "Id_Estado"
        }
    ]

    # model.bim
    model_bim = {
        "name": "Merkostore_PowerBI",
        "compatibilityLevel": 1550,
        "model": {
            "culture": "es-CO",
            "dataAccessOptions": {
                "legacyRedirects": True,
                "returnErrorValuesAsNull": True
            },
            "defaultPowerBIDataSourceVersion": "powerBI_V3",
            "tables": tables,
            "relationships": relationships
        }
    }

    with open(os.path.join(model_dir, "model.bim"), "w", encoding="utf-8") as f:
        json.dump(model_bim, f, indent=2, ensure_ascii=False)

    print("Proyecto PBIP creado exitosamente en:")
    print(pbip_file)

if __name__ == "__main__":
    create_pbip()
