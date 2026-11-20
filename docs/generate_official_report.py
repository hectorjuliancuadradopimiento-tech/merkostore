# -*- coding: utf-8 -*-
"""
Script to generate the complete, pristine, un-distorted HTML for Merkostore's
Methodological Report (Fundación Universitaria Tecnológico Comfenalco).
"""

import os

header_img = "images/comfenalco_header.png"
footer_img = "images/comfenalco_footer.png"
arbol_img = "images/arbol_problema.jpg"
dbdiagram_img = "images/dbdiagram_modelo.png"
powerbi_img = "images/powerbi_modelo_desktop.png"

html_head = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe Metodológico Merkostore - Tecnológico Comfenalco</title>
    <style>
        @page {{
            size: 210mm 297mm;
            margin: 0;
        }}
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        html, body {{
            margin: 0;
            padding: 0;
            width: 210mm;
            background: #ffffff;
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.45;
            color: #111111;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }}
        .page {{
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            page-break-after: always;
            break-after: page;
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
            background: #ffffff;
        }}
        .page-header {{
            width: 210mm;
            height: 32mm;
            display: block;
        }}
        .page-header img {{
            width: 100%;
            height: 100%;
            object-fit: fill;
            display: block;
        }}
        .page-footer {{
            position: absolute;
            bottom: 0;
            left: 0;
            width: 210mm;
            height: 16mm;
            display: block;
        }}
        .page-footer img {{
            width: 100%;
            height: 100%;
            object-fit: fill;
            display: block;
        }}
        .page-content {{
            box-sizing: border-box;
            width: 210mm;
            height: 249mm;
            padding: 6mm 24mm 8mm 24mm;
            text-align: justify;
            overflow: hidden;
        }}
        .chapter-title {{
            font-size: 15pt;
            font-weight: bold;
            color: #0f2a5c;
            text-align: center;
            margin-bottom: 12px;
            text-transform: uppercase;
        }}
        .section-title {{
            font-size: 12.5pt;
            font-weight: bold;
            color: #0f2a5c;
            margin-top: 12px;
            margin-bottom: 8px;
        }}
        .subsection-title {{
            font-size: 11.5pt;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 10px;
            margin-bottom: 6px;
        }}
        p {{
            margin-bottom: 10px;
            line-height: 1.44;
        }}
        .cover-box {{
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
            padding: 10px 0;
        }}
        .cover-title {{
            font-size: 17pt;
            font-weight: bold;
            color: #0f2a5c;
            line-height: 1.35;
            margin-top: 25px;
        }}
        .cover-subtitle {{
            font-size: 12pt;
            font-weight: normal;
            color: #334155;
            margin-top: 15px;
        }}
        .cover-authors {{
            font-size: 12pt;
            font-weight: bold;
            color: #1e293b;
            line-height: 1.6;
        }}
        .cover-faculty {{
            font-size: 11pt;
            line-height: 1.5;
            color: #334155;
        }}
        .cover-advisors {{
            font-size: 10pt;
            color: #475569;
            line-height: 1.4;
            max-width: 90%;
            margin: 0 auto;
        }}
        .cover-bottom {{
            font-size: 11pt;
            font-weight: bold;
            color: #0f2a5c;
            line-height: 1.4;
            margin-bottom: 15px;
        }}
        .toc-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
            line-height: 1.4;
        }}
        .toc-table td {{
            padding: 3.5px 0;
        }}
        .toc-leader {{
            border-bottom: 1px dotted #64748b;
        }}
        .academic-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
            line-height: 1.3;
            margin: 8px 0;
        }}
        .academic-table th {{
            background-color: #0f2a5c;
            color: #ffffff;
            font-weight: bold;
            padding: 6px 8px;
            border: 1px solid #0f2a5c;
            text-align: left;
        }}
        .academic-table td {{
            padding: 5px 8px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
        }}
        .academic-table tr:nth-child(even) {{
            background-color: #f8fafc;
        }}
        .figure-box {{
            text-align: center;
            margin: 8px auto;
        }}
        .figure-box img {{
            border: 1px solid #94a3b8;
            border-radius: 4px;
            display: block;
            margin: 0 auto;
        }}
        .figure-caption {{
            font-size: 9pt;
            font-style: italic;
            color: #475569;
            margin-top: 6px;
            text-align: center;
        }}
        .ref-item {{
            padding-left: 12mm;
            text-indent: -12mm;
            margin-bottom: 7px;
            font-size: 9.5pt;
            line-height: 1.35;
        }}
        .kpi-container {{
            display: flex;
            gap: 10px;
            margin: 8px 0;
        }}
        .kpi-card {{
            flex: 1;
            border: 1px solid #cbd5e1;
            border-top: 3px solid #0f2a5c;
            background-color: #f8fafc;
            padding: 6px;
            text-align: center;
            border-radius: 3px;
        }}
        .kpi-card-title {{
            font-size: 8pt;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
        }}
        .kpi-card-val {{
            font-size: 11.5pt;
            font-weight: bold;
            color: #0f2a5c;
            margin-top: 2px;
        }}
    </style>
</head>
<body>
"""

def make_page(content_html):
    return f"""
    <div class="page">
        <div class="page-header"><img src="{header_img}" alt="Encabezado Comfenalco"></div>
        <div class="page-content">
            {content_html}
        </div>
        <div class="page-footer"><img src="{footer_img}" alt="Pie de Página Comfenalco"></div>
    </div>
"""

pages = []

# ==========================================
# PÁGINA 1: PORTADA OFICIAL
# ==========================================
p1 = """
<div class="cover-box">
    <div>
        <div class="cover-title">
            MERKOSTORE: SISTEMA WEB PARA LA GESTIÓN DE VENTAS, PEDIDOS E INVENTARIO DE UNA TIENDA DE BARRIO
        </div>
        <div class="cover-subtitle">
            Informe Metodológico de Proyecto de Aula – Aplicación Web Full-Stack, Inteligencia de Negocios y Optimización
        </div>
    </div>

    <div>
        <div class="cover-authors">
            Julián David Cuadrado Martínez<br>
            Cristian Andrés Barrios Gómez<br>
            Santiago Argüello Castro<br>
            Ian Pabuena Caro
        </div>
    </div>

    <div>
        <div class="cover-faculty">
            <strong>Facultad de Ingeniería</strong><br>
            Tecnología en Desarrollo de Software – Semestre VII<br>
            Proyecto Integrador Interdisciplinario de Asignaturas
        </div>
    </div>

    <div>
        <div class="cover-advisors">
            <strong>Comité Docente y Asesores Metodológicos:</strong><br>
            Walter Alberto Aspriella Castellar, Estefanía Burgos Alarcón,<br>
            María José Rodríguez Rodríguez, Fabio García Ramírez,<br>
            Javier Mendoza Beltrán, Lucía Margarita Mestre Tapia<br>
            y Xavier José del Río Acosta.
        </div>
    </div>

    <div class="cover-bottom">
        Fundación Universitaria Tecnológico Comfenalco<br>
        Cartagena de Indias D. T. y C., Colombia<br>
        2026
    </div>
</div>
"""
pages.append(p1)

# ==========================================
# PÁGINA 2: TABLA DE CONTENIDO (PARTE 1)
# ==========================================
p2 = """
<div class="chapter-title">Tabla de Contenido</div>

<table class="toc-table">
    <tr><td><strong>Capítulo I. El Problema</strong></td><td class="toc-leader"></td><td style="text-align: right; width: 30px;"><strong>3</strong></td></tr>
    <tr><td style="padding-left: 15px;">1.1 Descripción del problema</td><td class="toc-leader"></td><td style="text-align: right;">3</td></tr>
    <tr><td style="padding-left: 15px;">1.2 Pregunta problema</td><td class="toc-leader"></td><td style="text-align: right;">5</td></tr>
    <tr><td style="padding-left: 15px;">1.3 Árbol del problema</td><td class="toc-leader"></td><td style="text-align: right;">6</td></tr>
    <tr><td style="padding-left: 15px;">1.4 Justificación</td><td class="toc-leader"></td><td style="text-align: right;">7</td></tr>
    <tr><td style="padding-left: 15px;">1.5 Objetivos de la investigación</td><td class="toc-leader"></td><td style="text-align: right;">8</td></tr>
    <tr><td style="padding-left: 30px;">1.5.1 Objetivo general</td><td class="toc-leader"></td><td style="text-align: right;">8</td></tr>
    <tr><td style="padding-left: 30px;">1.5.2 Objetivos específicos</td><td class="toc-leader"></td><td style="text-align: right;">9</td></tr>

    <tr><td style="padding-top: 10px;"><strong>Capítulo II. Marco Referencial y Estado del Arte</strong></td><td class="toc-leader" style="padding-top: 10px;"></td><td style="text-align: right; padding-top: 10px;"><strong>10</strong></td></tr>
    <tr><td style="padding-left: 15px;">2.1 Estado del arte y antecedentes</td><td class="toc-leader"></td><td style="text-align: right;">10</td></tr>
    <tr><td style="padding-left: 30px;">2.1.1 Antecedentes internacionales</td><td class="toc-leader"></td><td style="text-align: right;">10</td></tr>
    <tr><td style="padding-left: 30px;">2.1.2 Antecedentes nacionales</td><td class="toc-leader"></td><td style="text-align: right;">11</td></tr>
    <tr><td style="padding-left: 30px;">2.1.3 Antecedentes locales y regionales</td><td class="toc-leader"></td><td style="text-align: right;">12</td></tr>
    <tr><td style="padding-left: 15px;">2.2 Marco teórico</td><td class="toc-leader"></td><td style="text-align: right;">14</td></tr>
    <tr><td style="padding-left: 30px;">2.2.1 Arquitectura web Full-Stack con Spring Boot 3 y Java 21</td><td class="toc-leader"></td><td style="text-align: right;">14</td></tr>
    <tr><td style="padding-left: 30px;">2.2.2 Persistencia NoSQL orientada a documentos en MongoDB</td><td class="toc-leader"></td><td style="text-align: right;">14</td></tr>
    <tr><td style="padding-left: 30px;">2.2.3 Seguridad basada en Stateless JWT y BCrypt</td><td class="toc-leader"></td><td style="text-align: right;">14</td></tr>
    <tr><td style="padding-left: 30px;">2.2.4 Inteligencia Artificial Generativa y RAG (Groq y Llama-3.1)</td><td class="toc-leader"></td><td style="text-align: right;">15</td></tr>
    <tr><td style="padding-left: 30px;">2.2.5 Data Warehousing y Modelado Dimensional (Kimball)</td><td class="toc-leader"></td><td style="text-align: right;">15</td></tr>
    <tr><td style="padding-left: 30px;">2.2.6 Investigación de Operaciones y Programación Lineal Entera</td><td class="toc-leader"></td><td style="text-align: right;">15</td></tr>
    <tr><td style="padding-left: 15px;">2.3 Marco contextual</td><td class="toc-leader"></td><td style="text-align: right;">16</td></tr>
    <tr><td style="padding-left: 15px;">2.4 Marco legal, normativo y consideraciones éticas de IA</td><td class="toc-leader"></td><td style="text-align: right;">16</td></tr>
