import {
    cargarDatosCuidador,
    cargarPacientes,
    registrarPacienteDesdeFormulario,
    desvincularPacienteDesdeDashboard
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

    const handlers = {
        onRegistrarPaciente: () => registrarPacienteDesdeFormulario(elements, handlers),
        onDesvincularPaciente: (paciente) => desvincularPacienteDesdeDashboard(elements, paciente, handlers)
    };

    bindDashboardCuidadorEvents(elements, handlers);

    cargarDatosCuidador(elements);
    cargarPacientes(elements, handlers);
}
