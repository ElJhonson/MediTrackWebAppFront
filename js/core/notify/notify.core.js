import { ensureToastStyles, TOAST_CONTAINER_ID } from "./notify.styles.js";

function getToastContainer() {
    ensureToastStyles();

    let container = document.getElementById(TOAST_CONTAINER_ID);
    if (!container) {
        container = document.createElement("div");
        container.id = TOAST_CONTAINER_ID;
        document.body.appendChild(container);
    }

    return container;
}

export function showToast(message, type = "info", timeout = 3600) {
    if (typeof document === "undefined") return;

    const text = String(message || "").trim();
    if (!text) return;

    const icon = type === "error" ? "!" : type === "success" ? "OK" : "i";
    const container = getToastContainer();

    const toast = document.createElement("div");
    toast.className = `app-toast app-toast--${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    const ms = Number(timeout) > 0 ? Number(timeout) : 3600;
    toast.innerHTML = `
        <span class="app-toast__icon">${icon}</span>
        <p class="app-toast__text">${text}</p>
        <span class="app-toast__bar" style="animation-duration:${ms}ms"></span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toast-out 160ms ease-in forwards";
        setTimeout(() => toast.remove(), 170);
    }, ms);
}
