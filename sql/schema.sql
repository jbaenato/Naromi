-- =========================================================
-- Naromi Quiromasaje y Bienestar - Esquema de base de datos
-- Ejecutar en: Supabase > SQL Editor > New query > Run
-- =========================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------
-- Tabla: clients
-- Ficha inicial del cliente (se rellena una vez, en la
-- primera visita). Corresponde a las secciones 1, 2, 3, 4
-- y 6 del formulario en papel, mas el consentimiento.
-- -------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 1. Datos personales
  nombre text not null,
  apellidos text,
  direccion text,
  telefono text,
  email text,
  fecha_nacimiento date,
  profesion text,

  -- 2. Anamnesis
  problemas_columna boolean,
  dolores_cabeza boolean,
  manos_dormidas boolean,
  duermes_bien boolean,
  aprietas_dientes boolean,
  alergia boolean,
  padece_enfermedad text,
  toma_medicacion boolean,
  medicacion_cual text,
  tiene_alergias boolean,
  alergia_a text,
  cirugia_fractura boolean,
  cirugia_detalle text,
  que_duele text,
  desde_cuando text,
  como_es_dolor text,
  intensidad_dolor int check (intensidad_dolor between 0 and 10),
  zonas_dolor text,
  tipo_tratamiento text,
  objetivo_aliviar_dolor boolean default false,
  objetivo_relajacion boolean default false,
  objetivo_reducir_contracturas boolean default false,
  objetivo_estres boolean default false,
  objetivo_mejorar_movilidad boolean default false,
  objetivo_otro text,
  observaciones_anamnesis text,

  -- 3. Habitos y estilo de vida
  actividad_fisica text,       -- ninguna | ligera | moderada | intensa
  habitos_alimentarios text,
  analisis_piel text,
  bebe_agua boolean,
  cantidad_agua text,
  fuma boolean,
  cigarrillos_dia text,
  bebe_alcohol boolean,
  frecuencia_alcohol text,
  calidad_sueno text,          -- buena | regular | mala
  nivel_estres text,           -- bajo | medio | alto

  -- 4. Evaluacion inicial
  observacion_postural text,
  marcha text,
  limitacion_movimiento text,
  acortamientos_musculares text,
  puntos_gatillo boolean,
  puntos_gatillo_donde text,
  contracturas boolean,
  contracturas_donde text,
  inflamacion boolean,
  inflamacion_donde text,
  temperatura_piel text,       -- normal | aumentada | disminuida
  otros_hallazgos text,

  -- 6. Tratamientos alternativos
  kinesiotape_hipersensibilidad boolean,
  kinesiotape_zona text,
  auriculoterapia_pabellon text,  -- derecho | izquierdo
  auriculoterapia_puntos text,

  -- Consentimiento informado / RGPD
  consentimiento_firmado boolean default false,
  consentimiento_fecha date,
  rgpd_aceptado boolean default false
);

-- -------------------------------------------------------
-- Tabla: sessions
-- Una fila por cada sesion/visita del cliente. Corresponde
-- a las secciones 5, 7, 8 y 9 del formulario en papel.
-- -------------------------------------------------------
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,

  -- 5. Tratamiento realizado
  fecha date not null default current_date,
  numero_sesion int,
  tecnicas_aplicadas text,
  duracion text,
  respuesta_cliente text,
  observaciones text,

  -- 7. Seguimiento maderoterapia (medidas en cm)
  medida_cintura numeric,
  medida_cadera_abdomen numeric,
  medida_cadera_pierna_dcha numeric,
  medida_cadera_pierna_izq numeric,
  medida_rodilla_dcha numeric,
  medida_rodilla_izq numeric,
  medida_otros text,

  -- 8. Recomendaciones para casa
  recomendaciones text,

  -- 9. Proxima cita
  proxima_cita_fecha date,
  proxima_cita_hora time
);

create index if not exists idx_sessions_client_id on sessions(client_id);

-- -------------------------------------------------------
-- Seguridad (RLS)
-- -------------------------------------------------------
-- Para empezar rapido, dejamos acceso abierto con la clave
-- "anon" de tu proyecto (uso interno, no pensado para
-- exponer publicamente el formulario sin autenticacion).
-- Cuando quieras anadir usuarios/login, sustituye estas
-- politicas por reglas basadas en auth.uid().

alter table clients enable row level security;
alter table sessions enable row level security;

drop policy if exists "allow all clients" on clients;
create policy "allow all clients" on clients
  for all using (true) with check (true);

drop policy if exists "allow all sessions" on sessions;
create policy "allow all sessions" on sessions
  for all using (true) with check (true);
