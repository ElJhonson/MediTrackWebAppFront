export function getPerfilCuidadorElements() {
    return {
        profileStatus: document.getElementById("profileStatus"),
        accountMenuWrap: document.getElementById("accountMenuWrap"),
        accountMenuBtn: document.getElementById("accountMenuBtn"),
        topbarCaregiverAvatar: document.getElementById("topbarCaregiverAvatar"),
        topbarCaregiverName: document.getElementById("topbarCaregiverName"),
        btnLogout: document.getElementById("btnLogout"),
        caregiverAvatar: document.getElementById("caregiverAvatar"),
        caregiverName: document.getElementById("caregiverName"),
        caregiverProfileForm: document.getElementById("caregiverProfileForm"),
        btnEditProfile: document.getElementById("btnEditProfile"),
        btnCancelProfile: document.getElementById("btnCancelProfile"),
        btnSaveProfile: document.getElementById("btnSaveProfile"),
        reauthModal: document.getElementById("reauthModal"),
        btnCancelReauth: document.getElementById("btnCancelReauth"),
        btnContinueReauth: document.getElementById("btnContinueReauth"),
        profileActions: document.getElementById("profileActions"),
        inputName: document.getElementById("inputName"),
        inputPhone: document.getElementById("inputPhone"),
        inputOcupacion: document.getElementById("inputOcupacion"),
        infoCodigo: document.getElementById("infoCodigo"),
        infoPacientes: document.getElementById("infoPacientes")
    };
}

export function hasRequiredPerfilCuidadorElements(elements) {
    return Boolean(
        elements.profileStatus
        && elements.accountMenuWrap
        && elements.accountMenuBtn
        && elements.topbarCaregiverAvatar
        && elements.topbarCaregiverName
        && elements.btnLogout
        && elements.caregiverAvatar
        && elements.caregiverName
        && elements.caregiverProfileForm
        && elements.btnEditProfile
        && elements.btnCancelProfile
        && elements.btnSaveProfile
        && elements.reauthModal
        && elements.btnCancelReauth
        && elements.btnContinueReauth
        && elements.profileActions
        && elements.inputName
        && elements.inputPhone
        && elements.inputOcupacion
        && elements.infoCodigo
        && elements.infoPacientes
    );
}
