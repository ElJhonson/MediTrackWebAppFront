export function getDashboardElements() {
    return {
        btnAddPatient: document.querySelector(".btn-add-patient"),
        modal: document.getElementById("modalRegister"),
        btnCloseModal: document.getElementById("btnCloseModal"),
        registerForm: document.getElementById("registerPacienteForm"),
        togglePasswordBtn: document.getElementById("togglePasswordBtn"),
        toggleConfirmPasswordBtn: document.getElementById("toggleConfirmPasswordBtn"),
        passwordInput: document.getElementById("password"),
        confirmPasswordInput: document.getElementById("confirmPassword"),
        patientContainer: document.getElementById("patient-list-container"),
        patientCount: document.getElementById("patient-count"),
        btnCopy: document.getElementById("btnCopy"),
        linkCode: document.getElementById("link-code"),
        btnLogout: document.getElementById("btnLogout"),
        accountMenuWrap: document.getElementById("accountMenuWrap"),
        accountMenuBtn: document.getElementById("accountMenuBtn"),
        caregiverAvatar: document.getElementById("caregiver-avatar"),
        caregiverName: document.getElementById("caregiver-name")
    };
}

export function hasRequiredDashboardElements(elements) {
    return Boolean(
        elements.btnAddPatient
        && elements.modal
        && elements.btnCloseModal
        && elements.registerForm
        && elements.togglePasswordBtn
        && elements.toggleConfirmPasswordBtn
        && elements.passwordInput
        && elements.confirmPasswordInput
        && elements.patientContainer
        && elements.patientCount
        && elements.btnCopy
        && elements.linkCode
    );
}
