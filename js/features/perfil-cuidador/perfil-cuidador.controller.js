import { logout } from "../../core/auth.js";
import { setupPhoneInputValidation } from "../../utils/form-validation.js";
import { notifyError } from "../../core/notify.js";
import { renderPerfilCuidadorError, closeReauthModal } from "./perfil-cuidador.dom.js";
import { bindPerfilCuidadorEvents } from "./perfil-cuidador.events.js";
import {
    getPerfilCuidadorElements,
    hasRequiredPerfilCuidadorElements
} from "./perfil-cuidador.state.js";
import { setTopbarData, toggleAccountMenu, closeAccountMenu } from "./perfil-cuidador.topbar.js";
import { createPerfilCuidadorActions } from "./perfil-cuidador.actions.js";

export async function initPerfilCuidador() {
    const elements = getPerfilCuidadorElements();
    if (!hasRequiredPerfilCuidadorElements(elements)) {
        console.error("Perfil cuidador: faltan elementos requeridos en el DOM.");
        return;
    }

    setupPhoneInputValidation(elements.inputPhone);
    setTopbarData(elements);

    const actions = createPerfilCuidadorActions({ elements });

    bindPerfilCuidadorEvents(elements, {
        onToggleAccountMenu: () => toggleAccountMenu(elements),
        onCloseAccountMenu: () => closeAccountMenu(elements),
        onLogout: () => logout(),
        onToggleEdit: () => actions.alternarEdicion(),
        onCancelEdit: () => actions.cancelarEdicion(),
        onSubmit: async () => actions.guardarCambios(),
        onContinueReauth: async () => actions.confirmarReauth(),
        onCancelReauth: () => actions.cancelarReauth()
    });

    closeReauthModal(elements);

    try {
        await actions.cargarPerfil();
    } catch (error) {
        console.error("Error cargando perfil del cuidador:", error);
        renderPerfilCuidadorError(elements);
        notifyError(error.message || "No se pudo cargar el perfil del cuidador");
    }
}

