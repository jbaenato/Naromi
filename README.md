# Naromi - Historia clinica digital

Web app instalable (PWA) que digitaliza la ficha en papel de Naromi Quiromasaje y Bienestar. Guarda cada ficha de cliente y cada sesion en una base de datos en la nube (Supabase / PostgreSQL) para poder analizar los datos despues.

No usa React ni ningun framework: es HTML, CSS y JavaScript simple, asi que no hay que instalar nada para editarla. Solo hay que conectarla a una base de datos y subirla a un hosting gratuito.

## Que incluye

- `index.html`, `css/`, `js/` — la aplicacion (formulario de ficha por pasos, formulario de sesion por pasos, panel de administracion).
- `sql/schema.sql` — script para crear las tablas en Supabase (proyecto nuevo).
- `sql/migracion_v1_a_v2.sql` — script para actualizar una base de datos que ya tenias con la version anterior de la app, sin perder los datos guardados.
- `manifest.json`, `sw.js`, `icons/` — hacen que la app se pueda "instalar" en el movil como un icono mas, funcionando a pantalla completa.

## Paso 1 - Crear la base de datos (Supabase, gratis)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Crea un nuevo proyecto (elige una region cercana, ej. Europa).
3. Cuando el proyecto este listo, entra en **SQL Editor > New query**.
4. Si es un proyecto nuevo: copia y pega todo el contenido de `sql/schema.sql` y pulsa **Run**. Esto crea las tablas `clients` y `sessions`.
   Si ya tenias la version anterior con datos reales: usa en su lugar `sql/migracion_v1_a_v2.sql`.
5. Ve a **Project Settings > API Keys**. Copia la **Publishable key** (empieza por `sb_publishable_...`; en proyectos antiguos puede llamarse "anon public").
6. Ve a **Project Settings > Data API** y copia la **Project URL** (termina en `.supabase.co`, sin nada detras).

## Paso 2 - Conectar la app a la base de datos

Abre `js/config.js` y sustituye los valores de ejemplo:

```js
window.NAROMI_CONFIG = {
  SUPABASE_URL: "https://tu-proyecto.supabase.co",
  SUPABASE_ANON_KEY: "tu-clave-anon-publica",
};
```

Guarda el fichero. Ya no hace falta ningun paso mas de compilacion.

## Paso 3 - Probarla en local

No hace falta instalar nada especial, solo un servidor local (para que el service worker y el manifest funcionen correctamente):

```bash
cd naromi-app
python3 -m http.server 8080
```

Abre `http://localhost:8080` en el navegador.

## Paso 4 - Publicarla para poder usarla desde el movil

La forma mas sencilla y gratuita es **Netlify** (o Vercel):

1. Entra en [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra la carpeta `naromi-app` completa a la pagina.
3. En segundos te da una URL publica (ej. `https://naromi-clinica.netlify.app`).
4. Abre esa URL desde el movil con Chrome/Safari. Aparecera un aviso para **"Anadir a pantalla de inicio"** (o el banner "Instalar" que muestra la propia app) — a partir de ahi funciona como una app instalada, con su propio icono.

Cada vez que quieras actualizar la app, vuelve a arrastrar la carpeta a Netlify Drop (o conecta un repositorio de GitHub para que se actualice sola).

## Como se organiza la informacion

La app funciona como un asistente por pasos (una pantalla por pregunta, con botones Atras/Siguiente), no como un formulario largo con scroll. Esto la hace mas comoda en movil.

- **Nueva ficha** (una vez por cliente): datos personales y, segun el tipo de tratamiento que elijas, unos pasos u otros:
  - **Quiromasaje**: anamnesis (antecedentes generales), evaluacion inicial, tratamientos alternativos, consentimiento.
  - **Maderoterapia**: habitos y estilo de vida, primera toma de medidas (se guarda automaticamente como su sesion numero 1), tratamientos alternativos, proxima cita, consentimiento.
  Se guarda en la tabla `clients`.
- **Nueva sesion** (en cada visita): buscas al cliente y, segun el tipo guardado en su ficha:
  - **Quiromasaje**: motivo de la consulta (con un mapa corporal tocable para marcar la zona de dolor, en vez de escribirla), tratamiento realizado, recomendaciones, proxima cita.
  - **Maderoterapia**: toma de medidas de esa sesion, proxima cita.
  Cada sesion se guarda como una fila nueva en la tabla `sessions`, enlazada a la ficha del cliente.
- **Panel / Clientes**: lista todos los clientes (con su tipo de tratamiento), permite buscar, ver el historial de sesiones de cada uno, y **exportar a CSV** (se abre directamente en Excel) tanto el listado completo de clientes como el de sesiones — listo para analizar tendencias, tratamientos mas usados, evolucion de medidas, etc.

## Seguridad y proximos pasos

Para empezar rapido, la base de datos se ha dejado con acceso abierto usando la clave "anon" (pensada para que solo la use el personal del centro, con la URL sin difundir). Si mas adelante quieres que cada terapeuta tenga su propio usuario y contrasena, se puede anadir **Supabase Auth** y restringir las políticas de la base de datos (RLS) para que cada uno solo vea lo que le corresponda — dimelo cuando quieras dar ese paso y lo preparamos.

Ideas para cuando quieras ampliarla:
- Firma digital del cliente en pantalla (tablet) en vez de casilla de consentimiento.
- Recordatorios automaticos de la proxima cita por email/WhatsApp.
- Graficos de evolucion de medidas (maderoterapia) por cliente.
- Convertirla en app nativa (iOS/Android) reutilizando la misma base de datos.
