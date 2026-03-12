export function renderPerfilCuidador(elements, cuidador, pacientes) {
    const fullName = String(cuidador?.name || "Cuidador").trim() || "Cuidador";

    elements.profileStatus.textContent = "Perfil cargado correctamente";
    elements.caregiverName.textContent = fullName;
    elements.caregiverAvatar.textContent = fullName
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .substring(0, 2)
        .toUpperCase();

    elements.infoName.textContent = fullName;
    elements.infoPhone.textContent = cuidador?.phoneNumber || "No disponible";
    elements.infoCodigo.textContent = cuidador?.codigoVinculacion || "No disponible";
    elements.infoPacientes.textContent = String(Array.isArray(pacientes) ? pacientes.length : 0);
}

export function renderPerfilCuidadorError(elements) {
    elements.profileStatus.textContent = "No se pudo cargar la informacion del perfil";
}
