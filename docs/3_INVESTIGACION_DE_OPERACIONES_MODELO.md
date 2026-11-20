# 📐 ENTREGABLE DE INVESTIGACIÓN DE OPERACIONES
## MODELO MATEMÁTICO DE OPTIMIZACIÓN DE ASIGNACIÓN DE INVENTARIO Y MEZCLA DE VENTAS
### CASO DE ESTUDIO: MERKOSTORE (PROYECTO DE AULA INTERDISCIPLINARIO)
**Programa:** Ingeniería de Sistemas - VII Semestre  
**Institución:** Corporación Universitaria Rafael Núñez / Plataforma FERRUM  
**Año Lectivo:** 2026  

---

## 1. DEFINICIÓN DEL PROBLEMA

En el comercio minorista tradicional y tiendas de barrio como **Merkostore**, el tendero enfrenta diariamente un dilema de asignación de recursos escasos: **¿Conviene vender los productos básicos al detal individualmente o ensamblarlos en "Mercados Combos" familiares con descuento atractivo?**

- Si se empaquetan demasiados combos, se agotan insumos clave (e.g. aceite, huevos, harina) y se pierden ventas al detal de clientes que solo necesitan un artículo específico con mayor margen porcentual individual.
- Si no se arman suficientes combos, disminuye el ticket promedio de compra, se reduce la rotación del inventario general y los hogares prefieren comprar en cadenas de descuento duro (D1, Ara).
- Además, el armado de combos consume tiempo de mano de obra limitada en la tienda (tiempo de selección, empaque y sellado).

**Objetivo de Optimización**: Determinar el plan óptimo diario de ensamblaje de combos y venta al detal que **maximice la utilidad neta total** de Merkostore, respetando las restricciones de inventario físico disponible en bodega, la capacidad operativa de armado (horas-hombre) y los compromisos de demanda mínima del mercado.

---

## 2. FORMULACIÓN DEL MODELO MATEMÁTICO (PLE)

El problema se formula formalmente como un **Modelo de Programación Lineal Entera (PLE)**.

### 2.1. Variables de Decisión

Las variables de decisión representan las cantidades enteras no negativas a producir y vender en el horizonte de planificación diario:

- $x_1$: Cantidad de combos **"Mercado Familiar Esencial"** a ensamblar y vender ($x_1 \in \mathbb{Z}_{\ge 0}$).
- $x_2$: Cantidad de combos **"Mercado Desayuno Completo"** a ensamblar y vender ($x_2 \in \mathbb{Z}_{\ge 0}$).
- $y_1$: Cantidad de unidades de **Huevos Kikes AA x30** a vender al detal ($y_1 \in \mathbb{Z}_{\ge 0}$).
- $y_2$: Cantidad de unidades de **Café Sello Rojo 425g** a vender al detal ($y_2 \in \mathbb{Z}_{\ge 0}$).
- $y_3$: Cantidad de unidades de **Harina Pan 1Kg** a vender al detal ($y_3 \in \mathbb{Z}_{\ge 0}$).
- $y_4$: Cantidad de unidades de **Aceite Medalla de Oro 3Lt** a vender al detal ($y_4 \in \mathbb{Z}_{\ge 0}$).
- $y_5$: Cantidad de unidades de **Azúcar Blanca 2.5Kg** a vender al detal ($y_5 \in \mathbb{Z}_{\ge 0}$).

### 2.2. Parámetros Económicos y Márgenes de Contribución Unitarios

| Producto / Combo | Precio Venta (COP) | Costo Adquisición (COP) | Margen Unitario $c_j$ (COP) |
| :--- | :---: | :---: | :---: |
| **Combo Mercado Familiar ($x_1$)** | $ 44.900 | $ 31.800 | **$ 13.100** |
| **Combo Mercado Desayuno ($x_2$)** | $ 34.500 | $ 25.200 | **$ 9.300** |
| **Huevos AA x30 Detal ($y_1$)** | $ 24.500 | $ 14.700 | **$ 9.800** |
| **Café Sello Rojo 425g Detal ($y_2$)** | $ 21.990 | $ 15.000 | **$ 6.990** |
| **Harina Pan 1Kg Detal ($y_3$)** | $ 4.800 | $ 3.200 | **$ 1.600** |
| **Aceite Mezcla 3Lt Detal ($y_4$)** | $ 19.490 | $ 13.500 | **$ 5.990** |
| **Azúcar Blanca 2.5Kg Detal ($y_5$)** | $ 9.900 | $ 6.800 | **$ 3.100** |

