// =========================================================
// Mapa corporal interactivo para marcar zonas de dolor o
// molestia, en lugar de escribirlas a mano. Vista frontal y
// posterior, con zonas tocables. Guarda un array de claves
// tipo "frontal:hombro_derecho" en el campo indicado.
// =========================================================

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function limbZones() {
  return [
    { id: "brazo_izquierdo", shape: "rect", x: 38, y: 85, w: 20, h: 68, rx: 9, label: "Brazo izquierdo" },
    { id: "brazo_derecho", shape: "rect", x: 142, y: 85, w: 20, h: 68, rx: 9, label: "Brazo derecho" },
    { id: "codo_izquierdo", shape: "ellipse", cx: 48, cy: 158, rx: 12, ry: 10, label: "Codo izquierdo" },
    { id: "codo_derecho", shape: "ellipse", cx: 152, cy: 158, rx: 12, ry: 10, label: "Codo derecho" },
    { id: "antebrazo_izquierdo", shape: "rect", x: 36, y: 166, w: 18, h: 54, rx: 8, label: "Antebrazo izquierdo" },
    { id: "antebrazo_derecho", shape: "rect", x: 146, y: 166, w: 18, h: 54, rx: 8, label: "Antebrazo derecho" },
    { id: "mano_izquierda", shape: "ellipse", cx: 45, cy: 233, rx: 12, ry: 15, label: "Mano izquierda" },
    { id: "mano_derecha", shape: "ellipse", cx: 155, cy: 233, rx: 12, ry: 15, label: "Mano derecha" },
    { id: "muslo_izquierdo", shape: "rect", x: 70, y: 197, w: 26, h: 68, rx: 10, label: "Muslo izquierdo" },
    { id: "muslo_derecho", shape: "rect", x: 104, y: 197, w: 26, h: 68, rx: 10, label: "Muslo derecho" },
    { id: "rodilla_izquierda", shape: "ellipse", cx: 83, cy: 270, rx: 14, ry: 11, label: "Rodilla izquierda" },
    { id: "rodilla_derecha", shape: "ellipse", cx: 117, cy: 270, rx: 14, ry: 11, label: "Rodilla derecha" },
    { id: "pierna_izquierda", shape: "rect", x: 72, y: 282, w: 22, h: 63, rx: 9, label: "Pierna izquierda" },
    { id: "pierna_derecha", shape: "rect", x: 106, y: 282, w: 22, h: 63, rx: 9, label: "Pierna derecha" },
    { id: "pie_izquierdo", shape: "ellipse", cx: 83, cy: 360, rx: 14, ry: 9, label: "Pie izquierdo" },
    { id: "pie_derecho", shape: "ellipse", cx: 117, cy: 360, rx: 14, ry: 9, label: "Pie derecho" },
  ];
}

function frontZones() {
  return [
    { id: "cabeza", shape: "ellipse", cx: 100, cy: 30, rx: 22, ry: 26, label: "Cabeza" },
    { id: "cuello", shape: "rect", x: 88, y: 54, w: 24, h: 14, label: "Cuello" },
    { id: "hombro_izquierdo", shape: "ellipse", cx: 60, cy: 78, rx: 16, ry: 12, label: "Hombro izquierdo" },
    { id: "hombro_derecho", shape: "ellipse", cx: 140, cy: 78, rx: 16, ry: 12, label: "Hombro derecho" },
    { id: "pecho", shape: "rect", x: 70, y: 68, w: 60, h: 50, rx: 10, label: "Pecho" },
    { id: "abdomen", shape: "rect", x: 72, y: 120, w: 56, h: 42, rx: 10, label: "Abdomen" },
    { id: "cadera", shape: "rect", x: 68, y: 164, w: 64, h: 30, rx: 12, label: "Cadera" },
    ...limbZones(),
  ];
}

