import { logout } from "../../core/auth.js";
import { notifyError, notifySuccess } from "../../core/notify.js";
import {
    PHONE_DIGITS,
    sanitizePhoneValue,
    setupPhoneInputValidation
} from "../../utils/form-validation.js";
import {
    actualizarPerfilCuidador,
    obtenerPerfilCuidadorConPacientes
} from "./perfil-cuidador.data.js";
import {
    getPerfilCuidadorDTO,
    renderPerfilCuidador,
    renderPerfilCuidadorError,
    resetPerfilCuidadorForm,
    setPerfilCuidadorEditMode
} from "./perfil-cuidador.dom.js";
import { bindPerfilCuidadorEvents } from "./perfil-cuidador.events.js";
import {
    getPerfilCuidadorElements,
    hasRequiredPerfilCuidadorElements
} from "./perfil-cuidador.state.js";

const perfilCuidadorState = {
    modoEdicion: false,
    guardando: false,
    cuidador: null,
    pacientes: [],
    dtoPendienteReauth: null
};

function setSavingState(elements, isSaving) {
    perfilCuidadorState.guardando = isSaving;
    elements.btnSaveProfile.disabled = isSaving;
    elements.btnCancelProfile.disabled = isSaving;
    elements.btnEditProfile.disabled = isSaving;
    elements.inputName.disabled = isSaving || !perfilCuidadorState.modoEdicion;
    elements.inputPhone.disabled = isSaving || !perfilCuidadorState.modoEdicion;
    elements.inputOcupacion.disabled = isSaving || !perfilCuidadorState.modoEdicion;
    elements.btnContinueReauth.disabled = isSaving;
    elements.btnCancelReauth.disabled = isSaving;

    elements.btnSaveProfile.textContent = isSaving
        ? "Guardando..."
        : "Guardar Cambios";
}

function openReauthModal(elements) {
    elements.reauthModal.classList.remove("hidden");
    elements.reauthModal.setAttribute("aria-hidden", "false");
}

function closeReauthModal(elements) {
    elements.reauthModal.classList.add("hidden");
    elements.reauthModal.setAttribute("aria-hidden", "true");
}

async function cargarPerfil(elements) {
    const { cuidador, pacientes } = await obtenerPerfilCuidadorConPacientes();
    perfilCuidadorState.cuidador = cuidador;
    perfilCuidadorState.pacientes = pacientes;
    perfilCuidadorState.dtoPendienteReauth = null;
    renderPerfilCuidador(elements, cuidador, pacientes);
    setPerfilCuidadorEditMode(elements, false);
    perfilCuidadorState.modoEdicion = false;
}

function alternarEdicion(elements) {
    perfilCuidadorState.modoEdicion = !perfilCuidadorState.modoEdicion;
    setPerfilCuidadorEditMode(elements, perfilCuidadorState.modoEdicion);
}

function cancelarEdicion(elements) {
    resetPerfilCuidadorForm(elements, perfilCuidadorState.cuidador);
    perfilCuidadorState.modoEdicion = false;
    setPerfilCuidadorEditMode(elements, false);
}

function telefonoCambiado(dto) {
    const telefonoActual = sanitizePhoneValue(perfilCuidadorState.cuidador?.phoneNumber || "");
    return dto.phoneNumber !== telefonoActual;
}

function validarDTO(dto) {
    if (!dto.name) {
        notifyError("El nombre es obligatorio");
        return false;
    }

    if (dto.phoneNumber.length !== PHONE_DIGITS) {
        notifyError("El numero de telefono debe tener 10 digitos");
        return false;
    }

    return true;
}

async function actualizarPerfil(elements, dto, options = {}) {
    const { logoutAfterSave = false } = options;

    try {
        setSavingState(elements, true);
        const response = await actualizarPerfilCuidador(dto);
        const message = response?.message || "Datos actualizados correctamente";

        if (logoutAfterSave || response?.requiresReauth) {
            notifySuccess(message);
            logout();
            return;
        }

        await cargarPerfil(elements);
        notifySuccess(message);
    } catch (error) {
        console.error("Error actualizando perfil del cuidador:", error);
        notifyError(error.message || "No se pudo actualizar el perfil del cuidador");
    } finally {
        setSavingState(elements, false);
    }
}

async function guardarCambios(elements) {
    if (!perfilCuidadorState.modoEdicion || perfilCuidadorState.guardando) return;

    const dto = getPerfilCuidadorDTO(elements);
    if (!validarDTO(dto)) return;

    if (telefonoCambiado(dto)) {
        perfilCuidadorState.dtoPendienteReauth = dto;
        openReauthModal(elements);
        return;
    }

    await actualizarPerfil(elements, dto);
}

async function confirmarReauth(elements) {
    if (perfilCuidadorState.guardando) return;

    const dto = perfilCuidadorState.dtoPendienteReauth;
    if (!dto) {
        closeReauthModal(elements);
        return;
    }

    closeReauthModal(elements);
    perfilCuidadorState.dtoPendienteReauth = null;
    await actualizarPerfil(elements, dto, { logoutAfterSave: true });
}

function cancelarReauth(elements) {
    closeReauthModal(elements);
    perfilCuidadorState.dtoPendienteReauth = null;
    cancelarEdicion(elements);
}

export async function initPerfilCuidador() {
    const elements = getPerfilCuidadorElements();
    if (!hasRequiredPerfilCuidadorElements(elements)) {
        console.error("Perfil cuidador: faltan elementos requeridos en el DOM.");
        return;
    }

    setupPhoneInputValidation(elements.inputPhone);

    bindPerfilCuidadorEvents(elements, {
        onToggleEdit: () => alternarEdicion(elements),
        onCancelEdit: () => cancelarEdicion(elements),
        onSubmit: async () => guardarCambios(elements),
        onContinueReauth: async () => confirmarReauth(elements),
        onCancelReauth: () => cancelarReauth(elements)
    });

    closeReauthModal(elements);

    try {
        await cargarPerfil(elements);
    } catch (error) {
        console.error("Error cargando perfil del cuidador:", error);
        renderPerfilCuidadorError(elements);
        notifyError(error.message || "No se pudo cargar el perfil del cuidador");
    }
}
