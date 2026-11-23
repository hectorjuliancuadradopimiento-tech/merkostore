-- ==============================================================================
-- SCRIPT SQL OFICIAL: MERKOSTORE CLOUD DATABASE & DATA WAREHOUSE
-- Proyecto Integrador de Aula - Visualización de Datos II
-- Compatible con: PostgreSQL (Supabase / Neon / Aiven / RDS) y Azure SQL / MySQL
-- ==============================================================================

-- 1. ELIMINACIÓN DE TABLAS PREVIAS (ORDEN DE INTEGRIDAD REFERENCIAL)
DROP TABLE IF EXISTS Fact_Ventas CASCADE;
DROP TABLE IF EXISTS Dim_Producto CASCADE;
DROP TABLE IF EXISTS Dim_Cliente CASCADE;
DROP TABLE IF EXISTS Dim_Tiempo CASCADE;
DROP TABLE IF EXISTS Dim_Metodo_Pago CASCADE;

-- 2. CREACIÓN DE TABLAS DIMENSIONALES (ESQUEMA ESTRELLA)

-- 2.1 Dimensión Tiempo
CREATE TABLE Dim_Tiempo (
    id_tiempo INT PRIMARY KEY,
    fecha DATE NOT NULL,
    dia INT NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    mes INT NOT NULL,
    nombre_mes VARCHAR(20) NOT NULL,
    trimestre INT NOT NULL,
    anio INT NOT NULL,
    es_fin_semana BOOLEAN NOT NULL
);

-- 2.2 Dimensión Producto
CREATE TABLE Dim_Producto (
    id_producto VARCHAR(20) PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    tipo_producto VARCHAR(20) NOT NULL, -- 'DETAL' o 'MERCADO'
    precio_regular NUMERIC(12,2) NOT NULL,
    costo_base NUMERIC(12,2) NOT NULL,
    tiene_descuento BOOLEAN NOT NULL,
    stock_disponible INT NOT NULL
);

-- 2.3 Dimensión Cliente
CREATE TABLE Dim_Cliente (
    id_cliente INT PRIMARY KEY,
    nombre_cliente VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    barrio VARCHAR(50) NOT NULL,
    direccion VARCHAR(120) NOT NULL
);

-- 2.4 Dimensión Método de Pago / Canal
CREATE TABLE Dim_Metodo_Pago (
    id_metodo_pago INT PRIMARY KEY,
    canal_origen VARCHAR(50) NOT NULL, -- 'WhatsApp Web', 'MerkoBot IA', 'Mostrador Tienda', etc.
    metodo_pago VARCHAR(50) NOT NULL,  -- 'Nequi', 'Daviplata', 'Efectivo', 'Bancolombia QR'
    tipo_entrega VARCHAR(50) NOT NULL -- 'Domicilio Moto', 'Recogida Local'
);

-- 3. CREACIÓN DE TABLA DE HECHOS (FACT TABLE)
CREATE TABLE Fact_Ventas (
    id_venta INT PRIMARY KEY,
    id_tiempo INT NOT NULL,
    id_producto VARCHAR(20) NOT NULL,
    id_cliente INT NOT NULL,
    id_metodo_pago INT NOT NULL,
    numero_pedido VARCHAR(20) NOT NULL,
    cantidad_vendida INT NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    costo_unitario NUMERIC(12,2) NOT NULL,
    ingreso_bruto NUMERIC(12,2) NOT NULL,
    monto_descuento NUMERIC(12,2) DEFAULT 0,
    costo_domicilio NUMERIC(12,2) DEFAULT 0,
    ingreso_neto NUMERIC(12,2) NOT NULL,
    margen_utilidad NUMERIC(12,2) NOT NULL,
    CONSTRAINT fk_ventas_tiempo FOREIGN KEY (id_tiempo) REFERENCES Dim_Tiempo(id_tiempo),
    CONSTRAINT fk_ventas_producto FOREIGN KEY (id_producto) REFERENCES Dim_Producto(id_producto),
    CONSTRAINT fk_ventas_cliente FOREIGN KEY (id_cliente) REFERENCES Dim_Cliente(id_cliente),
    CONSTRAINT fk_ventas_metodo FOREIGN KEY (id_metodo_pago) REFERENCES Dim_Metodo_Pago(id_metodo_pago)
);

