export function bindDashboardPacienteEvents(elements, handlers) {
    elements.accountMenuBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = elements.accountMenuWrap.classList.toggle("open");
        elements.accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    window.addEventListener("click", (event) => {
        if (!elements.accountMenuWrap.contains(event.target)) {
            handlers.onCloseAccountMenu();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            handlers.onCloseAccountMenu();
        }
    });

    elements.btnViewProfile?.addEventListener("click", () => {
        handlers.onOpenProfile();
    });

    elements.medicinasCard.addEventListener("click", () => {
        handlers.onOpenMedicinas();
    });

    elements.cuidadorCard?.addEventListener("click", () => {
        handlers.onOpenCuidador();
    });

    elements.btnLogout?.addEventListener("click", () => {
        handlers.onLogout();
    });
}
