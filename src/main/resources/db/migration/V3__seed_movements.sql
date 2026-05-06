insert into inventario_movimientos (
    id, fecha_creacion, fecha_actualizacion, item_inventario_id, tipo_movimiento, cantidad, motivo, referencia, fecha_movimiento
) values
('00000000-0000-0000-0000-000000000801', now(), now(), '00000000-0000-0000-0000-000000000401', 'SALIDA', 6, 'Consumo historico', 'HIST-001', now() - interval '3 day'),
('00000000-0000-0000-0000-000000000802', now(), now(), '00000000-0000-0000-0000-000000000401', 'SALIDA', 5, 'Consumo historico', 'HIST-002', now() - interval '2 day'),
('00000000-0000-0000-0000-000000000803', now(), now(), '00000000-0000-0000-0000-000000000402', 'SALIDA', 7, 'Consumo historico', 'HIST-003', now() - interval '4 day'),
('00000000-0000-0000-0000-000000000804', now(), now(), '00000000-0000-0000-0000-000000000402', 'SALIDA', 6, 'Consumo historico', 'HIST-004', now() - interval '1 day'),
('00000000-0000-0000-0000-000000000805', now(), now(), '00000000-0000-0000-0000-000000000405', 'SALIDA', 2.50, 'Consumo historico', 'HIST-005', now() - interval '5 day'),
('00000000-0000-0000-0000-000000000806', now(), now(), '00000000-0000-0000-0000-000000000405', 'SALIDA', 2.00, 'Consumo historico', 'HIST-006', now() - interval '2 day'),
('00000000-0000-0000-0000-000000000807', now(), now(), '00000000-0000-0000-0000-000000000406', 'SALIDA', 0.80, 'Consumo historico', 'HIST-007', now() - interval '6 day'),
('00000000-0000-0000-0000-000000000808', now(), now(), '00000000-0000-0000-0000-000000000407', 'SALIDA', 5, 'Consumo historico', 'HIST-008', now() - interval '3 day'),
('00000000-0000-0000-0000-000000000809', now(), now(), '00000000-0000-0000-0000-000000000408', 'SALIDA', 8, 'Consumo historico', 'HIST-009', now() - interval '2 day'),
('00000000-0000-0000-0000-000000000810', now(), now(), '00000000-0000-0000-0000-000000000410', 'SALIDA', 1.20, 'Consumo historico', 'HIST-010', now() - interval '7 day');