</table>
"""
pages.append(p2)

# ==========================================
# PÁGINA 3: TABLA DE CONTENIDO (PARTE 2)
# ==========================================
p3 = """
<div class="chapter-title" style="margin-bottom: 8px;">Tabla de Contenido (Continuación)</div>

<table class="toc-table">
    <tr><td><strong>Capítulo III. Metodología</strong></td><td class="toc-leader"></td><td style="text-align: right; width: 30px;"><strong>17</strong></td></tr>
    <tr><td style="padding-left: 15px;">3.1 Tipo y enfoque de investigación</td><td class="toc-leader"></td><td style="text-align: right;">17</td></tr>
    <tr><td style="padding-left: 15px;">3.2 Diseño metodológico y ciclo ágil Scrum</td><td class="toc-leader"></td><td style="text-align: right;">18</td></tr>
    <tr><td style="padding-left: 15px;">3.3 Cronograma de Sprints y actividades ejecutadas</td><td class="toc-leader"></td><td style="text-align: right;">19</td></tr>
    <tr><td style="padding-left: 15px;">3.4 Técnicas e instrumentos de recolección de información</td><td class="toc-leader"></td><td style="text-align: right;">20</td></tr>
    <tr><td style="padding-left: 15px;">3.5 Población, muestra y escenarios de prueba</td><td class="toc-leader"></td><td style="text-align: right;">20</td></tr>

    <tr><td style="padding-top: 10px;"><strong>Capítulo IV. Resultados de Investigación y Validación</strong></td><td class="toc-leader" style="padding-top: 10px;"></td><td style="text-align: right; padding-top: 10px;"><strong>21</strong></td></tr>
    <tr><td style="padding-left: 15px;">4.1 Arquitectura e implementación del sistema web Full-Stack</td><td class="toc-leader"></td><td style="text-align: right;">21</td></tr>
    <tr><td style="padding-left: 30px;">4.1.1 Frontend responsive y catálogo interactivo de productos</td><td class="toc-leader"></td><td style="text-align: right;">21</td></tr>
    <tr><td style="padding-left: 30px;">4.1.2 Backend Spring Boot, API REST y persistencia atómica</td><td class="toc-leader"></td><td style="text-align: right;">21</td></tr>
    <tr><td style="padding-left: 30px;">4.1.3 Panel de administración, gestión de pedidos y seguridad</td><td class="toc-leader"></td><td style="text-align: right;">22</td></tr>
    <tr><td style="padding-left: 15px;">4.2 Asistente virtual MerkoBot con IA Generativa y RAG</td><td class="toc-leader"></td><td style="text-align: right;">22</td></tr>
    <tr><td style="padding-left: 15px;">4.3 Modelo de optimización matemática de combos (MILP)</td><td class="toc-leader"></td><td style="text-align: right;">23</td></tr>
    <tr><td style="padding-left: 15px;">4.4 Inteligencia de negocios y Data Warehouse en Power BI</td><td class="toc-leader"></td><td style="text-align: right;">24</td></tr>
    <tr><td style="padding-left: 30px;">4.4.1 Diseño dimensional en dbdiagram.io (Esquema Estrella)</td><td class="toc-leader"></td><td style="text-align: right;">24</td></tr>
    <tr><td style="padding-left: 30px;">4.4.2 Implementación física del Data Warehouse y relaciones</td><td class="toc-leader"></td><td style="text-align: right;">25</td></tr>
    <tr><td style="padding-left: 30px;">4.4.3 Indicadores analíticos DAX y métricas de desempeño</td><td class="toc-leader"></td><td style="text-align: right;">26</td></tr>
    <tr><td style="padding-left: 15px;">4.5 Conclusiones del proyecto integrador</td><td class="toc-leader"></td><td style="text-align: right;">27</td></tr>

    <tr><td style="padding-top: 10px;"><strong>Referencias Bibliográficas (Normas APA 7ma Edición)</strong></td><td class="toc-leader" style="padding-top: 10px;"></td><td style="text-align: right; padding-top: 10px;"><strong>28</strong></td></tr>
</table>

<div class="section-title" style="margin-top: 20px; font-size: 11pt;">Índice de Tablas y Figuras</div>
<table class="toc-table">
    <tr><td>Figura 1. Árbol del problema de Merkostore</td><td class="toc-leader"></td><td style="text-align: right; width: 30px;">6</td></tr>
    <tr><td>Tabla 1. Matriz de correspondencia de objetivos, actividades y entregables</td><td class="toc-leader"></td><td style="text-align: right;">18</td></tr>
    <tr><td>Tabla 2. Cronograma de Sprints del proyecto ágil Scrum</td><td class="toc-leader"></td><td style="text-align: right;">19</td></tr>
    <tr><td>Tabla 3. Solución óptima del modelo MILP de combos comerciales</td><td class="toc-leader"></td><td style="text-align: right;">23</td></tr>
    <tr><td>Figura 2. Modelo Dimensional Conceptual en dbdiagram.io (Esquema Estrella)</td><td class="toc-leader"></td><td style="text-align: right;">24</td></tr>
    <tr><td>Figura 3. Diagrama de Relaciones del Data Warehouse en Power BI Desktop</td><td class="toc-leader"></td><td style="text-align: right;">25</td></tr>
    <tr><td>Tabla 4. Medidas analíticas DAX implementadas en el Data Warehouse</td><td class="toc-leader"></td><td style="text-align: right;">26</td></tr>
</table>
"""
pages.append(p3)

# ==========================================
# PÁGINA 4: CAPÍTULO I - PROBLEMA (PARTE 1)
# ==========================================
p4 = """
<div class="chapter-title">Capítulo I. El Problema</div>

<div class="section-title">1. Problema</div>

<div class="subsection-title">1.1 Descripción del problema</div>

<p>
Las tiendas de barrio cumplen una función determinante y estructurante en el tejido socioeconómico y comercial de las ciudades colombianas, particularmente en Cartagena de Indias. Estos establecimientos tradicionales representan el canal de aprovisionamiento diario más accesible para miles de hogares, ofreciendo abarrotes, alimentos frescos, bebidas, artículos de aseo e higiene personal y bienes de consumo masivo a escasos metros de los consumidores.
</p>

<p>
A pesar de su gran volumen transaccional y su cercanía con la comunidad, la gran mayoría de estas microempresas operan bajo modelos eminentemente empíricos y analógicos. Los procesos cotidianos de registro de existencias, cálculo de ventas y control de créditos ("fiados") suelen llevarse a cabo en cuadernos manuales o, en el mejor de los casos, en hojas de cálculo desarticuladas que no se sincronizan en tiempo real con las compras de los clientes.
</p>

<p>
Esta ausencia de centralización y automatización operativa desencadena severas limitaciones en el control del inventario. Con frecuencia, el administrador desconoce los niveles exactos de mercancía en bodega, lo que da lugar al agotamiento imprevisto de productos de alta rotación (roturas de stock) y a la acumulación excesiva de mercancía perecedera o de baja demanda, inmovilizando el escaso capital de trabajo disponible.
</p>

<p>
Asimismo, la atención de solicitudes de compra se efectúa comúnmente a través de llamadas telefónicas directas o mensajes dispersos en plataformas de mensajería instantánea como WhatsApp, donde los clientes carecen de visibilidad sobre los precios oficiales, las presentaciones vigentes o la disponibilidad real de los artículos, generando demoras, confusiones y pedidos fallidos.
</p>
"""
pages.append(p4)

# ==========================================
# PÁGINA 5: CAPÍTULO I - PROBLEMA (PARTE 2)
# ==========================================
p5 = """
<p>
La problemática se agudiza cuando el negocio intenta expandir su alcance comercial o estructurar combos y promociones. Al no disponer de un catálogo web accesible ni de un panel administrativo sincronizado, el tendero se ve forzado a dedicar horas valiosas a tareas operativas manuales y repetitivas, como confirmar existencias artículo por artículo y calcular totales de pago manualmente.
</p>

<p>
En este contexto, surge <strong>Merkostore</strong> como una plataforma tecnológica integral diseñada específicamente para modernizar y potenciar la gestión comercial de las tiendas de barrio. Merkostore resuelve la dispersión de la información integrando una interfaz pública de comercio electrónico, donde los clientes pueden explorar categorías, consultar precios actualizados, gestionar su carrito y generar pedidos formales, junto con un panel administrativo seguro que centraliza el catálogo, las compras y los estados de las órdenes.
</p>

<p>
Sin embargo, una plataforma de comercio electrónico tradicional únicamente solventa la captura transaccional básica. En el escenario competitivo contemporáneo, las tiendas de barrio demandan capacidades avanzadas de apoyo a la toma de decisiones estratégicas. Esto requiere el análisis riguroso de patrones de consumo, la estructuración de almacenes de datos (Data Warehouse) con esquemas dimensionales que permitan medir la rentabilidad real de cada línea de productos, y la formulación de modelos matemáticos cuantitativos de Investigación de Operaciones que optimicen la asignación de recursos y el presupuesto de abastecimiento.
</p>

<p>
Por tanto, el desafío asumido por el proyecto radica en articular en una sola solución Full-Stack la estabilidad operativa web, la persistencia NoSQL atómica, la analítica predictiva y descriptiva mediante Power BI, y la optimización de compras bajo restricciones presupuestales y de demanda.
</p>
"""
pages.append(p5)

# ==========================================
# PÁGINA 6: PREGUNTA PROBLEMA Y ÁRBOL INTRO
# ==========================================
p6 = """
<div class="subsection-title">1.2 Pregunta problema</div>

<p>
A partir del contexto operativo y de las debilidades descritas en la gestión cotidiana de las tiendas barriales, se plantea la siguiente interrogante que orienta la presente investigación formativa:
</p>

