import { protectPage } from "../guards/guard.js";
import { logout } from "../core/auth.js";
import { STORAGE_KEYS } from "../core/config.js";
import {
  obtenerMisAlarmasConfig
} from "../services/alarma.service.js";

protectPage();

/* ── Topbar ── */
function initTopbar() {
  const accountMenuWrap = document.getElementById("accountMenuWrap");
  const accountMenuBtn  = document.getElementById("accountMenuBtn");
  const btnLogout       = document.getElementById("btnLogout");
  const userName        = document.getElementById("alarmas-user-name");
  const userAvatar      = document.getElementById("alarmas-user-avatar");

  const name      = String(localStorage.getItem(STORAGE_KEYS.NAME) || "Paciente").trim();
  const shortName = name.split(" ").slice(0, 2).join(" ") || "Paciente";

  if (userName) userName.textContent = shortName;

  if (userAvatar) {
    userAvatar.textContent = shortName
      .split(" ")
      .map(p => p[0] || "")
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  const closeMenu = () => {
    accountMenuWrap?.classList.remove("open");
    accountMenuBtn?.setAttribute("aria-expanded", "false");
  };

  accountMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = accountMenuWrap.classList.toggle("open");
    accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  window.addEventListener("click",   (e) => { if (!accountMenuWrap?.contains(e.target)) closeMenu(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  btnLogout?.addEventListener("click", () => logout());
}

const medNames = {
  "1": "Metformina 500mg",
  "2": "Losartan 50mg",
  "3": "Atorvastatina 20mg",
  "4": "Omeprazol 20mg",
  "5": "Aspirina 100mg"
};

let alarms = [];
let expandedId = null;
let currentFilter = "all";
let searchQuery = "";

/* ── Utilidades ── */
function fmt(d) {
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) + " " +
         d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function toLocal(d) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function parseDateSafe(value, fallback = new Date()) {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : fallback;
}

function normalizeAlarm(raw) {
  const now = new Date();
  const fallbackStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
  const fallbackEnd = new Date(fallbackStart.getTime() + 7 * 24 * 3600000);

  const medId = String(raw?.medicinaId ?? raw?.medId ?? "");
  const inicio = parseDateSafe(raw?.fechaInicio ?? raw?.inicio, fallbackStart);
  const fin = parseDateSafe(raw?.fechaFin ?? raw?.fin, fallbackEnd);

  return {
    id: Number(raw?.id ?? raw?.configId ?? Date.now()),
    medId,
    medName: String(raw?.medicinaNombre ?? raw?.medName ?? medNames[medId] ?? "Medicamento"),
    dosis: String(raw?.dosis ?? raw?.dosisPorToma ?? "Sin dosis"),
    frecHoras: Number(raw?.frecuenciaHoras ?? raw?.frecHoras ?? 8) || 8,
    inicio: toLocal(inicio),
    fin: toLocal(fin),
    instrucciones: String(raw?.instrucciones ?? ""),
    activo: raw?.activo !== false
  };
}

async function loadAlarmsFromApi() {
  try {
    const result = await obtenerMisAlarmasConfig();
    const items = Array.isArray(result)
      ? result
      : Array.isArray(result?.alarmas)
        ? result.alarmas
        : [];

    alarms = items.map(normalizeAlarm);
  } catch (error) {
    console.warn("No se pudieron cargar alarmas desde API:", error);
    alarms = [];
    showToast("No se pudieron cargar alarmas del servidor");
  }
}

function getNextTimes(alarm, max = 4) {
  const times = [];
  const now   = new Date();
  let d       = new Date(alarm.inicio);
  const end   = new Date(alarm.fin);
  let guard   = 0;

  while (d <= end && guard < 3000) {
    if (d >= now) times.push(new Date(d));
    if (times.length >= max) break;
    d = new Date(d.getTime() + alarm.frecHoras * 3600000);
    guard++;
  }
  return times;
}

function countToday(alarm) {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,  0,  0);
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let d       = new Date(alarm.inicio);
  const fin   = new Date(alarm.fin);
  let c = 0, guard = 0;

  while (d <= fin && guard < 3000) {
    if (d >= start && d <= end) c++;
    d = new Date(d.getTime() + alarm.frecHoras * 3600000);
    guard++;
  }
  return c;
}

function alarmaStatus(alarm) {
  const now = new Date();
  if (!alarm.activo) return "paused";
  if (new Date(alarm.fin) < now) return "ended";
  return "active";
}

/* ── Estadísticas ── */
function updateStats() {
  const active = alarms.filter(a => alarmaStatus(a) === 'active').length;
  const total  = alarms.length;

  document.getElementById('statActive').textContent  = active;
  document.getElementById('barActive').style.width   = total ? (active / total * 100) + '%' : '0%';

  const today = alarms.reduce((s, a) => s + (alarmaStatus(a) === 'active' ? countToday(a) : 0), 0);
  document.getElementById('statToday').textContent   = today;
  document.getElementById('barToday').style.width    = today ? Math.min(100, today * 10) + '%' : '0%';

  const nexts = alarms
    .filter(a => alarmaStatus(a) === 'active')
    .flatMap(a => getNextTimes(a, 1).map(t => ({ t, name: a.medName })))
    .sort((a, b) => a.t - b.t);

  if (nexts.length) {
    document.getElementById('statNext').textContent    = nexts[0].t.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('statNextMed').textContent = nexts[0].name;
  } else {
    document.getElementById("statNext").textContent = "—";
    document.getElementById("statNextMed").textContent = "Sin alarmas";
  }
}

/* ── Renderizar lista de alarmas ── */
function renderAlarms() {
  const list = document.getElementById("alarmList");
  let filtered = alarms;

  if (currentFilter === "active") filtered = alarms.filter((a) => alarmaStatus(a) === "active");
  if (currentFilter === "paused") filtered = alarms.filter((a) => alarmaStatus(a) !== "active");
  if (searchQuery) filtered = filtered.filter((a) => a.medName.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1f3d32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <div class="empty-title">Sin recordatorios</div>
        <div class="empty-text">No hay alarmas en esta categoría.<br>Crea una desde el formulario.</div>
      </div>`;
    return;
  }

  const statusLabel = { active: "Activo", paused: "Pausado", ended: "Finalizado" };

  list.innerHTML = filtered.map(a => {
    const isExpanded = expandedId === Number(a.id);
    const st         = alarmaStatus(a);
    const nexts      = getNextTimes(a);

    const pillsHtml = nexts.length
      ? nexts.map((d) => `<span class="next-pill">${fmt(d)}</span>`).join("")
      : `<span class="no-next">Sin próximas tomas en el rango configurado</span>`;

    const instrLine = a.instrucciones
      ? `<div class="detail-chip" style="grid-column:1/-1">
           <div class="detail-chip-label">Instrucciones</div>
           <div class="detail-chip-val">${a.instrucciones}</div>
         </div>`
      : '';

    const pauseIcon = st === "active"
      ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
      : '<polygon points="5 3 19 12 5 21 5 3"/>';

    return `
    <div class="alarm-card ${isExpanded ? "expanded" : ""}" data-id="${a.id}">
      <div class="alarm-top">
        <div class="alarm-med-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1f3d32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="alarm-info">
          <div class="alarm-name">${a.medName}</div>
          <div class="alarm-meta">
            Cada ${a.frecHoras}h
            <span class="meta-sep"></span>
            ${a.dosis}
            <span class="meta-sep"></span>
            ${fmt(new Date(a.inicio))} → ${fmt(new Date(a.fin))}
          </div>
        </div>
        <div class="alarm-right">
          <span class="status-badge ${st}">${statusLabel[st]}</span>
          <svg class="alarm-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <div class="alarm-detail">
        <div class="detail-grid">
          <div class="detail-chip">
            <div class="detail-chip-label">Inicio</div>
            <div class="detail-chip-val">${fmt(new Date(a.inicio))}</div>
          </div>
          <div class="detail-chip">
            <div class="detail-chip-label">Fin</div>
            <div class="detail-chip-val">${fmt(new Date(a.fin))}</div>
          </div>
          <div class="detail-chip">
            <div class="detail-chip-label">Frecuencia</div>
            <div class="detail-chip-val">Cada ${a.frecHoras} horas</div>
          </div>
          <div class="detail-chip">
            <div class="detail-chip-label">Dosis</div>
            <div class="detail-chip-val">${a.dosis}</div>
          </div>
          ${instrLine}
        </div>

        <div class="next-section-title">Próximas alarmas</div>
        <div class="next-pills">${pillsHtml}</div>

        <div class="detail-actions">
          <button class="btn-action" data-action="toggle" data-id="${a.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${pauseIcon}
            </svg>
            ${st === "active" ? "Pausar" : "Activar"}
          </button>
          <button class="btn-action danger" data-action="delete" data-id="${a.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    </div>`;
  }).join("");

  /* Eventos de expansión */
  list.querySelectorAll(".alarm-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-action")) return;
      const id = parseInt(card.dataset.id);
      expandedId = expandedId === id ? null : id;
      renderAlarms();
    });
  });

  list.querySelectorAll(".btn-action[data-action='toggle']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      toggleAlarm(id);
    });
  });

  list.querySelectorAll(".btn-action[data-action='delete']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      deleteAlarm(id);
    });
  });

  updateStats();
}

