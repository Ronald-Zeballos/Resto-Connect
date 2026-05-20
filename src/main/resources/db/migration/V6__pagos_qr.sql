create table pagos_qr (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    pedido_id uuid not null,
    pago_id uuid,
    proveedor varchar(50) not null,
    qr_externo_id varchar(255) not null unique,
    transaccion_externa varchar(255) not null,
    estado varchar(50) not null,
    monto numeric(12, 2) not null,
    moneda varchar(20) not null,
    descripcion varchar(500),
    expiracion timestamptz,
    imagen_qr text,
    referencia_pago_externa varchar(255),
    pagado_en timestamptz,
    fecha_ultima_sincronizacion timestamptz,
    constraint fk_pagos_qr_pedido foreign key (pedido_id) references pedidos (id),
    constraint fk_pagos_qr_pago foreign key (pago_id) references pagos (id)
);

create index idx_pagos_qr_pedido_fecha on pagos_qr (pedido_id, fecha_creacion desc);