function backZones() {
  return [
    { id: "cabeza", shape: "ellipse", cx: 100, cy: 30, rx: 22, ry: 26, label: "Cabeza (parte posterior)" },
    { id: "cuello", shape: "rect", x: 88, y: 54, w: 24, h: 14, label: "Nuca" },
    { id: "hombro_izquierdo", shape: "ellipse", cx: 60, cy: 78, rx: 16, ry: 12, label: "Hombro izquierdo" },
    { id: "hombro_derecho", shape: "ellipse", cx: 140, cy: 78, rx: 16, ry: 12, label: "Hombro derecho" },
    { id: "espalda_alta", shape: "rect", x: 70, y: 68, w: 60, h: 50, rx: 10, label: "Espalda alta" },
    { id: "espalda_baja", shape: "rect", x: 72, y: 120, w: 56, h: 42, rx: 10, label: "Espalda baja / lumbar" },
    { id: "gluteos", shape: "rect", x: 68, y: 164, w: 64, h: 30, rx: 12, label: "Gluteos" },
    ...limbZones(),
  ];
}

/**
 * Renderiza el mapa corporal dentro de `container`.
 * @param {HTMLElement} container
 * @param {Array} initialSelected  ej: ["frontal:hombro_derecho", "posterior:espalda_baja"]
 * @returns {{ getSelected: () => string[] }}
 */
function renderBodyMap(container, initialSelected = []) {
  container.innerHTML = "";
  let view = "frontal";
  const selected = new Set(initialSelected);

  const wrap = el("div", { class: "bodymap" });
  const toggleRow = el("div", { class: "bodymap-toggle" });
  const btnFront = el("button", { type: "button", class: "small secondary active" }, "Vista frontal");
  const btnBack = el("button", { type: "button", class: "small secondary" }, "Vista posterior");
  toggleRow.appendChild(btnFront);
  toggleRow.appendChild(btnBack);
  wrap.appendChild(toggleRow);

  const svgHolder = el("div", { class: "bodymap-svg" });
  wrap.appendChild(svgHolder);

  const chipsWrap = el("div", { class: "bodymap-chips" });
  wrap.appendChild(chipsWrap);

  container.appendChild(wrap);

  function zoneKey(view, id) {
    return `${view}:${id}`;
  }

  function renderChips() {
    chipsWrap.innerHTML = "";
    if (selected.size === 0) {
      chipsWrap.appendChild(el("p", { class: "muted" }, "Toca una zona del dibujo para marcarla."));
      return;
    }
    selected.forEach((key) => {
      const [v, id] = key.split(":");
      const zones = v === "frontal" ? frontZones() : backZones();
      const zone = zones.find((z) => z.id === id);
      const label = zone ? zone.label : id;
      const chip = el("button", { type: "button", class: "bodymap-chip" }, `${label} (${v}) ×`);
      chip.addEventListener("click", () => {
        selected.delete(key);
        renderSvg();
        renderChips();
      });
      chipsWrap.appendChild(chip);
    });
  }

  function renderSvg() {
    svgHolder.innerHTML = "";
    const zones = view === "frontal" ? frontZones() : backZones();
    const svg = svgEl("svg", { viewBox: "0 0 200 380", class: "bodymap-figure" });

    zones.forEach((zone) => {
      let shape;
      if (zone.shape === "ellipse") {
        shape = svgEl("ellipse", { cx: zone.cx, cy: zone.cy, rx: zone.rx, ry: zone.ry });
      } else {
        shape = svgEl("rect", { x: zone.x, y: zone.y, width: zone.w, height: zone.h, rx: zone.rx || 6 });
      }
      const key = zoneKey(view, zone.id);
      shape.setAttribute("class", "bodymap-zone" + (selected.has(key) ? " selected" : ""));
      shape.setAttribute("tabindex", "0");
      shape.setAttribute("role", "button");
      shape.setAttribute("aria-label", zone.label);
      const toggle = () => {
        if (selected.has(key)) selected.delete(key);
        else selected.add(key);
        renderSvg();
        renderChips();
      };
      shape.addEventListener("click", toggle);
      shape.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
      const title = svgEl("title", {});
      title.textContent = zone.label;
      shape.appendChild(title);
      svg.appendChild(shape);
    });

    svgHolder.appendChild(svg);
  }

  btnFront.addEventListener("click", () => {
    view = "frontal";
    btnFront.classList.add("active");
    btnBack.classList.remove("active");
    renderSvg();
  });
  btnBack.addEventListener("click", () => {
    view = "posterior";
    btnBack.classList.add("active");
    btnFront.classList.remove("active");
    renderSvg();
  });

  renderSvg();
  renderChips();

  return {
    getSelected: () => Array.from(selected),
  };
}

window.renderBodyMap = renderBodyMap;