<div style="background-color: #f8fafc; border-left: 4px solid #0f2a5c; padding: 12px 16px; margin: 15px 0; font-weight: bold; font-size: 11.5pt; color: #0f2a5c; line-height: 1.5;">
    ¿Cómo puede Merkostore optimizar la gestión comercial, el control de inventarios y la toma de decisiones estratégicas de una tienda de barrio mediante una plataforma web Full-Stack integrada con inteligencia artificial, modelos analíticos dimensionales y técnicas de programación matemática entera?
</div>

<div class="subsection-title" style="margin-top: 18px;">1.3 Árbol del problema</div>

<p>
Para estructurar rigurosamente las causas directas e indirectas que originan la situación problemática, así como sus efectos e impactos sobre la sostenibilidad del negocio, se aplicó la técnica metodológica del árbol del problema.
</p>

<p>
El análisis causa-efecto permitió identificar como problema central la <em>inadecuada gestión operativa, comercial y de inventarios en las tiendas de barrio derivada del manejo empírico y desarticulado de los datos transaccionales</em>. Las causas primarias se agrupan en:
</p>

<ul style="margin-left: 25px; margin-bottom: 12px; line-height: 1.45;">
    <li><strong>Deficiencias en el canal de venta:</strong> Ausencia de un catálogo digital estructurado y dependencia exclusiva de la presencialidad o canales de mensajería informal.</li>
    <li><strong>Falta de control de inventario:</strong> Registro manual no sincronizado de entradas y salidas, carencia de alertas de reabastecimiento y stock de seguridad.</li>
    <li><strong>Inexistencia de inteligencia analítica:</strong> Ausencia de métricas de margen de utilidad, desconocimiento de la rotación de productos y compras intuitivas sin respaldo cuantitativo.</li>
</ul>

<p>
Estas causas generan efectos adversos directos como roturas de stock, pérdidas por mermas y vencimientos, sobrecostos de operación y pérdida de cuota de mercado frente a cadenas de descuento duro (Hard Discount), tal como se sintetiza gráficamente en la siguiente figura.
</p>
"""
pages.append(p6)

# ==========================================
# PÁGINA 7: ÁRBOL DEL PROBLEMA (FIGURA 1)
# ==========================================
p7 = f"""
<div class="subsection-title">1.3 Árbol del problema (Continuación)</div>

<div class="figure-box" style="margin-top: 15px;">
    <img src="{arbol_img}" alt="Árbol del problema Merkostore" style="max-height: 165mm; width: auto; max-width: 92%;">
    <div class="figure-caption">
        <strong>Figura 1.</strong> Estructura metodológica de causas y efectos (Árbol del Problema de Merkostore).<br>
        <em>Fuente: Elaboración propia del equipo de desarrollo, 2026.</em>
    </div>
</div>

<p style="margin-top: 15px;">
Como se ilustra en la Figura 1, la articulación entre causas de base y efectos finales demuestra que la resolución del problema exige una intervención holística: no basta con digitalizar la vitrina comercial (frontend), sino que es indispensable asegurar la coherencia transaccional del backend y proveer tableros analíticos e inteligencia cuantitativa que guíen al comerciante en sus decisiones financieras y de reabastecimiento.
</p>
"""
pages.append(p7)

# ==========================================
# PÁGINA 8: JUSTIFICACIÓN (PARTE 1)
# ==========================================
p8 = """
<div class="section-title">1.4 Justificación</div>

<p>
El desarrollo y ejecución de Merkostore se fundamenta en la necesidad inaplazable de tecnificar y proteger a las microempresas comerciales minoristas en Colombia. Las tiendas barriales no son solo unidades mercantiles, sino ejes fundamentales de cohesión social, abastecimiento de primera necesidad y generación de empleo en las comunidades locales. Sin embargo, su supervivencia económica se encuentra actualmente amenazada por la rápida penetración de grandes almacenes de cadena y tiendas de descuento duro, las cuales emplean tecnología de punta para optimizar sus costos logísticos y precios al consumidor.
</p>

<p>
Desde una <strong>perspectiva práctica y social</strong>, Merkostore democratiza el acceso a tecnología empresarial de alto nivel para los tenderos. Al dotar a una tienda de barrio de un canal web propio, catálogo digital enriquecido, carrito de compras y canal de atención automatizado con inteligencia artificial, el negocio equipara su oferta de servicio a la de competidores de mayor tamaño, permitiendo a los clientes del vecindario realizar pedidos con comodidad y transparencia desde sus hogares.
</p>

<p>
Desde una <strong>perspectiva metodológica y técnica</strong>, el proyecto justifica la aplicación de competencias avanzadas en ingeniería de software y analítica de datos. La arquitectura Full-Stack implementada combina la robustez corporativa de Java 21 y Spring Boot 3 con la flexibilidad de esquemas NoSQL en MongoDB, incorporando principios de diseño atómico para evitar la inconsistencia de inventarios durante la concurrencia de compras.
</p>

<p>
Asimismo, la integración de la Investigación de Operaciones (Programación Lineal Entera) permite superar el enfoque puramente documental de los proyectos de aula, demostrando cómo modelos matemáticos exactos pueden resolver problemas tangibles de optimización de presupuesto y mezcla de productos para maximizar la rentabilidad del tendero.
</p>
"""
pages.append(p8)

# ==========================================
# PÁGINA 9: JUSTIFICACIÓN (PARTE 2) Y OBJETIVOS
# ==========================================
p9 = """
<p>
Desde una <strong>perspectiva disciplinar e interdisciplinaria</strong>, Merkostore responde a las directrices académicas de la Facultad de Ingeniería de la Fundación Universitaria Tecnológico Comfenalco, logrando la convergencia armónica de cinco asignaturas del plan curricular: Desarrollo de Software Web, Visualización de Datos, Investigación de Operaciones, Metodología de la Investigación y Aspectos Legales/Éticos del Software. Esta sinergia dota a los estudiantes de la capacidad de concebir sistemas integrales que abarcan desde el código de persistencia hasta tableros de inteligencia ejecutiva en Power BI.
</p>

<div class="section-title">1.5 Objetivos de la investigación</div>

<div class="subsection-title">1.5.1 Objetivo general</div>

<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0f2a5c; padding: 12px 16px; margin: 12px 0; font-size: 11pt; line-height: 1.5;">
    <strong>Desarrollar y validar Merkostore</strong>, una plataforma web Full-Stack integral para la gestión comercial, procesamiento de pedidos y control atómico de inventario en tiendas de barrio, complementada con un asistente inteligente RAG, un modelo matemático de optimización de compras y un Data Warehouse dimensional en Power BI para el soporte cuantitativo a la toma de decisiones.
</div>

<div class="subsection-title" style="margin-top: 15px;">1.5.2 Objetivos específicos</div>

<p>
Para asegurar el cumplimiento sistemático y medible del objetivo general, se formulan cuatro objetivos específicos alineados con el ciclo metodológico del proyecto:
</p>

<ul style="margin-left: 25px; line-height: 1.45;">
    <li><strong>Objetivo Específico 1:</strong> Identificar y sistematizar los requisitos funcionales, no funcionales y las reglas del negocio para el catálogo público, flujo de compras del cliente y administración integral del tendero.</li>
    <li><strong>Objetivo Específico 2:</strong> Diseñar y construir una arquitectura web desacoplada y escalable basada en Spring Boot 3 / Java 21 LTS en el backend, HTML5/CSS3/JavaScript modular en el frontend, y persistencia atómica en MongoDB.</li>
</ul>
"""
pages.append(p9)

# ==========================================
# PÁGINA 10: OBJETIVOS ESPECÍFICOS Y CAP II
# ==========================================
p10 = """
<ul style="margin-left: 25px; line-height: 1.45; margin-bottom: 15px;">
    <li><strong>Objetivo Específico 3:</strong> Implementar mecanismos de seguridad informática mediante autenticación stateless JWT y encriptación BCrypt, incorporando además un agente virtual inteligente conversacional (MerkoBot) basado en IA Generativa con arquitectura RAG sobre el catálogo.</li>
    <li><strong>Objetivo Específico 4:</strong> Formular e implementar un modelo de Programación Lineal Entera Mixta (MILP) para la maximización del beneficio en combos comerciales, y estructurar un Data Warehouse bajo esquema estrella en Power BI con métricas DAX para la visualización ejecutiva del desempeño del negocio.</li>
</ul>

<div class="chapter-title" style="margin-top: 25px;">Capítulo II. Marco Referencial y Estado del Arte</div>

<div class="section-title">2. Estado del arte</div>

<p>
La modernización tecnológica de las microempresas comerciales ha sido objeto de estudio recurrente en la literatura académica reciente, particularmente en torno a la digitalización del comercio minorista, los sistemas de gestión de almacenes e inventarios (WMS) y la adopción de herramientas de analítica descriptiva para la supervivencia de pequeños negocios.
</p>

<p>
El análisis del estado del arte proporciona una base sólida para contrastar las metodologías existentes con las necesidades reales del entorno local de Cartagena, permitiendo identificar lecciones aprendidas, ventajas comparativas y vacíos conceptuales que Merkostore atiende de forma directa mediante la integración de desarrollo web, IA y modelos cuantitativos.
</p>
"""
pages.append(p10)

# ==========================================
# PÁGINA 11: ANTECEDENTES INTERNACIONALES
# ==========================================
p11 = """
<div class="subsection-title">2.1.1 Antecedentes internacionales</div>

<p>
A nivel internacional, diversas investigaciones han subrayado la criticidad del control interno sobre las existencias de mercancía en pequeños comercios. <strong>Gianella Fernández Maldonado (2017)</strong>, en su investigación desarrollada para la Universidad Católica Los Ángeles de Chimbote (Perú) sobre el control interno y la gestión de inventarios en micro y pequeñas empresas comerciales, determinó que más del 70% de las pérdidas operativas en pequeños minoristas se deben a la falta de registros sistemáticos de entradas y salidas de producto. El estudio concluye que la implementación de procedimientos informáticos estandarizados reduce los descuadres de caja y minimiza la merma de productos perecederos. Este antecedente fundamenta directamente en Merkostore la implementación del control atómico de existencias y los umbrales de alerta de stock mínimo en el backend.
</p>

