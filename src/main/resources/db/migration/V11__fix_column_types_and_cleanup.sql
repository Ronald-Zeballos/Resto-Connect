-- Fix detalle_pagos type (was JSONB, using as text)
alter table cierres_caja
    alter column detalle_pagos type text using detalle_pagos::text;

-- Remove pagui columns from configuracion_restaurante
alter table configuracion_restaurante
    drop column if exists pagui_base_url,
    drop column if exists pagui_email,
    drop column if exists pagui_password,
    drop column if exists pagui_bank_id;

-- Remove grok columns from configuracion_restaurante
alter table configuracion_restaurante
    drop column if exists grok_api_key,
    drop column if exists grok_modelo,
    drop column if exists grok_system_prompt;
