import { logout } from "../../core/auth.js";
import { ROLES, STORAGE_KEYS } from "../../core/config.js";
import { notifyError, notifyInfo, notifySuccess } from "../../core/notify.js";
import {
    actualizarMedicinaPaciente,
    eliminarMedicinaPaciente,
    obtenerDetalleMedicina,
    obtenerDetallePaciente,
    obtenerMedicinasPorPaciente,
    obtenerPacientesVinculados,
    registrarMedicinaPaciente
} from "./cuidador-medicinas.data.js";
import {
    bindCuidadorMedicinasEvents
} from "./cuidador-medicinas.events.js";
import {
    cerrarModalConfirmacionEliminacion,
    closeAccountMenu,
    closeModal,
    closePatientSelector,
    fillEditModal,
    getFormPayload,
    openCreateModal,
    renderMedicinas,
    renderPatientSelectorDropdown,
    renderQuickStats,
    setMedicinasLoading,
    setMedicinasLoadError,
    setPatientHeader,
    solicitarConfirmacionEliminacion,
    syncPatientInUrl
} from "./cuidador-medicinas.dom.js";
import {
    cuidadorMedicinasState as state,
    getCuidadorMedicinasElements,
    hasRequiredCuidadorMedicinasElements
} from "./cuidador-medicinas.state.js";

export async function initCuidadorMedicinasPage() {
    const elements = getCuidadorMedicinasElements();
    if (!hasRequiredCuidadorMedicinasElements(elements)) {
        console.error("Cuidador medicinas: faltan elementos requeridos en el DOM.");
        return;
    }

    if (!validarRolCuidador()) {
        return;
    }

    setTopbarData(elements);

    bindCuidadorMedicinasEvents(elements, {
        onCloseAccountMenu: () => closeAccountMenu(elements),
        onClosePatientSelector: () => closePatientSelector(elements),
        onCloseModal: () => closeModal(elements),
        onDeleteConfirmChoice: (confirmado) => cerrarModalConfirmacionEliminacion(elements, confirmado),
        onLogout: () => logout(),
        onChangePaciente: async (pacienteId) => cambiarPaciente(elements, pacienteId),
        onOpenCreateModal: () => openCreateModal(elements),
        onSubmitForm: async () => guardarDesdeFormulario(elements),
        onEditMedicina: async (id) => abrirEdicion(elements, id),
        onDeleteMedicina: async (id) => eliminarMedicina(elements, id),
        onReminderInfo: () => notifyInfo("La configuracion de recordatorios se realiza desde el panel del paciente.")
    });

    await bootstrapPacientes(elements);
}

async function bootstrapPacientes(elements) {
    const params = new URLSearchParams(window.location.search);
    const pacienteIdParam = params.get("pacienteId");
    const pacienteNombreParam = params.get("pacienteNombre");

    try {
        state.pacientes = await obtenerPacientesVinculados();
    } catch (error) {
        notifyError(error.message || "No se pudieron obtener los pacientes vinculados");
        window.location.replace("/pages/dashboard-cuidador.html");
        return;
    }

    if (!Array.isArray(state.pacientes) || state.pacientes.length === 0) {
        notifyError("No tienes pacientes vinculados para gestionar medicinas.");
        window.location.replace("/pages/dashboard-cuidador.html");
        return;
    }

    state.pacienteId = pacienteIdParam || String(state.pacientes[0].id);
    state.pacienteNombre = pacienteNombreParam || "Paciente";

    if (!state.pacientes.some((p) => String(p.id) === String(state.pacienteId))) {
        state.pacienteId = String(state.pacientes[0].id);
    }

    renderPatientSelectorDropdown(elements, state);
    await cargarHeaderPaciente(elements, state.pacienteId);
    await cargarMedicinasPaciente(elements, state.pacienteId);
}

async function cargarMedicinasPaciente(elements, pacienteId) {
    setMedicinasLoading(elements);

    try {
        state.lista = await obtenerMedicinasPorPaciente(pacienteId);
        renderMedicinas(elements, state.lista);
        renderQuickStats(elements, state.lista);
    } catch (error) {
        console.error("Error al cargar medicinas:", error);
        setMedicinasLoadError(elements);
        renderQuickStats(elements, []);
        notifyError(error.message || "No se pudieron cargar las medicinas");
    }
}

async function guardarDesdeFormulario(elements) {
    const id = elements.editId.value;
    const dto = getFormPayload(elements);

    try {
        if (id) {
            await actualizarMedicinaPaciente(id, dto);
            notifySuccess("Medicina actualizada correctamente");
        } else {
            await registrarMedicinaPaciente(dto, state.pacienteId);
            notifySuccess("Medicina registrada correctamente");
        }

        closeModal(elements);
        await cargarMedicinasPaciente(elements, state.pacienteId);
    } catch (error) {
        console.error("Error al guardar medicina:", error);
        notifyError(error.message || "No se pudo guardar la medicina");
    }
}

async function abrirEdicion(elements, id) {
    try {
        const med = await obtenerDetalleMedicina(id);
        fillEditModal(elements, med);
    } catch (error) {
        console.error("Error al obtener medicina:", error);
        notifyError(error.message || "No se pudo cargar la medicina");
    }
}

async function eliminarMedicina(elements, id) {
    const confirmado = await solicitarConfirmacionEliminacion(elements);
    if (!confirmado) return;

    try {
        await eliminarMedicinaPaciente(id);
        notifySuccess("Medicina eliminada correctamente");
        await cargarMedicinasPaciente(elements, state.pacienteId);
    } catch (error) {
        console.error("Error al eliminar medicina:", error);
        notifyError(error.message || "No se pudo eliminar la medicina");
    }
}

async function cambiarPaciente(elements, pacienteId) {
    state.pacienteId = pacienteId;
    syncPatientInUrl(state, pacienteId);

    await cargarHeaderPaciente(elements, pacienteId);
    renderPatientSelectorDropdown(elements, state);
    await cargarMedicinasPaciente(elements, pacienteId);
}

async function cargarHeaderPaciente(elements, pacienteId) {
    try {
        const paciente = await obtenerDetallePaciente(pacienteId);
        setPatientHeader(elements, state, paciente);
    } catch {
        const fallback = state.pacientes.find((p) => String(p.id) === String(pacienteId));
        setPatientHeader(elements, state, fallback || { name: state.pacienteNombre });
    }
}

function setTopbarData(elements) {
    const rawName = String(localStorage.getItem(STORAGE_KEYS.NAME) || "Cuidador").trim();
    const shortName = rawName.split(" ").slice(0, 2).join(" ") || "Cuidador";
    state.cuidadorNombre = rawName || shortName;

    elements.caregiverName.textContent = shortName;
    elements.caregiverAvatar.textContent = shortName
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

function validarRolCuidador() {
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (role !== ROLES.CUIDADOR) {
        window.location.replace("/index.html");
        return false;
    }

    return true;
}