### 2.3. Función Objetivo

Maximizar la Utilidad Neta Total Diaria ($Z$):

$$\max Z = 13100\,x_1 + 9300\,x_2 + 9800\,y_1 + 6990\,y_2 + 1600\,y_3 + 5990\,y_4 + 3100\,y_5$$

### 2.4. Restricciones del Sistema

#### a) Restricciones de Inventario Disponible en Bodega (Balance de Masa de Insumos):
1. **Huevos Kikes x30** (Cada $x_1$ usa 1, cada $x_2$ usa 1, detal usa 1; Stock = 35):
   $$1\,x_1 + 1\,x_2 + y_1 \le 35$$

2. **Café Sello Rojo 425g** (Cada $x_1$ usa 1, cada $x_2$ usa 2, detal usa 1; Stock = 20):
   $$1\,x_1 + 2\,x_2 + y_2 \le 20$$

3. **Harina Pan 1Kg** (Cada $x_1$ usa 2, cada $x_2$ usa 2, detal usa 1; Stock = 50):
   $$2\,x_1 + 2\,x_2 + y_3 \le 50$$

4. **Aceite Medalla de Oro 3Lt** (Cada $x_1$ usa 1, detal usa 1; Stock = 14):
   $$1\,x_1 + y_4 \le 14$$

5. **Azúcar Blanca 2.5Kg** (Cada $x_1$ usa 1, detal usa 1; Stock = 28):
   $$1\,x_1 + y_5 \le 28$$

#### b) Restricción de Capacidad de Empaque y Mano de Obra:
La tienda asigna 1 operario durante la jornada matutina (8 horas = 480 minutos) para armar y embalar pedidos. El combo familiar requiere 12 minutos de empaque y el combo desayuno 8 minutos:
$$12\,x_1 + 8\,x_2 \le 480$$

#### c) Restricciones de Demanda Mínima del Mercado (Compromisos y Políticas Comerciales):
- Demanda mínima de combos familiares: $x_1 \ge 5$
- Demanda mínima de combos desayuno: $x_2 \ge 3$
- Demanda mínima garantizada para clientes al detal:
  $$y_1 \ge 5, \quad y_2 \ge 2, \quad y_4 \ge 2$$

#### d) Restricciones de No Negatividad e Integralidad:
$$x_1, x_2, y_1, y_2, y_3, y_4, y_5 \in \mathbb{Z}_{\ge 0}$$

---

## 3. IMPLEMENTACIÓN COMPUTACIONAL

El modelo fue implementado y resuelto computacionalmente en dos entornos técnicos:

### 3.1. Código en Python (`docs/optimizacion_combos_merkostore.py`)
Utilizando el solucionador de Programación Lineal Entera Mixta (MILP) de alto rendimiento basado en Branch & Bound y Simplex Dual de `scipy.optimize.milp`:

```python
import numpy as np
from scipy.optimize import milp, LinearConstraint, Bounds

# Vector de coeficientes de costos invertidos para maximización
c = -np.array([13100, 9300, 9800, 6990, 1600, 5990, 3100])

# Matriz tecnológica A
A = np.array([
    [1, 1, 1, 0, 0, 0, 0],  # Huevos <= 35
    [1, 2, 0, 1, 0, 0, 0],  # Café <= 20
    [2, 2, 0, 0, 1, 0, 0],  # Harina Pan <= 50
    [1, 0, 0, 0, 0, 1, 0],  # Aceite <= 14
    [1, 0, 0, 0, 0, 0, 1],  # Azúcar <= 28
    [12, 8, 0, 0, 0, 0, 0], # Tiempo de armado <= 480 min
])

b_u = np.array([35, 20, 50, 14, 28, 480])
b_l = -np.inf * np.ones_like(b_u)
constraints = LinearConstraint(A, b_l, b_u)

# Demandas mínimas (Bounds)
lb = np.array([5, 3, 5, 2, 0, 2, 0])
ub = np.array([np.inf] * 7)
bounds = Bounds(lb, ub)

# Integralidad (todas enteras)
integrality = np.ones(7)

res = milp(c=c, constraints=constraints, bounds=bounds, integrality=integrality)
```

### 3.2. Configuración en Microsoft Excel Solver
- **Celda Objetivo**: Celda de suma producto `SUMAPRODUCTO(C7:I7; C8:I8)` configurada en opción **Maximizar**.
- **Celdas de Variables**: Rango `C8:I8`.
- **Restricciones Agregadas en Solver**:
  - `C8:I8 = entero` (Restricción int).
  - `C8 >= 5`, `D8 >= 3`, `E8 >= 5`, `F8 >= 2`, `H8 >= 2`.
  - `Total_Insumos_Usados <= Stock_Bodega`.
  - `Tiempo_Empaque <= 480`.
