import { alarmasState } from "./alarmas.state.js";
import { normalizeAlarm } from "./alarmas.utils.js";
import { renderAlarms } from "./alarmas.render.js";
import { obtenerMisAlarmasConfig, actualizarAlarmaConfig, eliminarAlarmaConfig, obtenerAlarmasDelDia } from "../../services/alarma.service.js";
import { obtenerMisMedicinas } from "../../services/medicina.service.js";
import { createBlockingConfirmationModal } from "../../core/helpers/confirmation-modal.js";

let _deleteModal = null;

export function initDeleteModal() {
  const modal = document.getElementById("modalDeleteAlarm");
  _deleteModal = createBlockingConfirmationModal({
    modal,
    confirmButton: document.getElementById("btnConfirmDeleteAlarm"),
    cancelButton:  document.getElementById("btnCancelDeleteAlarm"),
    closeButton:   document.getElementById("btnCloseDeleteAlarm"),
    idleConfirmText:    "Eliminar",
    pendingConfirmText: "Eliminando...",
    showModal: () => modal.classList.add("active"),
    hideModal: () => modal.classList.remove("active"),
    isModalOpen: () => modal.classList.contains("active")
  });
  _deleteModal.bind();
}

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

export async function loadTodayAlarmsFromApi() {
  try {
    const result = await obtenerAlarmasDelDia();
    alarmasState.todayAlarms = Array.isArray(result) ? result : [];
  } catch (error) {
    console.warn("No se pudieron cargar alarmas del día:", error);
    alarmasState.todayAlarms = [];
  }
}

export async function loadMedsCountFromApi() {
  try {
    const result = await obtenerMisMedicinas();
    alarmasState.medsCount = Array.isArray(result) ? result.length : 0;
  } catch (error) {
    console.warn("No se pudo obtener el conteo de medicinas:", error);
    alarmasState.medsCount = 0;
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

export async function deleteAlarm(id) {
  if (!_deleteModal) return;
  const confirmed = await _deleteModal.open();
  if (!confirmed) return;

  try {
    await eliminarAlarmaConfig(id);
    _deleteModal.close();
    alarmasState.alarms = alarmasState.alarms.filter(x => Number(x.id) !== Number(id));
    if (alarmasState.selectedId === id) alarmasState.selectedId = null;
    await loadTodayAlarmsFromApi();
    renderAlarms();
    showToast("Alarma eliminada");
  } catch (error) {
    console.error("Error al eliminar alarma:", error);
    _deleteModal.close();
    showToast(error.message || "Error al eliminar la alarma");
  }
}

export async function updateAlarm(id, dto) {
  try {
    const updated = await actualizarAlarmaConfig(id, dto);
    const idx = alarmasState.alarms.findIndex(a => Number(a.id) === Number(id));
    if (idx >= 0) {
      alarmasState.alarms[idx] = normalizeAlarm(updated ?? { ...dto, id });
    }
    await loadTodayAlarmsFromApi();
    renderAlarms();
    showToast("Alarma actualizada");
  } catch (error) {
    console.error("Error al actualizar alarma:", error);
    showToast(error.message || "Error al actualizar la alarma");
    throw error;
  }
}
