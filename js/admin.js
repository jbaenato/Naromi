// =========================================================
// Panel de administracion - listado de clientes, ficha
// detallada, historico de sesiones y exportacion CSV para
// analisis posterior (Excel, hojas de calculo, BI...).
// =========================================================

async function renderAdmin(root) {
  root.innerHTML = "";

  if (!window.isSupabaseConfigured()) {
    root.appendChild(
      el(
        "div",
        { class: "config-warning" },
        "Todavia no has conectado la base de datos. Edita js/config.js para ver los datos guardados."
      )
    );
    return;
  }

  const actions = el("div", { class: "actions-bar" });
  const exportClientsBtn = el("button", { class: "secondary" }, "Exportar clientes (CSV)");
  const exportSessionsBtn = el("button", { class: "secondary" }, "Exportar sesiones (CSV)");
  actions.appendChild(exportClientsBtn);
  actions.appendChild(exportSessionsBtn);
  root.appendChild(actions);

  const searchBar = el("div", { class: "search-bar" });
  const searchInput = el("input", { type: "text", placeholder: "Buscar cliente por nombre o telefono..." });
  searchBar.appendChild(searchInput);
  root.appendChild(searchBar);

  const listBox = el("div");
  root.appendChild(listBox);

  const detailBox = el("div");
  root.appendChild(detailBox);

  let clients = [];
  try {
    clients = await window.NaromiDB.select("clients", { order: "created_at.desc" });
  } catch (err) {
    showToast(err.message, true);
    return;
  }

  if (clients.length === 0) {
    listBox.appendChild(el("div", { class: "empty-state" }, "Todavia no hay clientes registrados. Crea una ficha en 'Nueva ficha'."));
  }

  function renderList(list) {
    listBox.innerHTML = "";
    detailBox.innerHTML = "";
    if (list.length === 0 && clients.length > 0) {
      listBox.appendChild(el("div", { class: "empty-state" }, "Sin resultados para esa busqueda."));
      return;
    }
    const table = el("table", { class: "data" });
    const thead = el("thead", {});
    const headRow = el("tr", {});
    ["Nombre", "Telefono", "Tipo", "Alta"].forEach((h) => headRow.appendChild(el("th", {}, h)));
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = el("tbody", {});
    list.forEach((c) => {
      const tr = el("tr", { onclick: () => showDetail(c) });
      tr.appendChild(el("td", {}, `${c.nombre} ${c.apellidos || ""}`));
      tr.appendChild(el("td", {}, c.telefono || "-"));
      tr.appendChild(
        el("td", {}, el("span", { class: "badge" }, c.tipo_tratamiento === "maderoterapia" ? "Maderoterapia" : "Quiromasaje"))
      );
      tr.appendChild(el("td", {}, fmtDate(c.created_at)));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    const card = el("div", { class: "card" });
    card.appendChild(table);
    listBox.appendChild(card);
  }

  renderList(clients);

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = !q
      ? clients
      : clients.filter((c) => `${c.nombre} ${c.apellidos || ""} ${c.telefono || ""}`.toLowerCase().includes(q));
    renderList(filtered);
  });

  exportClientsBtn.addEventListener("click", () => {
    downloadCSV("naromi_clientes.csv", clients);
  });

  exportSessionsBtn.addEventListener("click", async () => {
    try {
      const sessions = await window.NaromiDB.select("sessions", { order: "fecha.desc" });
      downloadCSV("naromi_sesiones.csv", sessions);
    } catch (err) {
      showToast(err.message, true);
    }
  });

  async function showDetail(client) {
    detailBox.innerHTML = "";
    const card = el("div", { class: "card" });

    const header = el("div", { class: "detail-header" });
    const nameBlock = el("div");
    nameBlock.appendChild(el("h2", { style: "border:none;" }, `${client.nombre} ${client.apellidos || ""}`));
    nameBlock.appendChild(
      el(
        "p",
        { class: "muted" },
        [client.telefono, client.email, client.direccion].filter(Boolean).join(" · ") || "Sin datos de contacto"
      )
    );
    header.appendChild(nameBlock);
    const isMadero = client.tipo_tratamiento === "maderoterapia";
    header.appendChild(el("span", { class: "badge" }, isMadero ? "Maderoterapia" : "Quiromasaje"));
    const exportOneBtn = el("button", { class: "secondary small" }, "Exportar sesiones de este cliente");
    header.appendChild(exportOneBtn);
    card.appendChild(header);

    card.appendChild(el("h2", { style: "margin-top:18px;" }, "Resumen de la ficha"));
    const summaryRows = isMadero
      ? [
          ["Actividad fisica", client.actividad_fisica],
          ["Nivel de estres", client.nivel_estres],
          ["Calidad del sueno", client.calidad_sueno],
        ]
      : [
          ["¿Padece alguna enfermedad?", client.padece_enfermedad],
          ["¿Tiene alergias?", client.tiene_alergias === true ? `Si (${client.alergia_a || "sin detalle"})` : client.tiene_alergias === false ? "No" : null],
          ["Observacion postural", client.observacion_postural],
        ];
    summaryRows.forEach(([label, value]) => {
      if (value === null || value === undefined || value === "") return;
      const row = el("div", { class: "check-row" });
      row.appendChild(el("span", { class: "muted" }, label));
      row.appendChild(el("span", {}, String(value)));
      card.appendChild(row);
    });

    card.appendChild(el("h2", { style: "margin-top:18px;" }, "Historial de sesiones"));
    const sessionsBox = el("div");
    card.appendChild(sessionsBox);
    detailBox.appendChild(card);

    try {
      const sessions = await window.NaromiDB.select("sessions", {
        client_id: `eq.${client.id}`,
        order: "numero_sesion.desc",
      });
      if (sessions.length === 0) {
        sessionsBox.appendChild(el("p", { class: "muted" }, "Este cliente todavia no tiene sesiones registradas."));
      } else {
        const table = el("table", { class: "data" });
        const thead = el("thead", {});
        const headRow = el("tr", {});
        const cols = isMadero
          ? ["Fecha", "N.", "Cintura", "Cadera", "Rodilla D/I", "Proxima cita"]
          : ["Fecha", "N.", "Que duele", "Tecnicas", "Proxima cita"];
        cols.forEach((h) => headRow.appendChild(el("th", {}, h)));
        thead.appendChild(headRow);
        table.appendChild(thead);
        const tbody = el("tbody", {});
        sessions.forEach((s) => {
          const tr = el("tr", {});
          tr.appendChild(el("td", {}, fmtDate(s.fecha)));
          tr.appendChild(el("td", {}, s.numero_sesion ?? "-"));
          if (isMadero) {
            tr.appendChild(el("td", {}, s.medida_cintura ?? "-"));
            tr.appendChild(el("td", {}, s.medida_cadera_abdomen ?? "-"));
            tr.appendChild(el("td", {}, `${s.medida_rodilla_dcha ?? "-"} / ${s.medida_rodilla_izq ?? "-"}`));
          } else {
            tr.appendChild(el("td", {}, s.que_duele || "-"));
            tr.appendChild(el("td", {}, s.tecnicas_aplicadas || "-"));
          }
          tr.appendChild(
            el(
              "td",
              {},
              s.proxima_cita_fecha ? `${fmtDate(s.proxima_cita_fecha)} ${s.proxima_cita_hora || ""}` : "-"
            )
          );
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        sessionsBox.appendChild(table);
      }

      exportOneBtn.addEventListener("click", () => {
        downloadCSV(`naromi_sesiones_${(client.nombre || "cliente").replace(/\s+/g, "_")}.csv`, sessions);
      });
    } catch (err) {
      showToast(err.message, true);
    }

    detailBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
