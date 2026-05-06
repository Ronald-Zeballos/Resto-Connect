create table configuracion_restaurante (
    id uuid primary key,
    fecha_creacion timestamptz not null,
    fecha_actualizacion timestamptz not null,
    nombre_comercial varchar(255) not null,
    razon_social varchar(255) not null,
    nit varchar(255) not null,
    telefono varchar(255) not null,
    direccion varchar(255) not null,
    email varchar(255) not null,
    moneda varchar(30) not null,
    porcentaje_impuesto numeric(6, 2) not null
);

insert into configuracion_restaurante (
    id, fecha_creacion, fecha_actualizacion, nombre_comercial, razon_social, nit, telefono, direccion, email, moneda, porcentaje_impuesto
) values (
    '00000000-0000-0000-0000-000000000950',
    now(),
    now(),
    'RestoConnect Pro',
    'RestoConnect Pro SRL',
    '1002003001',
    '70020030',
    'Av. Gastronomica 123',
    'admin@restoconnect.local',
    'BOB',
    13.00
);
