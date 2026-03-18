import { STORAGE_KEYS } from "../../core/config.js";

export function initCuidadorVinculacionTopbar({
    accountMenuWrap,
    accountMenuBtn,
    btnLogout,
    patientDisplayName,
    patientAvatar,
    confirmModal,
    modal,
    onLogout
}) {
    function initHeader() {
        const name = String(localStorage.getItem(STORAGE_KEYS.NAME) || "Paciente").trim();
        const shortName = name.split(" ").slice(0, 2).join(" ") || "Paciente";

        if (patientDisplayName) {
            patientDisplayName.textContent = shortName;
        }

        if (patientAvatar) {
            const initials = shortName
                .split(" ")
                .map((part) => part[0] || "")
                .join("")
                .substring(0, 2)
                .toUpperCase();
            patientAvatar.textContent = initials;
        }
    }

    function closeAccountMenu() {
        if (!accountMenuWrap || !accountMenuBtn) return;
        accountMenuWrap.classList.remove("open");
        accountMenuBtn.setAttribute("aria-expanded", "false");
    }

    function setupTopbarNavActive() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll(".nav-links a");

        navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (!href) return;

            const linkPath = new URL(href, window.location.origin).pathname;
            if (linkPath === currentPath) {
                link.classList.add("active");
            }
        });
    }

    function setupTopbarEvents() {
        accountMenuBtn?.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = accountMenuWrap.classList.toggle("open");
            accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
        });

        window.addEventListener("click", (event) => {
            if (!accountMenuWrap?.contains(event.target)) {
                closeAccountMenu();
            }

            if (event.target === confirmModal) {
                modal.closeConfirmModal();
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeAccountMenu();
                modal.closeConfirmModal();
            }
        });

        btnLogout?.addEventListener("click", () => {
            onLogout();
        });
    }

    initHeader();
    setupTopbarNavActive();
    setupTopbarEvents();
}
