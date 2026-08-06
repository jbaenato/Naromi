-- =========================================================
-- Naromi Quiromasaje y Bienestar - Esquema de base de datos
-- Version 2: ficha por tipo de tratamiento (quiromasaje /
-- maderoterapia) + sesiones cortas por visita.
--
-- Si es un proyecto de Supabase NUEVO: ejecuta este archivo
-- completo en SQL Editor > New query > Run.
--
-- Si ya tenias la version 1 instalada (con datos reales),
-- NO ejecutes este archivo: usa en su lugar
-- sql/migracion_v1_a_v2.sql para no perder datos.
-- =========================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------
-- Tabla: clients
-- Ficha del cliente. Se rellena UNA VEZ, en la primera
-- visita. Segun el tipo de tratamiento elegido, se muestran
-- unas secciones u otras (ver README).
-- -------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 1. Datos personales (obligatorios salvo email y profesion)
  nombre text not null,
  apellidos text not null,
  direccion text not null,
  telefono text not null,
  fecha_nacimiento date not null,
  profesion text,
  email text,

  -- Tipo de tratamiento elegido para este cliente: determina
  -- que formulario se muestra en "Nueva ficha" y en cada
  -- "Nueva sesion".
  tipo_tratamiento text not null check (tipo_tratamiento in ('quiromasaje', 'maderoterapia')),

  -- 2. Anamnesis - parte historica (solo quiromasaje).
  -- Se rellena una vez; el motivo de consulta de cada visita
  -- (que duele, desde cuando, etc.) vive en "sessions".
  problemas_columna boolean,
  dolores_cabeza boolean,
  manos_dormidas boolean,
  duermes_bien boolean,
  aprietas_dientes boolean,
  padece_enfermedad text,
  toma_medicacion boolean,
  medicacion_cual text,
  tiene_alergias boolean,
  alergia_a text,
  cirugia_fractura boolean,
  cirugia_detalle text,

  -- 4. Evaluacion inicial (solo quiromasaje)
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
  temperatura_piel text,
  otros_hallazgos text,

  -- 3. Habitos y estilo de vida (solo maderoterapia)
  actividad_fisica text,
  habitos_alimentarios text,
  analisis_piel text,
  bebe_agua boolean,
  cantidad_agua text,
  fuma boolean,
  cigarrillos_dia text,
  bebe_alcohol boolean,
  frecuencia_alcohol text,
  calidad_sueno text,
  nivel_estres text,

  -- 6. Tratamientos alternativos (ambos tipos)
  kinesiotape_hipersensibilidad boolean,
  kinesiotape_zona text,
  auriculoterapia_pabellon text,
  auriculoterapia_puntos text,

  -- Consentimiento informado / RGPD (ambos tipos)
  consentimiento_firmado boolean default false,
  consentimiento_fecha date,
  rgpd_aceptado boolean default false
);

create index if not exists idx_clients_tipo on clients(tipo_tratamiento);

-- -------------------------------------------------------
-- Tabla: sessions
-- Una fila por cada visita. Para maderoterapia, la primera
-- fila (numero_sesion = 1) se crea automaticamente al
-- guardar la ficha, junto con la primera toma de medidas.
-- -------------------------------------------------------
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,

  fecha date not null default current_date,
  numero_sesion int not null default 1,

  -- 2 (parte 2). Motivo de consulta de esta visita (solo quiromasaje)
  que_duele text,
  desde_cuando text,
  como_es_dolor text,
  intensidad_dolor int check (intensidad_dolor between 0 and 10),
  zonas_dolor jsonb,              -- ej: ["frontal:hombro_der","posterior:lumbar"]
  plan_tratamiento text,          -- "tipo de tratamiento que se va a realizar"
  objetivo_aliviar_dolor boolean default false,
  objetivo_relajacion boolean default false,
  objetivo_reducir_contracturas boolean default false,
  objetivo_estres boolean default false,
  objetivo_mejorar_movilidad boolean default false,
  objetivo_otro text,
  observaciones_anamnesis text,

  -- 5. Tratamiento realizado (solo quiromasaje)
  tecnicas_aplicadas text,
  duracion text,
  respuesta_cliente text,
  observaciones text,

  -- 8. Recomendaciones para casa (ambos tipos)
  recomendaciones text,

  -- 7. Seguimiento maderoterapia - medidas de esta sesion (solo maderoterapia)
  medida_cintura numeric,
  medida_cadera_abdomen numeric,
  medida_cadera_pierna_dcha numeric,
  medida_cadera_pierna_izq numeric,
  medida_rodilla_dcha numeric,
  medida_rodilla_izq numeric,
  medida_otros text,

  -- 9. Proxima cita (ambos tipos)
  proxima_cita_fecha date,
  proxima_cita_hora time
);

create index if not exists idx_sessions_client_id on sessions(client_id);

-- -------------------------------------------------------
-- Seguridad (RLS)
-- -------------------------------------------------------
alter table clients enable row level security;
alter table sessions enable row level security;

drop policy if exists "allow all clients" on clients;
create policy "allow all clients" on clients
  for all using (true) with check (true);

drop policy if exists "allow all sessions" on sessions;
create policy "allow all sessions" on sessions
  for all using (true) with check (true);
