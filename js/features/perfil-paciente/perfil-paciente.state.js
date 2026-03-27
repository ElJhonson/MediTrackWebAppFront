export const perfilPacienteState = {
    enfermedades: [],
    modoEdicion: false,
    guardando: false,
    coloresEnfermedad: new Map(),
    paciente: null,
    dtoPendienteReauth: null
};

export function getPerfilPacienteElements() {
    return {
        btnEditProfile: document.getElementById("edit-btn"),
        btnCancelProfile: document.getElementById("btn-cancel"),
        btnSaveProfile: document.getElementById("btn-save"),
        reauthModal: document.getElementById("reauthModal"),
        btnCancelReauth: document.getElementById("btnCancelReauth"),
        btnContinueReauth: document.getElementById("btnContinueReauth"),
        profileActions: document.getElementById("actions-bar"),
        inputName: document.getElementById("nombre") || document.getElementById("name"),
        inputPhone: document.getElementById("phoneNumber"),
        inputEdad: document.getElementById("edad"),
        inputCurp: document.getElementById("curp"),
        inputTogglePhone: document.getElementById("toggle-phone"),
        inputToggleCurp: document.getElementById("toggle-curp"),
        diseasesContainer: document.getElementById("diseases-container"),
        addDiseaseBox: document.getElementById("add-disease-box"),
        loadingDiv: document.getElementById("loading"),
        profileCard: document.getElementById("profile-card"),
        profileForm: document.getElementById("profile-form"),
        patientAvatar: document.getElementById("patientAvatar"),
        patientName: document.getElementById("patientName"),
        topbarTitle: document.getElementById("topbar-title"),
        topbarLinkHome: document.getElementById("topbar-link-home"),
        topbarLinkProfile: document.getElementById("topbar-link-profile"),
        topbarLinkMedicinas: document.getElementById("topbar-link-medicinas"),
        accountMenuWrap: document.getElementById("accountMenuWrap"),
        accountMenuBtn: document.getElementById("accountMenuBtn"),
        topbarPatientAvatar: document.getElementById("topbar-patient-avatar"),
        topbarPatientName: document.getElementById("topbar-patient-name"),
        btnLogout: document.getElementById("btnLogout")
    };
}

export function hasRequiredPerfilPacienteElements(elements) {
    const requiredEntries = {
        profileForm: elements.profileForm,
        btnEditProfile: elements.btnEditProfile,
        btnCancelProfile: elements.btnCancelProfile,
        btnSaveProfile: elements.btnSaveProfile,
        inputName: elements.inputName,
        inputPhone: elements.inputPhone,
        inputEdad: elements.inputEdad,
        inputCurp: elements.inputCurp,
        diseasesContainer: elements.diseasesContainer,
        reauthModal: elements.reauthModal,
        btnContinueReauth: elements.btnContinueReauth,
        btnCancelReauth: elements.btnCancelReauth
    };

    const missing = Object.entries(requiredEntries)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        console.error("Perfil paciente: elementos faltantes en DOM:", missing);
        return false;
    }

    return true;
}
