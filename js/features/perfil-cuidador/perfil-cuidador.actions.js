import { logout } from "../../core/auth.js";
import { PHONE_DIGITS, sanitizePhoneValue } from "../../utils/form-validation.js";
import { notifyError, notifySuccess } from "../../core/notify.js";
import { actualizarPerfilCuidador, obtenerPerfilCuidadorConPacientes } from "./perfil-cuidador.data.js";
import {
    getPerfilCuidadorDTO,
    renderPerfilCuidador,
    resetPerfilCuidadorForm,
    setPerfilCuidadorEditMode,
    setSavingState,
    openReauthModal,
    closeReauthModal
} from "./perfil-cuidador.dom.js";

export function createPerfilCuidadorActions({ elements }) {
    const state = {
        modoEdicion: false,
        guardando: false,
        cuidador: null,
        pacientes: [],
        dtoPendienteReauth: null
    };

    function telefonoCambiado(dto) {
        const telefonoActual = sanitizePhoneValue(state.cuidador?.phoneNumber || "");
        return dto.phoneNumber !== telefonoActual;
    }

    function validarDTO(dto) {
        if (!dto.name) {
            notifyError("El nombre es obligatorio");
            return false;
        }

        if (dto.phoneNumber.length !== PHONE_DIGITS) {
            notifyError("El número de teléfono debe tener 10 dígitos");
            return false;
        }

        return true;
    }

    async function cargarPerfil() {
        const { cuidador, pacientes } = await obtenerPerfilCuidadorConPacientes();
        state.cuidador = cuidador;
        state.pacientes = pacientes;
        state.dtoPendienteReauth = null;
        renderPerfilCuidador(elements, cuidador, pacientes);
        setPerfilCuidadorEditMode(elements, false);
        state.modoEdicion = false;
    }

    function alternarEdicion() {
        state.modoEdicion = !state.modoEdicion;
        setPerfilCuidadorEditMode(elements, state.modoEdicion);
    }

    function cancelarEdicion() {
        resetPerfilCuidadorForm(elements, state.cuidador);
        state.modoEdicion = false;
        setPerfilCuidadorEditMode(elements, false);
    }

    async function actualizarPerfil(dto, options = {}) {
        const { logoutAfterSave = false } = options;

        try {
            state.guardando = true;
            setSavingState(elements, true, state.modoEdicion);
            const response = await actualizarPerfilCuidador(dto);
            const message = response?.message || "Datos actualizados correctamente";

            if (logoutAfterSave || response?.requiresReauth) {
                notifySuccess(message);
                logout();
                return;
            }

            await cargarPerfil();
            notifySuccess(message);
        } catch (error) {
            console.error("Error actualizando perfil del cuidador:", error);
            notifyError(error.message || "No se pudo actualizar el perfil del cuidador");
        } finally {
            state.guardando = false;
            setSavingState(elements, false, state.modoEdicion);
        }
    }

    async function guardarCambios() {
        if (!state.modoEdicion || state.guardando) return;

        const dto = getPerfilCuidadorDTO(elements);
        if (!validarDTO(dto)) return;

        if (telefonoCambiado(dto)) {
            state.dtoPendienteReauth = dto;
            openReauthModal(elements);
            return;
        }

        await actualizarPerfil(dto);
    }

    async function confirmarReauth() {
        if (state.guardando) return;

        const dto = state.dtoPendienteReauth;
        if (!dto) {
            closeReauthModal(elements);
            return;
        }

        closeReauthModal(elements);
        state.dtoPendienteReauth = null;
        await actualizarPerfil(dto, { logoutAfterSave: true });
    }

    function cancelarReauth() {
        closeReauthModal(elements);
        state.dtoPendienteReauth = null;
        cancelarEdicion();
    }

    return { cargarPerfil, alternarEdicion, cancelarEdicion, guardarCambios, confirmarReauth, cancelarReauth };
}
