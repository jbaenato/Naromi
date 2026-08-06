// =========================================================
// Motor generico de "asistente por pasos" (wizard): en vez
// de un formulario largo con scroll infinito, muestra una
// pantalla por paso con botones Atras/Siguiente, pensado
// para movil. Los datos de cada paso se guardan en memoria
// (objeto "data") para que no se pierdan al ir hacia atras.
// =========================================================

/**
 * @param {HTMLElement} root Contenedor donde se monta el wizard.
 * @param {Object} opts
 * @param {Array}  opts.steps  Array de { title, build(stepEl, data), onNext(stepEl, data) }
 * @param {Object} opts.data   Objeto donde se acumulan los valores de todos los pasos.
 * @param {Function} opts.onSubmit (data, { setLoading, stepEl }) => Promise|void
 * @param {String} opts.submitLabel Texto del boton final (por defecto "Guardar")
 */
function createWizard(root, opts) {
  const steps = opts.steps.slice();
  const data = opts.data || {};
  let current = 0;
  let currentStepEl = null;

  const shell = el("div", { class: "wizard" });
  const progress = el("div", { class: "wizard-progress" });
  const body = el("div", { class: "wizard-body" });
  const nav = el("div", { class: "wizard-nav" });
  const backBtn = el("button", { type: "button", class: "secondary" }, "Atras");
  const nextBtn = el("button", { type: "button", class: "primary" }, "Siguiente");
  nav.appendChild(backBtn);
  nav.appendChild(nextBtn);
  shell.appendChild(progress);
  shell.appendChild(body);
  shell.appendChild(nav);
  root.appendChild(shell);

  function harvest(stepEl) {
    stepEl.querySelectorAll("input, select, textarea").forEach((input) => {
      if (!input.name) return;
      if (input.type === "checkbox") data[input.name] = input.checked;
      else if (input.type === "radio") {
        if (input.checked) data[input.name] = input.value;
      } else {
        data[input.name] = input.value;
      }
    });
  }

  function renderProgress() {
    progress.innerHTML = "";
    steps.forEach((s, i) => {
      const dot = el("div", {
        class: "wizard-dot" + (i === current ? " active" : "") + (i < current ? " done" : ""),
      });
      progress.appendChild(dot);
    });
    const label = el("div", { class: "wizard-step-count" }, `Paso ${current + 1} de ${steps.length}`);
    progress.appendChild(label);
  }

  function renderStep() {
    body.innerHTML = "";
    const stepDef = steps[current];
    const stepEl = el("div", { class: "wizard-step" });
    if (stepDef.title) stepEl.appendChild(el("h2", { class: "wizard-step-title" }, stepDef.title));
    if (stepDef.subtitle) stepEl.appendChild(el("p", { class: "muted wizard-step-subtitle" }, stepDef.subtitle));
    stepDef.build(stepEl, data);
    body.appendChild(stepEl);
    currentStepEl = stepEl;

    backBtn.style.display = current === 0 ? "none" : "inline-block";
    nextBtn.textContent = current === steps.length - 1 ? opts.submitLabel || "Guardar" : "Siguiente";
    renderProgress();
    shell.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  backBtn.addEventListener("click", () => {
    if (currentStepEl) harvest(currentStepEl);
    if (current > 0) {
      current--;
      renderStep();
    }
  });

  nextBtn.addEventListener("click", async () => {
    const stepEl = currentStepEl;
    const invalid = stepEl.querySelector(":invalid");
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    harvest(stepEl);

    const stepDef = steps[current];
    if (stepDef.onNext) {
      const result = stepDef.onNext(stepEl, data);
      if (result === false) return;
      if (result && Array.isArray(result.insertSteps)) {
        const groupTag = result.group || null;
        if (groupTag) {
          // Si el usuario vuelve atras y cambia una respuesta que ramifica
          // el asistente (ej. tipo de tratamiento), quitamos los pasos que
          // habiamos insertado antes para ese mismo grupo, para no duplicar.
          for (let i = steps.length - 1; i > current; i--) {
            if (steps[i]._group === groupTag) steps.splice(i, 1);
          }
          result.insertSteps.forEach((s) => {
            s._group = groupTag;
          });
        }
        steps.splice(current + 1, 0, ...result.insertSteps);
      }
    }

    if (current < steps.length - 1) {
      current++;
      renderStep();
    } else if (opts.onSubmit) {
      nextBtn.disabled = true;
      backBtn.disabled = true;
      const originalLabel = nextBtn.textContent;
      nextBtn.textContent = "Guardando...";
      try {
        await opts.onSubmit(data, { stepEl });
      } finally {
        nextBtn.disabled = false;
        backBtn.disabled = false;
        nextBtn.textContent = originalLabel;
      }
    }
  });

  renderStep();

  return {
    goTo(i) {
      if (currentStepEl) harvest(currentStepEl);
      current = i;
      renderStep();
    },
    getData: () => data,
  };
}

window.createWizard = createWizard;
