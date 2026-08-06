// =========================================================
// Enrutado principal de la app (SPA sin frameworks) +
// registro del service worker para que sea instalable.
// =========================================================

const views = {
  ficha: renderClientForm,
  sesion: renderSessionForm,
  admin: renderAdmin,
};

async function navigate(viewName) {
  document.querySelectorAll("nav.tabs button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === viewName);
  });
  const root = document.getElementById("app");
  root.innerHTML = '<p class="muted">Cargando...</p>';
  try {
    await views[viewName](root);
  } catch (err) {
    root.innerHTML = "";
    root.appendChild(el("div", { class: "config-warning" }, "Error al cargar la vista: " + err.message));
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("nav.tabs button").forEach((btn) => {
  btn.addEventListener("click", () => navigate(btn.dataset.view));
});

async function checkConnection() {
  const badge = document.getElementById("connStatus");
  if (!window.isSupabaseConfigured()) {
    badge.textContent = "Sin configurar";
    badge.style.background = "rgba(179,69,59,0.15)";
    badge.style.color = "#b3453b";
    return;
  }
  try {
    await window.NaromiDB.select("clients", { select: "id", limit: "1" });
    badge.textContent = "Conectado";
  } catch (err) {
    badge.textContent = "Error de conexion";
    badge.style.background = "rgba(179,69,59,0.15)";
    badge.style.color = "#b3453b";
  }
}

// ---- PWA: registro del service worker ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* el service worker es opcional: si falla, la app sigue funcionando */
    });
  });
}

// ---- PWA: banner de instalacion en Android/escritorio ----
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installBanner").style.display = "flex";
});
document.getElementById("installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById("installBanner").style.display = "none";
});

// ---- Inicio ----
checkConnection();
navigate("ficha");
