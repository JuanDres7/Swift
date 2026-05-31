-- Elimina la versión obsoleta de actualizar_estado_pedido con parámetro
-- p_pedido_id de tipo integer. La migración 20260530140000 creó la versión
-- uuid con CREATE OR REPLACE, pero al cambiar el tipo del parámetro PostgreSQL
-- la trató como una función distinta y dejó ambas conviviendo. Eso provoca el
-- error PGRST203 ("Could not choose the best candidate function") al llamarla
-- por RPC desde PostgREST. Aquí dejamos únicamente la versión uuid.

drop function if exists actualizar_estado_pedido(integer, text);
