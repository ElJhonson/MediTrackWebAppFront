import { ROUTES } from "../../core/config.js";
import { notifyError } from "../../core/notify.js";
import { obtenerPerfilCuidadorConPacientes } from "./perfil-cuidador.data.js";
import {
    renderPerfilCuidador,
    renderPerfilCuidadorError
} from "./perfil-cuidador.dom.js";
import { bindPerfilCuidadorEvents } from "./perfil-cuidador.events.js";
import {
    getPerfilCuidadorElements,
    hasRequiredPerfilCuidadorElements
} from "./perfil-cuidador.state.js";

export async function initPerfilCuidador() {
    const elements = getPerfilCuidadorElements();
    if (!hasRequiredPerfilCuidadorElements(elements)) {
        console.error("Perfil cuidador: faltan elementos requeridos en el DOM.");
        return;
    }

    bindPerfilCuidadorEvents(elements, {
        onBack: () => {
            window.location.href = ROUTES.DASHBOARD_CUIDADOR;
        }
    });

    try {
        const { cuidador, pacientes } = await obtenerPerfilCuidadorConPacientes();
        renderPerfilCuidador(elements, cuidador, pacientes);
    } catch (error) {
        console.error("Error cargando perfil del cuidador:", error);
        renderPerfilCuidadorError(elements);
        notifyError(error.message || "No se pudo cargar el perfil del cuidador");
    }
}