- **Método de Resolución**: `Simplex LP`.

---

## 4. RESULTADOS Y ANÁLISIS DE LA SOLUCIÓN

### 4.1. Solución Óptima Obtenida

| Variable | Descripción | Valor Óptimo | Unidades |
| :---: | :--- | :---: | :---: |
| $x_1^*$ | Combos Mercado Familiar Esencial | **5** | Combos |
| $x_2^*$ | Combos Mercado Desayuno Completo | **3** | Combos |
| $y_1^*$ | Huevos Kikes AA x30 al Detal | **27** | Bandejas |
| $y_2^*$ | Café Sello Rojo 425g al Detal | **9** | Bolsas |
| $y_3^*$ | Harina Pan 1Kg al Detal | **34** | Bolsas |
| $y_4^*$ | Aceite Medalla de Oro 3Lt al Detal | **9** | Botellas |
| $y_5^*$ | Azúcar Blanca 2.5Kg al Detal | **23** | Bolsas |

$$\mathbf{Z^* = \$ \, 600.520,00 \text{ COP diarios de Utilidad Neta}}$$

### 4.2. Análisis de Holguras y Cuellos de Botella (Sensibilidad)

| Recurso / Insumo | Capacidad / Stock | Cantidad Usada | Holgura (Slack) | Estado del Recurso |
| :--- | :---: | :---: | :---: | :--- |
| **Huevos AA x30** | 35 bandejas | 35 | 0 | **Cuello de Botella (Agotado al 100%)** |
| **Café 425g** | 20 bolsas | 20 | 0 | **Cuello de Botella (Agotado al 100%)** |
| **Harina Pan 1Kg** | 50 bolsas | 50 | 0 | **Cuello de Botella (Agotado al 100%)** |
| **Aceite 3Lt** | 14 botellas | 14 | 0 | **Cuello de Botella (Agotado al 100%)** |
| **Azúcar 2.5Kg** | 28 bolsas | 28 | 0 | **Cuello de Botella (Agotado al 100%)** |
| **Tiempo de Armado** | 480 minutos | 84 min | **396 min** | **Recurso Abundante (Holgura del 82.5%)** |

### 4.3. Interpretación Económica y Gerencial
1. **Priorización de la Venta al Detal sobre el Exceso de Combos**:  
   El modelo matemático demostró que, aunque los combos generan un volumen de facturación alto, el margen porcentual unitario de vender insumos escasos como el Café ($6.990) y los Huevos ($9.800) de manera individual supera la ganancia marginal del combo promocional con descuento. Por tanto, el modelo cumple con la demanda esperada de combos ($x_1=5, x_2=3$) y destina todo el inventario restante a la venta al detal.
2. **Capacidad Ociosa de Empaque**:  
   El personal solo utiliza 84 minutos de los 480 minutos disponibles para empacar. Esto indica que la mano de obra no es la restricción activa; el crecimiento de la rentabilidad depende exclusivamente de negociar mayor volumen de compra con los proveedores mayoristas de granos y abarrotes.

---

## 5. INTEGRACIÓN DEL MODELO CON LA APLICACIÓN WEB

En la plataforma web Merkostore, el modelo matemático está integrado de manera activa:
1. **Cálculo Dinámico de Disponibilidad (`recalculateMercadoStocks`)**:  
   En `app.js`, la función `recalculateMercadoStocks()` implementa la lógica de las restricciones de inventario del modelo:
   ```javascript
   function recalculateMercadoStocks() {
       state.products.filter(p => p.type === 'MERCADO').forEach(mercado => {
           if (!mercado.bundleItems || mercado.bundleItems.length === 0) return;
           const maxPossible = Math.min(...mercado.bundleItems.map(b => {
               const single = state.products.find(p => p.id === b.productId);
               return single ? Math.floor(single.stock / (b.quantity || 1)) : 0;
           }));
           mercado.stock = maxPossible;
       });
   }
   ```
2. **Verificación Transaccional en Backend (`OrderService.java`)**:  
   Al procesar un pedido de un mercado combo, el servidor descuenta atómicamente cada uno de los insumos que componen el paquete (`bundleItems`), garantizando que las restricciones de balance de inventario no se violen en concurrencia.
