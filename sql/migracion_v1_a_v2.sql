-- =========================================================
-- Migracion de la base de datos de Naromi: version 1 -> 2
--
-- Usa este script SOLO si ya habias ejecutado el schema.sql
-- original y tienes clientes/sesiones reales guardados que
-- no quieres perder. Si es un proyecto nuevo, no uses este
-- archivo: usa directamente sql/schema.sql.
--
-- Que cambia en la v2:
--  - Se anade "tipo_tratamiento" (quiromasaje / maderoterapia)
--    a cada cliente.
--  - Se elimina el check duplicado "Alergia" (se queda solo
--    "Tienes alergias?").
--  - La parte de la anamnesis sobre el motivo de la consulta
--    (que duele, desde cuando, intensidad, zonas, objetivo del
--    tratamiento...) pasa de la ficha del cliente a cada sesion,
--    porque cambia en cada visita.
--
-- Ejecuta este archivo completo en Supabase > SQL Editor.
-- =========================================================

-- 1. El campo "tipo_tratamiento" ya existia con otro significado
--    (el texto libre "tipo de tratamiento que se va a realizar").
--    Lo renombramos para no perderlo, y pasa a vivir en "sessions".
alter table clients rename column tipo_tratamiento to plan_tratamiento_legado;

-- 2. Nueva columna: tipo de tratamiento del cliente (quiromasaje/maderoterapia)
alter table clients add column if not exists tipo_tratamiento text;
update clients set tipo_tratamiento = 'quiromasaje' where tipo_tratamiento is null;
alter table clients alter column tipo_tratamiento set default 'quiromasaje';
alter table clients alter column tipo_tratamiento set not null;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clients_tipo_tratamiento_check') then
    alter table clients add constraint clients_tipo_tratamiento_check
      check (tipo_tratamiento in ('quiromasaje', 'maderoterapia'));
  end if;
end $$;

-- 3b. Nueva columna: si el cliente padece alguna enfermedad (antes solo
--     habia el campo de texto, ahora tiene un Si/No delante)
alter table clients add column if not exists tiene_enfermedad boolean;

-- 3. Nuevas columnas en "sessions" para el motivo de consulta de cada visita
alter table sessions add column if not exists que_duele text;
alter table sessions add column if not exists desde_cuando text;
alter table sessions add column if not exists como_es_dolor text;
alter table sessions add column if not exists intensidad_dolor int;
alter table sessions add column if not exists zonas_dolor jsonb;
alter table sessions add column if not exists plan_tratamiento text;
alter table sessions add column if not exists objetivo_aliviar_dolor boolean default false;
alter table sessions add column if not exists objetivo_relajacion boolean default false;
alter table sessions add column if not exists objetivo_reducir_contracturas boolean default false;
alter table sessions add column if not exists objetivo_estres boolean default false;
alter table sessions add column if not exists objetivo_mejorar_movilidad boolean default false;
alter table sessions add column if not exists objetivo_otro text;
alter table sessions add column if not exists observaciones_anamnesis text;

update sessions set numero_sesion = 1 where numero_sesion is null;
alter table sessions alter column numero_sesion set default 1;

-- 4. Trasladamos los datos existentes de "motivo de consulta" (si los hay)
--    de clients a una sesion, para no perderlos.
insert into sessions (
  client_id, fecha, numero_sesion, que_duele, desde_cuando, como_es_dolor,
  intensidad_dolor, zonas_dolor, plan_tratamiento,
  objetivo_aliviar_dolor, objetivo_relajacion, objetivo_reducir_contracturas,
  objetivo_estres, objetivo_mejorar_movilidad, objetivo_otro, observaciones_anamnesis
)
select
  id, current_date, 0, que_duele, desde_cuando, como_es_dolor,
  intensidad_dolor, to_jsonb(zonas_dolor), plan_tratamiento_legado,
  coalesce(objetivo_aliviar_dolor, false), coalesce(objetivo_relajacion, false), coalesce(objetivo_reducir_contracturas, false),
  coalesce(objetivo_estres, false), coalesce(objetivo_mejorar_movilidad, false), objetivo_otro, observaciones_anamnesis
from clients
where que_duele is not null or desde_cuando is not null or como_es_dolor is not null
   or intensidad_dolor is not null or zonas_dolor is not null;

-- 5. Limpiamos de "clients" las columnas que ahora viven en "sessions"
alter table clients drop column if exists que_duele;
alter table clients drop column if exists desde_cuando;
alter table clients drop column if exists como_es_dolor;
alter table clients drop column if exists intensidad_dolor;
alter table clients drop column if exists zonas_dolor;
alter table clients drop column if exists objetivo_aliviar_dolor;
alter table clients drop column if exists objetivo_relajacion;
alter table clients drop column if exists objetivo_reducir_contracturas;
alter table clients drop column if exists objetivo_estres;
alter table clients drop column if exists objetivo_mejorar_movilidad;
alter table clients drop column if exists objetivo_otro;
alter table clients drop column if exists observaciones_anamnesis;
alter table clients drop column if exists plan_tratamiento_legado;

-- 6. Eliminamos el check "Alergia" duplicado (se queda "Tienes alergias?")
alter table clients drop column if exists alergia;

create index if not exists idx_clients_tipo on clients(tipo_tratamiento);

-- Listo. Revisa en Table Editor que "clients" y "sessions" tengan las
-- columnas nuevas, y que no se haya perdido ningun dato importante.
