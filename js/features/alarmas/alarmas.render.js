import { alarmasState } from "./alarmas.state.js";
import { alarmaStatus, getNextTimes, fmt, countToday } from "./alarmas.utils.js";

const STATUS_LABEL = { active: "Activo", paused: "Pausado", ended: "Finalizado" };

export function updateStats() {
  const active = alarmasState.alarms.filter(a => alarmaStatus(a) === "active").length;
  const total  = alarmasState.alarms.length;

  document.getElementById("statActive").textContent = active;
  document.getElementById("barActive").style.width  = total ? (active / total * 100) + "%" : "0%";

  const today = alarmasState.alarms.reduce(
    (s, a) => s + (alarmaStatus(a) === "active" ? countToday(a) : 0), 0
  );
  document.getElementById("statToday").textContent  = today;
  document.getElementById("barToday").style.width   = today ? Math.min(100, today * 10) + "%" : "0%";

  const nexts = alarmasState.alarms
    .filter(a => alarmaStatus(a) === "active")
    .flatMap(a => getNextTimes(a, 1).map(t => ({ t, name: a.medName })))
    .sort((a, b) => a.t - b.t);

  if (nexts.length) {
    document.getElementById("statNext").textContent    = nexts[0].t.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    document.getElementById("statNextMed").textContent = nexts[0].name;
  } else {
    document.getElementById("statNext").textContent    = "—";
    document.getElementById("statNextMed").textContent = "Sin alarmas";
  }
}

function buildAlarmCardHtml(a) {
  const isExpanded = alarmasState.expandedId === Number(a.id);
  const st         = alarmaStatus(a);
  const nexts      = getNextTimes(a);

  const pillsHtml = nexts.length
    ? nexts.map(d => `<span class="next-pill">${fmt(d)}</span>`).join("")
    : `<span class="no-next">Sin próximas tomas en el rango configurado</span>`;

  const instrLine = a.instrucciones
    ? `<div class="detail-chip" style="grid-column:1/-1">
           <div class="detail-chip-label">Instrucciones</div>
           <div class="detail-chip-val">${a.instrucciones}</div>
         </div>`
    : "";

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
          <span class="status-badge ${st}">${STATUS_LABEL[st]}</span>
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
}

export function renderAlarms() {
  const list = document.getElementById("alarmList");
  let filtered = alarmasState.alarms;

  if (alarmasState.currentFilter === "active") filtered = alarmasState.alarms.filter(a => alarmaStatus(a) === "active");
  if (alarmasState.currentFilter === "paused") filtered = alarmasState.alarms.filter(a => alarmaStatus(a) !== "active");
  if (alarmasState.searchQuery) filtered = filtered.filter(a => a.medName.toLowerCase().includes(alarmasState.searchQuery.toLowerCase()));

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

  list.innerHTML = filtered.map(buildAlarmCardHtml).join("");

  list.querySelectorAll(".alarm-card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest(".btn-action")) return;
      const id = parseInt(card.dataset.id);
      alarmasState.expandedId = alarmasState.expandedId === id ? null : id;
      renderAlarms();
    });
  });

  updateStats();
}
