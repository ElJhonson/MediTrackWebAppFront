export function getDashboardPacienteElements() {
    return {
        titleEl: document.querySelector("h1"),
        statusEl: document.querySelector(".status"),
        medicinasCard: document.querySelector(".service-card.reminders"),
        horariosCard: document.querySelector(".service-card.schedules"),
        cuidadorCard: document.querySelector(".service-card.caregiver"),
        btnViewProfile: document.getElementById("btnViewProfile"),
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
        && elements.horariosCard
        && elements.accountMenuWrap
        && elements.accountMenuBtn
        && elements.patientDisplayName
        && elements.patientAvatar
    );
}
