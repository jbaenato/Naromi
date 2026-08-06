// =========================================================
// Seccion "Nueva ficha" - Historia clinica del cliente
// Secciones 1, 2, 3, 4 y 6 del formulario en papel, mas
// consentimiento informado / RGPD.
// =========================================================

function renderClientForm(root) {
  root.innerHTML = "";

  const form = el("form", { id: "clientForm" });

  // ---- Aviso de configuracion ----
  if (!window.isSupabaseConfigured()) {
    form.appendChild(
      el(
        "div",
        { class: "config-warning" },
        "Todavia no has conectado la base de datos. Edita js/config.js con la URL y la clave anon de tu proyecto Supabase para poder guardar datos. Mientras tanto puedes ver el formulario, pero no se guardara nada."
      )
    );
  }

  // ---- 1. Datos personales ----
  const s1 = el("div", { class: "card" });
  s1.appendChild(sectionTitle(1, "Datos personales"));
  s1.appendChild(formField({ label: "Nombre", name: "nombre", required: true }));
  s1.appendChild(formField({ label: "Apellidos", name: "apellidos" }));
  s1.appendChild(formField({ label: "Direccion", name: "direccion" }));
  const row1 = el("div", { class: "row" });
  row1.appendChild(formField({ label: "Telefono", name: "telefono", type: "tel" }));
  row1.appendChild(formField({ label: "Email", name: "email", type: "email" }));
  s1.appendChild(row1);
  const row2 = el("div", { class: "row" });
  row2.appendChild(formField({ label: "Fecha de nacimiento", name: "fecha_nacimiento", type: "date" }));
  row2.appendChild(formField({ label: "Profesion", name: "profesion" }));
  s1.appendChild(row2);
  form.appendChild(s1);

  // ---- 2. Anamnesis ----
  const s2 = el("div", { class: "card" });
  s2.appendChild(sectionTitle(2, "Anamnesis"));
  [
    ["Problemas de columna", "problemas_columna"],
    ["Dolores de cabeza frecuentes", "dolores_cabeza"],
    ["Manos dormidas", "manos_dormidas"],
    ["Duermes bien", "duermes_bien"],
    ["Aprietas los dientes", "aprietas_dientes"],
    ["Alergia", "alergia"],
  ].forEach(([label, name]) => s2.appendChild(yesNoRow(label, name)));

  s2.appendChild(formField({ label: "¿Padece alguna enfermedad?", name: "padece_enfermedad", type: "textarea" }));

  s2.appendChild(yesNoRow("¿Tomas medicacion actualmente?", "toma_medicacion"));
  s2.appendChild(formField({ label: "¿Cual?", name: "medicacion_cual" }));

  s2.appendChild(yesNoRow("¿Tienes alergias?", "tiene_alergias"));
  s2.appendChild(formField({ label: "¿A que?", name: "alergia_a" }));

  s2.appendChild(yesNoRow("¿Has tenido cirugia, fractura o lesion importante?", "cirugia_fractura"));
  s2.appendChild(formField({ label: "¿Cual y cuando?", name: "cirugia_detalle" }));

  s2.appendChild(formField({ label: "¿Que duele?", name: "que_duele" }));
  s2.appendChild(formField({ label: "¿Desde cuando duele?", name: "desde_cuando" }));
  s2.appendChild(formField({ label: "¿Como es el dolor?", name: "como_es_dolor" }));
  s2.appendChild(painScale("intensidad_dolor", ""));
  s2.appendChild(
    formField({
      label: "Zonas donde sientes dolor o molestia",
      name: "zonas_dolor",
      type: "textarea",
      placeholder: "Describe la/s zona/s del cuerpo",
    })
  );
  s2.appendChild(formField({ label: "Tipo de tratamiento que se va a realizar", name: "tipo_tratamiento" }));

  const objWrap = el("div", { class: "field" });
  objWrap.appendChild(el("label", {}, "Objetivo del tratamiento"));
  const objGroup = el("div", { class: "pill-group" });
  [
    ["Aliviar dolor", "objetivo_aliviar_dolor"],
    ["Relajacion", "objetivo_relajacion"],
    ["Reducir contracturas", "objetivo_reducir_contracturas"],
    ["Estres", "objetivo_estres"],
    ["Mejorar movilidad", "objetivo_mejorar_movilidad"],
  ].forEach(([label, name]) => objGroup.appendChild(checkboxPill(label, name)));
  objWrap.appendChild(objGroup);
  s2.appendChild(objWrap);
  s2.appendChild(formField({ label: "Otro objetivo", name: "objetivo_otro" }));
  s2.appendChild(formField({ label: "Observaciones", name: "observaciones_anamnesis", type: "textarea" }));
  form.appendChild(s2);

  // ---- 3. Habitos y estilo de vida ----
  const s3 = el("div", { class: "card" });
  s3.appendChild(sectionTitle(3, "Habitos y estilo de vida"));
  s3.appendChild(
    formField({
      label: "Actividad fisica",
      name: "actividad_fisica",
      type: "select",
      options: ["Ninguna", "Ligera", "Moderada", "Intensa"],
    })
  );
  s3.appendChild(formField({ label: "Habitos alimentarios", name: "habitos_alimentarios", type: "textarea" }));
  s3.appendChild(formField({ label: "Analisis de la piel", name: "analisis_piel" }));
  s3.appendChild(yesNoRow("¿Bebe suficiente agua al dia?", "bebe_agua"));
  s3.appendChild(formField({ label: "Cantidad aproximada", name: "cantidad_agua" }));
  s3.appendChild(yesNoRow("Fuma", "fuma"));
  s3.appendChild(formField({ label: "¿Cuantos al dia?", name: "cigarrillos_dia" }));
  s3.appendChild(yesNoRow("Bebe alcohol", "bebe_alcohol"));
  s3.appendChild(formField({ label: "¿Con que frecuencia?", name: "frecuencia_alcohol" }));
  s3.appendChild(
    formField({ label: "Calidad del sueno", name: "calidad_sueno", type: "select", options: ["Buena", "Regular", "Mala"] })
  );
  s3.appendChild(
    formField({ label: "Nivel de estres", name: "nivel_estres", type: "select", options: ["Bajo", "Medio", "Alto"] })
  );
  form.appendChild(s3);

  // ---- 4. Evaluacion inicial ----
  const s4 = el("div", { class: "card" });
  s4.appendChild(sectionTitle(4, "Evaluacion inicial"));
  s4.appendChild(formField({ label: "Observacion postural", name: "observacion_postural", type: "textarea" }));
  s4.appendChild(formField({ label: "Marcha", name: "marcha" }));
  s4.appendChild(formField({ label: "Limitacion de movimiento", name: "limitacion_movimiento", type: "textarea" }));
  s4.appendChild(formField({ label: "Acortamientos musculares", name: "acortamientos_musculares", type: "textarea" }));

  const palp = el("div", { class: "card", style: "background:#fbf6f1;" });
  palp.appendChild(el("h2", {}, "Hallazgos a la palpacion"));
  s4.appendChild(palp);
  palp.appendChild(yesNoRow("Puntos gatillo", "puntos_gatillo"));
  palp.appendChild(formField({ label: "¿Donde?", name: "puntos_gatillo_donde" }));
  palp.appendChild(yesNoRow("Contracturas", "contracturas"));
  palp.appendChild(formField({ label: "¿Donde?", name: "contracturas_donde" }));
  palp.appendChild(yesNoRow("Inflamacion", "inflamacion"));
  palp.appendChild(formField({ label: "¿Donde?", name: "inflamacion_donde" }));
  palp.appendChild(
    formField({
      label: "Temperatura de la piel",
      name: "temperatura_piel",
      type: "select",
      options: ["Normal", "Aumentada", "Disminuida"],
    })
  );
  palp.appendChild(formField({ label: "Otros hallazgos", name: "otros_hallazgos", type: "textarea" }));
  form.appendChild(s4);

  // ---- 6. Tratamientos alternativos ----
  const s6 = el("div", { class: "card" });
  s6.appendChild(sectionTitle(6, "Tratamientos alternativos"));
  s6.appendChild(el("h2", { style: "border:none;font-size:0.9rem;" }, "Kinesiotape"));
  s6.appendChild(yesNoRow("Hipersensibilidad al kinesiotape", "kinesiotape_hipersensibilidad"));
  s6.appendChild(formField({ label: "Zona tratada", name: "kinesiotape_zona" }));
  s6.appendChild(el("h2", { style: "border:none;font-size:0.9rem;margin-top:16px;" }, "Auriculoterapia"));
  s6.appendChild(
    formField({
      label: "Pabellon auricular dominante",
      name: "auriculoterapia_pabellon",
      type: "select",
      options: ["Derecho", "Izquierdo"],
    })
  );
  s6.appendChild(formField({ label: "Puntos tratados", name: "auriculoterapia_puntos" }));
  form.appendChild(s6);

  // ---- Consentimiento ----
  const s7 = el("div", { class: "card" });
  s7.appendChild(sectionTitle("", "Consentimiento informado y proteccion de datos (RGPD)"));
  s7.appendChild(
    el(
      "p",
      { class: "muted" },
      "Declaro que la informacion proporcionada es verdadera y autorizo a Naromi Quiro-Masaje y Bienestar a realizar el tratamiento que se considere mas adecuado para mi bienestar. Entiendo que el quiromasaje no sustituye un tratamiento medico y me comprometo a informar de cualquier cambio en mi estado de salud. En cumplimiento del RGPD, mis datos seran tratados de forma confidencial."
    )
  );
  const consentGroup = el("div", { class: "pill-group" });
  consentGroup.appendChild(checkboxPill("Doy mi consentimiento informado", "consentimiento_firmado"));
  consentGroup.appendChild(checkboxPill("He leido y acepto la politica de privacidad (RGPD)", "rgpd_aceptado"));
  s7.appendChild(consentGroup);
  form.appendChild(s7);

  form.appendChild(el("button", { type: "submit", class: "primary" }, "Guardar ficha de cliente"));

  root.appendChild(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitClientForm(form);
  });
}

