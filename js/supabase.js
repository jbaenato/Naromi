// =========================================================
// Cliente ligero para la API REST de Supabase (PostgREST).
// No depende de ninguna libreria externa: usa fetch() puro,
// asi que la app funciona sin instalar nada ni usar npm.
// =========================================================

const cfg = window.NAROMI_CONFIG;

function isConfigured() {
  return (
    cfg &&
    cfg.SUPABASE_URL &&
    !cfg.SUPABASE_URL.includes("TU-PROYECTO") &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_ANON_KEY.includes("TU-CLAVE")
  );
}

function baseHeaders(extra = {}) {
  return {
    apikey: cfg.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${cfg.SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function handle(res) {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.message || body.hint || JSON.stringify(body);
    } catch (e) {
      detail = res.statusText;
    }
    throw new Error(`Error ${res.status}: ${detail}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const db = {
  /** SELECT con filtros opcionales estilo PostgREST, ej: { order: "created_at.desc" } */
  async select(table, params = {}) {
    const qs = new URLSearchParams({ select: "*", ...params });
    const res = await fetch(`${cfg.SUPABASE_URL}/rest/v1/${table}?${qs.toString()}`, {
      headers: baseHeaders(),
    });
    return handle(res);
  },

  async insert(table, row) {
    const res = await fetch(`${cfg.SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: baseHeaders({ Prefer: "return=representation" }),
      body: JSON.stringify(row),
    });
    return handle(res);
  },

  async update(table, id, row) {
    const res = await fetch(`${cfg.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: baseHeaders({ Prefer: "return=representation" }),
      body: JSON.stringify(row),
    });
    return handle(res);
  },

  async remove(table, id) {
    const res = await fetch(`${cfg.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: baseHeaders(),
    });
    return handle(res);
  },
};

window.NaromiDB = db;
window.isSupabaseConfigured = isConfigured;