/* ── Acciones sobre alarmas ── */
function toggleAlarm(id) {
  const a = alarms.find((x) => Number(x.id) === Number(id));
  if (a) {
    a.activo = !a.activo;
    renderAlarms();
    showToast(a.activo ? "Alarma activada" : "Alarma pausada");
  }
}

function deleteAlarm(id) {
  if (!confirm("¿Eliminar esta configuracion de alarma?")) return;
  alarms = alarms.filter((x) => Number(x.id) !== Number(id));
  if (expandedId === id) expandedId = null;
  renderAlarms();
  showToast("Alarma eliminada");
}

/* ── Toast ── */
function showToast(msg = "Operacion exitosa") {
  const t = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

function bindUiEvents() {
  document.querySelectorAll(".tab-btn").forEach((t) => {
    t.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      currentFilter = t.dataset.filter;
      expandedId = null;
      renderAlarms();
    });
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderAlarms();
  });
}

async function initAlarmasPage() {
  initTopbar();
  bindUiEvents();
  await loadAlarmsFromApi();
  renderAlarms();
}

document.addEventListener("DOMContentLoaded", () => {
  initAlarmasPage().catch((error) => {
    console.error("Error inicializando alarmas:", error);
    showToast("No se pudo inicializar la pagina de alarmas");
  });
});