import {
    cargarDatosCuidador,
    cargarPacientes,
    registrarPacienteDesdeFormulario
} from "./dashboard-cuidador.data.js";
import { bindDashboardCuidadorEvents } from "./dashboard-cuidador.events.js";
import {
    getDashboardElements,
    hasRequiredDashboardElements
} from "./dashboard-cuidador.state.js";

export function initDashboardCuidador() {
    const elements = getDashboardElements();

    if (!hasRequiredDashboardElements(elements)) {
        console.error("Dashboard cuidador: faltan elementos requeridos en el DOM.");
        return;
    }

    bindDashboardCuidadorEvents(elements, {
        onRegistrarPaciente: () => registrarPacienteDesdeFormulario(elements)
    });

    cargarDatosCuidador(elements);
    cargarPacientes(elements);
}
