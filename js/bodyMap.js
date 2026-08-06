// =========================================================
// Mapa corporal anatomico interactivo para marcar zonas de
// dolor o molestia, en lugar de escribirlas a mano. Usa la
// ilustracion anatomica real (img/bodymap-front.jpg y
// img/bodymap-back.jpg) con zonas musculares/articulares
// tocables superpuestas. Guarda un array de claves tipo
// "frontal:pectoral_derecho" en el campo indicado.
// =========================================================

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// Las dos ilustraciones comparten el mismo lienzo de referencia
// (480 x 1000), asi que las zonas se definen en esas coordenadas.
const BODY_VIEWBOX = "0 0 480 1000";
const IMAGES = {
  frontal: "img/bodymap-front.jpg",
  posterior: "img/bodymap-back.jpg",
};

// ---------------------------------------------------------
// Zonas tocables - vista frontal: musculos principales +
// articulaciones/extremidades, calibradas sobre la imagen.
// ---------------------------------------------------------
function frontZones() {
  return [
    { id: "cabeza", shape: "ellipse", cx: 242, cy: 78, rx: 40, ry: 68, label: "Cabeza" },
    { id: "cuello", shape: "rect", x: 220, y: 132, w: 45, h: 33, label: "Cuello" },
    { id: "deltoides_izquierdo", shape: "ellipse", cx: 177, cy: 235, rx: 30, ry: 42, label: "Deltoides izquierdo" },
    { id: "deltoides_derecho", shape: "ellipse", cx: 308, cy: 235, rx: 30, ry: 42, label: "Deltoides derecho" },
    {
      id: "pectoral_izquierdo",
      shape: "path",
      d: "M182,205 C197,196 220,193 240,199 C243,245 241,280 233,310 C210,314 191,303 183,280 C177,258 178,227 182,205 Z",
      label: "Pectoral izquierdo",
    },
    {
      id: "pectoral_derecho",
      shape: "path",
      d: "M303,205 C288,196 265,193 245,199 C242,245 244,280 252,310 C275,314 294,303 302,280 C308,258 307,227 303,205 Z",
      label: "Pectoral derecho",
    },
    {
      id: "abdominales",
      shape: "path",
      d: "M207,305 C207,300 217,297 242,297 C268,297 278,300 278,305 L278,415 C278,425 264,432 242,432 C221,432 207,425 207,415 Z",
      label: "Abdominales",
    },
    { id: "oblicuo_izquierdo", shape: "path", d: "M180,308 L206,303 L206,410 L184,405 Z", label: "Oblicuo izquierdo" },
    { id: "oblicuo_derecho", shape: "path", d: "M305,308 L279,303 L279,410 L301,405 Z", label: "Oblicuo derecho" },
    { id: "biceps_izquierdo", shape: "ellipse", cx: 157, cy: 298, rx: 24, ry: 58, label: "Biceps izquierdo" },
    { id: "biceps_derecho", shape: "ellipse", cx: 328, cy: 298, rx: 24, ry: 58, label: "Biceps derecho" },
    { id: "antebrazo_izquierdo", shape: "ellipse", cx: 132, cy: 425, rx: 18, ry: 55, label: "Antebrazo izquierdo" },
    { id: "antebrazo_derecho", shape: "ellipse", cx: 352, cy: 425, rx: 18, ry: 55, label: "Antebrazo derecho" },
    { id: "mano_izquierda", shape: "ellipse", cx: 105, cy: 535, rx: 38, ry: 52, label: "Mano izquierda" },
    { id: "mano_derecha", shape: "ellipse", cx: 378, cy: 535, rx: 38, ry: 52, label: "Mano derecha" },
    {
      id: "cuadriceps_izquierdo",
      shape: "path",
      d: "M197,440 C207,432 220,430 228,434 L225,650 C215,658 202,656 197,648 Z",
      label: "Cuadriceps izquierdo",
    },
    {
      id: "cuadriceps_derecho",
      shape: "path",
      d: "M285,440 C275,432 262,430 254,434 L257,650 C267,658 280,656 285,648 Z",
      label: "Cuadriceps derecho",
    },
    { id: "rodilla_izquierda", shape: "ellipse", cx: 211, cy: 655, rx: 25, ry: 22, label: "Rodilla izquierda" },
    { id: "rodilla_derecha", shape: "ellipse", cx: 271, cy: 655, rx: 25, ry: 22, label: "Rodilla derecha" },
    {
      id: "tibial_izquierdo",
      shape: "path",
      d: "M199,680 C207,675 216,675 222,680 L219,870 C213,876 203,876 199,870 Z",
      label: "Tibial anterior izquierdo",
    },
    {
      id: "tibial_derecho",
      shape: "path",
      d: "M283,680 C275,675 266,675 260,680 L263,870 C269,876 279,876 283,870 Z",
      label: "Tibial anterior derecho",
    },
    { id: "pie_izquierdo", shape: "ellipse", cx: 198, cy: 945, rx: 42, ry: 35, label: "Pie izquierdo" },
    { id: "pie_derecho", shape: "ellipse", cx: 284, cy: 945, rx: 42, ry: 35, label: "Pie derecho" },
  ];
}

