create table usuarios (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    nombre varchar(255) not null,
    username varchar(255) not null unique,
    password_hash varchar(255) not null,
    rol varchar(50) not null,
    activo boolean not null
);

create table mesas (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    numero integer not null unique,
    codigo_qr varchar(255) not null unique,
    estado varchar(50) not null
);

create table proveedores (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    nombre varchar(255) not null,
    nit varchar(255) not null unique,
    telefono varchar(255) not null,
    email varchar(255) not null,
    direccion varchar(255) not null,
    activo boolean not null
);

create table inventario_items (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    nombre varchar(255) not null,
    descripcion varchar(255) not null,
    unidad_medida varchar(50) not null,
    stock_actual numeric(12, 2) not null,
    stock_minimo numeric(12, 2) not null,
    stock_maximo numeric(12, 2) not null,
    punto_reorden numeric(12, 2) not null,
    costo_unitario numeric(12, 2) not null,
    proveedor_preferido_id uuid,
    tiempo_entrega_proveedor_dias integer not null,
    activo boolean not null,
    clasificacion_abc varchar(50) not null,
    fecha_ultima_compra date,
    constraint fk_inventario_items_proveedor foreign key (proveedor_preferido_id) references proveedores (id)
);

create table categorias_producto (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    nombre varchar(255) not null unique,
    descripcion varchar(255) not null,
    activo boolean not null
);

create table productos (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    nombre varchar(255) not null,
    descripcion varchar(255) not null,
    precio numeric(12, 2) not null,
    categoria_id uuid not null,
    activo boolean not null,
    disponible boolean not null,
    imagen_url varchar(255),
    constraint fk_productos_categoria foreign key (categoria_id) references categorias_producto (id)
);

create table recetas_producto (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    producto_id uuid not null,
    item_inventario_id uuid not null,
    cantidad_necesaria numeric(12, 2) not null,
    constraint fk_recetas_producto foreign key (producto_id) references productos (id),
    constraint fk_recetas_item foreign key (item_inventario_id) references inventario_items (id)
);

create table inventario_parametros (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    dias_analisis_consumo integer not null,
    dias_cobertura_deseada integer not null,
    porcentaje_margen_seguridad numeric(6, 2) not null,
    activar_prediccion_automatica boolean not null,
    activar_alertas_email boolean not null,
    activar_alertas_web_socket boolean not null,
    hora_ejecucion_prediccion_diaria time not null,
    stock_minimo_global_opcional numeric(12, 2),
    metodo_prediccion varchar(50) not null
);

create table inventario_movimientos (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    item_inventario_id uuid not null,
    tipo_movimiento varchar(50) not null,
    cantidad numeric(12, 2) not null,
    motivo varchar(255) not null,
    referencia varchar(255) not null,
    fecha_movimiento timestamptz not null,
    constraint fk_movimientos_item foreign key (item_inventario_id) references inventario_items (id)
);

create table inventario_alertas (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    item_inventario_id uuid not null,
    tipo varchar(50) not null,
    severidad varchar(50) not null,
    mensaje varchar(1000) not null,
    atendida boolean not null,
    constraint fk_alertas_item foreign key (item_inventario_id) references inventario_items (id)
);

create table inventario_predicciones (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    item_inventario_id uuid not null,
    consumo_promedio_diario numeric(12, 4) not null,
    dias_hasta_agotamiento numeric(12, 2) not null,
    fecha_estimada_agotamiento date not null,
    cantidad_sugerida_compra numeric(12, 2) not null,
    nivel_riesgo varchar(50) not null,
    confianza numeric(5, 2) not null,
    motivo varchar(1000) not null,
    fecha_generacion timestamptz not null,
    constraint fk_predicciones_item foreign key (item_inventario_id) references inventario_items (id)
);

create table pedidos (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    mesa_id uuid not null,
    estado varchar(50) not null,
    metodo_pago varchar(50) not null,
    total numeric(12, 2) not null,
    mesero_validador_id uuid,
    constraint fk_pedidos_mesa foreign key (mesa_id) references mesas (id),
    constraint fk_pedidos_mesero foreign key (mesero_validador_id) references usuarios (id)
);

create table pedido_detalles (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    pedido_id uuid not null,
    producto_id uuid not null,
    cantidad integer not null,
    precio_unitario numeric(12, 2) not null,
    subtotal numeric(12, 2) not null,
    constraint fk_pedido_detalles_pedido foreign key (pedido_id) references pedidos (id),
    constraint fk_pedido_detalles_producto foreign key (producto_id) references productos (id)
);

create table pagos (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    pedido_id uuid not null,
    metodo varchar(50) not null,
    estado varchar(50) not null,
    monto numeric(12, 2) not null,
    fecha_pago timestamptz,
    referencia_transaccion varchar(255),
    constraint fk_pagos_pedido foreign key (pedido_id) references pedidos (id)
);

create table facturas (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    pedido_id uuid not null,
    numero_factura varchar(255) not null unique,
    razon_social varchar(255) not null,
    nit_ci varchar(255) not null,
    email varchar(255) not null,
    total numeric(12, 2) not null,
    fecha_emision date not null,
    constraint fk_facturas_pedido foreign key (pedido_id) references pedidos (id)
);

create table ordenes_compra (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    proveedor_id uuid not null,
    estado varchar(50) not null,
    costo_estimado numeric(12, 2) not null,
    fecha_recepcion date,
    constraint fk_ordenes_proveedor foreign key (proveedor_id) references proveedores (id)
);

create table ordenes_compra_detalle (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    orden_compra_id uuid not null,
    item_inventario_id uuid not null,
    cantidad numeric(12, 2) not null,
    costo_unitario numeric(12, 2) not null,
    subtotal numeric(12, 2) not null,
    constraint fk_orden_detalle_orden foreign key (orden_compra_id) references ordenes_compra (id),
    constraint fk_orden_detalle_item foreign key (item_inventario_id) references inventario_items (id)
);

create table notificaciones (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    tipo varchar(50) not null,
    titulo varchar(255) not null,
    mensaje varchar(1200) not null,
    severidad varchar(50) not null,
    rol_destino varchar(50) not null,
    leida boolean not null,
    entidad_relacionada varchar(255) not null,
    entidad_id uuid not null
);

create index idx_movimientos_item_fecha on inventario_movimientos (item_inventario_id, fecha_movimiento);
create index idx_predicciones_item_fecha on inventario_predicciones (item_inventario_id, fecha_generacion desc);
create index idx_notificaciones_rol_fecha on notificaciones (rol_destino, fecha_creacion desc);

