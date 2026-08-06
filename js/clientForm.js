// =========================================================
// Seccion "Nueva ficha" - se rellena UNA VEZ por cliente,
// como un asistente por pasos (mejor para movil que un
// formulario largo con scroll). Segun el tipo de tratamiento
// elegido, se muestran unos pasos u otros:
//
//  - Quiromasaje: anamnesis (historico), evaluacion inicial,
//    tratamientos alternativos, consentimiento.
//  - Maderoterapia: habitos y estilo de vida, primera toma de
//    medidas, tratamientos alternativos, proxima cita,
//    consentimiento. La primera toma de medidas se guarda
//    automaticamente como la sesion numero 1 de ese cliente.
// =========================================================

function renderClientForm(root) {
  root.innerHTML = "";

  if (!window.isSupabaseConfigured()) {
    root.appendChild(
      el(
        "div",
        { class: "config-warning" },
        "Todavia no has conectado la base de datos. Edita js/config.js con la URL y la clave de tu proyecto Supabase para poder guardar datos."
      )
    );
  }

  const introSteps = [
    {
      title: "Datos personales",
      build: (stepEl, data) => {
        stepEl.appendChild(formField({ label: "Nombre", name: "nombre", required: true, value: data.nombre }));
        stepEl.appendChild(
          formField({ label: "Apellidos", name: "apellidos", required: true, value: data.apellidos })
        );
        stepEl.appendChild(
          formField({ label: "Direccion", name: "direccion", required: true, value: data.direccion })
        );
        const row1 = el("div", { class: "row" });
        row1.appendChild(
          formField({ label: "Telefono", name: "telefono", type: "tel", required: true, value: data.telefono })
        );
        row1.appendChild(formField({ label: "Email (opcional)", name: "email", type: "email", value: data.email }));
        stepEl.appendChild(row1);
        const row2 = el("div", { class: "row" });
        row2.appendChild(
          formField({
            label: "Fecha de nacimiento",
            name: "fecha_nacimiento",
            type: "date",
            required: true,
            value: data.fecha_nacimiento,
          })
        );
        row2.appendChild(formField({ label: "Profesion (opcional)", name: "profesion", value: data.profesion }));
        stepEl.appendChild(row2);
      },
    },
    {
      title: "Tipo de tratamiento",
      subtitle: "Esto decide que preguntas te haremos a continuacion.",
      build: (stepEl, data) => buildTipoTratamientoStep(stepEl, data),
      onNext: (stepEl, data) => {
        if (!data.tipo_tratamiento) {
          showToast("Selecciona un tipo de tratamiento para continuar", true);
          return false;
        }
        // Si el usuario ya habia rellenado pasos del otro tipo y cambia de
        // opinion, limpiamos esos campos para no guardar datos a medias.
        clearOppositeFields(data, data.tipo_tratamiento);
        const steps =
          data.tipo_tratamiento === "quiromasaje" ? quiromasajeFichaSteps() : maderoterapiaFichaSteps();
        return { insertSteps: steps, group: "tipo" };
      },
    },
  ];

  createWizard(root, {
    data: {},
    steps: introSteps,
    submitLabel: "Guardar ficha",
    onSubmit: async (data) => {
      await submitClientWizard(data);
    },
  });
}

const QUIRO_ONLY_FIELDS = [
  "problemas_columna",
  "dolores_cabeza",
  "manos_dormidas",
  "duermes_bien",
  "aprietas_dientes",
  "tiene_enfermedad",
  "padece_enfermedad",
  "toma_medicacion",
  "medicacion_cual",
  "tiene_alergias",
  "alergia_a",
  "cirugia_fractura",
  "cirugia_detalle",
  "observacion_postural",
  "marcha",
  "limitacion_movimiento",
  "acortamientos_musculares",
  "puntos_gatillo",
  "puntos_gatillo_donde",
  "contracturas",
  "contracturas_donde",
  "inflamacion",
  "inflamacion_donde",
  "temperatura_piel",
  "otros_hallazgos",
];

const MADERO_ONLY_FIELDS = [
  "actividad_fisica",
  "habitos_alimentarios",
  "analisis_piel",
  "bebe_agua",
  "cantidad_agua",
  "fuma",
  "cigarrillos_dia",
  "bebe_alcohol",
  "frecuencia_alcohol",
  "calidad_sueno",
  "nivel_estres",
  "medida_cintura",
  "medida_cadera_abdomen",
  "medida_cadera_pierna_dcha",
  "medida_cadera_pierna_izq",
  "medida_rodilla_dcha",
  "medida_rodilla_izq",
  "medida_otros",
  "proxima_cita_fecha",
  "proxima_cita_hora",
];