function sectionTitle(num, text) {
  const h2 = el("h2", {});
  if (num !== "") h2.appendChild(el("span", { class: "num" }, String(num)));
  h2.appendChild(document.createTextNode(text));
  return h2;
}

async function submitClientForm(form) {
  const fd = new FormData(form);
  const get = (name) => fd.get(name) || null;

  const payload = {
    nombre: get("nombre"),
    apellidos: get("apellidos"),
    direccion: get("direccion"),
    telefono: get("telefono"),
    email: get("email"),
    fecha_nacimiento: get("fecha_nacimiento"),
    profesion: get("profesion"),

    problemas_columna: getYesNo(form, "problemas_columna"),
    dolores_cabeza: getYesNo(form, "dolores_cabeza"),
    manos_dormidas: getYesNo(form, "manos_dormidas"),
    duermes_bien: getYesNo(form, "duermes_bien"),
    aprietas_dientes: getYesNo(form, "aprietas_dientes"),
    alergia: getYesNo(form, "alergia"),
    padece_enfermedad: get("padece_enfermedad"),
    toma_medicacion: getYesNo(form, "toma_medicacion"),
    medicacion_cual: get("medicacion_cual"),
    tiene_alergias: getYesNo(form, "tiene_alergias"),
    alergia_a: get("alergia_a"),
    cirugia_fractura: getYesNo(form, "cirugia_fractura"),
    cirugia_detalle: get("cirugia_detalle"),
    que_duele: get("que_duele"),
    desde_cuando: get("desde_cuando"),
    como_es_dolor: get("como_es_dolor"),
    intensidad_dolor: fd.get("intensidad_dolor") ? Number(fd.get("intensidad_dolor")) : null,
    zonas_dolor: get("zonas_dolor"),
    tipo_tratamiento: get("tipo_tratamiento"),
    objetivo_aliviar_dolor: form.querySelector('[name="objetivo_aliviar_dolor"]').checked,
    objetivo_relajacion: form.querySelector('[name="objetivo_relajacion"]').checked,
    objetivo_reducir_contracturas: form.querySelector('[name="objetivo_reducir_contracturas"]').checked,
    objetivo_estres: form.querySelector('[name="objetivo_estres"]').checked,
    objetivo_mejorar_movilidad: form.querySelector('[name="objetivo_mejorar_movilidad"]').checked,
    objetivo_otro: get("objetivo_otro"),
    observaciones_anamnesis: get("observaciones_anamnesis"),

    actividad_fisica: get("actividad_fisica"),
    habitos_alimentarios: get("habitos_alimentarios"),
    analisis_piel: get("analisis_piel"),
    bebe_agua: getYesNo(form, "bebe_agua"),
    cantidad_agua: get("cantidad_agua"),
    fuma: getYesNo(form, "fuma"),
    cigarrillos_dia: get("cigarrillos_dia"),
    bebe_alcohol: getYesNo(form, "bebe_alcohol"),
    frecuencia_alcohol: get("frecuencia_alcohol"),
    calidad_sueno: get("calidad_sueno"),
    nivel_estres: get("nivel_estres"),

    observacion_postural: get("observacion_postural"),
    marcha: get("marcha"),
    limitacion_movimiento: get("limitacion_movimiento"),
    acortamientos_musculares: get("acortamientos_musculares"),
    puntos_gatillo: getYesNo(form, "puntos_gatillo"),
    puntos_gatillo_donde: get("puntos_gatillo_donde"),
    contracturas: getYesNo(form, "contracturas"),
    contracturas_donde: get("contracturas_donde"),
    inflamacion: getYesNo(form, "inflamacion"),
    inflamacion_donde: get("inflamacion_donde"),
    temperatura_piel: get("temperatura_piel"),
    otros_hallazgos: get("otros_hallazgos"),

    kinesiotape_hipersensibilidad: getYesNo(form, "kinesiotape_hipersensibilidad"),
    kinesiotape_zona: get("kinesiotape_zona"),
    auriculoterapia_pabellon: get("auriculoterapia_pabellon"),
    auriculoterapia_puntos: get("auriculoterapia_puntos"),

    consentimiento_firmado: form.querySelector('[name="consentimiento_firmado"]').checked,
    consentimiento_fecha: new Date().toISOString().slice(0, 10),
    rgpd_aceptado: form.querySelector('[name="rgpd_aceptado"]').checked,
  };

  if (!payload.nombre) {
    showToast("El nombre es obligatorio", true);
    return;
  }
  if (!window.isSupabaseConfigured()) {
    showToast("Configura Supabase en js/config.js antes de guardar", true);
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Guardando...";
  try {
    await window.NaromiDB.insert("clients", payload);
    showToast("Ficha guardada correctamente");
    form.reset();
  } catch (err) {
    showToast(err.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar ficha de cliente";
  }
}
