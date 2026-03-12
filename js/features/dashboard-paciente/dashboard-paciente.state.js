export function getDashboardPacienteElements() {
    return {
        titleEl: document.querySelector("h1"),
        statusEl: document.querySelector(".status"),
        medicinasCard: document.querySelector(".service-card.reminders"),
        cuidadorCard: document.querySelector(".service-card.caregiver"),
        btnLogout: document.getElementById("btnLogout"),
        accountMenuWrap: document.getElementById("accountMenuWrap"),
        accountMenuBtn: document.getElementById("accountMenuBtn"),
        patientDisplayName: document.getElementById("patient-display-name"),
        patientAvatar: document.getElementById("patient-avatar")
    };
}

export function hasRequiredDashboardPacienteElements(elements) {
    return Boolean(
        elements.titleEl
        && elements.statusEl
        && elements.medicinasCard
        && elements.accountMenuWrap
        && elements.accountMenuBtn
        && elements.patientDisplayName
        && elements.patientAvatar
    );
}
