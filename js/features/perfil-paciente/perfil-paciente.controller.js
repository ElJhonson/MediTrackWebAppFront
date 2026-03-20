import { logout } from "../../core/auth.js";
import { setupPhoneInputValidation, setupCurpInputValidation } from "../../utils/form-validation.js";
import { notifyError } from "../../core/notify.js";
import { perfilPacienteState, getPerfilPacienteElements, hasRequiredPerfilPacienteElements } from "./perfil-paciente.state.js";
import { createPerfilPacienteActions } from "./perfil-paciente.actions.js";
import { closeReauthModal, mostrarPerfilCargado } from "./perfil-paciente.dom.js";
import { renderTags } from "./perfil-paciente.tags.js";
import {
    togglePhoneVisibility,
    toggleCurpVisibility,
    initVisibilityButtons
} from "./perfil-paciente.edit.js";

function addDiseaseTag(e) {
    e.preventDefault();
    const input = document.getElementById("new-disease-input");
    const enfermedad = input.value.trim();

    if (!enfermedad) {
        notifyError("Por favor ingresa una enfermedad");
        return;
    }

    if (perfilPacienteState.enfermedades.includes(enfermedad)) {
        notifyError("Esta enfermedad ya está agregada");
        return;
    }

    perfilPacienteState.enfermedades.push(enfermedad);
    input.value = "";
    renderTags(perfilPacienteState);
}

function handleDiseaseActions(e) {
    if (e.target.classList.contains("btn-remove-tag")) {
        const enfermedad = e.target.dataset.enfermedad;
        perfilPacienteState.enfermedades = perfilPacienteState.enfermedades.filter(
            (disease) => disease !== enfermedad
        );
        renderTags(perfilPacienteState);
    }
}

export async function initPerfilPaciente() {
    const elements = getPerfilPacienteElements();
    
    if (!hasRequiredPerfilPacienteElements(elements)) {
        console.error("Perfil paciente: faltan elementos requeridos en el DOM.", elements);
        return;
    }

    // Configurar validaciones
    setupPhoneInputValidation(elements.inputPhone);
    setupCurpInputValidation(elements.inputCurp);
    initVisibilityButtons();

    // Crear acciones con referencia al estado compartido
    const actions = createPerfilPacienteActions({
        elements,
        state: perfilPacienteState
    });

    // Vincular eventos
    elements.btnEditProfile.addEventListener("click", () => actions.alternarEdicion());
    elements.btnCancelProfile.addEventListener("click", () => actions.cancelarEdicion());
    elements.profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        actions.guardarCambios();
    });
    elements.inputTogglePhone.addEventListener("click", togglePhoneVisibility);
    elements.inputToggleCurp.addEventListener("click", toggleCurpVisibility);
    elements.btnContinueReauth.addEventListener("click", () => actions.confirmarReauth());
    elements.btnCancelReauth.addEventListener("click", () => actions.cancelarReauth());
    elements.diseasesContainer.addEventListener("click", handleDiseaseActions);
    
    // Agregar enfermedad
    const addButton = elements.addDiseaseBox.querySelector(".btn-add-tag");
    if (addButton) {
        addButton.addEventListener("click", addDiseaseTag);
    }

    // Logout
    if (elements.btnLogout) {
        elements.btnLogout.addEventListener("click", () => logout());
    }

    closeReauthModal(elements);

    try {
        await actions.cargarPerfil();
        mostrarPerfilCargado();
        renderTags(perfilPacienteState);
    } catch (error) {
        console.error("Error cargando perfil del paciente:", error);
        notifyError(error.message || "No se pudo cargar el perfil");
    }
}
