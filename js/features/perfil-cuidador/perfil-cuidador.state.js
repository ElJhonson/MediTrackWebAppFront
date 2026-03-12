export function getPerfilCuidadorElements() {
    return {
        profileStatus: document.getElementById("profileStatus"),
        btnBackToDashboard: document.getElementById("btnBackToDashboard"),
        caregiverAvatar: document.getElementById("caregiverAvatar"),
        caregiverName: document.getElementById("caregiverName"),
        infoName: document.getElementById("infoName"),
        infoPhone: document.getElementById("infoPhone"),
        infoCodigo: document.getElementById("infoCodigo"),
        infoPacientes: document.getElementById("infoPacientes")
    };
}

export function hasRequiredPerfilCuidadorElements(elements) {
    return Boolean(
        elements.profileStatus
        && elements.btnBackToDashboard
        && elements.caregiverAvatar
        && elements.caregiverName
        && elements.infoName
        && elements.infoPhone
        && elements.infoCodigo
        && elements.infoPacientes
    );
}
