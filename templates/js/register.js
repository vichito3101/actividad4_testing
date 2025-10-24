// templates/js/register.js
const API_BASE = "http://localhost:4001";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const msgEl = $("#msg");
  const setMsg = (t, ok = false) => {
    msgEl.textContent = t;
    msgEl.className = ok ? "ok" : "error";
  };

  $("#btnBackLogin").addEventListener("click", () => {
    window.location.href = "/login.html";
  });

  $("#frmRegister").addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    const btn = e.submitter || $("#frmRegister button[type='submit']");
    btn.disabled = true;

    const payload = {
      nombre: $("#nombre").value.trim(),
      apellido: $("#apellido").value.trim(),
      nro_documento: $("#nro_documento").value.trim(),
      edad: Number($("#edad").value),
      email: $("#email").value.trim(),
      password: $("#password").value,
      rol: $("#rol").value
    };

    if (!/^\d{8,}$/.test(payload.nro_documento)) {
      setMsg("DNI inválido (mín. 8 dígitos)."); btn.disabled = false; return;
    }
    if (payload.password.length < 4) {
      setMsg("Contraseña muy corta."); btn.disabled = false; return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/seguridad/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) data = await res.json();
      else data = { error: await res.text() };

      if (!res.ok) {
        setMsg(data?.error || `No se pudo registrar. Código ${res.status}`);
        btn.disabled = false;
        return;
      }

      setMsg("Cuenta creada correctamente. Redirigiendo…", true);
      setTimeout(() => window.location.href = "/login.html", 900);
    } catch (err) {
      setMsg("Error de conexión con el servidor.");
      btn.disabled = false;
    }
  });
});
