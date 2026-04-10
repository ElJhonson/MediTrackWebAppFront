import { ROLES, STORAGE_KEYS } from "../../core/config.js";
import { initCuidadorAlarmasTopbar } from "./cuidador-alarmas.topbar.js";
import { bindUiEvents } from "./cuidador-alarmas.events.js";
import {
  initDeleteModal,
  loadAlarmsFromApi,
  loadTodayAlarmsFromApi,
  loadMedsCountFromApi,
  showToast
} from "./cuidador-alarmas.controller.js";
import { renderAlarms } from "./cuidador-alarmas.render.js";
import { cuidadorAlarmasState } from "./cuidador-alarmas.state.js";
import { obtenerPacientesVinculados } from "./cuidador-alarmas.data.js";

// ── Validación de rol ──────────────────────────────────────────────────────

function validarRolCuidador() {
  const role = localStorage.getItem(STORAGE_KEYS.ROLE);
  if (role !== ROLES.CUIDADOR) {
    window.location.replace("/index.html");
    return false;
  }
  return true;
}

// ── Selector de paciente ───────────────────────────────────────────────────

function renderPatientSelectorDropdown() {
  const dropdown = document.getElementById("patientSelectorDropdown");
  if (!dropdown) return;
  dropdown.innerHTML = "";

  cuidadorAlarmasState.pacientes.forEach(paciente => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "patient-option";
    btn.dataset.patientId = String(paciente.id);
    btn.role = "option";
    btn.textContent = paciente.name || `Paciente ${paciente.id}`;

    if (String(paciente.id) === String(cuidadorAlarmasState.pacienteId)) {
      btn.classList.add("active");
    }

    dropdown.appendChild(btn);
  });
}

function updatePatientContextBar() {
  const nameEl   = document.getElementById("patientContextName");
  const avatarEl = document.getElementById("patientContextAvatar");

  if (nameEl) nameEl.textContent = cuidadorAlarmasState.pacienteNombre;

  if (avatarEl) {
    avatarEl.textContent = cuidadorAlarmasState.pacienteNombre
      .split(" ")
      .map(p => p[0] || "")
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }
}

function bindPatientSelectorEvents() {
  const selectorWrap = document.getElementById("patientSelectorWrap");
  const selectorBtn  = document.getElementById("patientSelectorBtn");
  const dropdown     = document.getElementById("patientSelectorDropdown");

  const closeSelector = () => {
    selectorWrap?.classList.remove("open");
    selectorBtn?.setAttribute("aria-expanded", "false");
  };

  selectorBtn?.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = selectorWrap.classList.toggle("open");
    selectorBtn.setAttribute("aria-expanded", String(isOpen));
  });

  dropdown?.addEventListener("click", async e => {
    const option = e.target.closest("button.patient-option");
    if (!option) return;
    const selectedId = option.dataset.patientId;
    if (!selectedId || selectedId === String(cuidadorAlarmasState.pacienteId)) {
      closeSelector();
      return;
    }
    closeSelector();
    await cambiarPaciente(selectedId);
  });

  window.addEventListener("click", e => {
    if (!selectorWrap?.contains(e.target)) closeSelector();
  });
}

async function cambiarPaciente(pacienteId) {
  const paciente = cuidadorAlarmasState.pacientes.find(p => String(p.id) === String(pacienteId));

  cuidadorAlarmasState.pacienteId     = pacienteId;
  cuidadorAlarmasState.pacienteNombre = paciente?.name || "Paciente";
  cuidadorAlarmasState.alarms         = [];
  cuidadorAlarmasState.todayAlarms    = [];
  cuidadorAlarmasState.medsCount      = 0;
  cuidadorAlarmasState.selectedId     = null;
  cuidadorAlarmasState.searchQuery    = "";
  cuidadorAlarmasState.currentFilter  = "all";

  // Resetear UI de filtros
  document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
  document.querySelector(".tab-btn[data-filter='all']")?.classList.add("active");
  const searchEl = document.getElementById("searchInput");
  if (searchEl) searchEl.value = "";

  updatePatientContextBar();
  renderPatientSelectorDropdown();

  await Promise.all([loadAlarmsFromApi(), loadTodayAlarmsFromApi(), loadMedsCountFromApi()]);
  renderAlarms();
}

// ── Bootstrap de pacientes ─────────────────────────────────────────────────

async function bootstrapPacientes() {
  const params = new URLSearchParams(window.location.search);
  const pacienteIdParam     = params.get("pacienteId");
  const pacienteNombreParam = params.get("pacienteNombre");

  try {
    cuidadorAlarmasState.pacientes = await obtenerPacientesVinculados();
  } catch (error) {
    showToast("No se pudieron obtener los pacientes vinculados");
    window.location.replace("/pages/dashboard-cuidador.html");
    return;
  }

  if (!Array.isArray(cuidadorAlarmasState.pacientes) || cuidadorAlarmasState.pacientes.length === 0) {
    showToast("No tienes pacientes vinculados para gestionar.");
    window.location.replace("/pages/dashboard-cuidador.html");
    return;
  }

  // Determinar paciente inicial desde URL o primer paciente de la lista
  const idFromUrl = pacienteIdParam
    ? cuidadorAlarmasState.pacientes.find(p => String(p.id) === String(pacienteIdParam))
    : null;

  const pacienteInicial = idFromUrl ?? cuidadorAlarmasState.pacientes[0];

  cuidadorAlarmasState.pacienteId     = String(pacienteInicial.id);
  cuidadorAlarmasState.pacienteNombre = pacienteNombreParam || pacienteInicial.name || "Paciente";

  updatePatientContextBar();
  renderPatientSelectorDropdown();
  bindPatientSelectorEvents();

  await Promise.all([loadAlarmsFromApi(), loadTodayAlarmsFromApi(), loadMedsCountFromApi()]);

  // Selección automática por query param
  const paramId = new URLSearchParams(window.location.search).get("id");
  if (paramId) {
    const id = Number(paramId);
    if (cuidadorAlarmasState.alarms.find(a => Number(a.id) === id)) {
      cuidadorAlarmasState.selectedId = id;
    }
  }

  renderAlarms();
}

// ── Entry point ────────────────────────────────────────────────────────────

export async function initCuidadorAlarmasPage() {
  if (!validarRolCuidador()) return;

  initCuidadorAlarmasTopbar();
  initDeleteModal();
  bindUiEvents();

  await bootstrapPacientes();
}
