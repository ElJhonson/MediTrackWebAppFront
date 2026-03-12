import {
    obtenerMisDatosCuidador,
    obtenerPacientesDelCuidador
} from "../../services/cuidador.service.js";

export async function obtenerPerfilCuidadorConPacientes() {
    const [cuidador, pacientes] = await Promise.all([
        obtenerMisDatosCuidador(),
        obtenerPacientesDelCuidador()
    ]);

    return {
        cuidador,
        pacientes: Array.isArray(pacientes) ? pacientes : []
    };
}