/** Borra del objeto "data" los campos del tipo de tratamiento NO elegido. */
function clearOppositeFields(data, tipoElegido) {
  const toClear = tipoElegido === "quiromasaje" ? MADERO_ONLY_FIELDS : QUIRO_ONLY_FIELDS;
  toClear.forEach((name) => delete data[name]);
}

function buildTipoTratamientoStep(stepEl, data) {
  const wrap = el("div", { class: "treatment-choice" });
  const hidden = el("input", { type: "hidden", name: "tipo_tratamiento", value: data.tipo_tratamiento || "" });

  const cardQuiro = el("div", {
    class: "treatment-card" + (data.tipo_tratamiento === "quiromasaje" ? " selected" : ""),
  });
  cardQuiro.appendChild(el("h3", {}, "Quiromasaje"));
  cardQuiro.appendChild(
    el("p", {}, "Anamnesis, evaluacion inicial y tratamiento manual. El motivo de cada visita se registra sesion a sesion.")
  );

  const cardMadero = el("div", {
    class: "treatment-card" + (data.tipo_tratamiento === "maderoterapia" ? " selected" : ""),
  });
  cardMadero.appendChild(el("h3", {}, "Maderoterapia"));
  cardMadero.appendChild(
    el("p", {}, "Habitos y estilo de vida, mas seguimiento de medidas corporales sesion a sesion.")
  );

  function select(type) {
    hidden.value = type;
    data.tipo_tratamiento = type;
    cardQuiro.classList.toggle("selected", type === "quiromasaje");
    cardMadero.classList.toggle("selected", type === "maderoterapia");
  }
  cardQuiro.addEventListener("click", () => select("quiromasaje"));
  cardMadero.addEventListener("click", () => select("maderoterapia"));

  wrap.appendChild(cardQuiro);
  wrap.appendChild(cardMadero);
  wrap.appendChild(hidden);
  stepEl.appendChild(wrap);
}

// ---------------------------------------------------------
// Pasos exclusivos de Quiromasaje
// ---------------------------------------------------------
function quiromasajeFichaSteps() {
  return [
    {
      title: "Anamnesis",
      subtitle: "Antecedentes generales del cliente (se rellena una sola vez).",
      build: (stepEl, data) => {
        [
          ["Problemas de columna", "problemas_columna"],
          ["Dolores de cabeza frecuentes", "dolores_cabeza"],
          ["Manos dormidas", "manos_dormidas"],
          ["Duermes bien", "duermes_bien"],
          ["Aprietas los dientes", "aprietas_dientes"],
        ].forEach(([label, name]) => stepEl.appendChild(yesNoRow(label, name, data[name])));

        stepEl.appendChild(
          conditionalField("¿Padece alguna enfermedad?", "tiene_enfermedad", data.tiene_enfermedad, {
            label: "¿Cual?",
            name: "padece_enfermedad",
            type: "textarea",
            value: data.padece_enfermedad,
          })
        );
        stepEl.appendChild(
          conditionalField("¿Tomas medicacion actualmente?", "toma_medicacion", data.toma_medicacion, {
            label: "¿Cual?",
            name: "medicacion_cual",
            value: data.medicacion_cual,
          })
        );
        stepEl.appendChild(
          conditionalField("¿Tienes alergias?", "tiene_alergias", data.tiene_alergias, {
            label: "¿A que?",
            name: "alergia_a",
            value: data.alergia_a,
          })
        );
        stepEl.appendChild(
          conditionalField(
            "¿Has tenido cirugia, fractura o lesion importante?",
            "cirugia_fractura",
            data.cirugia_fractura,
            { label: "¿Cual y cuando?", name: "cirugia_detalle", value: data.cirugia_detalle }
          )
        );
      },
    },
    {
      title: "Evaluacion inicial",
      build: (stepEl, data) => {
        stepEl.appendChild(
          formField({
            label: "Observacion postural",
            name: "observacion_postural",
            type: "textarea",
            value: data.observacion_postural,
          })
        );
        stepEl.appendChild(formField({ label: "Marcha", name: "marcha", value: data.marcha }));
        stepEl.appendChild(
          formField({
            label: "Limitacion de movimiento",
            name: "limitacion_movimiento",
            type: "textarea",
            value: data.limitacion_movimiento,
          })
        );
        stepEl.appendChild(
          formField({
            label: "Acortamientos musculares",
            name: "acortamientos_musculares",
            type: "textarea",
            value: data.acortamientos_musculares,
          })
        );

        const palp = el("div", { class: "card", style: "background:#fbf6f1;margin-top:14px;" });
        palp.appendChild(el("h2", {}, "Hallazgos a la palpacion"));
        palp.appendChild(
          conditionalField("Puntos gatillo", "puntos_gatillo", data.puntos_gatillo, {
            label: "¿Donde?",
            name: "puntos_gatillo_donde",
            value: data.puntos_gatillo_donde,
          })
        );
        palp.appendChild(
          conditionalField("Contracturas", "contracturas", data.contracturas, {
            label: "¿Donde?",
            name: "contracturas_donde",
            value: data.contracturas_donde,
          })
        );
        palp.appendChild(
          conditionalField("Inflamacion", "inflamacion", data.inflamacion, {
            label: "¿Donde?",
            name: "inflamacion_donde",
            value: data.inflamacion_donde,
          })
        );
        palp.appendChild(
          formField({
            label: "Temperatura de la piel",
            name: "temperatura_piel",
            type: "select",
            options: ["Normal", "Aumentada", "Disminuida"],
            value: data.temperatura_piel,
          })
        );
        palp.appendChild(
          formField({ label: "Otros hallazgos", name: "otros_hallazgos", type: "textarea", value: data.otros_hallazgos })
        );
        stepEl.appendChild(palp);
      },
    },
    ...sharedFichaSteps(),
    consentimientoStep(),
  ];
}

