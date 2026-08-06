// =========================================================
// Seccion "Nueva sesion" - se rellena en cada visita. Busca
// un cliente ya existente y muestra un asistente corto segun
// el tipo de tratamiento guardado en su ficha:
//
//  - Quiromasaje: motivo de la consulta (con mapa corporal),
//    tratamiento realizado, recomendaciones y proxima cita.
//  - Maderoterapia: toma de medidas de esta sesion y proxima
//    cita.
// =========================================================

async function renderSessionForm(root) {
  root.innerHTML = "";

  if (!window.isSupabaseConfigured()) {
    root.appendChild(
      el(
        "div",
        { class: "config-warning" },
        "Todavia no has conectado la base de datos. Edita js/config.js para poder registrar sesiones."
      )
    );
    return;
  }

  const selectorCard = el("div", { class: "card" });
  selectorCard.appendChild(el("h2", {}, "Selecciona el cliente"));
  const searchInput = el("input", { type: "text", placeholder: "Busca por nombre o telefono..." });
  searchInput.style.width = "100%";
  searchInput.style.padding = "10px 12px";
  searchInput.style.border = "1px solid var(--border)";
  searchInput.style.borderRadius = "8px";
  const resultsBox = el("div", { style: "margin-top:10px;" });
  selectorCard.appendChild(searchInput);
  selectorCard.appendChild(resultsBox);
  root.appendChild(selectorCard);

  const wizardHolder = el("div");
  root.appendChild(wizardHolder);

  let clients = [];
  try {
    clients = await window.NaromiDB.select("clients", { order: "nombre.asc" });
  } catch (err) {
    showToast(err.message, true);
    return;
  }

  function renderResults(list) {
    resultsBox.innerHTML = "";
    if (list.length === 0) {
      resultsBox.appendChild(
        el("p", { class: "muted" }, "No se encontraron clientes. Crea primero su ficha en 'Nueva ficha'.")
      );
      return;
    }
    const table = el("table", { class: "data" });
    list.slice(0, 8).forEach((c) => {
      const tr = el("tr", { onclick: () => selectClient(c) });
      tr.appendChild(el("td", {}, `${c.nombre} ${c.apellidos || ""}`));
      tr.appendChild(el("td", {}, c.telefono || "-"));
      tr.appendChild(
        el("td", {}, el("span", { class: "badge" }, c.tipo_tratamiento === "maderoterapia" ? "Maderoterapia" : "Quiromasaje"))
      );
      table.appendChild(tr);
    });
    resultsBox.appendChild(table);
  }

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      renderResults([]);
      return;
    }
    const filtered = clients.filter((c) =>
      `${c.nombre} ${c.apellidos || ""} ${c.telefono || ""}`.toLowerCase().includes(q)
    );
    renderResults(filtered);
  });

  async function selectClient(client) {
    searchInput.value = `${client.nombre} ${client.apellidos || ""}`;
    resultsBox.innerHTML = "";
    let sessionCount = 0;
    try {
      const existing = await window.NaromiDB.select("sessions", {
        client_id: `eq.${client.id}`,
        select: "id",
      });
      sessionCount = existing.length;
    } catch (err) {
      // no bloqueante
    }
    startSessionWizard(wizardHolder, client, sessionCount + 1);
  }
}

function startSessionWizard(root, client, numeroSesion) {
  root.innerHTML = "";

  const info = el("div", { class: "card" });
  info.appendChild(el("h2", { style: "border:none;" }, `${client.nombre} ${client.apellidos || ""}`));
  info.appendChild(
    el(
      "p",
      { class: "muted" },
      `Sesion numero ${numeroSesion} · ${client.tipo_tratamiento === "maderoterapia" ? "Maderoterapia" : "Quiromasaje"}`
    )
  );
  root.appendChild(info);

  const wizardBox = el("div");
  root.appendChild(wizardBox);

  const steps =
    client.tipo_tratamiento === "maderoterapia" ? maderoterapiaSesionSteps() : quiromasajeSesionSteps();

  createWizard(wizardBox, {
    data: { fecha: new Date().toISOString().slice(0, 10) },
    steps,
    submitLabel: "Guardar sesion",
    onSubmit: async (data) => {
      await submitSessionWizard(data, client, numeroSesion);
    },
  });
}

