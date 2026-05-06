create table incidencias (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    titulo varchar(255) not null,
    descripcion varchar(1500) not null,
    categoria varchar(50) not null,
    prioridad varchar(50) not null,
    estado varchar(50) not null,
    mesa_id uuid,
    pedido_id uuid,
    reportado_por_id uuid not null,
    comentario_resolucion varchar(1000),
    fecha_resolucion timestamptz,
    constraint fk_incidencias_mesa foreign key (mesa_id) references mesas (id),
    constraint fk_incidencias_pedido foreign key (pedido_id) references pedidos (id),
    constraint fk_incidencias_usuario foreign key (reportado_por_id) references usuarios (id)
);

create index idx_incidencias_estado_fecha on incidencias (estado, fecha_creacion desc);

insert into usuarios (id, fecha_creacion, fecha_actualizacion, nombre, username, password_hash, rol, activo) values
('00000000-0000-0000-0000-000000000003', now(), now(), 'Cocinero Principal', 'cocina', '{noop}cocina123', 'COCINA', true);

insert into incidencias (
    id, fecha_creacion, fecha_actualizacion, titulo, descripcion, categoria, prioridad, estado,
    mesa_id, pedido_id, reportado_por_id, comentario_resolucion, fecha_resolucion
) values
(
    '00000000-0000-0000-0000-000000000901',
    now(),
    now(),
    'Mesa con QR desgastado',
    'El codigo QR de la mesa 4 necesita reposicion porque ya no se lee con facilidad.',
    'MESA',
    'MEDIA',
    'ABIERTA',
    '00000000-0000-0000-0000-000000000204',
    null,
    '00000000-0000-0000-0000-000000000002',
    null,
    null
);
