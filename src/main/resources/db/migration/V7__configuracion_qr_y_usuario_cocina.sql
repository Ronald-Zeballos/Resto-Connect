alter table configuracion_restaurante
    add column if not exists pagos_qr_habilitado boolean not null default false,
    add column if not exists proveedor_qr varchar(50) not null default 'PAGUI',
    add column if not exists pagui_base_url varchar(255),
    add column if not exists pagui_email varchar(255),
    add column if not exists pagui_password varchar(255),
    add column if not exists pagui_bank_id integer;

update configuracion_restaurante
set pagos_qr_habilitado = coalesce(pagos_qr_habilitado, true),
    proveedor_qr = coalesce(nullif(proveedor_qr, ''), 'PAGUI'),
    pagui_base_url = coalesce(nullif(pagui_base_url, ''), 'http://pagui-backend:3000'),
    pagui_email = coalesce(nullif(pagui_email, ''), 'admin@pagui.com'),
    pagui_password = coalesce(nullif(pagui_password, ''), 'admin123'),
    pagui_bank_id = coalesce(pagui_bank_id, 1);

insert into usuarios (id, fecha_creacion, fecha_actualizacion, nombre, username, password_hash, rol, activo)
select
    '00000000-0000-0000-0000-000000000003',
    now(),
    now(),
    'Cocinero Principal',
    'cocina',
    '{noop}cocina123',
    'COCINA',
    true
where not exists (
    select 1
    from usuarios
    where username = 'cocina'
);
