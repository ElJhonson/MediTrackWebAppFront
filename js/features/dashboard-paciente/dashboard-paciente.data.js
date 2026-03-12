import { obtenerMisDatosPaciente } from "../../services/paciente.service.js";

export async function obtenerDatosPacienteActual() {
    return obtenerMisDatosPaciente();
}
