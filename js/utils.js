// =========================================================
// Utilidades compartidas: notificaciones, exportacion CSV,
// helpers de formulario.
// =========================================================

function showToast(message, isError = false) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "toast" + (isError ? " error" : "");
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function formField({ label, type = "text", name, options, value = "", required = false, placeholder = "" }) {
  const wrap = el("div", { class: "field" });
  wrap.appendChild(el("label", { for: name }, label));

  if (type === "select") {
    const select = el("select", { id: name, name });
    if (required) select.required = true;
    select.appendChild(el("option", { value: "" }, "-- Selecciona --"));
    options.forEach((opt) => {
      const optEl = el("option", { value: opt.value || opt }, opt.label || opt);
      if ((opt.value || opt) === value) optEl.selected = true;
      select.appendChild(optEl);
    });
    wrap.appendChild(select);
  } else if (type === "textarea") {
    const ta = el("textarea", { id: name, name, placeholder });
    if (required) ta.required = true;
    ta.value = value;
    wrap.appendChild(ta);
  } else {
    const input = el("input", { type, id: name, name, placeholder });
    if (required) input.required = true;
    if (value) input.value = value;
    wrap.appendChild(input);
  }
  return wrap;
}

/**
 * Pregunta Si/No obligatoria. Si no hay un valor previo, queda
 * marcada "No" por defecto (asi lo pidio Jose: todas las
 * preguntas obligatorias, arrancando en "No").
 * currentValue: "si" | "no" | undefined
 */
function yesNoRow(label, name, currentValue) {
  const value = currentValue === "si" ? "si" : "no";
  const wrap = el("div", { class: "check-row" });
  wrap.appendChild(el("span", {}, label));
  const group = el("div", { class: "pill-group" });
  ["si", "no"].forEach((v) => {
    const lbl = el("label", {});
    const input = el("input", { type: "radio", name, value: v });
    input.required = true;
    if (value === v) input.checked = true;
    lbl.appendChild(input);
    lbl.appendChild(document.createTextNode(v === "si" ? "Si" : "No"));
    group.appendChild(lbl);
  });
  wrap.appendChild(group);
  return wrap;
}

/**
 * Pregunta Si/No + campo de texto ligado. El campo empieza
 * deshabilitado; se habilita y se vuelve obligatorio solo si
 * se responde "Si". Al volver a "No" se deshabilita y se
 * vacia, para no guardar texto que ya no aplica.
 *
 * fieldDef: mismo objeto que espera formField() (label, name,
 * type, placeholder...), sin "required" (se calcula solo).
 */
function conditionalField(label, yesNoName, currentYesNo, fieldDef) {
  const value = currentYesNo === "si" ? "si" : "no";
  const wrap = el("div", {});
  wrap.appendChild(yesNoRow(label, yesNoName, value));

  const fieldWrap = formField({ ...fieldDef });
  const input = fieldWrap.querySelector("input, textarea, select");
  wrap.appendChild(fieldWrap);

  function sync(v) {
    const enabled = v === "si";
    input.disabled = !enabled;
    input.required = enabled;
    fieldWrap.classList.toggle("field-disabled", !enabled);
    if (!enabled) input.value = "";
  }
  sync(value);

  wrap.querySelectorAll(`input[name="${yesNoName}"]`).forEach((radio) => {
    radio.addEventListener("change", () => sync(radio.value));
  });

  return wrap;
}

/**
 * Select + campo de texto ligado (ej. "Pabellon auricular" ->
 * "Puntos tratados"). El campo se habilita y se vuelve
 * obligatorio en cuanto se elige una opcion del select.
 */
function conditionalFieldFromSelect(selectDef, fieldDef, currentValue) {
  const wrap = el("div", {});
  const selectWrap = formField({ ...selectDef, type: "select", value: currentValue });
  const select = selectWrap.querySelector("select");
  wrap.appendChild(selectWrap);

  const fieldWrap = formField({ ...fieldDef });
  const input = fieldWrap.querySelector("input, textarea");
  wrap.appendChild(fieldWrap);

  function sync(v) {
    const enabled = !!v;
    input.disabled = !enabled;
    input.required = enabled;
    fieldWrap.classList.toggle("field-disabled", !enabled);
    if (!enabled) input.value = "";
  }
  sync(currentValue);

  select.addEventListener("change", () => sync(select.value));

  return wrap;
}

function getYesNo(form, name) {
  const val = form.querySelector(`input[name="${name}"]:checked`);
  if (!val) return null;
  return val.value === "si";
}

/** Convierte el valor "si"/"no" guardado por el wizard en boolean/null para la base de datos. */
function ynVal(data, name) {
  if (data[name] === "si") return true;
  if (data[name] === "no") return false;
  return null;
}

/** Numero o null si esta vacio. */
function numVal(data, name) {
  const v = data[name];
  return v !== undefined && v !== null && v !== "" ? Number(v) : null;
}

/** Texto o null si esta vacio. */
function strVal(data, name) {
  const v = data[name];
  return v !== undefined && v !== null && v !== "" ? v : null;
}

/** Boolean (checkbox) o false si no esta definido. */
function boolVal(data, name) {
  return data[name] === true;
}

function painScale(name, value) {
  const wrap = el("div", { class: "field" });
  wrap.appendChild(el("label", {}, "Intensidad del dolor (0 = sin dolor, 10 = maximo dolor)"));
  const row = el("div", { class: "scale-row" });
  for (let i = 0; i <= 10; i++) {
    const lbl = el("label", {});
    const input = el("input", { type: "radio", name, value: String(i) });
    input.required = true;
    if (String(value) === String(i)) {
      input.checked = true;
      lbl.classList.add("selected");
    }
    input.addEventListener("change", () => {
      row.querySelectorAll("label").forEach((l) => l.classList.remove("selected"));
      lbl.classList.add("selected");
    });
    lbl.appendChild(input);
    lbl.appendChild(document.createTextNode(String(i)));
    row.appendChild(lbl);
  }
  wrap.appendChild(row);
  const caption = el("div", { class: "scale-caption" });
  caption.appendChild(el("span", {}, "Sin dolor"));
  caption.appendChild(el("span", {}, "Maximo dolor"));
  wrap.appendChild(caption);
  return wrap;
}

function checkboxPill(label, name, checked) {
  const lbl = el("label", {});
  const input = el("input", { type: "checkbox", name });
  if (checked) input.checked = true;
  lbl.appendChild(input);
  lbl.appendChild(document.createTextNode(label));
  return lbl;
}

function fmtDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("es-ES");
  } catch (e) {
    return d;
  }
}

/** Descarga un array de objetos como fichero CSV (abrible en Excel). */
function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) {
    showToast("No hay datos para exportar", true);
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };
  const lines = [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))];
  const csv = "﻿" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