// ---------------------------------------------------------
// Pasos exclusivos de Maderoterapia
// ---------------------------------------------------------
function maderoterapiaFichaSteps() {
  return [
    {
      title: "Habitos y estilo de vida",
      build: (stepEl, data) => {
        stepEl.appendChild(
          formField({
            label: "Actividad fisica",
            name: "actividad_fisica",
            type: "select",
            options: ["Ninguna", "Ligera", "Moderada", "Intensa"],
            value: data.actividad_fisica,
          })
        );
        stepEl.appendChild(
          formField({
            label: "Habitos alimentarios",
            name: "habitos_alimentarios",
            type: "textarea",
            value: data.habitos_alimentarios,
          })
        );
        stepEl.appendChild(formField({ label: "Analisis de la piel", name: "analisis_piel", value: data.analisis_piel }));
        stepEl.appendChild(
          conditionalField("¿Bebe suficiente agua al dia?", "bebe_agua", data.bebe_agua, {
            label: "Cantidad aproximada",
            name: "cantidad_agua",
            value: data.cantidad_agua,
          })
        );
        stepEl.appendChild(
          conditionalField("Fuma", "fuma", data.fuma, {
            label: "¿Cuantos al dia?",
            name: "cigarrillos_dia",
            value: data.cigarrillos_dia,
          })
        );
        stepEl.appendChild(
          conditionalField("Bebe alcohol", "bebe_alcohol", data.bebe_alcohol, {
            label: "¿Con que frecuencia?",
            name: "frecuencia_alcohol",
            value: data.frecuencia_alcohol,
          })
        );
        stepEl.appendChild(
          formField({
            label: "Calidad del sueno",
            name: "calidad_sueno",
            type: "select",
            options: ["Buena", "Regular", "Mala"],
            value: data.calidad_sueno,
          })
        );
        stepEl.appendChild(
          formField({
            label: "Nivel de estres",
            name: "nivel_estres",
            type: "select",
            options: ["Bajo", "Medio", "Alto"],
            value: data.nivel_estres,
          })
        );
      },
    },
    {
      title: "Seguimiento maderoterapia",
      subtitle: "Primera toma de medidas (sesion 1). Todo en centimetros.",
      build: (stepEl, data) => {
        const r1 = el("div", { class: "row" });
        r1.appendChild(formField({ label: "Abdomen - Cintura", name: "medida_cintura", type: "number", value: data.medida_cintura }));
        r1.appendChild(
          formField({ label: "Abdomen - Cadera", name: "medida_cadera_abdomen", type: "number", value: data.medida_cadera_abdomen })
        );
        stepEl.appendChild(r1);
        const r2 = el("div", { class: "row" });
        r2.appendChild(
          formField({ label: "Piernas - Cadera Dcha.", name: "medida_cadera_pierna_dcha", type: "number", value: data.medida_cadera_pierna_dcha })
        );
        r2.appendChild(
          formField({ label: "Piernas - Cadera Izq.", name: "medida_cadera_pierna_izq", type: "number", value: data.medida_cadera_pierna_izq })
        );
        stepEl.appendChild(r2);
        const r3 = el("div", { class: "row" });
        r3.appendChild(
          formField({ label: "Piernas - Rodilla Dcha.", name: "medida_rodilla_dcha", type: "number", value: data.medida_rodilla_dcha })
        );
        r3.appendChild(
          formField({ label: "Piernas - Rodilla Izq.", name: "medida_rodilla_izq", type: "number", value: data.medida_rodilla_izq })
        );
        stepEl.appendChild(r3);
        stepEl.appendChild(formField({ label: "Otros", name: "medida_otros", value: data.medida_otros }));
      },
    },
    ...sharedFichaSteps(),
    {
      title: "Proxima cita",
      build: (stepEl, data) => {
        const row = el("div", { class: "row" });
        row.appendChild(
          formField({ label: "Fecha", name: "proxima_cita_fecha", type: "date", value: data.proxima_cita_fecha })
        );
        row.appendChild(
          formField({ label: "Hora", name: "proxima_cita_hora", type: "time", value: data.proxima_cita_hora })
        );
        stepEl.appendChild(row);
      },
    },
    consentimientoStep(),
  ];
}