function quiromasajeSesionSteps() {
  return [
    {
      title: "Motivo de la consulta",
      build: (stepEl, data) => {
        stepEl.appendChild(formField({ label: "¿Que duele?", name: "que_duele", value: data.que_duele }));
        stepEl.appendChild(
          formField({ label: "¿Desde cuando duele?", name: "desde_cuando", value: data.desde_cuando })
        );
        stepEl.appendChild(formField({ label: "¿Como es el dolor?", name: "como_es_dolor", value: data.como_es_dolor }));
        stepEl.appendChild(painScale("intensidad_dolor", data.intensidad_dolor));

        stepEl.appendChild(el("label", {}, "Zonas donde sientes dolor o molestia"));
        const mapWrap = el("div", { style: "margin-bottom:14px;" });
        stepEl.appendChild(mapWrap);
        let initial = [];
        try {
          initial = data.zonas_dolor ? JSON.parse(data.zonas_dolor) : [];
        } catch (e) {
          initial = [];
        }
        stepEl._bodyMapApi = renderBodyMap(mapWrap, initial);

        stepEl.appendChild(
          formField({
            label: "Tipo de tratamiento que se va a realizar",
            name: "plan_tratamiento",
            value: data.plan_tratamiento,
          })
        );

        const objWrap = el("div", { class: "field" });
        objWrap.appendChild(el("label", {}, "Objetivo del tratamiento"));
        const objGroup = el("div", { class: "pill-group" });
        [
          ["Aliviar dolor", "objetivo_aliviar_dolor"],
          ["Relajacion", "objetivo_relajacion"],
          ["Reducir contracturas", "objetivo_reducir_contracturas"],
          ["Estres", "objetivo_estres"],
          ["Mejorar movilidad", "objetivo_mejorar_movilidad"],
        ].forEach(([label, name]) => objGroup.appendChild(checkboxPill(label, name, data[name])));
        objWrap.appendChild(objGroup);
        stepEl.appendChild(objWrap);
        stepEl.appendChild(formField({ label: "Otro objetivo", name: "objetivo_otro", value: data.objetivo_otro }));
        stepEl.appendChild(
          formField({
            label: "Observaciones",
            name: "observaciones_anamnesis",
            type: "textarea",
            value: data.observaciones_anamnesis,
          })
        );
      },
      onNext: (stepEl, data) => {
        if (stepEl._bodyMapApi) data.zonas_dolor = JSON.stringify(stepEl._bodyMapApi.getSelected());
      },
    },
    {
      title: "Tratamiento realizado",
      build: (stepEl, data) => {
        stepEl.appendChild(formField({ label: "Fecha", name: "fecha", type: "date", value: data.fecha, required: true }));
        stepEl.appendChild(
          formField({ label: "Tecnicas / terapias aplicadas", name: "tecnicas_aplicadas", type: "textarea", value: data.tecnicas_aplicadas })
        );
        stepEl.appendChild(
          formField({ label: "Duracion de la sesion", name: "duracion", placeholder: "ej. 60 minutos", value: data.duracion })
        );
        stepEl.appendChild(
          formField({ label: "Respuesta del cliente durante la sesion", name: "respuesta_cliente", type: "textarea", value: data.respuesta_cliente })
        );
        stepEl.appendChild(formField({ label: "Observaciones", name: "observaciones", type: "textarea", value: data.observaciones }));
      },
    },
    {
      title: "Recomendaciones para casa",
      build: (stepEl, data) => {
        stepEl.appendChild(formField({ label: "", name: "recomendaciones", type: "textarea", value: data.recomendaciones }));
      },
    },
    proximaCitaStep(),
  ];
}

function maderoterapiaSesionSteps() {
  return [
    {
      title: "Seguimiento maderoterapia",
      subtitle: "Medidas de esta sesion (en centimetros).",
      build: (stepEl, data) => {
        stepEl.appendChild(formField({ label: "Fecha", name: "fecha", type: "date", value: data.fecha, required: true }));
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
    proximaCitaStep(),
  ];
}

function proximaCitaStep() {
  return {
    title: "Proxima cita",
    build: (stepEl, data) => {
      const row = el("div", { class: "row" });
      row.appendChild(formField({ label: "Fecha", name: "proxima_cita_fecha", type: "date", value: data.proxima_cita_fecha }));
      row.appendChild(formField({ label: "Hora", name: "proxima_cita_hora", type: "time", value: data.proxima_cita_hora }));
      stepEl.appendChild(row);
    },
  };
}

async function submitSessionWizard(data, client, numeroSesion) {
  const base = {
    client_id: client.id,
    fecha: data.fecha || new Date().toISOString().slice(0, 10),
    numero_sesion: numeroSesion,
    proxima_cita_fecha: strVal(data, "proxima_cita_fecha"),
    proxima_cita_hora: strVal(data, "proxima_cita_hora"),
  };

  let payload = base;

  if (client.tipo_tratamiento === "maderoterapia") {
    payload = {
      ...base,
      medida_cintura: numVal(data, "medida_cintura"),
      medida_cadera_abdomen: numVal(data, "medida_cadera_abdomen"),
      medida_cadera_pierna_dcha: numVal(data, "medida_cadera_pierna_dcha"),
      medida_cadera_pierna_izq: numVal(data, "medida_cadera_pierna_izq"),
      medida_rodilla_dcha: numVal(data, "medida_rodilla_dcha"),
      medida_rodilla_izq: numVal(data, "medida_rodilla_izq"),
      medida_otros: strVal(data, "medida_otros"),
    };
  } else {
    payload = {
      ...base,
      que_duele: strVal(data, "que_duele"),
      desde_cuando: strVal(data, "desde_cuando"),
      como_es_dolor: strVal(data, "como_es_dolor"),
      intensidad_dolor: numVal(data, "intensidad_dolor"),
      zonas_dolor: data.zonas_dolor ? JSON.parse(data.zonas_dolor) : [],
      plan_tratamiento: strVal(data, "plan_tratamiento"),
      objetivo_aliviar_dolor: boolVal(data, "objetivo_aliviar_dolor"),
      objetivo_relajacion: boolVal(data, "objetivo_relajacion"),
      objetivo_reducir_contracturas: boolVal(data, "objetivo_reducir_contracturas"),
      objetivo_estres: boolVal(data, "objetivo_estres"),
      objetivo_mejorar_movilidad: boolVal(data, "objetivo_mejorar_movilidad"),
      objetivo_otro: strVal(data, "objetivo_otro"),
      observaciones_anamnesis: strVal(data, "observaciones_anamnesis"),
      tecnicas_aplicadas: strVal(data, "tecnicas_aplicadas"),
      duracion: strVal(data, "duracion"),
      respuesta_cliente: strVal(data, "respuesta_cliente"),
      observaciones: strVal(data, "observaciones"),
      recomendaciones: strVal(data, "recomendaciones"),
    };
  }

  try {
    await window.NaromiDB.insert("sessions", payload);
    showToast("Sesion guardada correctamente");
    navigate("sesion");
  } catch (err) {
    showToast(err.message, true);
  }
}
