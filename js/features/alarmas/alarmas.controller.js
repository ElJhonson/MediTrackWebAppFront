import { alarmasState } from "./alarmas.state.js";
import { normalizeAlarm } from "./alarmas.utils.js";
import { renderAlarms } from "./alarmas.render.js";
import { obtenerMisAlarmasConfig } from "../../services/alarma.service.js";

export function showToast(msg = "Operacion exitosa") {
  const t = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

export async function loadAlarmsFromApi() {
  try {
    const result = await obtenerMisAlarmasConfig();
    const items = Array.isArray(result)
      ? result
      : Array.isArray(result?.alarmas)
        ? result.alarmas
        : [];

    alarmasState.alarms = items.map(normalizeAlarm);
  } catch (error) {
    console.warn("No se pudieron cargar alarmas desde API:", error);
    alarmasState.alarms = [];
    showToast("No se pudieron cargar alarmas del servidor");
  }
}

export function toggleAlarm(id) {
  const a = alarmasState.alarms.find(x => Number(x.id) === Number(id));
  if (a) {
    a.activo = !a.activo;
    renderAlarms();
    showToast(a.activo ? "Alarma activada" : "Alarma pausada");
  }
}

export function deleteAlarm(id) {
  if (!confirm("¿Eliminar esta configuracion de alarma?")) return;
  alarmasState.alarms = alarmasState.alarms.filter(x => Number(x.id) !== Number(id));
  if (alarmasState.expandedId === id) alarmasState.expandedId = null;
  renderAlarms();
  showToast("Alarma eliminada");
}