// ---------------------------------------------------------
// Pasos compartidos (tratamientos alternativos). El
// consentimiento se anade aparte porque en maderoterapia va
// despues de "proxima cita".
// ---------------------------------------------------------
function sharedFichaSteps() {
  return [
    {
      title: "Tratamientos alternativos",
      build: (stepEl, data) => {
        stepEl.appendChild(el("h2", { style: "border:none;font-size:0.9rem;" }, "Kinesiotape"));
        stepEl.appendChild(
          conditionalField(
            "Hipersensibilidad al kinesiotape",
            "kinesiotape_hipersensibilidad",
            data.kinesiotape_hipersensibilidad,
            { label: "Zona tratada", name: "kinesiotape_zona", value: data.kinesiotape_zona }
          )
        );
        stepEl.appendChild(
          el("h2", { style: "border:none;font-size:0.9rem;margin-top:16px;" }, "Auriculoterapia")
        );
        stepEl.appendChild(
          conditionalFieldFromSelect(
            {
              label: "Pabellon auricular dominante",
              name: "auriculoterapia_pabellon",
              options: ["Derecho", "Izquierdo"],
            },
            { label: "Puntos tratados", name: "auriculoterapia_puntos", value: data.auriculoterapia_puntos },
            data.auriculoterapia_pabellon
          )
        );
      },
    },
  ];
}

function consentimientoStep() {
  return {
    title: "Consentimiento informado y RGPD",
    build: (stepEl, data) => {
      stepEl.appendChild(
        el(
          "p",
          { class: "muted" },
          "Declaro que la informacion proporcionada es verdadera y autorizo a Naromi Quiro-Masaje y Bienestar a realizar el tratamiento que se considere mas adecuado para mi bienestar. Entiendo que no sustituye un tratamiento medico y me comprometo a informar de cualquier cambio en mi estado de salud. En cumplimiento del RGPD, mis datos seran tratados de forma confidencial."
        )
      );
      const group = el("div", { class: "pill-group" });
      group.appendChild(checkboxPill("Doy mi consentimiento informado", "consentimiento_firmado", data.consentimiento_firmado));
      group.appendChild(
        checkboxPill("He leido y acepto la politica de privacidad (RGPD)", "rgpd_aceptado", data.rgpd_aceptado)
      );
      stepEl.appendChild(group);
    },
  };
}