-- ==============================================================================
-- 4. INSERCIÓN DE DATOS REALES (INSERT INTO)
-- ==============================================================================

-- 4.1 Inserción en Dim_Tiempo
INSERT INTO Dim_Tiempo (id_tiempo, fecha, dia, dia_semana, mes, nombre_mes, trimestre, anio, es_fin_semana) VALUES
(20261101, '2026-11-01', 1, 'Lunes', 11, 'Noviembre', 4, 2026, FALSE),
(20261102, '2026-11-02', 2, 'Martes', 11, 'Noviembre', 4, 2026, FALSE),
(20261103, '2026-11-03', 3, 'Miércoles', 11, 'Noviembre', 4, 2026, FALSE),
(20261104, '2026-11-04', 4, 'Jueves', 11, 'Noviembre', 4, 2026, FALSE),
(20261105, '2026-11-05', 5, 'Viernes', 11, 'Noviembre', 4, 2026, FALSE),
(20261106, '2026-11-06', 6, 'Sábado', 11, 'Noviembre', 4, 2026, TRUE),
(20261107, '2026-11-07', 7, 'Domingo', 11, 'Noviembre', 4, 2026, TRUE),
(20261108, '2026-11-08', 8, 'Lunes', 11, 'Noviembre', 4, 2026, FALSE),
(20261109, '2026-11-09', 9, 'Martes', 11, 'Noviembre', 4, 2026, FALSE),
(20261110, '2026-11-10', 10, 'Miércoles', 11, 'Noviembre', 4, 2026, FALSE),
(20261111, '2026-11-11', 11, 'Jueves', 11, 'Noviembre', 4, 2026, FALSE),
(20261112, '2026-11-12', 12, 'Viernes', 11, 'Noviembre', 4, 2026, FALSE),
(20261113, '2026-11-13', 13, 'Sábado', 11, 'Noviembre', 4, 2026, TRUE),
(20261114, '2026-11-14', 14, 'Domingo', 11, 'Noviembre', 4, 2026, TRUE),
(20261115, '2026-11-15', 15, 'Lunes', 11, 'Noviembre', 4, 2026, FALSE),
(20261116, '2026-11-16', 16, 'Martes', 11, 'Noviembre', 4, 2026, FALSE),
(20261117, '2026-11-17', 17, 'Miércoles', 11, 'Noviembre', 4, 2026, FALSE),
(20261118, '2026-11-18', 18, 'Jueves', 11, 'Noviembre', 4, 2026, FALSE),
(20261119, '2026-11-19', 19, 'Viernes', 11, 'Noviembre', 4, 2026, FALSE),
(20261120, '2026-11-20', 20, 'Sábado', 11, 'Noviembre', 4, 2026, TRUE);

