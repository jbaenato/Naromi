// =========================================================
// Seccion "Nueva sesion" - Registro de cada visita.
// Secciones 5, 7, 8 y 9 del formulario en papel.
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
  selectorCard.appendChild(sectionTitle("", "Selecciona el cliente"));
  const searchInput = el("input", { type: "text", placeholder: "Busca por nombre o telefono..." });
  searchInput.style.width = "100%";
  searchInput.style.padding = "10px 12px";
  searchInput.style.border = "1px solid var(--border)";
  searchInput.style.borderRadius = "8px";
  const resultsBox = el("div", { style: "margin-top:10px;" });
  selectorCard.appendChild(searchInput);
  selectorCard.appendChild(resultsBox);
  root.appendChild(selectorCard);

  const formHolder = el("div");
  root.appendChild(formHolder);

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
      resultsBox.appendChild(el("p", { class: "muted" }, "No se encontraron clientes. Crea primero su ficha en 'Nueva ficha'."));
      return;
    }
    const table = el("table", { class: "data" });
    list.slice(0, 8).forEach((c) => {
      const tr = el("tr", {
        onclick: () => selectClient(c),
      });
      tr.appendChild(el("td", {}, `${c.nombre} ${c.apellidos || ""}`));
      tr.appendChild(el("td", {}, c.telefono || "-"));
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
    renderSessionFields(formHolder, client, sessionCount + 1);
  }
}

function renderSessionFields(root, client, nextSessionNumber) {
  root.innerHTML = "";
  const form = el("form", {});

  const info = el("div", { class: "card" });
  info.appendChild(el("h2", { style: "border:none;" }, `Cliente: ${client.nombre} ${client.apellidos || ""}`));
  info.appendChild(el("p", { class: "muted" }, `Sesion numero ${nextSessionNumber}`));
  form.appendChild(info);

  // ---- 5. Tratamiento realizado ----
  const s5 = el("div", { class: "card" });
  s5.appendChild(sectionTitle(5, "Tratamiento realizado"));
  const row = el("div", { class: "row" });
  row.appendChild(formField({ label: "Fecha", name: "fecha", type: "date", value: new Date().toISOString().slice(0, 10) }));
  row.appendChild(formField({ label: "Sesion n.", name: "numero_sesion", type: "number", value: nextSessionNumber }));
  s5.appendChild(row);
  s5.appendChild(formField({ label: "Tecnicas / terapias aplicadas", name: "tecnicas_aplicadas", type: "textarea" }));
  s5.appendChild(formField({ label: "Duracion de la sesion", name: "duracion", placeholder: "ej. 60 minutos" }));
  s5.appendChild(formField({ label: "Respuesta del cliente durante la sesion", name: "respuesta_cliente", type: "textarea" }));
  s5.appendChild(formField({ label: "Observaciones", name: "observaciones", type: "textarea" }));
  form.appendChild(s5);

  // ---- 7. Seguimiento maderoterapia ----
  const s7 = el("div", { class: "card" });
  s7.appendChild(sectionTitle(7, "Seguimiento maderoterapia (medidas en cm)"));
  const r1 = el("div", { class: "row" });
  r1.appendChild(formField({ label: "Abdomen - Cintura", name: "medida_cintura", type: "number" }));
  r1.appendChild(formField({ label: "Abdomen - Cadera", name: "medida_cadera_abdomen", type: "number" }));
  s7.appendChild(r1);
  const r2 = el("div", { class: "row" });
  r2.appendChild(formField({ label: "Piernas - Cadera Dcha.", name: "medida_cadera_pierna_dcha", type: "number" }));
  r2.appendChild(formField({ label: "Piernas - Cadera Izq.", name: "medida_cadera_pierna_izq", type: "number" }));
  s7.appendChild(r2);
  const r3 = el("div", { class: "row" });
  r3.appendChild(formField({ label: "Piernas - Rodilla Dcha.", name: "medida_rodilla_dcha", type: "number" }));
  r3.appendChild(formField({ label: "Piernas - Rodilla Izq.", name: "medida_rodilla_izq", type: "number" }));
  s7.appendChild(r3);
  s7.appendChild(formField({ label: "Otros", name: "medida_otros" }));
  form.appendChild(s7);

  // ---- 8. Recomendaciones ----
  const s8 = el("div", { class: "card" });
  s8.appendChild(sectionTitle(8, "Recomendaciones para casa"));
  s8.appendChild(formField({ label: "", name: "recomendaciones", type: "textarea" }));
  form.appendChild(s8);

  // ---- 9. Proxima cita ----
  const s9 = el("div", { class: "card" });
  s9.appendChild(sectionTitle(9, "Proxima cita"));
  const r9 = el("div", { class: "row" });
  r9.appendChild(formField({ label: "Fecha", name: "proxima_cita_fecha", type: "date" }));
  r9.appendChild(formField({ label: "Hora", name: "proxima_cita_hora", type: "time" }));
  s9.appendChild(r9);
  form.appendChild(s9);

  form.appendChild(el("button", { type: "submit", class: "primary" }, "Guardar sesion"));
  root.appendChild(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitSessionForm(form, client.id);
  });
}

async function submitSessionForm(form, clientId) {
  const fd = new FormData(form);
  const get = (name) => fd.get(name) || null;
  const num = (name) => (fd.get(name) ? Number(fd.get(name)) : null);

  const payload = {
    client_id: clientId,
    fecha: get("fecha"),
    numero_sesion: num("numero_sesion"),
    tecnicas_aplicadas: get("tecnicas_aplicadas"),
    duracion: get("duracion"),
    respuesta_cliente: get("respuesta_cliente"),
    observaciones: get("observaciones"),
    medida_cintura: num("medida_cintura"),
    medida_cadera_abdomen: num("medida_cadera_abdomen"),
    medida_cadera_pierna_dcha: num("medida_cadera_pierna_dcha"),
    medida_cadera_pierna_izq: num("medida_cadera_pierna_izq"),
    medida_rodilla_dcha: num("medida_rodilla_dcha"),
    medida_rodilla_izq: num("medida_rodilla_izq"),
    medida_otros: get("medida_otros"),
    recomendaciones: get("recomendaciones"),
    proxima_cita_fecha: get("proxima_cita_fecha"),
    proxima_cita_hora: get("proxima_cita_hora"),
  };

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Guardando...";
  try {
    await window.NaromiDB.insert("sessions", payload);
    showToast("Sesion guardada correctamente");
    form.reset();
  } catch (err) {
    showToast(err.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar sesion";
  }
}
