import {
    obtenerMisDatosPaciente,
    actualizarMiPerfil
} from "../../services/paciente.service.js";

export async function obtenerPerfilPaciente() {
    return obtenerMisDatosPaciente();
}

export async function actualizarPerfilPaciente(dto) {
    return actualizarMiPerfil(dto);
}