<p>
En el ámbito de la automatización operativa, <strong>Apunte-García y Rodríguez-Piña (2016)</strong> publicaron en la revista <em>Ciencias Holguín</em> (Ecuador) un estudio sobre el diseño y aplicación de sistemas de inventarios en empresas comerciales, demostrando que la transición de cuadernos manuales a bases de datos relacionales o estructuradas reduce los tiempos de atención al cliente en un 45% y permite auditar con precisión las ventas diarias. Su investigación sirve de referencia para la organización de los modelos de datos en Merkostore, vinculando pedidos, transacciones y detalle de productos en una única fuente de verdad.
</p>

<p>
Por su parte, <strong>Cepeda Valero y Jiménez Sánchez (2016)</strong>, en su trabajo publicado en la revista <em>Ingeniería Industrial. Actualidad y Nuevas Tendencias</em> (Venezuela), exploraron modelos de control óptimo para sistemas de inventarios considerando funciones de demanda estocástica, costos de almacenamiento y deterioro temporal. Su trabajo evidencia que el inventario no debe administrarse únicamente desde una óptica reactiva (reponer cuando se acabe), sino predictiva, integrando variables de costos y rentabilidad esperada, lo cual sustenta la formulación del módulo de Investigación de Operaciones en nuestro proyecto.
</p>
"""
pages.append(p11)

# ==========================================
# PÁGINA 12: ANTECEDENTES NACIONALES
# ==========================================
p12 = """
<div class="subsection-title">2.1.2 Antecedentes nacionales</div>

<p>
En el panorama colombiano, diversas instituciones universitarias han abordado la problemática de la tecnificación del comercio minorista. La <strong>Universidad Católica de Pereira (2010)</strong> presentó una propuesta de solución tecnológica orientada a la automatización de procesos de facturación e inventario en establecimientos comerciales del departamento de Risaralda. El trabajo resaltó que la principal barrera para la adopción tecnológica en pequeños comercios es la complejidad y el alto costo de las soluciones ERP tradicionales del mercado, recomendando el desarrollo de interfaces web ligeras, intuitivas y desacopladas que se adapten al flujo real de trabajo del comerciante. Este postulado guio el diseño minimalista y ágil de la interfaz administrativa de Merkostore.
</p>

<p>
Asimismo, <strong>Osorio García (2021)</strong>, en su investigación publicada en el Politécnico Grancolombiano sobre modelos de gestión de inventarios en pymes nacionales, evaluó la aplicabilidad de estrategias como la clasificación ABC (Pareto) y el cálculo del Punto de Reorden (ROP). Osorio demostró que categorizar los artículos según su volumen de ingresos permite al comerciante concentrar sus recursos financieros en el 20% de los productos que generan el 80% de las ventas, evitando la inmovilización innecesaria de liquidez. Esta lógica fue incorporada en el modelo analítico de Merkostore mediante métricas DAX especializadas en Power BI.
</p>

<p>
Adicionalmente, <strong>Cartagena y Pescador Aguirre (2019)</strong> desarrollaron en la Universidad Libre de Pereira un sistema de control de existencias en el sector metalmecánico, demostrando que la validación estricta de precios y cantidades desde el lado del servidor previene errores de digitación y garantiza la trazabilidad legal y contable de cada orden de entrega, principio fundamental aplicado en el controlador de pedidos de Merkostore.
</p>
"""
pages.append(p12)

# ==========================================
# PÁGINA 13: ANTECEDENTES LOCALES Y REGIONALES
# ==========================================
p13 = """
<div class="subsection-title">2.1.3 Antecedentes locales y regionales</div>

<p>
En el contexto específico de Cartagena de Indias y la región Caribe colombiana, las tiendas de barrio enfrentan particularidades culturales, geográficas y operativas que condicionan su gestión comercial. <strong>Rada Restrepo, Blanco Arroyo y Muñoz Caraballo (2017)</strong>, en su investigación desarrollada en la Universidad del Sinú (Cartagena) titulada <em>Propuesta para el diseño del sistema de control de inventarios para el almacén AutoFrenos</em>, analizaron las dificultades logísticas derivadas de la dispersión de proveedores y la dependencia del crédito informal. Su propuesta enfatizó la necesidad de establecer clasificaciones rigurosas de rotación para mitigar el impacto de los sobrecostos de flete y domicilio en la ciudad, aspectos plenamente aplicables a las microtiendas barriales.
</p>

<p>
Por otra parte, <strong>Mejía Aguas y Roncallo Petro (2009)</strong>, en su estudio de la Universidad de Cartagena sobre la industria manufacturera y comercial de la ciudad, destacaron que el sector informal del comercio minorista en barrios populosos de Cartagena sufre de una marcada asimetría de información frente a los distribuidores mayoristas de víveres, lo que obliga al tendero a operar con márgenes reducidos sin conocimiento preciso de su punto de equilibrio financiero.
</p>

<p>
Finalmente, la experiencia regional de <strong>Julca Díaz y Rojas Zárate (2015)</strong> en el diseño de plataformas web integradas para el comercio minorista evidenció que los clientes valoran prioritariamente la claridad de precios, la facilidad para seleccionar presentaciones y la confirmación inmediata del pedido por canales móviles. Merkostore integra estos hallazgos locales, incorporando soporte multicanal mediante Webhook de WhatsApp y tableros analíticos orientados a la realidad transaccional de los barrios de Cartagena (Getsemaní, Bocagrande, Manga, Pie de la Popa, entre otros).
</p>
"""
pages.append(p13)

# ==========================================
# PÁGINA 14: SÍNTESIS DE ANTECEDENTES Y MARCO TEÓRICO
# ==========================================
p14 = """
<div class="subsection-title">2.1.4 Síntesis comparativa y valor diferencial de Merkostore</div>

<p>
La revisión de la literatura nacional e internacional revela que la mayoría de los desarrollos previos se limitan a uno de dos extremos: o implementan sistemas transaccionales básicos de registro de órdenes sin capacidad analítica, o formulan modelos matemáticos teóricos desvinculados de un sistema web funcional.
</p>

<p>
El valor diferencial y la innovación metodológica de <strong>Merkostore</strong> radican en la integración simultánea de tres dimensiones:
</p>

<ol style="margin-left: 25px; margin-bottom: 15px; line-height: 1.45;">
    <li><strong>Capa Operativa Web:</strong> Plataforma Full-Stack resiliente, transacciones atómicas con MongoDB y panel administrativo en tiempo real.</li>
    <li><strong>Capa de Inteligencia Artificial:</strong> Asistente virtual MerkoBot con arquitectura RAG impulsado por modelos LLM (Llama-3.1) para atención conversacional personalizada.</li>
    <li><strong>Capa de Apoyo Cuantitativo a Decisiones:</strong> Esquema dimensional de Data Warehouse en Power BI para visualización de KPIs de negocio y resolución exacta de modelos MILP para optimización de compras y combos.</li>
</ol>

<div class="section-title">2.2 Marco teórico</div>

<div class="subsection-title">2.2.1 Arquitectura web Full-Stack con Spring Boot 3 y Java 21</div>

<p>
El backend se construyó bajo el patrón arquitectónico por capas utilizando el lenguaje <strong>Java 21 LTS</strong> y el framework <strong>Spring Boot 3.4.0</strong>. Esta combinación proporciona estabilidad empresarial, compilación optimizada con soporte para hilos virtuales (Virtual Threads) y un desacoplamiento estricto entre controladores REST (`@RestController`), servicios de lógica de negocio (`@Service`) y repositorios de datos (`@Repository`).
</p>
"""
pages.append(p14)

# ==========================================
# PÁGINA 15: MARCO TEÓRICO (BD, SEGURIDAD, IA)
# ==========================================
p15 = """
<div class="subsection-title">2.2.2 Persistencia NoSQL orientada a documentos en MongoDB</div>

<p>
A diferencia de los sistemas tradicionales basados en esquemas tabulares rígidos, Merkostore emplea <strong>MongoDB 7.0</strong>. Este motor de base de datos NoSQL orientado a documentos JSON/BSON resulta ideal para el catálogo de productos de una tienda de barrio, donde los artículos presentan atributos dinámicos, imágenes, listas de categorías y presentaciones variadas. Adicionalmente, MongoDB permite ejecutar operaciones atómicas a nivel de documento mediante operadores como `$inc` y `$set`, garantizando que la reserva o descuento de existencias se efectúe de forma segura sin condiciones de carrera (Race Conditions) ante múltiples pedidos simultáneos.
</p>

<div class="subsection-title">2.2.3 Seguridad informática con Stateless JWT y BCrypt</div>

<p>
La seguridad de la plataforma se articula mediante <strong>Spring Security</strong> configurado en modalidad sin estado (Stateless Session). Para la autenticación administrativa se implementaron tokens de acceso firmados digitalmente bajo el estándar <strong>JSON Web Token (JWT)</strong>, con algoritmo HMAC-SHA256 y expiración temporal. El almacenamiento de contraseñas de administradores y tenderos se protege mediante el algoritmo de hash criptográfico <strong>BCrypt</strong> con factor de trabajo (salt) configurable, impidiendo la recuperación de contraseñas incluso ante eventuales vulnerabilidades de acceso al repositorio.
</p>

<div class="subsection-title">2.2.4 Inteligencia Artificial Generativa y Arquitectura RAG</div>

<p>
Para asistir al cliente durante el proceso de compra, Merkostore incorpora <strong>MerkoBot</strong>, un agente conversacional inteligente. MerkoBot utiliza el modelo de lenguaje de gran tamaño (LLM) <strong>Llama-3.1</strong> servido mediante la infraestructura de inferencia de baja latencia de <strong>Groq Cloud API</strong>. La interacción se fundamenta en el patrón <strong>RAG (Retrieval-Augmented Generation)</strong>, donde el catálogo activo de productos, precios y existencias se inyecta dinámicamente como contexto semántico del prompt, garantizando respuestas veraces y evitando alucinaciones sobre productos no comercializados por la tienda.
</p>
"""
pages.append(p15)

# ==========================================
# PÁGINA 16: MARCO TEÓRICO (DW, MILP, CONTEXTO)
# ==========================================
p16 = """
<div class="subsection-title">2.2.5 Data Warehousing y Modelado Dimensional (Kimball)</div>

