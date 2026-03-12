export function setDashboardHeaderTitle(elements) {
    elements.titleEl.textContent = "Panel de Control";
}

export function closeAccountMenu(elements) {
    elements.accountMenuWrap.classList.remove("open");
    elements.accountMenuBtn.setAttribute("aria-expanded", "false");
}

export function setPatientIdentity(elements, fullName) {
    const shortName = String(fullName || "Paciente").trim().split(" ").slice(0, 2).join(" ") || "Paciente";

    elements.patientDisplayName.textContent = shortName;
    elements.patientAvatar.textContent = shortName
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

export function setCaregiverStatus(elements, cuidadorName) {
    elements.statusEl.textContent = cuidadorName
        ? `Cuidador: ${cuidadorName}`
        : "Sin cuidador vinculado";
}
