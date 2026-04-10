import { cuidadorAlarmasState } from "./cuidador-alarmas.state.js";
import { renderAlarms, renderDetail, renderDetailEdit } from "./cuidador-alarmas.render.js";
import { deleteAlarm, updateAlarm } from "./cuidador-alarmas.controller.js";

export function bindUiEvents() {
  document.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(x => x.classList.remove("active"));
      tab.classList.add("active");
      cuidadorAlarmasState.currentFilter = tab.dataset.filter;
      cuidadorAlarmasState.selectedId = null;
      renderAlarms();
    });
  });

  document.getElementById("searchInput").addEventListener("input", e => {
    cuidadorAlarmasState.searchQuery = e.target.value;
    renderAlarms();
  });

  document.getElementById("detailPanel").addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "delete")      deleteAlarm(id);
    if (btn.dataset.action === "edit") {
      const alarm = cuidadorAlarmasState.alarms.find(a => Number(a.id) === id);
      if (alarm) renderDetailEdit(alarm);
    }
    if (btn.dataset.action === "cancel-edit") renderDetail();
    if (btn.dataset.action === "save-edit")   _handleSaveEdit(id);
  });
}

async function _handleSaveEdit(id) {
  const alarm = cuidadorAlarmasState.alarms.find(a => Number(a.id) === id);
  if (!alarm) return;

  const inicioEl = document.getElementById("editFechaInicio");
  const finEl    = document.getElementById("editFechaFin");
  const frecEl   = document.getElementById("editFrecuencia");

  const inicio    = inicioEl?.value;
  const fin       = finEl?.value;
  const frecHoras = Number(frecEl?.value);

  const fields = [
    { el: inicioEl, valid: !!inicio },
    { el: finEl,    valid: !!fin },
    { el: frecEl,   valid: !!frecHoras }
  ];

  let hasError = false;
  fields.forEach(({ el, valid }) => {
    if (!el) return;
    el.classList.toggle("input-error", !valid);
    let errMsg = el.parentElement.querySelector(".edit-field-error");
    if (!valid) {
      hasError = true;
      if (!errMsg) {
        errMsg = document.createElement("span");
        errMsg.className = "edit-field-error";
        errMsg.textContent = "Este campo es obligatorio";
        el.parentElement.appendChild(errMsg);
      }
      el.addEventListener("input", function clear() {
        if (el.value) {
          el.classList.remove("input-error");
          errMsg?.remove();
          el.removeEventListener("input", clear);
        }
      }, { once: false });
    } else if (errMsg) {
      errMsg.remove();
    }
  });

  if (hasError) return;

  const btn = document.querySelector(`[data-action="save-edit"][data-id="${id}"]`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Actualizando...";
  }

  try {
    await updateAlarm(id, {
      medicinaId:      Number(alarm.medId),
      pacienteId:      Number(cuidadorAlarmasState.pacienteId),
      fechaInicio:     inicio,
      fechaFin:        fin,
      frecuenciaHoras: frecHoras
    });
  } catch {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Actualizar alarma";
    }
  }
}
