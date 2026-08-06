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
    { id: "cuello", shape: "rect", x: 218, y: 132, w: 48, h: 33, label: "Cuello" },
    {
      id: "pectoral_izquierdo",
      shape: "path",
      d: "M195,205 C205,197 220,193 240,199 C243,245 241,280 233,310 C213,314 198,304 192,282 C188,262 190,235 195,205 Z",
      label: "Pectoral izquierdo",
    },
    {
      id: "pectoral_derecho",
      shape: "path",
      d: "M289,205 C279,197 264,193 244,199 C241,245 243,280 251,310 C271,314 286,304 292,282 C296,262 294,235 289,205 Z",
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
    { id: "deltoides_izquierdo", shape: "ellipse", cx: 168, cy: 238, rx: 36, ry: 50, label: "Deltoides izquierdo (hombro)" },
    { id: "deltoides_derecho", shape: "ellipse", cx: 317, cy: 238, rx: 36, ry: 50, label: "Deltoides derecho (hombro)" },
    { id: "biceps_izquierdo", shape: "ellipse", cx: 153, cy: 300, rx: 27, ry: 62, label: "Biceps izquierdo" },
    { id: "biceps_derecho", shape: "ellipse", cx: 332, cy: 300, rx: 27, ry: 62, label: "Biceps derecho" },
    { id: "antebrazo_izquierdo", shape: "ellipse", cx: 128, cy: 415, rx: 19, ry: 48, label: "Antebrazo izquierdo" },
    { id: "antebrazo_derecho", shape: "ellipse", cx: 357, cy: 415, rx: 19, ry: 48, label: "Antebrazo derecho" },
    { id: "muneca_izquierda", shape: "ellipse", cx: 100, cy: 478, rx: 20, ry: 20, label: "Muñeca izquierda" },
    { id: "muneca_derecha", shape: "ellipse", cx: 385, cy: 478, rx: 20, ry: 20, label: "Muñeca derecha" },
    { id: "mano_izquierda", shape: "ellipse", cx: 103, cy: 535, rx: 38, ry: 52, label: "Mano izquierda" },
    { id: "mano_derecha", shape: "ellipse", cx: 380, cy: 535, rx: 38, ry: 52, label: "Mano derecha" },
    {
      id: "cuadriceps_izquierdo",
      shape: "path",
      d: "M173,445 C182,435 197,430 210,430 C222,430 232,435 236,443 L228,630 C218,640 197,640 184,630 Z",
      label: "Cuadriceps izquierdo",
    },
    {
      id: "cuadriceps_derecho",
      shape: "path",
      d: "M311,445 C302,435 287,430 274,430 C262,430 252,435 248,443 L256,630 C266,640 287,640 300,630 Z",
      label: "Cuadriceps derecho",
    },
    { id: "rodilla_izquierda", shape: "ellipse", cx: 211, cy: 655, rx: 28, ry: 24, label: "Rodilla izquierda" },
    { id: "rodilla_derecha", shape: "ellipse", cx: 271, cy: 655, rx: 28, ry: 24, label: "Rodilla derecha" },
    {
      id: "tibial_izquierdo",
      shape: "path",
      d: "M192,682 C202,675 220,675 230,682 L222,850 C214,858 200,858 192,850 Z",
      label: "Tibial anterior izquierdo",
    },
    {
      id: "tibial_derecho",
      shape: "path",
      d: "M292,682 C282,675 264,675 254,682 L262,850 C270,858 284,858 292,850 Z",
      label: "Tibial anterior derecho",
    },
    { id: "tobillo_izquierdo", shape: "ellipse", cx: 207, cy: 872, rx: 20, ry: 16, label: "Tobillo izquierdo" },
    { id: "tobillo_derecho", shape: "ellipse", cx: 275, cy: 872, rx: 20, ry: 16, label: "Tobillo derecho" },
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
    {
      id: "dorsal_izquierdo",
      shape: "path",
      d: "M185,215 C173,242 170,272 177,302 C184,328 199,348 220,354 L220,235 C206,225 195,218 185,215 Z",
      label: "Dorsal ancho izquierdo",
    },
    {
      id: "dorsal_derecho",
      shape: "path",
      d: "M299,215 C311,242 314,272 307,302 C300,328 285,348 264,354 L264,235 C278,225 289,218 299,215 Z",
      label: "Dorsal ancho derecho",
    },
    { id: "deltoides_izquierdo", shape: "ellipse", cx: 168, cy: 238, rx: 36, ry: 50, label: "Deltoides posterior izquierdo (hombro)" },
    { id: "deltoides_derecho", shape: "ellipse", cx: 317, cy: 238, rx: 36, ry: 50, label: "Deltoides posterior derecho (hombro)" },
    { id: "triceps_izquierdo", shape: "ellipse", cx: 153, cy: 300, rx: 27, ry: 62, label: "Triceps izquierdo" },
    { id: "triceps_derecho", shape: "ellipse", cx: 332, cy: 300, rx: 27, ry: 62, label: "Triceps derecho" },
    { id: "antebrazo_izquierdo", shape: "ellipse", cx: 128, cy: 415, rx: 19, ry: 48, label: "Antebrazo izquierdo" },
    { id: "antebrazo_derecho", shape: "ellipse", cx: 357, cy: 415, rx: 19, ry: 48, label: "Antebrazo derecho" },
    { id: "muneca_izquierda", shape: "ellipse", cx: 100, cy: 478, rx: 20, ry: 20, label: "Muñeca izquierda" },
    { id: "muneca_derecha", shape: "ellipse", cx: 385, cy: 478, rx: 20, ry: 20, label: "Muñeca derecha" },
    { id: "mano_izquierda", shape: "ellipse", cx: 103, cy: 535, rx: 38, ry: 52, label: "Mano izquierda" },
    { id: "mano_derecha", shape: "ellipse", cx: 380, cy: 535, rx: 38, ry: 52, label: "Mano derecha" },
    {
      id: "lumbares",
      shape: "path",
      d: "M212,354 C222,349 232,349 242,352 C252,349 262,349 272,354 L272,412 C262,420 252,422 242,422 C232,420 222,420 212,412 Z",
      label: "Zona lumbar",
    },
    {
      id: "gluteo_izquierdo",
      shape: "path",
      d: "M177,412 C192,400 215,398 230,406 L230,512 C215,524 193,524 180,512 C173,480 172,442 177,412 Z",
      label: "Gluteo izquierdo",
    },
    {
      id: "gluteo_derecho",
      shape: "path",
      d: "M307,412 C292,400 269,398 254,406 L254,512 C269,524 291,524 304,512 C311,480 312,442 307,412 Z",
      label: "Gluteo derecho",
    },
    {
      id: "isquiotibial_izquierdo",
      shape: "path",
      d: "M175,516 C185,509 200,507 212,511 L226,650 C214,658 196,658 186,650 Z",
      label: "Isquiotibial izquierdo",
    },
    {
      id: "isquiotibial_derecho",
      shape: "path",
      d: "M309,516 C299,509 284,507 272,511 L258,650 C270,658 288,658 298,650 Z",
      label: "Isquiotibial derecho",
    },
    { id: "rodilla_izquierda", shape: "ellipse", cx: 211, cy: 655, rx: 28, ry: 22, label: "Hueco popliteo (rodilla izquierda)" },
    { id: "rodilla_derecha", shape: "ellipse", cx: 271, cy: 655, rx: 28, ry: 22, label: "Hueco popliteo (rodilla derecha)" },
    {
      id: "gemelo_izquierdo",
      shape: "path",
      d: "M190,682 C202,675 220,675 232,682 C237,715 233,762 220,795 C212,801 198,801 190,795 C182,762 184,715 190,682 Z",
      label: "Gemelo izquierdo",
    },
    {
      id: "gemelo_derecho",
      shape: "path",
      d: "M292,682 C280,675 262,675 250,682 C245,715 249,762 262,795 C270,801 284,801 292,795 C300,762 298,715 292,682 Z",
      label: "Gemelo derecho",
    },
    { id: "tobillo_izquierdo", shape: "ellipse", cx: 207, cy: 875, rx: 20, ry: 16, label: "Tobillo izquierdo" },
    { id: "tobillo_derecho", shape: "ellipse", cx: 275, cy: 875, rx: 20, ry: 16, label: "Tobillo derecho" },
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
