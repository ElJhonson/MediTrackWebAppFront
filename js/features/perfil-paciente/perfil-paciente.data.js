import {
    obtenerMisDatosPaciente,
    actualizarMiPerfil
} from "../../services/paciente.service.js";
import {
    obtenerPacientePorId,
    actualizarPacienteDesdeCuidador
} from "../../services/cuidador.service.js";

function obtenerPacienteIdDesdeUrl() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id") || params.get("pacienteId");

    if (!idParam) return null;

    const id = Number(idParam);
    return Number.isFinite(id) && id > 0 ? id : null;
}

export async function obtenerPerfilPaciente() {
    const pacienteId = obtenerPacienteIdDesdeUrl();

    if (pacienteId) {
        return obtenerPacientePorId(pacienteId);
    }

    return obtenerMisDatosPaciente();
}

export async function actualizarPerfilPaciente(dto) {
    const pacienteId = obtenerPacienteIdDesdeUrl();

    if (pacienteId) {
        return actualizarPacienteDesdeCuidador(pacienteId, dto);
    }

    return actualizarMiPerfil(dto);
}
