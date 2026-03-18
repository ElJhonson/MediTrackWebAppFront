import { sanitizePhoneValue } from "../../utils/form-validation.js";

function resolveFullName(cuidador) {
    return String(cuidador?.name || "Cuidador").trim() || "Cuidador";
}

export function renderPerfilCuidador(elements, cuidador, pacientes) {
    const fullName = String(cuidador?.name || "Cuidador").trim() || "Cuidador";

    elements.profileStatus.textContent = "";
    elements.caregiverName.textContent = fullName;
    elements.caregiverAvatar.textContent = fullName
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .substring(0, 2)
        .toUpperCase();

    elements.inputName.value = fullName;
    elements.inputPhone.value = sanitizePhoneValue(cuidador?.phoneNumber || "");
    elements.inputOcupacion.value = String(cuidador?.ocupacion || "").trim();
    elements.infoCodigo.textContent = cuidador?.codigoVinculacion || "No disponible";
    elements.infoPacientes.textContent = String(Array.isArray(pacientes) ? pacientes.length : 0);
}

export function setPerfilCuidadorEditMode(elements, isEditing) {
    elements.inputName.disabled = !isEditing;
    elements.inputPhone.disabled = !isEditing;
    elements.inputOcupacion.disabled = !isEditing;
    elements.profileActions.classList.toggle("hidden", !isEditing);
    elements.btnEditProfile.textContent = isEditing ? "Viendo Perfil" : "Editar Perfil";
}

export function resetPerfilCuidadorForm(elements, cuidador) {
    const fullName = resolveFullName(cuidador);
    elements.inputName.value = fullName;
    elements.inputPhone.value = sanitizePhoneValue(cuidador?.phoneNumber || "");
    elements.inputOcupacion.value = String(cuidador?.ocupacion || "").trim();
}

export function getPerfilCuidadorDTO(elements) {
    return {
        name: String(elements.inputName.value || "").trim(),
        phoneNumber: sanitizePhoneValue(elements.inputPhone.value),
        ocupacion: String(elements.inputOcupacion.value || "").trim()
    };
}

export function renderPerfilCuidadorError(elements) {
    elements.profileStatus.textContent = "No se pudo cargar la información del perfil";
}
