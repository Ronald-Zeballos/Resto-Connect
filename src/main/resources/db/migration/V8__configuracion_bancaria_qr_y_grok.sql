alter table configuracion_restaurante
    add column if not exists qr_cuenta_titular varchar(255),
    add column if not exists qr_cuenta_banco varchar(255),
    add column if not exists qr_cuenta_numero varchar(255),
    add column if not exists qr_cuenta_tipo varchar(100),
    add column if not exists qr_comercio_codigo varchar(255),
    add column if not exists grok_api_key varchar(500),
    add column if not exists grok_modelo varchar(120),
    add column if not exists grok_system_prompt text;

update configuracion_restaurante
set qr_cuenta_tipo = coalesce(nullif(qr_cuenta_tipo, ''), 'CAJA_DE_AHORRO'),
    grok_modelo = coalesce(nullif(grok_modelo, ''), 'grok-4.20-reasoning'),
    grok_system_prompt = coalesce(
        nullif(grok_system_prompt, ''),
        'Eres un analista de operaciones para restaurantes. Resume hallazgos, riesgos y acciones concretas.'
    );