-- 4.2 Inserción en Dim_Producto
INSERT INTO Dim_Producto (id_producto, nombre_producto, categoria, tipo_producto, precio_regular, costo_base, tiene_descuento, stock_disponible) VALUES
('PRD-001', 'Huevos Kikes AA x30', 'Lácteos y Huevos', 'DETAL', 24500, 14700, FALSE, 35),
('PRD-002', 'Café Sello Rojo 425g', 'Abarrotes y Despensa', 'DETAL', 21990, 15000, FALSE, 20),
('PRD-003', 'Harina Pan 1Kg', 'Abarrotes y Despensa', 'DETAL', 4800, 3200, FALSE, 50),
('PRD-004', 'Aceite Medalla de Oro 3Lt', 'Abarrotes y Despensa', 'DETAL', 19490, 13500, FALSE, 14),
('PRD-005', 'Azúcar Blanca 2.5Kg', 'Abarrotes y Despensa', 'DETAL', 9900, 6800, FALSE, 28),
('PRD-006', 'Arroz Diana 1Kg', 'Abarrotes y Despensa', 'DETAL', 4500, 3100, FALSE, 45),
('PRD-007', 'Leche Colanta Entera 900ml', 'Lácteos y Huevos', 'DETAL', 4200, 2900, FALSE, 30),
('PRD-008', 'Pan Bimbo Artesano 500g', 'Panadería', 'DETAL', 8500, 6000, FALSE, 18),
('PRD-009', 'Jabón Rey Barra 300g', 'Cuidado del Hogar', 'DETAL', 3200, 2100, FALSE, 40),
('CMB-001', 'Mercado Familiar Esencial', 'Combos Mercados', 'MERCADO', 44900, 31800, TRUE, 10),
('CMB-002', 'Mercado Desayuno Completo', 'Combos Mercados', 'MERCADO', 34500, 25200, TRUE, 8),
('CMB-003', 'Combo Aseo y Hogar', 'Combos Mercados', 'MERCADO', 28000, 18500, TRUE, 6);

-- 4.3 Inserción en Dim_Cliente (Cartagena de Indias)
INSERT INTO Dim_Cliente (id_cliente, nombre_cliente, telefono, barrio, direccion) VALUES
(1, 'María Camila Gómez', '3004567890', 'El Recreo', 'Mz 14 Lote 8'),
(2, 'Carlos Andrés Pérez', '3119876543', 'La Castellana', 'Calle 30 # 24-12'),
(3, 'Rosa Elena Martínez', '3201122334', 'Ceballos', 'Sector El Bosque # 10-05'),
(4, 'Jorge Luis Herrera', '3158877665', 'Blas de Lezo', 'Manzana B Casa 12'),
(5, 'Diana Patricia Polo', '3045566778', 'San Fernando', 'Cra 82 # 15-40'),
(6, 'Andrés Felipe Ruiz', '3123344556', 'Santa Lucía', 'Diag 32 # 55-20'),
(7, 'Consuelo Del Carmen', '3189900112', 'Torices', 'Calle de la Cruz # 42-18'),
(8, 'Manuel Salvador Díaz', '3012233445', 'Manga', 'Calle Real # 22-09');

-- 4.4 Inserción en Dim_Metodo_Pago
INSERT INTO Dim_Metodo_Pago (id_metodo_pago, canal_origen, metodo_pago, tipo_entrega) VALUES
(1, 'WhatsApp Web', 'Nequi', 'Domicilio Moto'),
(2, 'MerkoBot IA', 'Daviplata', 'Domicilio Moto'),
(3, 'Mostrador Tienda', 'Efectivo', 'Recogida Local'),
(4, 'WhatsApp Web', 'Bancolombia QR', 'Domicilio Moto'),
(5, 'Tienda Online', 'Contraentrega Efectivo', 'Domicilio Moto');