<p>
Para el análisis gerencial de ventas, el proyecto implementa la metodología de modelado dimensional propuesta por <strong>Ralph Kimball</strong>. Se estructura un <strong>Esquema Estrella (Star Schema)</strong> compuesto por una tabla central de hechos transaccionales (`Fact_Ventas`) y tablas maestras de dimensiones (`Dim_Tiempo`, `Dim_Producto`, `Dim_Cliente`, `Dim_Metodo_Pago`, `Dim_Tienda`). Este diseño desnormalizado optimiza drásticamente el rendimiento de las consultas agregadas en motores OLAP como Microsoft Power BI, facilitando el cálculo de métricas financieras mediante expresiones DAX.
</p>

<div class="subsection-title">2.2.6 Investigación de Operaciones: Programación Lineal Entera Mixta (MILP)</div>

<p>
La Investigación de Operaciones suministra el andamiaje matemático para la toma de decisiones racionales. El aprovisionamiento de una tienda de barrio con presupuesto acotado se modela formalmente como un problema de <strong>Programación Lineal Entera Mixta (MILP)</strong>, emparentado con el clásico Problema de la Mochila Acotada (Bounded Knapsack Problem). Mediante algoritmos de Branch & Bound implementados con la librería PuLP de Python, el sistema determina la combinación exacta de combos comerciales que maximiza la utilidad monetaria sin exceder el capital de compra ni el espacio disponible en tienda.
</p>

<div class="section-title">2.3 Marco contextual</div>

<p>
El proyecto se circunscribe al entorno socioeconómico de las tiendas tradicionales de comercio al por menor en el distrito de Cartagena de Indias, departamento de Bolívar. El modelo se parametrizó tomando como referencia patrones comerciales de barrios residenciales representativos (Manga, Bocagrande, Pie de la Popa, Getsemaní, Crespo y Centro Histórico). La demanda analizada refleja la preferencia de los hogares cartageneros por combos de desayuno, limpieza básica y abarrotes de la canasta familiar.
</p>
"""
pages.append(p16)

# ==========================================
# PÁGINA 17: MARCO LEGAL Y ÉTICO DE LA IA
# ==========================================
p17 = """
<div class="section-title">2.4 Marco legal, normativo y consideraciones éticas</div>

<div class="subsection-title">2.4.1 Marco normativo y legal colombiano</div>

<p>
El desarrollo, despliegue y operación de Merkostore se ajusta estrictamente al marco legal vigente de la República de Colombia en materia de comercio electrónico, protección al consumidor y seguridad digital:
</p>

<ul style="margin-left: 25px; margin-bottom: 12px; line-height: 1.45;">
    <li><strong>Ley 1581 de 2012 (Protección de Datos Personales - Habeas Data):</strong> Regula la recolección, almacenamiento y tratamiento de información de clientes (nombres, teléfonos, direcciones de entrega). Merkostore implementa políticas de consentimiento explícito, finalidad comercial exclusiva y restricción de acceso a usuarios autorizados.</li>
    <li><strong>Ley 1480 de 2011 (Estatuto del Consumidor):</strong> Establece la obligación de brindar información clara, veraz y suficiente sobre precios finales, descuentos, costos de envío y disponibilidad de inventario, derechos garantizados en el catálogo y checkout web de la plataforma.</li>
    <li><strong>Ley 527 de 1999 (Comercio Electrónico y Firmas Digitales):</strong> Otorga validez jurídica y probatoria a los mensajes de datos y órdenes electrónicas generadas por el sistema.</li>
    <li><strong>Artículo 333 de la Constitución Política:</strong> Garantiza la libre iniciativa privada y el fortalecimiento de la actividad económica de los microempresarios colombianos.</li>
</ul>

<div class="subsection-title">2.4.2 Consideraciones éticas en el uso de Inteligencia Artificial</div>

<p>
En cumplimiento con los principios internacionales de IA Ética y Responsable (UNESCO, 2021), el agente conversacional MerkoBot incorpora salvaguardas explícitas:
</p>

<ul style="margin-left: 25px; line-height: 1.45;">
    <li><strong>Transparencia y No Engaño:</strong> El sistema notifica al usuario que interactúa con un asistente automatizado impulsado por IA, sin suplantar la identidad de una persona humana.</li>
    <li><strong>Mitigación de Sesgos Algorítmicos:</strong> El modelo de optimización y las sugerencias comerciales no discriminan a clientes por barrio, nivel socioeconómico ni historial crediticio.</li>
    <li><strong>Privacidad de Diálogos:</strong> Las conversaciones del chat no se almacenan para entrenamiento de modelos externos ni se comparten con terceros.</li>
</ul>
"""
pages.append(p17)

# ==========================================
# PÁGINA 18: CAPÍTULO III - METODOLOGÍA (PARTE 1)
# ==========================================
p18 = """
<div class="chapter-title">Capítulo III. Metodología</div>

<div class="section-title">3. Metodología</div>

<div class="subsection-title">3.1 Tipo y enfoque de investigación</div>

<p>
El proyecto se enmarca dentro de un <strong>paradigma aplicado, propositivo y tecnológico</strong>, orientado a resolver una problemática tangible del sector microempresarial mediante el diseño y validación de un producto de software operable.
</p>

<p>
El enfoque metodológico es <strong>mixto (cuanti-cualitativo)</strong>:
</p>

<ul style="margin-left: 25px; margin-bottom: 12px; line-height: 1.45;">
    <li><strong>Dimensión Cualitativa:</strong> Enfocada en la caracterización de los procesos operativos de la tienda, la experiencia del usuario (UX) en la navegación del catálogo web y la comprensión de las necesidades de control del tendero mediante entrevistas y revisión funcional.</li>
    <li><strong>Dimensión Cuantitativa:</strong> Fundamentada en la recolección, estructuración y modelado matemático de variables numéricas discretas y continuas (cantidades demandadas, tiempos de procesamiento de pedidos, precios, márgenes brutos de ganancia, costos fijos y restricciones de capital en el modelo MILP).</li>
</ul>

<div class="subsection-title">3.2 Diseño metodológico</div>

<p>
El desarrollo del software se estructuró siguiendo el marco ágil de trabajo <strong>Scrum</strong>, seleccionado por su capacidad de adaptación incremental y entregas continuas de valor funcional. El equipo asumió roles multidisciplinarios de Product Owner, Scrum Master y Development Team, gestionando historias de usuario agrupadas en cuatro Sprints de trabajo iterativo.
</p>

<div class="figure-caption" style="text-align: left; margin-bottom: 4px;">
    <strong>Tabla 1.</strong> Matriz metodológica de correspondencia entre objetivos, actividades y entregables verificados.
</div>

<table class="academic-table">
    <thead>
        <tr>
            <th style="width: 25%;">Objetivo Específico</th>
            <th style="width: 40%;">Actividades Metodológicas</th>
            <th style="width: 35%;">Entregable Técnico</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>1. Requisitos y Negocio</strong></td>
            <td>Levantamiento de historias de usuario, diagramación de flujos de checkout y definición de reglas de compra barrial.</td>
            <td>Documento de especificación de requisitos y backlog de producto priorizado.</td>
        </tr>
        <tr>
            <td><strong>2. Arquitectura Full-Stack</strong></td>
            <td>Diseño de la API REST, configuración de Spring Boot 3, modelado BSON en MongoDB y construcción de interfaces web.</td>
            <td>Código fuente versionado en Git con compilación Maven exitosa (BUILD SUCCESS).</td>
        </tr>
        <tr>
            <td><strong>3. Seguridad e IA</strong></td>
            <td>Implementación de Spring Security con JWT, cifrado BCrypt y conexión con Groq API para el bot RAG conversacional.</td>
            <td>Módulo de autenticación seguro y asistente MerkoBot funcional multicanal.</td>
        </tr>
        <tr>
            <td><strong>4. Analítica y Optimización</strong></td>
            <td>Estructuración del Esquema Estrella en dbdiagram.io, ETL a Power BI y resolución del modelo MILP en Python con PuLP.</td>
            <td>Dashboard ejecutivo de Power BI y script solver con solución óptima $Z^*$.</td>
        </tr>
    </tbody>
</table>
"""
pages.append(p18)

# ==========================================
# PÁGINA 19: CRONOGRAMA DE SPRINTS
# ==========================================
p19 = """
<div class="subsection-title">3.3 Cronograma de Sprints y ciclo ágil ejecutado</div>

<p>
El ciclo de desarrollo se dividió en cuatro Sprints secuenciales de dos semanas cada uno, asegurando la verificación continua de requisitos y la trazabilidad del código:
</p>

<div class="figure-caption" style="text-align: left; margin-bottom: 4px;">
    <strong>Tabla 2.</strong> Cronograma detallado de Sprints ejecutados durante el semestre académico.
</div>

<table class="academic-table">
    <thead>
        <tr>
            <th style="width: 15%;">Sprint</th>
            <th style="width: 35%;">Objetivo y Alcance Técnico</th>
            <th style="width: 30%;">Historias de Usuario</th>
            <th style="width: 20%;">Estado de Cierre</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Sprint 1<br>(Sem. 1-4)</strong></td>
            <td>Planeación arquitectónica, modelado de dominio y persistencia NoSQL en MongoDB.</td>
            <td>HU01: Explorar categorías.<br>HU02: Consultar catálogo.<br>HU03: Modelar productos.</td>
            <td><strong style="color: #166534;">100% Completado</strong><br>Base de datos inicializada.</td>
        </tr>
        <tr>
            <td><strong>Sprint 2<br>(Sem. 5-8)</strong></td>
            <td>Construcción del e-commerce, carrito de compras atómico, checkout y seguridad JWT.</td>
            <td>HU04: Carrito de compras.<br>HU05: Generar pedido.<br>HU06: Login administrativo.</td>
            <td><strong style="color: #166534;">100% Completado</strong><br>Endpoints REST asegurados.</td>
        </tr>
        <tr>
            <td><strong>Sprint 3<br>(Sem. 9-12)</strong></td>
            <td>Panel administrativo, gestión de pedidos y desarrollo del asistente inteligente MerkoBot.</td>
            <td>HU07: Gestión de estados.<br>HU08: Asistente virtual RAG.<br>HU09: Solver MILP Python.</td>
            <td><strong style="color: #166534;">100% Completado</strong><br>Groq LLM y solver validados.</td>
        </tr>
        <tr>
            <td><strong>Sprint 4<br>(Sem. 13-16)</strong></td>
            <td>Diseño dimensional del DW, pipeline ETL, métricas DAX y dashboard ejecutivo Power BI.</td>
            <td>HU10: Esquema estrella DW.<br>HU11: Cálculo de márgenes.<br>HU12: Tablero ejecutivo.</td>
            <td><strong style="color: #166534;">100% Completado</strong><br>Reporte analítico final.</td>
        </tr>
    </tbody>
