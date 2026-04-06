import { medNames } from "./alarmas.state.js";

export function fmt(d) {
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) + " " +
         d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export function fmtShort(d) {
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export function toLocal(d) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function parseDateSafe(value, fallback = new Date()) {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : fallback;
}

export function normalizeAlarm(raw) {
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

export function getNextTimes(alarm, max = 4) {
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

export function countToday(alarm) {
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

export function alarmaStatus(alarm) {
  const now = new Date();
  if (!alarm.activo) return "paused";
  if (new Date(alarm.fin) < now) return "ended";
  return "active";
}