// ---------------------------------------------------------
// Zonas tocables - vista posterior.
// ---------------------------------------------------------
function backZones() {
  return [
    { id: "cabeza", shape: "ellipse", cx: 242, cy: 78, rx: 40, ry: 68, label: "Cabeza (nuca)" },
    { id: "cuello", shape: "rect", x: 220, y: 132, w: 45, h: 33, label: "Nuca" },
    {
      id: "trapecio",
      shape: "path",
      d: "M242,168 C270,172 300,185 315,205 L290,240 C275,222 260,212 242,210 C224,212 209,222 194,240 L169,205 C184,185 214,172 242,168 Z",
      label: "Trapecio",
    },
    { id: "deltoides_izquierdo", shape: "ellipse", cx: 177, cy: 235, rx: 30, ry: 42, label: "Deltoides posterior izquierdo" },
    { id: "deltoides_derecho", shape: "ellipse", cx: 308, cy: 235, rx: 30, ry: 42, label: "Deltoides posterior derecho" },
    {
      id: "dorsal_izquierdo",
      shape: "path",
      d: "M185,215 C175,240 172,270 178,300 C184,325 198,345 218,352 L218,235 C205,225 194,218 185,215 Z",
      label: "Dorsal ancho izquierdo",
    },
    {
      id: "dorsal_derecho",
      shape: "path",
      d: "M300,215 C310,240 313,270 307,300 C301,325 287,345 267,352 L267,235 C280,225 291,218 300,215 Z",
      label: "Dorsal ancho derecho",
    },
    { id: "triceps_izquierdo", shape: "ellipse", cx: 157, cy: 298, rx: 24, ry: 58, label: "Triceps izquierdo" },
    { id: "triceps_derecho", shape: "ellipse", cx: 328, cy: 298, rx: 24, ry: 58, label: "Triceps derecho" },
    { id: "antebrazo_izquierdo", shape: "ellipse", cx: 132, cy: 425, rx: 18, ry: 55, label: "Antebrazo izquierdo" },
    { id: "antebrazo_derecho", shape: "ellipse", cx: 352, cy: 425, rx: 18, ry: 55, label: "Antebrazo derecho" },
    { id: "mano_izquierda", shape: "ellipse", cx: 105, cy: 535, rx: 38, ry: 52, label: "Mano izquierda" },
    { id: "mano_derecha", shape: "ellipse", cx: 378, cy: 535, rx: 38, ry: 52, label: "Mano derecha" },
    {
      id: "lumbares",
      shape: "path",
      d: "M212,352 C222,347 232,347 242,350 C252,347 262,347 272,352 L272,412 C262,420 252,422 242,422 C232,422 222,420 212,412 Z",
      label: "Zona lumbar",
    },
    {
      id: "gluteo_izquierdo",
      shape: "path",
      d: "M180,410 C195,400 215,398 228,405 L228,510 C215,522 195,522 182,510 C176,480 176,440 180,410 Z",
      label: "Gluteo izquierdo",
    },
    {
      id: "gluteo_derecho",
      shape: "path",
      d: "M304,410 C289,400 269,398 256,405 L256,510 C269,522 289,522 302,510 C308,480 308,440 304,410 Z",
      label: "Gluteo derecho",
    },
    {
      id: "isquiotibial_izquierdo",
      shape: "path",
      d: "M198,520 C208,514 220,513 228,517 L225,648 C217,655 205,654 199,647 Z",
      label: "Isquiotibial izquierdo",
    },
    {
      id: "isquiotibial_derecho",
      shape: "path",
      d: "M286,520 C276,514 264,513 256,517 L259,648 C267,655 279,654 285,647 Z",
      label: "Isquiotibial derecho",
    },
    { id: "rodilla_izquierda", shape: "ellipse", cx: 211, cy: 655, rx: 25, ry: 20, label: "Hueco popliteo (rodilla izquierda)" },
    { id: "rodilla_derecha", shape: "ellipse", cx: 271, cy: 655, rx: 25, ry: 20, label: "Hueco popliteo (rodilla derecha)" },
    {
      id: "gemelo_izquierdo",
      shape: "path",
      d: "M196,682 C206,675 218,675 226,682 C230,715 228,760 218,790 C210,795 200,793 196,785 C192,750 192,715 196,682 Z",
      label: "Gemelo izquierdo",
    },
    {
      id: "gemelo_derecho",
      shape: "path",
      d: "M286,682 C276,675 264,675 256,682 C252,715 254,760 264,790 C272,795 282,793 286,785 C290,750 290,715 286,682 Z",
      label: "Gemelo derecho",
    },
    { id: "pie_izquierdo", shape: "ellipse", cx: 198, cy: 945, rx: 42, ry: 35, label: "Pie izquierdo" },
    { id: "pie_derecho", shape: "ellipse", cx: 284, cy: 945, rx: 42, ry: 35, label: "Pie derecho" },
  ];
}

/**
 * Renderiza el mapa corporal dentro de `container`.
 * @param {HTMLElement} container
 * @param {Array} initialSelected  ej: ["frontal:pectoral_derecho", "posterior:lumbares"]
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
      chipsWrap.appendChild(el("p", { class: "muted" }, "Toca un musculo o zona del dibujo para marcarla."));
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
    const svg = svgEl("svg", { viewBox: BODY_VIEWBOX, class: "bodymap-figure" });

    const image = svgEl("image", {
      href: IMAGES[view],
      x: 0,
      y: 0,
      width: 480,
      height: 1000,
      preserveAspectRatio: "xMidYMid meet",
    });
    svg.appendChild(image);

    const zonesGroup = svgEl("g", { class: "bodymap-zones" });
    zones.forEach((zone) => {
      let shape;
      if (zone.shape === "ellipse") {
        shape = svgEl("ellipse", { cx: zone.cx, cy: zone.cy, rx: zone.rx, ry: zone.ry });
      } else if (zone.shape === "path") {
        shape = svgEl("path", { d: zone.d });
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
      zonesGroup.appendChild(shape);
    });
    svg.appendChild(zonesGroup);

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
