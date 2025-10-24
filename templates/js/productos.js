// templates/js/productos.js
const API = "http://localhost:4001/api/v1";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const tbody = $("#tabla tbody");
  const msg = $("#msg");
  const sel = $("#fCategoria");

  const DEFAULT_CATS = [
    "Abarrotes", "Bebidas", "Lácteos", "Conservas", "Limpieza", "Panadería"
  ];

  const setMsg = (t = "") => { msg.textContent = t; };

  const authHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    const t = localStorage.getItem("token");
    if (t) headers.Authorization = `Bearer ${t}`;
    return headers;
  };

  function poblarSelect(cats) {
    const uniq = Array.from(new Set(["Todas", ...cats.filter(Boolean)]))
      .sort((a, b) => a.localeCompare(b, "es"));
    sel.innerHTML = "";
    for (const c of uniq) {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    }
    sel.value = "Todas";
  }

  async function cargarCategorias() {
    try {
      let categorias = [...DEFAULT_CATS];
      const res = await fetch(`${API}/productos/categorias`, { headers: authHeaders() });
      if (res.ok) {
        const fromApi = await res.json();
        categorias = [...categorias, ...fromApi];
      } else if (res.status === 401) {
        window.location.href = "/login.html";
        return;
      }
      poblarSelect(categorias);
    } catch {
      poblarSelect(DEFAULT_CATS);
    }
  }

  function render(data) {
    tbody.innerHTML = "";
    if (!data || data.length === 0) {
      setMsg("No hay productos para mostrar.");
      return;
    }
    setMsg("");
    for (const p of data) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.categoria}</td>
        <td>${Number(p.precio).toFixed(2)}</td>
        <td>${p.stock}</td>`;
      tbody.appendChild(tr);
    }
  }

  async function cargarProductos(categoria = "Todas") {
    try {
      const url = new URL(`${API}/productos`);
      if (categoria && categoria !== "Todas") url.searchParams.set("categoria", categoria);
      const res = await fetch(url, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = "/login.html"; return; }
      const data = await res.json();
      render(data);
    } catch {
      setMsg("Error cargando productos.");
    }
  }

  // Eventos
  sel.addEventListener("change", () => cargarProductos(sel.value));
  $("#btnLimpiar").addEventListener("click", () => { sel.value = "Todas"; cargarProductos("Todas"); });
  $("#btnLogout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login.html";
  });

  // Init
  (async () => {
    await cargarCategorias();
    await cargarProductos("Todas");
  })();
});
