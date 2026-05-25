-- =============================================================
-- V12: SEED DATA — personal, clientes, contabilidad
-- =============================================================

-- =============================================================
-- PERSONAL (usuarios de ejemplo, solo si no existen)
-- =============================================================
INSERT INTO usuarios (id, fecha_creacion, fecha_actualizacion, nombre, username, password_hash, rol, activo)
SELECT
    gen_random_uuid(), now(), now(),
    t.nombre, t.username, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    t.rol, true
FROM (VALUES
    ('Carlos Mamani',    'carlos.mamani',    'MESERO'),
    ('Maria Choque',     'maria.choque',     'MESERO'),
    ('Juan Perez',       'juan.perez',       'COCINA'),
    ('Rosa Flores',      'rosa.flores',      'COCINA'),
    ('Pedro Vargas',     'pedro.vargas',     'CAJERO'),
    ('Lucia Gutierrez',  'lucia.gutierrez',  'GERENTE'),
    ('Diego Rojas',      'diego.rojas',      'INVENTARIO'),
    ('Ana Morales',      'ana.morales',      'CONTADOR')
) AS t(nombre, username, rol)
WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.username = t.username);

-- =============================================================
-- CLIENTES (ejemplos)
-- =============================================================
INSERT INTO clientes (id, fecha_creacion, fecha_actualizacion, nombre, nit_ci, telefono, email, direccion, tipo_documento, activo)
SELECT
    gen_random_uuid(), now(), now(),
    t.nombre, t.nit_ci, t.telefono, t.email, t.direccion, t.tipo_documento, true
FROM (VALUES
    ('Empresa ABC SRL',     '123456789', '71234567', 'ventas@abc.com',      'Av. Siempre Viva 123', 'NIT'),
    ('Juan Carlos Diaz',    '9876543',    '69876543', 'juan.diaz@email.com',  'Calle Bolivar 456',    'CI'),
    ('Maria Fernanda Lopez','543210',     '61112233', 'maria.lopez@email.com','Av. 16 de Julio 789',  'CI'),
    ('Restaurante El Sabor','1029384756','72543210', 'info@elsabor.com',     'Zona Central 321',     'NIT'),
    ('Hotel Los Andes',     '5647382910','70223344', 'reservas@hotel.com',   'Calle Comercio 555',   'NIT')
) AS t(nombre, nit_ci, telefono, email, direccion, tipo_documento)
WHERE NOT EXISTS (SELECT 1 FROM clientes c WHERE c.nit_ci = t.nit_ci);

-- =============================================================
-- CUENTAS POR PAGAR (ejemplos)
-- =============================================================
INSERT INTO cuentas_pagar (id, fecha_creacion, fecha_actualizacion, proveedor_id, monto_original, saldo_pendiente, fecha_emision, fecha_vencimiento, estado, descripcion, numero_comprobante)
SELECT
    gen_random_uuid(), now(), now(),
    (SELECT id FROM proveedores ORDER BY fecha_creacion LIMIT 1),
    t.monto, t.saldo, t.emision::date, t.vencimiento::date, t.estado, t.descripcion, t.comprobante
FROM (VALUES
    (1500.00, 1500.00, '2026-05-01', '2026-05-30', 'PENDIENTE', 'Compra de insumos cocina mayo', 'FAC-001'),
    (3200.50, 2000.00, '2026-04-15', '2026-05-15', 'PARCIAL',   'Pedido de bebidas abril',       'FAC-002'),
    (800.00,  0.00,    '2026-04-01', '2026-04-20', 'PAGADO',    'Utensilios cocina',             'FAC-003')
) AS t(monto, saldo, emision, vencimiento, estado, descripcion, comprobante)
WHERE EXISTS (SELECT 1 FROM proveedores)
AND NOT EXISTS (SELECT 1 FROM cuentas_pagar);

-- =============================================================
-- CUENTAS POR COBRAR (ejemplos)
-- =============================================================
INSERT INTO cuentas_cobrar (id, fecha_creacion, fecha_actualizacion, cliente_id, monto_original, saldo_pendiente, fecha_emision, fecha_vencimiento, estado, descripcion)
SELECT
    gen_random_uuid(), now(), now(),
    (SELECT id FROM clientes WHERE nit_ci = '9876543' LIMIT 1),
    t.monto, t.saldo, t.emision::date, t.vencimiento::date, t.estado, t.descripcion
FROM (VALUES
    (1200.00, 1200.00, '2026-05-10', '2026-06-10', 'PENDIENTE', 'Servicio de catering evento corporativo'),
    (450.00,  250.00,  '2026-04-20', '2026-05-20', 'PARCIAL',   'Consumo en restaurante - abril'),
    (2100.00, 0.00,    '2026-04-01', '2026-04-30', 'COBRADO',   'Almuerzos semanales empresa ABC')
) AS t(monto, saldo, emision, vencimiento, estado, descripcion)
WHERE EXISTS (SELECT 1 FROM clientes)
AND NOT EXISTS (SELECT 1 FROM cuentas_cobrar);

-- =============================================================
-- GASTOS CONTABLES (ejemplos)
-- =============================================================
INSERT INTO contabilidad_gastos (id, fecha_creacion, fecha_actualizacion, fecha_gasto, descripcion, categoria_gasto, monto, metodo_pago, observaciones)
SELECT gen_random_uuid(), now(), now(), t.fecha::date, t.descripcion, t.categoria, t.monto, t.metodo, t.obs
FROM (VALUES
    ('2026-05-15', 'Pago de luz mayo',       'SERVICIOS',   850.00,  'TRANSFERENCIA', 'Factura mayo'),
    ('2026-05-10', 'Alquiler local mayo',     'ALQUILER',   5000.00, 'TRANSFERENCIA', 'Pago puntual'),
    ('2026-05-12', 'Sueldos quincena 1 mayo', 'SUELDOS',   12000.00, 'TRANSFERENCIA', 'Personal operativo'),
    ('2026-05-08', 'Compra de verduras',       'OPERATIVO',  350.00,  'EFECTIVO',      NULL),
    ('2026-05-05', 'Mantenimiento equipo gas', 'OPERATIVO',  240.00,  'EFECTIVO',      'Reparacion cocina')
) AS t(fecha, descripcion, categoria, monto, metodo, obs)
WHERE NOT EXISTS (SELECT 1 FROM contabilidad_gastos);

-- =============================================================
-- INGRESOS CONTABLES (ejemplos)
-- =============================================================
INSERT INTO contabilidad_ingresos (id, fecha_creacion, fecha_actualizacion, fecha_ingreso, descripcion, categoria_ingreso, monto, metodo_pago, observaciones)
SELECT gen_random_uuid(), now(), now(), t.fecha::date, t.descripcion, t.categoria, t.monto, t.metodo, t.obs
FROM (VALUES
    ('2026-05-14', 'Venta almuerzos dia',   'VENTAS',    4500.00, 'EFECTIVO',      NULL),
    ('2026-05-14', 'Venta cenas',            'VENTAS',    6200.00, 'TARJETA',       NULL),
    ('2026-05-13', 'Servicio catering',      'SERVICIOS', 1800.00, 'TRANSFERENCIA', 'Evento viernes'),
    ('2026-05-12', 'Venta almuerzos dia',   'VENTAS',    3800.00, 'TARJETA',       NULL),
    ('2026-05-11', 'Alquiler espacio terraza','OTROS',     500.00, 'EFECTIVO',      'Evento privado sabado')
) AS t(fecha, descripcion, categoria, monto, metodo, obs)
WHERE NOT EXISTS (SELECT 1 FROM contabilidad_ingresos);