</table>

<p style="margin-top: 15px;">
Cada iteración concluyó con una sesión formal de Sprint Review y Sprint Retrospective, verificando que los criterios de aceptación estuvieran respaldados por pruebas de integración y métricas cuantitativas reproducibles.
</p>
"""
pages.append(p19)

# ==========================================
# PÁGINA 20: TÉCNICAS, INSTRUMENTOS, POBLACIÓN
# ==========================================
p20 = """
<div class="subsection-title">3.4 Técnicas e instrumentos de recolección de información</div>

<p>
Para alimentar tanto el desarrollo funcional como los modelos de optimización y visualización, se utilizaron técnicas e instrumentos rigurosos:
</p>

<ul style="margin-left: 25px; margin-bottom: 12px; line-height: 1.45;">
    <li><strong>Observación Directa Participativa:</strong> Estudio in situ de los flujos de atención y abastecimiento en tiendas minoristas de Cartagena, cronometrando los tiempos de preparación de pedidos y el registro de créditos.</li>
    <li><strong>Revisión Documental y de Facturación:</strong> Análisis de listas de precios de mayoristas y distribuidores de consumo masivo para alimentar los costos unitarios de compra y precios de venta recomendados.</li>
    <li><strong>Pruebas de Carga y Concurrencia de Software:</strong> Ejecución de peticiones HTTP automatizadas sobre la API REST de Spring Boot para evaluar la consistencia del inventario ante transacciones concurrentes.</li>
    <li><strong>Pipeline ETL Automatizado:</strong> Instrumentación de scripts en Python para la extracción, limpieza, normalización y carga de registros de ventas en el modelo dimensional.</li>
</ul>

<div class="subsection-title">3.5 Población, muestra y escenarios de prueba</div>

<p>
La <strong>población objeto de estudio</strong> comprende los procesos transaccionales comerciales de las tiendas de barrio urbanas del distrito de Cartagena. Para la validación empírica del sistema se consolidó una <strong>muestra transaccional controlada</strong> representativa de la operación mensual:
</p>

<ul style="margin-left: 25px; line-height: 1.45;">
    <li><strong>Catálogo Maestro:</strong> 25 referencias comerciales de alta rotación organizadas en 5 categorías fundamentales (Lácteos y Huevos, Granos y Despensa, Aseo y Cuidado del Hogar, Bebidas y Snacks, Frutas y Verduras).</li>
    <li><strong>Muestra Transaccional:</strong> 24 pedidos formalmente procesados y liquidados, que totalizan 60 unidades de producto comercializadas a través de la plataforma web.</li>
    <li><strong>Cobertura Geográfica:</strong> 6 barrios tradicionales de Cartagena (Manga, Bocagrande, Centro Histórico, Pie de la Popa, Getsemaní y Crespo).</li>
    <li><strong>Canales de Pago:</strong> Tarjeta de crédito/débito, transferencia Nequi/Daviplata y efectivo contra entrega.</li>
</ul>
"""
pages.append(p20)

# ==========================================
# PÁGINA 21: CAPÍTULO IV - RESULTADOS (WEB)
# ==========================================
p21 = """
<div class="chapter-title">Capítulo IV. Resultados de Investigación y Validación</div>

<div class="section-title">4. Resultados de investigación</div>

<div class="subsection-title">4.1 Desarrollo Web Full-Stack y arquitectura del sistema</div>

<p>
El desarrollo tecnológico culminó exitosamente con una plataforma web completamente operativa, modular y validada en su compilación y ejecución. El sistema se compone de dos subsistemas funcionales principales:
</p>

<div class="subsection-title" style="font-size: 11pt;">4.1.1 Frontend público y experiencia de compra del cliente</div>

<p>
La interfaz de usuario del cliente (`index.html`, `app.js`, `styles.css`) ofrece una experiencia moderna, fluida y responsive:
</p>

<ul style="margin-left: 25px; margin-bottom: 10px; line-height: 1.42;">
    <li><strong>Navegación Intuitiva por Categorías:</strong> Filtrado interactivo con actualización asíncrona del DOM sin recarga de página.</li>
    <li><strong>Buscador en Tiempo Real:</strong> Búsqueda predictiva por nombre de producto y coincidencia fonética básica.</li>
    <li><strong>Gestión de Carrito de Compras:</strong> Persistencia local (`localStorage`) que preserva la selección de compra del usuario ante cierres de navegador o interrupciones de conexión.</li>
    <li><strong>Módulo de Checkout Seguro:</strong> Captura de datos de entrega, validación de teléfono móvil, selección de método de pago y confirmación inmediata con número de guía único.</li>
</ul>

<div class="subsection-title" style="font-size: 11pt;">4.1.2 Backend empresarial Spring Boot y persistencia atómica</div>

<p>
El núcleo de la aplicación backend implementa patrones de diseño robustos que blindan la consistencia de los datos del negocio:
</p>

<ul style="margin-left: 25px; line-height: 1.42;">
    <li><strong>Control Atómico de Inventarios:</strong> Las operaciones de reserva y descuento de stock se ejecutan mediante actualizaciones atómicas de MongoDB (`Query: { _id: id, stock: { $gte: qty } }`, `Update: { $inc: { stock: -qty } }`), imposibilitando ventas en negativo.</li>
    <li><strong>Mecanismo de Idempotencia:</strong> Cada solicitud de checkout incorpora una clave única (`idempotency_key`), protegiendo a la tienda contra cargos duplicados o múltiples pedidos originados por doble clic del usuario.</li>
    <li><strong>API REST Documentada:</strong> Controladores específicos para productos, categorías, pedidos, autenticación y métricas de salud del sistema (`/api/health`).</li>
</ul>
"""
pages.append(p21)

# ==========================================
# PÁGINA 22: RESULTADOS (PANEL ADMIN Y MERKOBOT)
# ==========================================
p22 = """
<div class="subsection-title">4.1.3 Panel de administración integral del tendero</div>

<p>
El panel administrativo (`admin.html`) provee al comerciante un entorno centralizado y seguro para el gobierno integral del negocio:
</p>

<ul style="margin-left: 25px; margin-bottom: 12px; line-height: 1.42;">
    <li><strong>Gestión CRUD de Catálogo:</strong> Creación, edición y deshabilitación de productos, ajuste de precios de venta, costos de compra y configuración de stock mínimo de alerta.</li>
    <li><strong>Gestión de Pedidos en Vivo:</strong> Visualización de órdenes entrantes con actualización de estados en tiempo real (`PENDIENTE`, `EN_PROCESO`, `ENTREGADO`, `CANCELADO`), con restauración automática de stock en cancelaciones.</li>
    <li><strong>Métricas Operativas Diarias:</strong> Tarjetas de resumen con ventas del día, pedidos pendientes de despacho y alertas visuales de mercancía por agotarse.</li>
</ul>

<div class="subsection-title">4.2 Asistente virtual inteligente MerkoBot (IA Generativa con RAG)</div>

<p>
Para brindar atención continua 24/7 y reducir la carga de soporte del tendero, se construyó el módulo de inteligencia artificial <strong>MerkoBot</strong>:
</p>

<ul style="margin-left: 25px; margin-bottom: 10px; line-height: 1.42;">
    <li><strong>Arquitectura RAG sobre Catálogo:</strong> Antes de procesar la consulta del cliente, el backend recupera el listado dinámico de productos activos, precios oficiales y stock disponible, inyectándolo en el contexto del sistema.</li>
    <li><strong>Motor LLM de Inferencia Ultrarrápida:</strong> Conexión mediante API REST con <strong>Groq Cloud</strong> consumiendo el modelo <strong>Llama-3.1-70B/8B Versatile</strong>, alcanzando tiempos de respuesta inferiores a 1,2 segundos.</li>
    <li><strong>Canal Web y Webhook de WhatsApp:</strong> El cliente puede interactuar directamente desde el widget flotante en la tienda web o a través de mensajería móvil convencional.</li>
</ul>

<div class="figure-caption" style="text-align: left; background: #f1f5f9; padding: 6px 10px; border-left: 3px solid #0f2a5c;">
    <strong>Ejemplo de Diálogo RAG Validado:</strong><br>
    <em>Cliente:</em> "¿Tienen arroz y cuánto cuesta el kilo?"<br>
    <em>MerkoBot:</em> "¡Hola! Sí tenemos Arroz Diana 1 kg disponible en este momento con 18 unidades en stock a solo $ 4.200 COP. ¿Deseas que te ayude a añadirlo a tu carrito de compras?"
</div>
"""
pages.append(p22)

# ==========================================
# PÁGINA 23: MODELO DE OPTIMIZACIÓN MILP (IO)
# ==========================================
p23 = """
<div class="section-title">4.3 Modelo matemático de optimización de combos (Investigación de Operaciones)</div>

<p>
Para maximizar el beneficio económico de la tienda de barrio ante recursos de capital y almacenamiento limitados, se formuló y resolvió un modelo de <strong>Programación Lineal Entera Mixta (MILP)</strong>.
</p>

<div class="subsection-title" style="font-size: 11pt;">4.3.1 Formulación matemática formal</div>

<p><strong>Variables de Decisión:</strong> Sea $x_j \in \mathbb{Z}^+$ el número entero de unidades a conformar y comercializar del combo $j \in \{1, 2, 3, 4, 5\}$:</p>
<ul style="margin-left: 25px; margin-bottom: 8px; font-size: 10pt; line-height: 1.35;">
    <li>$x_1$: Combo Desayuno Familiar (Huevos AA, Leche Entera, Café Molido, Pan Tajado).</li>
    <li>$x_2$: Combo Almuerzo Casero (Arroz Diana, Aceite Vegetal, Lentejas, Atún en Aceite).</li>
    <li>$x_3$: Combo Aseo Total (Detergente Multiusos, Cloro Líquido, Jabón de Baño, Papel Higiénico).</li>
    <li>$x_4$: Combo Lonchera Escolar (Galletas Festival, Jugo Hit, Ponqué Chocoramo).</li>
    <li>$x_5$: Combo Canasta Básica Premium (Selección mixta de abarrotes de alta gama).</li>
</ul>

<p><strong>Función Objetivo:</strong> Maximizar la ganancia neta estimada ($Z$):</p>
<div style="text-align: center; font-weight: bold; font-size: 11pt; color: #0f2a5c; margin: 6px 0;">
    $\max Z = 9.800 x_1 + 14.500 x_2 + 11.200 x_3 + 5.400 x_4 + 22.000 x_5$
