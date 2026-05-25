-- =============================================================
-- CATEGORIAS DE INVENTARIO (agrupacion logica de insumos)
-- =============================================================
CREATE TABLE inventario_categorias (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE inventario_items ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES inventario_categorias(id);

-- =============================================================
-- LOTES / VENCIMIENTOS (trazabilidad por lote y fecha de exp.)
-- =============================================================
CREATE TABLE inventario_lotes (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    item_inventario_id UUID NOT NULL REFERENCES inventario_items(id),
    codigo_lote VARCHAR(100) NOT NULL,
    cantidad_inicial DECIMAL(12,2) NOT NULL,
    cantidad_restante DECIMAL(12,2) NOT NULL,
    fecha_vencimiento DATE,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    costo_unitario DECIMAL(12,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_lotes_item ON inventario_lotes(item_inventario_id);
CREATE INDEX idx_lotes_vencimiento ON inventario_lotes(fecha_vencimiento) WHERE activo = TRUE;

-- =============================================================
-- CONTEO FISICO DE INVENTARIO (toma fisica periodica)
-- =============================================================
CREATE TABLE inventario_conteos (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_conteo DATE NOT NULL DEFAULT CURRENT_DATE,
    numero_conteo INTEGER NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTO',
    observaciones TEXT,
    usuario_id UUID REFERENCES usuarios(id),
    -- Totales calculados al cerrar
    total_items_contados INTEGER DEFAULT 0,
    total_diferencias INTEGER DEFAULT 0,
    total_ajuste_valor DECIMAL(14,2) DEFAULT 0
);

CREATE TABLE inventario_conteos_detalle (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    conteo_id UUID NOT NULL REFERENCES inventario_conteos(id),
    item_inventario_id UUID NOT NULL REFERENCES inventario_items(id),
    cantidad_sistema DECIMAL(12,2) NOT NULL,
    cantidad_fisica DECIMAL(12,2) NOT NULL,
    diferencia DECIMAL(12,2) NOT NULL,
    costo_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
    ajuste_valor DECIMAL(14,2) NOT NULL DEFAULT 0,
    observaciones VARCHAR(300),
    lotes_detalle JSONB
);

ALTER TABLE inventario_items ADD COLUMN IF NOT EXISTS costo_promedio_ponderado DECIMAL(12,2) DEFAULT 0;

-- =============================================================
-- CIERRE DE CAJA
-- =============================================================
CREATE TABLE cierres_caja (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_apertura TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_cierre TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTO',
    usuario_apertura_id UUID NOT NULL REFERENCES usuarios(id),
    usuario_cierre_id UUID REFERENCES usuarios(id),
    saldo_inicial DECIMAL(14,2) NOT NULL DEFAULT 0,
    saldo_esperado DECIMAL(14,2) DEFAULT 0,
    saldo_real_declarado DECIMAL(14,2) DEFAULT 0,
    diferencia DECIMAL(14,2) DEFAULT 0,
    observaciones TEXT,
    -- Resumen de metodos de pago (JSON)
    detalle_pagos JSONB,
    -- Resumen de pedidos en este turno
    total_pedidos INTEGER DEFAULT 0,
    total_ventas DECIMAL(14,2) DEFAULT 0,
    total_impuesto DECIMAL(14,2) DEFAULT 0,
    total_propinas DECIMAL(14,2) DEFAULT 0,
    total_descuentos DECIMAL(14,2) DEFAULT 0,
    total_gastos DECIMAL(14,2) DEFAULT 0
);

CREATE INDEX idx_cierres_fecha ON cierres_caja(fecha_apertura);
CREATE INDEX idx_cierres_estado ON cierres_caja(estado);

-- =============================================================
-- GASTOS OPERATIVOS (asociados a un cierre de caja)
-- =============================================================
CREATE TABLE caja_gastos (
    id UUID PRIMARY KEY,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    cierre_caja_id UUID NOT NULL REFERENCES cierres_caja(id),
    descripcion VARCHAR(300) NOT NULL,
    categoria_gasto VARCHAR(50) NOT NULL,
    monto DECIMAL(14,2) NOT NULL,
    metodo_pago VARCHAR(20) DEFAULT 'EFECTIVO',
    comprobante VARCHAR(100)
);

-- =============================================================
-- ACTUALIZAR CONFIGURACION DEL RESTAURANTE (mas campos)
-- =============================================================
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS paginas_por_carta INTEGER DEFAULT 1;
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS idioma_defecto VARCHAR(10) DEFAULT 'es';
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS zona_horaria VARCHAR(50) DEFAULT 'America/La_Paz';
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS formato_fecha VARCHAR(20) DEFAULT 'DD/MM/YYYY';
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS mensaje_pie_factura VARCHAR(300);
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS tipo_servicio VARCHAR(50) DEFAULT 'MESA';
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS propina_porcentaje DECIMAL(4,2) DEFAULT 0;
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS propina_incluida BOOLEAN DEFAULT FALSE;
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS inventario_valoracion VARCHAR(20) DEFAULT 'PROMEDIO_PONDERADO';
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS controlar_vencimientos BOOLEAN DEFAULT FALSE;
ALTER TABLE configuracion_restaurante ADD COLUMN IF NOT EXISTS controlar_lotes BOOLEAN DEFAULT FALSE;
