-- =============================================================
-- V10: CONTABILIDAD, CLIENTES, PRODUCTOS MEJORADOS, ROLES
-- =============================================================

-- =============================================================
-- CLIENTES
-- =============================================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    nombre VARCHAR(200) NOT NULL,
    nit_ci VARCHAR(50),
    telefono VARCHAR(50),
    email VARCHAR(200),
    direccion VARCHAR(300),
    tipo_documento VARCHAR(20) DEFAULT 'CI',
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS descuento DECIMAL(14,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS propina DECIMAL(14,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS motivo_anulacion VARCHAR(300);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS notas VARCHAR(500);

-- =============================================================
-- PRODUCTOS MEJORADOS
-- =============================================================
ALTER TABLE productos ADD COLUMN IF NOT EXISTS codigo_interno VARCHAR(50);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS costo DECIMAL(12,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS es_venta BOOLEAN DEFAULT TRUE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS es_insumo BOOLEAN DEFAULT FALSE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS impuesto_aplicable DECIMAL(6,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(20) DEFAULT 'UNIDAD';

CREATE INDEX idx_productos_codigo ON productos(codigo_interno);
CREATE INDEX idx_productos_nombre ON productos(nombre);

-- =============================================================
-- ALMACENES (multi-warehouse)
-- =============================================================
CREATE TABLE almacenes (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE inventario_items ADD COLUMN IF NOT EXISTS almacen_id UUID REFERENCES almacenes(id);

-- =============================================================
-- TRANSFERENCIAS ENTRE ALMACENES
-- =============================================================
CREATE TABLE inventario_transferencias (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    item_inventario_id UUID NOT NULL REFERENCES inventario_items(id),
    almacen_origen_id UUID NOT NULL REFERENCES almacenes(id),
    almacen_destino_id UUID NOT NULL REFERENCES almacenes(id),
    cantidad DECIMAL(12,2) NOT NULL,
    motivo VARCHAR(300),
    usuario_id UUID REFERENCES usuarios(id),
    fecha_transferencia TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- MERMAS / PERDIDAS
-- =============================================================
CREATE TABLE inventario_mermas (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    item_inventario_id UUID NOT NULL REFERENCES inventario_items(id),
    cantidad DECIMAL(12,2) NOT NULL,
    costo DECIMAL(12,2) NOT NULL DEFAULT 0,
    tipo_merma VARCHAR(50) NOT NULL,
    motivo VARCHAR(300) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id),
    fecha_merma TIMESTAMP NOT NULL DEFAULT NOW(),
    observaciones TEXT
);

-- =============================================================
-- KARDEX VALORIZADO
-- =============================================================
CREATE TABLE inventario_kardex (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    item_inventario_id UUID NOT NULL REFERENCES inventario_items(id),
    fecha_movimiento TIMESTAMP NOT NULL,
    tipo_movimiento VARCHAR(30) NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL,
    costo_unitario DECIMAL(12,2) NOT NULL,
    costo_total DECIMAL(14,2) NOT NULL,
    stock_saldo DECIMAL(12,2) NOT NULL,
    costo_saldo DECIMAL(14,2) NOT NULL,
    referencia VARCHAR(200),
    documento VARCHAR(100)
);

CREATE INDEX idx_kardex_item ON inventario_kardex(item_inventario_id, fecha_movimiento);

-- =============================================================
-- CUENTAS POR PAGAR
-- =============================================================
CREATE TABLE cuentas_pagar (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    proveedor_id UUID REFERENCES proveedores(id),
    orden_compra_id UUID REFERENCES ordenes_compra(id),
    monto_original DECIMAL(14,2) NOT NULL,
    saldo_pendiente DECIMAL(14,2) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    descripcion VARCHAR(300),
    numero_comprobante VARCHAR(100),
    fecha_ultimo_pago DATE
);

CREATE TABLE cuentas_pagar_pagos (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    cuenta_pagar_id UUID NOT NULL REFERENCES cuentas_pagar(id),
    fecha_pago DATE NOT NULL,
    monto DECIMAL(14,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO',
    comprobante VARCHAR(100),
    observaciones VARCHAR(300),
    usuario_id UUID REFERENCES usuarios(id)
);

-- =============================================================
-- CUENTAS POR COBRAR
-- =============================================================
CREATE TABLE cuentas_cobrar (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    cliente_id UUID REFERENCES clientes(id),
    pedido_id UUID REFERENCES pedidos(id),
    monto_original DECIMAL(14,2) NOT NULL,
    saldo_pendiente DECIMAL(14,2) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    descripcion VARCHAR(300),
    fecha_ultimo_cobro DATE
);

CREATE TABLE cuentas_cobrar_cobros (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    cuenta_cobrar_id UUID NOT NULL REFERENCES cuentas_cobrar(id),
    fecha_cobro DATE NOT NULL,
    monto DECIMAL(14,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO',
    comprobante VARCHAR(100),
    observaciones VARCHAR(300),
    usuario_id UUID REFERENCES usuarios(id)
);

-- =============================================================
-- GASTOS / EGRESOS (no asociados a cierre de caja, contables)
-- =============================================================
CREATE TABLE contabilidad_gastos (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_gasto DATE NOT NULL,
    descripcion VARCHAR(300) NOT NULL,
    categoria_gasto VARCHAR(50) NOT NULL,
    monto DECIMAL(14,2) NOT NULL,
    metodo_pago VARCHAR(20) DEFAULT 'EFECTIVO',
    comprobante VARCHAR(100),
    proveedor_id UUID REFERENCES proveedores(id),
    usuario_id UUID REFERENCES usuarios(id),
    observaciones TEXT
);

-- =============================================================
-- INGRESOS (contables, no operativos)
-- =============================================================
CREATE TABLE contabilidad_ingresos (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_ingreso DATE NOT NULL,
    descripcion VARCHAR(300) NOT NULL,
    categoria_ingreso VARCHAR(50) NOT NULL,
    monto DECIMAL(14,2) NOT NULL,
    metodo_pago VARCHAR(20) DEFAULT 'EFECTIVO',
    comprobante VARCHAR(100),
    cliente_id UUID REFERENCES clientes(id),
    usuario_id UUID REFERENCES usuarios(id),
    observaciones TEXT
);

-- =============================================================
-- METODOS DE PAGO CONFIGURABLES
-- =============================================================
CREATE TABLE metodos_pago (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo_interno VARCHAR(20) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    requiere_comprobante BOOLEAN DEFAULT FALSE,
    orden_visual INTEGER DEFAULT 0
);

INSERT INTO metodos_pago (id, nombre, codigo_interno, activo, orden_visual) VALUES
    (gen_random_uuid(), 'Efectivo', 'EFECTIVO', TRUE, 1),
    (gen_random_uuid(), 'Tarjeta de credito', 'TARJETA_CREDITO', TRUE, 2),
    (gen_random_uuid(), 'Tarjeta de debito', 'TARJETA_DEBITO', TRUE, 3),
    (gen_random_uuid(), 'QR', 'QR', TRUE, 4),
    (gen_random_uuid(), 'Transferencia', 'TRANSFERENCIA', TRUE, 5),
    (gen_random_uuid(), 'Credito', 'CREDITO', TRUE, 6);

-- =============================================================
-- EXPANDIR METODO_PAGO EN PAGOS PARA SOPORTAR MAS METODOS
-- =============================================================
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS metodo_pago_id UUID REFERENCES metodos_pago(id);
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id);
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS descuento DECIMAL(14,2) DEFAULT 0;

-- =============================================================
-- ACTUALIZAR ROL DE USUARIO PARA MAS ROLES
-- =============================================================
-- Nota: Como RolUsuario es un enum de Java, los valores se manejan
-- desde el codigo. La columna ya es VARCHAR asi que acepta cualquier valor.
-- Seed de usuarios con nuevos roles se hace desde datos de prueba.

-- =============================================================
-- COMPRAS: agregar estado de pago a ordenes de compra
-- =============================================================
ALTER TABLE ordenes_compra ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20) DEFAULT 'PENDIENTE';
ALTER TABLE ordenes_compra ADD COLUMN IF NOT EXISTS fecha_pago DATE;
ALTER TABLE ordenes_compra ADD COLUMN IF NOT EXISTS usuario_recibe_id UUID REFERENCES usuarios(id);
ALTER TABLE ordenes_compra ADD COLUMN IF NOT EXISTS notas TEXT;

-- =============================================================
-- PROVEEDORES: agregar contacto
-- =============================================================
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS persona_contacto VARCHAR(200);
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS pagina_web VARCHAR(300);
