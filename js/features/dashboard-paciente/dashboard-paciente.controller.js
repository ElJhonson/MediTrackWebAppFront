import { STORAGE_KEYS, ROUTES } from "../../core/config.js";
import { logout } from "../../core/auth.js";
import { obtenerDatosPacienteActual } from "./dashboard-paciente.data.js";
import { bindDashboardPacienteEvents } from "./dashboard-paciente.events.js";
import {
    closeAccountMenu,
    setCaregiverStatus,
    setDashboardHeaderTitle,
    setPatientIdentity
} from "./dashboard-paciente.dom.js";
import {
    getDashboardPacienteElements,
    hasRequiredDashboardPacienteElements
} from "./dashboard-paciente.state.js";
import { initDailySection } from "./dashboard-paciente.daily.js";

export async function initDashboardPaciente() {
    const elements = getDashboardPacienteElements();
    if (!hasRequiredDashboardPacienteElements(elements)) {
        console.error("Dashboard paciente: faltan elementos requeridos en el DOM.");
        return;
    }

    const name = localStorage.getItem(STORAGE_KEYS.NAME);
    if (!name) {
        logout();
        return;
    }

    bloquearNavegacionAtras();
    setDashboardHeaderTitle(elements);
    setPatientIdentity(elements, name);

    bindDashboardPacienteEvents(elements, {
        onCloseAccountMenu: () => closeAccountMenu(elements),
        onOpenProfile: () => {
            closeAccountMenu(elements);
            window.location.href = ROUTES.PERFIL_PACIENTE;
        },
        onOpenMedicinas: () => {
            window.location.href = "/pages/medicamentos.html";
        },
        onOpenHorarios: () => {
            window.location.href = ROUTES.ALARMAS;
        },
        onOpenCuidador: () => {
            window.location.href = ROUTES.CUIDADOR_PACIENTE;
        },
        onLogout: () => logout()
    });

    await cargarDatosPacienteEnHeader(elements, name);
    initDailySection();
}

async function cargarDatosPacienteEnHeader(elements, fallbackName) {
    try {
        const paciente = await obtenerDatosPacienteActual();

        if (!paciente) {
            logout();
            return;
        }

        setPatientIdentity(elements, paciente.name || fallbackName);
        setCaregiverStatus(elements, paciente.cuidadorName);
    } catch (error) {
        console.error(error);
        setCaregiverStatus(elements, null);
    }
}

function bloquearNavegacionAtras() {
    history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", () => {
        history.pushState(null, "", window.location.href);
    });
}
