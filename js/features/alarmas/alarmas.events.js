import { alarmasState } from "./alarmas.state.js";
import { renderAlarms, renderDetail, renderDetailEdit } from "./alarmas.render.js";
import { toggleAlarm, deleteAlarm, updateAlarm } from "./alarmas.controller.js";

export function bindUiEvents() {
  document.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(x => x.classList.remove("active"));
      tab.classList.add("active");
      alarmasState.currentFilter = tab.dataset.filter;
      alarmasState.selectedId = null;
      renderAlarms();
    });
  });

  document.getElementById("searchInput").addEventListener("input", e => {
    alarmasState.searchQuery = e.target.value;
    renderAlarms();
  });

  document.getElementById("detailPanel").addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "toggle")      toggleAlarm(id);
    if (btn.dataset.action === "delete")      deleteAlarm(id);
    if (btn.dataset.action === "edit") {
      const alarm = alarmasState.alarms.find(a => Number(a.id) === id);
      if (alarm) renderDetailEdit(alarm);
    }
    if (btn.dataset.action === "cancel-edit") renderDetail();
    if (btn.dataset.action === "save-edit")   _handleSaveEdit(id);
  });
}

async function _handleSaveEdit(id) {
  const alarm = alarmasState.alarms.find(a => Number(a.id) === id);
  if (!alarm) return;

  const inicio    = document.getElementById("editFechaInicio")?.value;
  const fin       = document.getElementById("editFechaFin")?.value;
  const frecHoras = Number(document.getElementById("editFrecuencia")?.value);

  if (!inicio || !fin || !frecHoras) return;

  const btn = document.querySelector(`[data-action="save-edit"][data-id="${id}"]`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Actualizando...";
  }

  try {
    await updateAlarm(id, {
      medicinaId:      Number(alarm.medId),
      fechaInicio:     inicio,
      fechaFin:        fin,
      frecuenciaHoras: frecHoras
    });
  } catch {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Actualizar";
    }
  }
}