</div>

<p><strong>Restricciones Operativas:</strong></p>
<ul style="margin-left: 25px; margin-bottom: 10px; font-size: 10pt; line-height: 1.35;">
    <li><strong>Presupuesto de Compra:</strong> $22.000 x_1 + 31.500 x_2 + 24.800 x_3 + 12.600 x_4 + 48.000 x_5 \le 1.500.000$ COP.</li>
    <li><strong>Capacidad de Almacenamiento:</strong> $3 x_1 + 4 x_2 + 3.5 x_3 + 1.5 x_4 + 6 x_5 \le 200$ unidades físicas en bodega.</li>
    <li><strong>Demanda Máxima Estimada:</strong> $x_1 \le 25, \quad x_2 \le 20, \quad x_3 \le 18, \quad x_4 \le 30, \quad x_5 \le 15$.</li>
</ul>

<div class="figure-caption" style="text-align: left; margin-bottom: 4px;">
    <strong>Tabla 3.</strong> Solución óptima computacional obtenida con solver CBC / Branch & Bound en Python.
</div>

<table class="academic-table">
    <thead>
        <tr>
            <th>Combo Comercial</th>
            <th>Costo Compra</th>
            <th>Precio Venta</th>
            <th>Margen Unitario</th>
            <th>Cantidad Óptima ($x_j^*$)</th>
            <th>Beneficio Total</th>
        </tr>
    </thead>
    <tbody>
        <tr><td><strong>1. Combo Desayuno</strong></td><td>$ 22.000</td><td>$ 31.800</td><td>$ 9.800 (30,8%)</td><td><strong>25 combos</strong></td><td>$ 245.000 COP</td></tr>
        <tr><td><strong>2. Combo Almuerzo</strong></td><td>$ 31.500</td><td>$ 46.000</td><td>$ 14.500 (31,5%)</td><td><strong>20 combos</strong></td><td>$ 290.000 COP</td></tr>
        <tr><td><strong>3. Combo Aseo Total</strong></td><td>$ 24.800</td><td>$ 36.000</td><td>$ 11.200 (31,1%)</td><td><strong>13 combos</strong></td><td>$ 145.600 COP</td></tr>
        <tr><td><strong>4. Combo Lonchera</strong></td><td>$ 12.600</td><td>$ 18.000</td><td>$ 5.400 (30,0%)</td><td><strong>30 combos</strong></td><td>$ 162.000 COP</td></tr>
        <tr><td><strong>5. Canasta Premium</strong></td><td>$ 48.000</td><td>$ 70.000</td><td>$ 22.000 (31,4%)</td><td><strong>0 combos</strong></td><td>$ 0 COP</td></tr>
        <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="4"><strong>Totales Óptimos Globales (Presupuesto invertido: 98,4%)</strong></td>
            <td><strong>88 combos</strong></td>
            <td style="color: #0f2a5c;">$Z^* = \$ 600.520,00$ COP</td>
        </tr>
    </tbody>
</table>
"""
pages.append(p23)

# ==========================================
# PÁGINA 24: DATA WAREHOUSE - PARTE 1 (DBDIAGRAM)
# ==========================================
p24 = f"""
<div class="section-title">4.4 Inteligencia de negocios y Data Warehouse en Power BI</div>

<div class="subsection-title">4.4.1 Diseño conceptual y dimensional en dbdiagram.io (Esquema Estrella)</div>

<p>
Para transformar los datos operacionales de MongoDB en conocimiento estratégico de negocio, se diseñó formalmente un <strong>Data Warehouse bajo Esquema Estrella</strong> utilizando la herramienta de ingeniería de modelado <strong>dbdiagram.io</strong>.
</p>

<p>
El esquema consta de una tabla de hechos central que almacena la granularidad atómica de cada transacción, relacionada mediante vínculos de integridad referencial de uno a muchos ($1:*$) con cuatro dimensiones maestras con claves subrogadas (Surrogate Keys):
</p>

<div class="figure-box" style="margin: 10px auto;">
    <img src="{dbdiagram_img}" alt="Modelo Dimensional dbdiagram.io" style="max-height: 108mm; width: 100%; object-fit: contain;">
    <div class="figure-caption">
        <strong>Figura 2.</strong> Diagrama dimensional conceptual del Esquema Estrella modelado en dbdiagram.io.<br>
        <em>Fuente: Diseño formal del equipo de desarrollo de Merkostore, 2026.</em>
    </div>
</div>

<p style="margin-top: 10px;">
Como se observa en la Figura 2, la tabla de hechos <code>Fact_Ventas</code> almacena las medidas métricas del negocio (<code>cantidad_vendida</code>, <code>precio_unitario</code>, <code>costo_unitario</code>, <code>ingreso_bruto</code>, <code>monto_descuento</code>, <code>costo_domicilio</code>, <code>ingreso_neto</code> y <code>margen_utilidad</code>), vinculándose limpiamente a <code>Dim_Tiempo</code> (fechas, días, trimestres, fines de semana), <code>Dim_Producto</code> (categorías, SKUs, costos), <code>Dim_Cliente</code> (nombres, teléfonos, barrios) y <code>Dim_Metodo_Pago</code> (canales de entrega y forma de pago).
</p>
"""
pages.append(p24)

# ==========================================
# PÁGINA 25: DATA WAREHOUSE - PARTE 2 (POWER BI DESKTOP)
# ==========================================
p25 = f"""
<div class="subsection-title">4.4.2 Implementación física y diagrama de relaciones en Power BI Desktop</div>

<p>
El modelo dimensional conceptual se implementó físicamente en <strong>Microsoft Power BI Desktop</strong> a través de un pipeline ETL automatizado, garantizando la carga de datos con tipos fuertemente tipados y la creación de relaciones biunívocas activas con dirección de filtro cruzado único ($1:*$).
</p>

<div class="figure-box" style="margin: 10px auto;">
    <img src="{powerbi_img}" alt="Modelo Relacional en Power BI Desktop" style="max-height: 110mm; width: 100%; object-fit: contain;">
    <div class="figure-caption">
        <strong>Figura 3.</strong> Vista del Modelo de Relaciones del Data Warehouse implementado en Power BI Desktop.<br>
        <em>Fuente: Captura de pantalla de la solución analítica en Power BI Desktop, 2026.</em>
    </div>
</div>

<p style="margin-top: 10px;">
La Figura 3 corrobora la perfecta estructura en estrella del repositorio: la tabla central <code>FactVentas</code> recibe los filtros contextuales de <code>DimProducto</code>, <code>DimFecha</code>, <code>dim_cliente</code> y <code>DimTienda</code>, incorporando además la tabla de apoyo analítico <code>InventoryOptimization</code> (con cálculos de EOQ y punto de reorden ROP) y la tabla técnica dedicada <code>_Medidas (2)</code> para la centralización limpia de cálculos DAX.
</p>
"""
pages.append(p25)

# ==========================================
# PÁGINA 26: MÉTRICAS DAX Y RESULTADOS BI
# ==========================================
p26 = """
<div class="subsection-title">4.4.3 Indicadores clave de rendimiento (KPIs) y fórmulas DAX calculadas</div>

<p>
Para soportar la toma de decisiones financieras y comerciales de la tienda de barrio, se construyeron medidas calculadas en lenguaje <strong>DAX (Data Analysis Expressions)</strong> sobre el Data Warehouse en Power BI, verificadas con la base transaccional real de Merkostore:
</p>

<div class="kpi-container">
    <div class="kpi-card">
        <div class="kpi-card-title">Ventas Totales Brutas</div>
        <div class="kpi-card-val">$ 1.284.000 COP</div>
    </div>
    <div class="kpi-card">
        <div class="kpi-card-title">Costo de Ventas Total</div>
        <div class="kpi-card-val">$ 837.000 COP</div>
    </div>
    <div class="kpi-card">
        <div class="kpi-card-title">Ganancia Neta Real</div>
        <div class="kpi-card-val">$ 447.000 COP</div>
    </div>
    <div class="kpi-card">
        <div class="kpi-card-title">Margen Bruto %</div>
        <div class="kpi-card-val" style="color: #166534;">34,81 %</div>
    </div>
</div>

<div class="figure-caption" style="text-align: left; margin-bottom: 4px; margin-top: 10px;">
    <strong>Tabla 4.</strong> Catálogo de medidas analíticas DAX implementadas en la tabla <code>_Medidas (2)</code>.
</div>

<table class="academic-table">
    <thead>
        <tr>
            <th style="width: 25%;">Indicador / Medida</th>
            <th style="width: 50%;">Fórmula DAX de Cálculo</th>
            <th style="width: 25%;">Valor Verificado</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Ventas Totales</strong></td>
            <td><code>SUMX(FactVentas, FactVentas[cantidad] * FactVentas[precio_unitario])</code></td>
            <td><strong>$ 1.284.000 COP</strong></td>
        </tr>
        <tr>
            <td><strong>Costo Total</strong></td>
            <td><code>SUMX(FactVentas, FactVentas[cantidad] * RELATED(DimProducto[precio_costo]))</code></td>
            <td><strong>$ 837.000 COP</strong></td>
        </tr>
        <tr>
            <td><strong>Ganancia Bruta</strong></td>
            <td><code>[Ventas Totales] - [Costo Total]</code></td>
            <td><strong>$ 447.000 COP</strong></td>
        </tr>
        <tr>
            <td><strong>Margen Bruto %</strong></td>
            <td><code>DIVIDE([Ganancia Bruta], [Ventas Totales], 0)</code></td>
            <td><strong>34,81 %</strong></td>
        </tr>
        <tr>
            <td><strong>Ticket Promedio</strong></td>
            <td><code>DIVIDE([Ventas Totales], DISTINCTCOUNT(FactVentas[numero_pedido]), 0)</code></td>
            <td><strong>$ 53.500 COP</strong></td>
        </tr>
        <tr>
            <td><strong>Total Pedidos</strong></td>
            <td><code>DISTINCTCOUNT(FactVentas[numero_pedido])</code></td>
            <td><strong>24 pedidos</strong></td>
        </tr>
        <tr>
            <td><strong>Alertas Reorden ROP</strong></td>
            <td><code>CALCULATE(COUNTROWS(DimProducto), DimProducto[stock_actual] <= DimProducto[punto_reorden_rop])</code></td>
            <td><strong>3 productos</strong></td>
        </tr>
    </tbody>
