import { cuidadorAlarmasState } from "./cuidador-alarmas.state.js";
import { normalizeAlarm } from "./cuidador-alarmas.utils.js";
import { renderAlarms } from "./cuidador-alarmas.render.js";
import {
  obtenerAlarmasConfigPaciente,
  obtenerAlarmasDelDiaPaciente,
  obtenerMedsCountPaciente,
  actualizarAlarmaPaciente,
  eliminarAlarmaPaciente
} from "./cuidador-alarmas.data.js";
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

export function showToast(msg = "Operación exitosa") {
  const t = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

export async function loadAlarmsFromApi() {
  try {
    const result = await obtenerAlarmasConfigPaciente(cuidadorAlarmasState.pacienteId);
    const items  = Array.isArray(result)
      ? result
      : Array.isArray(result?.alarmas)
        ? result.alarmas
        : [];
    cuidadorAlarmasState.alarms = items.map(normalizeAlarm);
  } catch (error) {
    console.warn("[cuidador-alarmas] No se pudieron cargar alarmas:", error);
    cuidadorAlarmasState.alarms = [];
    showToast("No se pudieron cargar las alarmas del paciente");
  }
}

export async function loadTodayAlarmsFromApi() {
  try {
    const result = await obtenerAlarmasDelDiaPaciente(cuidadorAlarmasState.pacienteId);
    cuidadorAlarmasState.todayAlarms = Array.isArray(result) ? result : [];
  } catch (error) {
    console.warn("[cuidador-alarmas] No se pudieron cargar alarmas de hoy:", error);
    cuidadorAlarmasState.todayAlarms = [];
  }
}

export async function loadMedsCountFromApi() {
  try {
    cuidadorAlarmasState.medsCount = await obtenerMedsCountPaciente(cuidadorAlarmasState.pacienteId);
  } catch (error) {
    console.warn("[cuidador-alarmas] No se pudo obtener conteo de medicinas:", error);
    cuidadorAlarmasState.medsCount = 0;
  }
}

export async function deleteAlarm(id) {
  if (!_deleteModal) return;
  const confirmed = await _deleteModal.open();
  if (!confirmed) return;

  try {
    await eliminarAlarmaPaciente(id);
    _deleteModal.close();
    cuidadorAlarmasState.alarms = cuidadorAlarmasState.alarms.filter(x => Number(x.id) !== Number(id));
    if (cuidadorAlarmasState.selectedId === id) cuidadorAlarmasState.selectedId = null;
    await loadTodayAlarmsFromApi();
    renderAlarms();
    showToast("Alarma eliminada");
  } catch (error) {
    console.error("[cuidador-alarmas] Error al eliminar alarma:", error);
    _deleteModal.close();
    showToast(error.message || "Error al eliminar la alarma");
  }
}

export async function updateAlarm(id, dto) {
  try {
    const updated = await actualizarAlarmaPaciente(id, dto);
    const idx = cuidadorAlarmasState.alarms.findIndex(a => Number(a.id) === Number(id));
    if (idx >= 0) {
      cuidadorAlarmasState.alarms[idx] = normalizeAlarm(updated ?? { ...dto, id });
    }
    await loadTodayAlarmsFromApi();
    renderAlarms();
    showToast("Alarma actualizada");
  } catch (error) {
    console.error("[cuidador-alarmas] Error al actualizar alarma:", error);
    showToast(error.message || "Error al actualizar la alarma");
    throw error;
  }
}
