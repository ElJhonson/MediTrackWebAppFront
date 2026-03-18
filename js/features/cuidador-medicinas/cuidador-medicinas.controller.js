import { logout } from "../../core/auth.js";
import { notifyError, notifyInfo, notifySuccess } from "../../core/notify.js";
import * as data from "./cuidador-medicinas.data.js";
import {
    bindCuidadorMedicinasEvents
} from "./cuidador-medicinas.events.js";
import * as dom from "./cuidador-medicinas.dom.js";
import {
    cuidadorMedicinasState as state,
    getCuidadorMedicinasElements,
    hasRequiredCuidadorMedicinasElements
} from "./cuidador-medicinas.state.js";
import { createCuidadorMedicinasActions } from "./cuidador-medicinas.actions.js";

export async function initCuidadorMedicinasPage() {
    const elements = getCuidadorMedicinasElements();
    if (!hasRequiredCuidadorMedicinasElements(elements)) {
        console.error("Cuidador medicinas: faltan elementos requeridos en el DOM.");
        return;
    }

    const actions = createCuidadorMedicinasActions({
        elements,
        state,
        data,
        dom,
        notify: {
            error: notifyError,
            success: notifySuccess
        }
    });

    if (!actions.validarRolCuidador()) {
        return;
    }

    actions.setTopbarData();

    bindCuidadorMedicinasEvents(elements, {
        onCloseAccountMenu: () => dom.closeAccountMenu(elements),
        onClosePatientSelector: () => dom.closePatientSelector(elements),
        onCloseModal: () => dom.closeModal(elements),
        onDeleteConfirmChoice: (confirmado) => dom.responderConfirmacionEliminacion(elements, confirmado),
        onLogout: () => logout(),
        onChangePaciente: async (pacienteId) => actions.cambiarPaciente(pacienteId),
        onOpenCreateModal: () => dom.openCreateModal(elements),
        onSubmitForm: async () => actions.guardarDesdeFormulario(),
        onEditMedicina: async (id, button) => actions.abrirEdicion(id, button),
        onDeleteMedicina: async (id) => actions.eliminarMedicina(id),
        onReminderInfo: () => notifyInfo("La configuracion de recordatorios se realiza desde el panel del paciente.")
    });

    await actions.bootstrapPacientes();
}
