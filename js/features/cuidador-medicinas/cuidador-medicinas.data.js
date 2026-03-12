import {
    registrarMedicina as registrarMedicinaService,
    actualizarMedicina as actualizarMedicinaService,
    eliminarMedicina as eliminarMedicinaService,
    obtenerMedicinasPaciente,
    obtenerMedicinaPorId
} from "../../services/medicina.service.js";
import {
    obtenerPacientePorId,
    obtenerPacientesDelCuidador
} from "../../services/cuidador.service.js";

export async function obtenerPacientesVinculados() {
    return obtenerPacientesDelCuidador();
}

export async function obtenerDetallePaciente(id) {
    return obtenerPacientePorId(id);
}

export async function obtenerMedicinasPorPaciente(id) {
    return obtenerMedicinasPaciente(id);
}

export async function obtenerDetalleMedicina(id) {
    return obtenerMedicinaPorId(id);
}

export async function registrarMedicinaPaciente(dto, pacienteId) {
    return registrarMedicinaService({
        ...dto,
        pacienteId
    });
}

export async function actualizarMedicinaPaciente(id, dto) {
    return actualizarMedicinaService(id, dto);
}

export async function eliminarMedicinaPaciente(id) {
    return eliminarMedicinaService(id);
}