// ---------------------------------------------------------
// Guardado final: crea el cliente y, si es maderoterapia,
// crea tambien su primera sesion con las medidas ya tomadas.
// ---------------------------------------------------------
async function submitClientWizard(data) {
  if (!window.isSupabaseConfigured()) {
    showToast("Configura Supabase en js/config.js antes de guardar", true);
    return;
  }
  if (!data.nombre || !data.apellidos || !data.direccion || !data.telefono || !data.fecha_nacimiento) {
    showToast("Faltan datos personales obligatorios", true);
    return;
  }

  const clientPayload = {
    nombre: data.nombre,
    apellidos: data.apellidos,
    direccion: data.direccion,
    telefono: data.telefono,
    email: strVal(data, "email"),
    fecha_nacimiento: data.fecha_nacimiento,
    profesion: strVal(data, "profesion"),
    tipo_tratamiento: data.tipo_tratamiento,

    problemas_columna: ynVal(data, "problemas_columna"),
    dolores_cabeza: ynVal(data, "dolores_cabeza"),
    manos_dormidas: ynVal(data, "manos_dormidas"),
    duermes_bien: ynVal(data, "duermes_bien"),
    aprietas_dientes: ynVal(data, "aprietas_dientes"),
    tiene_enfermedad: ynVal(data, "tiene_enfermedad"),
    padece_enfermedad: strVal(data, "padece_enfermedad"),
    toma_medicacion: ynVal(data, "toma_medicacion"),
    medicacion_cual: strVal(data, "medicacion_cual"),
    tiene_alergias: ynVal(data, "tiene_alergias"),
    alergia_a: strVal(data, "alergia_a"),
    cirugia_fractura: ynVal(data, "cirugia_fractura"),
    cirugia_detalle: strVal(data, "cirugia_detalle"),

    observacion_postural: strVal(data, "observacion_postural"),
    marcha: strVal(data, "marcha"),
    limitacion_movimiento: strVal(data, "limitacion_movimiento"),
    acortamientos_musculares: strVal(data, "acortamientos_musculares"),
    puntos_gatillo: ynVal(data, "puntos_gatillo"),
    puntos_gatillo_donde: strVal(data, "puntos_gatillo_donde"),
    contracturas: ynVal(data, "contracturas"),
    contracturas_donde: strVal(data, "contracturas_donde"),
    inflamacion: ynVal(data, "inflamacion"),
    inflamacion_donde: strVal(data, "inflamacion_donde"),
    temperatura_piel: strVal(data, "temperatura_piel"),
    otros_hallazgos: strVal(data, "otros_hallazgos"),

    actividad_fisica: strVal(data, "actividad_fisica"),
    habitos_alimentarios: strVal(data, "habitos_alimentarios"),
    analisis_piel: strVal(data, "analisis_piel"),
    bebe_agua: ynVal(data, "bebe_agua"),
    cantidad_agua: strVal(data, "cantidad_agua"),
    fuma: ynVal(data, "fuma"),
    cigarrillos_dia: strVal(data, "cigarrillos_dia"),
    bebe_alcohol: ynVal(data, "bebe_alcohol"),
    frecuencia_alcohol: strVal(data, "frecuencia_alcohol"),
    calidad_sueno: strVal(data, "calidad_sueno"),
    nivel_estres: strVal(data, "nivel_estres"),

    kinesiotape_hipersensibilidad: ynVal(data, "kinesiotape_hipersensibilidad"),
    kinesiotape_zona: strVal(data, "kinesiotape_zona"),
    auriculoterapia_pabellon: strVal(data, "auriculoterapia_pabellon"),
    auriculoterapia_puntos: strVal(data, "auriculoterapia_puntos"),

    consentimiento_firmado: boolVal(data, "consentimiento_firmado"),
    consentimiento_fecha: new Date().toISOString().slice(0, 10),
    rgpd_aceptado: boolVal(data, "rgpd_aceptado"),
  };

  try {
    const [client] = await window.NaromiDB.insert("clients", clientPayload);

    if (data.tipo_tratamiento === "maderoterapia") {
      const sessionPayload = {
        client_id: client.id,
        fecha: new Date().toISOString().slice(0, 10),
        numero_sesion: 1,
        medida_cintura: numVal(data, "medida_cintura"),
        medida_cadera_abdomen: numVal(data, "medida_cadera_abdomen"),
        medida_cadera_pierna_dcha: numVal(data, "medida_cadera_pierna_dcha"),
        medida_cadera_pierna_izq: numVal(data, "medida_cadera_pierna_izq"),
        medida_rodilla_dcha: numVal(data, "medida_rodilla_dcha"),
        medida_rodilla_izq: numVal(data, "medida_rodilla_izq"),
        medida_otros: strVal(data, "medida_otros"),
        proxima_cita_fecha: strVal(data, "proxima_cita_fecha"),
        proxima_cita_hora: strVal(data, "proxima_cita_hora"),
      };
      await window.NaromiDB.insert("sessions", sessionPayload);
    }

    showToast("Ficha guardada correctamente");
    renderClientForm(document.getElementById("app"));
  } catch (err) {
    showToast(err.message, true);
  }
}
