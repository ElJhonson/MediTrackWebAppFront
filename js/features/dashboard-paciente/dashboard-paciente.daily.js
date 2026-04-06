import { obtenerAlarmasDelDia } from "../../services/alarma.service.js";
import { obtenerMisMedicinas } from "../../services/medicina.service.js";
import { ROUTES } from "../../core/config.js";

const ESTADO = {
  TOMADA:   { bg: "#dcfce7", color: "#166534", border: "#bbf7d0", label: "Tomada"   },
  PROXIMA:  { bg: "#fef3c7", color: "#92400e", border: "#fde68a", label: "Próxima"  },
  ATRASADA: { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca", label: "Atrasada" },
  OMITIDA:  { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca", label: "Omitida"  }
};

function _diasRestantes(fechaStr) {
  if (!fechaStr) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaStr);
  fin.setHours(0, 0, 0, 0);
  return Math.ceil((fin - hoy) / 86400000);
}

function _fmtHora(fechaHora) {
  return new Date(fechaHora).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function _estadoInfoSemantic(estado, fechaHora) {
  if (estado === "TOMADA")  return ESTADO.TOMADA;
  if (estado === "OMITIDA") return ESTADO.OMITIDA;
  // PENDIENTE: pasada = atrasada, futura = próxima
  return new Date(fechaHora) < new Date() ? ESTADO.ATRASADA : ESTADO.PROXIMA;
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function _metricsSkeleton() {
  const el = document.getElementById("dailyMetrics");
  if (!el) return;
  el.innerHTML = Array(4)
    .fill(`<div class="ds-metric-card">
      <div class="ds-skeleton ds-skeleton--number"></div>
      <div class="ds-skeleton ds-skeleton--label"></div>
    </div>`)
    .join("");
}

function _sectionSkeleton(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `
    <div class="ds-skeleton-row">
      <div class="ds-skeleton"></div>
      <div class="ds-skeleton"></div>
      <div class="ds-skeleton ds-skeleton--short"></div>
    </div>`;
}

// ── Metrics ───────────────────────────────────────────────────────────────────

function _renderMetrics(alarmas, medicinas) {
  const el = document.getElementById("dailyMetrics");
  if (!el) return;

  const completadas = alarmas.filter(a => a.estado === "TOMADA").length;
  const pendientes  = alarmas.filter(a => a.estado === "PENDIENTE").length;
  const activos     = medicinas.filter(m => {
    const dias = _diasRestantes(m.expirationDate ?? m.fechaFin);
    return dias === null || dias >= 0;
  }).length;

  const items = [
    { label: "Tomas hoy",    value: alarmas.length, color: "var(--text-muted)" },
    { label: "Completadas",  value: completadas,     color: "#22c55e" },
    { label: "Pendientes",   value: pendientes,      color: "#f59e0b" },
    { label: "Medicamentos", value: activos,         color: "var(--text-muted)" }
  ];

  el.innerHTML = items
    .map(
      i => `<div class="ds-metric-card">
        <div class="ds-metric-value" style="color:${i.color}">${i.value}</div>
        <div class="ds-metric-label">${i.label}</div>
      </div>`
    )
    .join("");
}

// ── Tomas de hoy ─────────────────────────────────────────────────────────────

function _renderTomasHoy(alarmas) {
  const el = document.getElementById("tomasHoyContent");
  if (!el) return;

  if (!alarmas.length) {
    el.innerHTML = `
      <div class="ds-empty">
        <div class="ds-empty-icon">💊</div>
        <p>No hay tomas programadas para hoy.</p>
      </div>`;
    return;
  }

  const total       = alarmas.length;
  const completadas = alarmas.filter(a => a.estado === "TOMADA").length;
  const pct         = Math.round((completadas / total) * 100);

  const sorted = [...alarmas].sort(
    (a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)
  );

  // Prioridad: Próxima/Pendiente primero, luego el resto; cortar a 3
  const upcoming  = sorted.filter(a => a.estado === "PENDIENTE");
  const rest      = sorted.filter(a => a.estado !== "PENDIENTE");
  const visible   = [...upcoming, ...rest].slice(0, 3);

  const PILL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`;

  const cardsHtml = visible
    .map(a => {
      const e = _estadoInfoSemantic(a.estado, a.fechaHora);
      return `
        <div class="ds-toma-card">
          <div class="ds-toma-icon" style="background:${e.bg};color:${e.color}">${PILL_SVG}</div>
          <div class="ds-toma-info">
            <div class="ds-toma-nombre">${a.medicinaNombre}</div>
            <div class="ds-toma-hora-text">${_fmtHora(a.fechaHora)}</div>
          </div>
          <span class="ds-badge" style="background:${e.bg};color:${e.color};border-color:${e.border}">${e.label}</span>
        </div>`;
    })
    .join("");

  const verTodas = total > 3
    ? `<a class="ds-ver-todas" href="${ROUTES.ALARMAS}">Ver todas (${total}) →</a>`
    : "";

  el.innerHTML = `
    <div class="ds-progress-wrap">
      <div class="ds-progress-info">
        <span>${completadas} de ${total} completadas</span>
        <span>${pct}%</span>
      </div>
      <div class="ds-progress-bar-bg">
        <div class="ds-progress-bar-fill" style="width:${pct}%"></div>
      </div>
    </div>
    <div class="ds-toma-list">${cardsHtml}</div>
    ${verTodas}`;
}

// ── Medicamentos activos ──────────────────────────────────────────────────────

function _renderMedicamentosActivos(medicinas) {
  const el = document.getElementById("medicamentosActivosContent");
  if (!el) return;

  if (!medicinas.length) {
    el.innerHTML = `
      <div class="ds-empty">
        <div class="ds-empty-icon">🏥</div>
        <p>No tienes medicamentos registrados.</p>
      </div>`;
    return;
  }

  const rows = medicinas
    .map(m => {
      const dias = _diasRestantes(m.expirationDate ?? m.fechaFin);
      let badge, badgeStyle, dotColor;
      if (dias === null || dias < 0) {
        badge = "Vencida";    badgeStyle = "background:#fee2e2;color:#b91c1c;border-color:#fecaca"; dotColor = "#ef4444";
      } else if (dias <= 7) {
        badge = "Por vencer"; badgeStyle = "background:#fef3c7;color:#92400e;border-color:#fde68a"; dotColor = "#f59e0b";
      } else {
        badge = "Vigente";    badgeStyle = "background:#dcfce7;color:#166534;border-color:#bbf7d0"; dotColor = "#22c55e";
      }
      const diasText = dias === null
        ? "Sin fecha de vencimiento"
        : dias < 0
          ? "Expirado"
          : `${dias} día${dias !== 1 ? "s" : ""} restantes`;
      const metaParts = [m.dosageForm, diasText].filter(Boolean).join(" · ");

      return `
        <div class="ds-med-row">
          <div class="ds-med-dot" style="background:${dotColor}"></div>
          <div class="ds-med-info">
            <div class="ds-med-nombre">${m.nombre}</div>
            <div class="ds-med-meta">${metaParts}</div>
          </div>
          <span class="ds-badge" style="${badgeStyle}">${badge}</span>
        </div>`;
    })
    .join("");

  el.innerHTML = `<div class="ds-med-list">${rows}</div>`;
}

// ── Entry point ───────────────────────────────────────────────────────────────

export async function initDailySection() {
  _metricsSkeleton();
  _sectionSkeleton("tomasHoyContent");
  _sectionSkeleton("medicamentosActivosContent");

  const [alarmas, medicinas] = await Promise.all([
    obtenerAlarmasDelDia().catch(() => []),
    obtenerMisMedicinas().catch(() => [])
  ]);

  _renderMetrics(alarmas, medicinas);
  _renderTomasHoy(alarmas);
  _renderMedicamentosActivos(medicinas);
}
