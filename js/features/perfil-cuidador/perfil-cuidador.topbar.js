import { STORAGE_KEYS } from "../../core/config.js";

export function setTopbarData(elements) {
    const rawName = String(localStorage.getItem(STORAGE_KEYS.NAME) || "Cuidador").trim();
    const shortName = rawName.split(" ").slice(0, 2).join(" ") || "Cuidador";
    const initials = shortName
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .substring(0, 2)
        .toUpperCase();

    elements.topbarCaregiverName.textContent = shortName;
    elements.topbarCaregiverAvatar.textContent = initials;
}

export function toggleAccountMenu(elements) {
    const isOpen = elements.accountMenuWrap.classList.toggle("open");
    elements.accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
}

export function closeAccountMenu(elements) {
    elements.accountMenuWrap.classList.remove("open");
    elements.accountMenuBtn.setAttribute("aria-expanded", "false");
}