-- 4.5 Inserción en Fact_Ventas
INSERT INTO Fact_Ventas (id_venta, id_tiempo, id_producto, id_cliente, id_metodo_pago, numero_pedido, cantidad_vendida, precio_unitario, costo_unitario, ingreso_bruto, monto_descuento, costo_domicilio, ingreso_neto, margen_utilidad) VALUES
(1,  20261103, 'CMB-001', 1, 1, 'PED-001', 2, 44900, 31800, 89800, 0, 3000, 89800, 26200),
(2,  20261104, 'CMB-002', 2, 2, 'PED-002', 1, 34500, 25200, 34500, 0, 3000, 34500, 9300),
(3,  20261105, 'PRD-001', 3, 3, 'PED-003', 1, 24500, 14700, 24500, 0, 0,    24500, 9800),
(4,  20261105, 'PRD-002', 3, 3, 'PED-003', 1, 21990, 15000, 21990, 0, 0,    21990, 6990),
(5,  20261106, 'PRD-004', 4, 1, 'PED-004', 1, 19490, 13500, 19490, 0, 3000, 19490, 5990),
(6,  20261107, 'CMB-001', 5, 2, 'PED-005', 1, 44900, 31800, 44900, 0, 3000, 44900, 13100),
(7,  20261108, 'CMB-003', 6, 1, 'PED-006', 1, 28000, 18500, 28000, 0, 3000, 28000, 9500),
(8,  20261109, 'PRD-001', 7, 3, 'PED-007', 2, 24500, 14700, 49000, 0, 0,    49000, 19600),
(9,  20261110, 'CMB-001', 1, 2, 'PED-008', 2, 44900, 31800, 89800, 0, 3000, 89800, 26200),
(10, 20261111, 'CMB-002', 4, 1, 'PED-009', 2, 34500, 25200, 69000, 0, 3000, 69000, 18600),
(11, 20261112, 'PRD-002', 2, 3, 'PED-010', 2, 21990, 15000, 43980, 0, 0,    43980, 13980),
(12, 20261113, 'PRD-003', 3, 3, 'PED-011', 4, 4800,  3200,  19200, 0, 0,    19200, 6400),
(13, 20261114, 'CMB-001', 8, 1, 'PED-012', 1, 44900, 31800, 44900, 0, 3000, 44900, 13100),
(14, 20261114, 'PRD-001', 8, 1, 'PED-012', 1, 24500, 14700, 24500, 0, 3000, 24500, 9800),
(15, 20261115, 'PRD-006', 5, 3, 'PED-013', 3, 4500,  3100,  13500, 0, 0,    13500, 4200),
(16, 20261115, 'PRD-007', 5, 3, 'PED-013', 4, 4200,  2900,  16800, 0, 0,    16800, 5200),
(17, 20261116, 'CMB-001', 2, 2, 'PED-014', 2, 44900, 31800, 89800, 0, 3000, 89800, 26200),
(18, 20261117, 'CMB-002', 3, 1, 'PED-015', 1, 34500, 25200, 34500, 0, 3000, 34500, 9300),
(19, 20261117, 'PRD-008', 3, 1, 'PED-015', 2, 8500,  6000,  17000, 0, 3000, 17000, 5000),
(20, 20261118, 'CMB-003', 4, 2, 'PED-016', 2, 28000, 18500, 56000, 0, 3000, 56000, 19000),
(21, 20261118, 'PRD-001', 6, 1, 'PED-017', 2, 24500, 14700, 49000, 0, 3000, 49000, 19600),
(22, 20261119, 'PRD-004', 7, 3, 'PED-018', 2, 19490, 13500, 38980, 0, 0,    38980, 11980),
(23, 20261119, 'PRD-009', 7, 3, 'PED-018', 5, 3200,  2100,  16000, 0, 0,    16000, 5500),
(24, 20261120, 'CMB-001', 1, 4, 'PED-019', 2, 44900, 31800, 89800, 0, 3000, 89800, 26200),
(25, 20261120, 'CMB-002', 2, 5, 'PED-020', 1, 34500, 25200, 34500, 0, 3000, 34500, 9300);

-- ==============================================================================
-- 5. VERIFICACIÓN DE TOTALES
-- ==============================================================================
SELECT 
    COUNT(*) AS total_transacciones,
    SUM(cantidad_vendida) AS total_unidades,
    SUM(ingreso_neto) AS total_ventas_cop,
    SUM(costo_unitario * cantidad_vendida) AS costo_total_cop,
    SUM(margen_utilidad) AS ganancia_neta_cop,
    ROUND((SUM(margen_utilidad) / SUM(ingreso_neto)) * 100, 2) AS margen_bruto_pct
FROM Fact_Ventas;