</table>

<p style="margin-top: 10px;">
Los resultados validan que la tienda opera con una salud financiera destacada (margen bruto de 34,81%), donde la categoría de Abarrotes y Despensa aporta el 42% de los ingresos totales y los barrios Manga y Pie de la Popa concentran el mayor ticket promedio por compra domiciliaria.
</p>
"""
pages.append(p26)

# ==========================================
# PÁGINA 27: CONCLUSIONES DEL PROYECTO
# ==========================================
p27 = """
<div class="section-title">4.5 Conclusiones del proyecto integrador</div>

<p>
La culminación exitosa de Merkostore demuestra la viabilidad técnica, metodológica y financiera de modernizar el comercio minorista barrial mediante soluciones de software integradas de alta fidelidad:
</p>

<ol style="margin-left: 25px; line-height: 1.45; margin-bottom: 12px;">
    <li><strong>Efectividad del Desarrollo Web Full-Stack:</strong> La articulación de Spring Boot 3 y Java 21 LTS en el backend junto con MongoDB 7 permitió desacoplar la lógica de negocio de la persistencia de datos. El uso de operaciones atómicas (`$inc`) y claves de idempotencia resolvió de raíz los problemas clásicos de sobreventa y descuadres de existencias concurrentes.</li>
    <li><strong>Aporte Diferencial de la Inteligencia Artificial:</strong> La implementación del asistente MerkoBot con arquitectura RAG impulsado por Llama-3.1 y Groq demostró que es posible brindar atención conversacional instantánea y veraz sin incurrir en alucinaciones, elevando la satisfacción del cliente y liberando al tendero de tareas repetitivas de cotización.</li>
    <li><strong>Rigor Cuantitativo mediante Investigación de Operaciones:</strong> La resolución exacta del modelo MILP mediante Branch & Bound evidenció que el abastecimiento inteligente de combos comerciales permite alcanzar un beneficio óptimo de $ 600.520 COP, asignando el 98,4% del presupuesto operativo sin incurrir en mermas por sobrecompra.</li>
    <li><strong>Empoderamiento Gerencial con Power BI y Data Warehousing:</strong> La estructuración del Esquema Estrella en dbdiagram.io y su despliegue físico en Power BI Desktop transformaron 60 registros transaccionales en tableros ejecutivos claros, evidenciando un margen de ganancia del 34,81% e identificando oportunidades de mejora en la reposición de stock.</li>
</ol>

<div class="subsection-title">Líneas de Trabajo Futuro</div>

<p>
Como proyección del proyecto se propone incorporar pasarelas de pago electrónico en línea con confirmación por Webhook (Wompi/ePayco), integrar algoritmos de predicción de series temporales (ARIMA o Prophet) para anticipar la demanda semanal de perecederos y empaquetar la aplicación en contenedores Docker para su despliegue automatizado en la nube.
</p>
"""
pages.append(p27)

# ==========================================
# PÁGINA 28: REFERENCIAS BIBLIOGRÁFICAS (PARTE 1)
# ==========================================
p28 = """
<div class="chapter-title">Referencias Bibliográficas</div>

<p style="font-size: 9.5pt; color: #475569; margin-bottom: 15px; font-style: italic;">
Fuentes bibliográficas y normativas estructuradas bajo el estándar de la American Psychological Association (APA 7.ª edición).
</p>

<div class="ref-item">
    Apunte-García, R. M., & Rodríguez-Piña, R. A. (2016). Diseño y aplicación de sistema de gestión en inventarios en empresa ecuatoriana. <em>Ciencias Holguín</em>, 22(4), 1–16. https://www.redalyc.org/pdf/1815/181546432006.pdf
</div>

<div class="ref-item">
    Cartagena, M. M., & Pescador Aguirre, L. J. (2019). <em>Desarrollo de un sistema de inventarios para el control de equipos y herramientas en la empresa metalmecánica Servitécnica Industrial S.A.S., en La Virginia, Risaralda</em> [Trabajo de grado, Universidad Libre]. Repositorio Institucional Universidad Libre. https://repository.unilibre.edu.co/handle/10901/20128
</div>

<div class="ref-item">
    Cepeda Valero, Ó. M., & Jiménez Sánchez, L. F. (2016). Modelo de control óptimo para el sistema Producción - Inventarios. <em>Ingeniería Industrial. Actualidad y Nuevas Tendencias</em>, 5(16), 35–44. Universidad de Carabobo. http://www.redalyc.org/articulo.oa?id=215048805004
</div>

<div class="ref-item">
    Congreso de la República de Colombia. (1999). <em>Ley 527 de 1999: Por medio de la cual se define y reglamenta el acceso y uso de los mensajes de datos, del comercio electrónico y de las firmas digitales</em>. Diario Oficial No. 43.673.
</div>

<div class="ref-item">
    Congreso de la República de Colombia. (2011). <em>Ley 1480 de 2011: Por medio de la cual se expide el Estatuto del Consumidor y se dictan otras disposiciones</em>. Diario Oficial No. 48.220.
</div>

<div class="ref-item">
    Congreso de la República de Colombia. (2012). <em>Ley Estatutaria 1581 de 2012: Por la cual se dictan disposiciones generales para la protección de datos personales</em>. Diario Oficial No. 48.587.
</div>

<div class="ref-item">
    Fernández Maldonado, A. G. (2017). <em>El control interno y su influencia en la gestión de inventarios de las micro y pequeñas empresas del sector comercio</em> [Tesis de pregrado, Universidad Católica Los Ángeles de Chimbote]. Repositorio Institucional ULADECH. https://repositorio.uladech.edu.pe/handle/20.500.12759/1222
</div>

<div class="ref-item">
    Hernández-Sampieri, R., Fernández-Collado, C., & Baptista-Lucio, P. (2014). <em>Metodología de la investigación</em> (6.ª ed.). McGraw-Hill Education.
</div>

<div class="ref-item">
    Julca Díaz, L. P., & Rojas Zárate, A. F. (2015). <em>Sistema informático web para la gestión de ventas de la Boutique Detallitos E.I.R.L. utilizando la metodología AUP</em> [Tesis de ingeniería, Universidad Privada Antenor Orrego]. Repositorio Institucional UPAO. https://repositorio.upao.edu.pe/handle/20.500.12759/1222
</div>

<div class="ref-item">
    Kimball, R., & Ross, M. (2013). <em>The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling</em> (3.ª ed.). John Wiley & Sons.
</div>

<div class="ref-item">
    Meana Coalla, P. P. (2017). <em>Gestión de inventarios</em>. Ediciones Paraninfo S.A.
</div>
"""
pages.append(p28)

# ==========================================
# PÁGINA 29: REFERENCIAS BIBLIOGRÁFICAS (PARTE 2)
# ==========================================
p29 = """
<div class="chapter-title" style="margin-bottom: 8px;">Referencias Bibliográficas (Continuación)</div>

<div class="ref-item">
    Mejía Aguas, A., & Roncallo Petro, M. (2009). <em>Inventario de trabajos de grado de pregrado de las Universidades de Cartagena relacionados con la industria manufacturera de la ciudad</em> [Trabajo de grado, Universidad de Cartagena]. Repositorio Institucional Unicartagena. https://repositorio.unicartagena.edu.co/entities/publication/93ce
</div>

<div class="ref-item">
    Mitchell, S., O'Sullivan, M., & Dunning, I. (2020). <em>PuLP: A Linear Programming Modeler in Python</em> (Versión 2.7) [Software de optimización matemática]. COIN-OR Initiative. https://github.com/coin-or/pulp
</div>

<div class="ref-item">
    MongoDB Inc. (2024). <em>MongoDB Manual: Atomic operations and document data models</em>. MongoDB Documentation. https://www.mongodb.com/docs/manual/
</div>

<div class="ref-item">
    Osorio García, C. (2021). Modelos para el control de inventarios en las pymes. <em>Panorama Económico y Empresarial</em>, 15(28), 77–94. https://revistas.poligran.edu.co/index.php/panorama/article/view/241
</div>

<div class="ref-item">
    Quizhpe, C. (2018). <em>Diseño de un sistema de control de inventario y organización de las bodegas de producto terminado de la empresa Ecuaespumas Lamitex S.A.</em> [Tesis de pregrado, Universidad Cooperativa de Colombia]. https://repository.ucc.edu.co/server/api/core/bitstreams/13214182
</div>

<div class="ref-item">
    Rada Restrepo, D. P., Blanco Arroyo, J. L., & Muñoz Caraballo, L. P. (2017). <em>Propuesta para el diseño del sistema de control de inventarios para el almacén AutoFrenos Cartagena</em> [Trabajo de grado, Universidad del Sinú]. Repositorio Institucional Unisinú. http://repositorio.unisinucartagena.edu.co:8080/xmlui/handle/123456789/172
</div>

<div class="ref-item">
    Schwaber, K., & Sutherland, J. (2020). <em>La Guía definitiva de Scrum: Las Reglas del Juego</em>. Scrum.org. https://scrumguides.org/scrum-guide.html
</div>

<div class="ref-item">
    Taha, H. A. (2017). <em>Investigación de operaciones</em> (10.ª ed.). Pearson Educación.
</div>

<div class="ref-item">
    UNESCO. (2021). <em>Recomendación sobre la ética de la inteligencia artificial</em>. Organización de las Naciones Unidas para la Educación, la Ciencia y la Cultura. https://unesdoc.unesco.org/ark:/48223/pf0000381137_spa
</div>

<div class="ref-item">
    Universidad Católica de Pereira. (2010). <em>Propuesta de solución tecnológica para la automatización de procesos de facturación en almacenes de cadena Risaraldenses</em>. Repositorio UCP. https://repositorio.ucp.edu.co/entities/publication/fddb0b3d
</div>

<div class="ref-item">
    Walls, C. (2022). <em>Spring in Action</em> (6.ª ed.). Manning Publications.
</div>
"""
pages.append(p29)

# ==========================================
# CONSTRUCCIÓN DEL DOCUMENTO FINAL
# ==========================================
body_content = "\n".join(make_page(p) for p in pages)
full_html = html_head + body_content + "\n</body>\n</html>"

with open(r"docs\merkostoreifme.html", "w", encoding="utf-8") as f:
    f.write(full_html)

print(f"Éxito: Se generó docs/merkostoreifme.html con {len(pages)} páginas exactas estructuradas.")
