import { protectPage } from "../guards/guard.js";
import { logout } from "../core/auth.js";
import { STORAGE_KEYS } from "../core/config.js";
import {
    initMedicamentos,
    cargarMedicamentos
} from "../features/medicamentos/medicamentos.controller.js";
import { cargarDatosPaciente } from "../features/paciente/paciente.controller.js";
import { initAlarmaModal } from "../features/medicamentos/medicamentos.alarma.js"; 

protectPage();

function initTopbarMenu() {
    const accountMenuWrap = document.getElementById("accountMenuWrap");
    const accountMenuBtn = document.getElementById("accountMenuBtn");
    const btnLogout = document.getElementById("btnLogout");
    const userName = document.getElementById("meds-user-name");
    const userAvatar = document.getElementById("meds-user-avatar");

    const name = String(localStorage.getItem(STORAGE_KEYS.NAME) || "Paciente").trim();
    const shortName = name.split(" ").slice(0, 2).join(" ") || "Paciente";

    if (userName) {
        userName.textContent = shortName;
    }

    if (userAvatar) {
        const initials = shortName
            .split(" ")
            .map((part) => part[0] || "")
            .join("")
            .substring(0, 2)
            .toUpperCase();
        userAvatar.textContent = initials;
    }

    const closeAccountMenu = () => {
        if (!accountMenuWrap || !accountMenuBtn) return;
        accountMenuWrap.classList.remove("open");
        accountMenuBtn.setAttribute("aria-expanded", "false");
    };

    accountMenuBtn?.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = accountMenuWrap.classList.toggle("open");
        accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    window.addEventListener("click", (event) => {
        if (!accountMenuWrap?.contains(event.target)) {
            closeAccountMenu();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAccountMenu();
        }
    });

    btnLogout?.addEventListener("click", () => {
        logout();
    });
}

async function cargarDatosPacienteSeguro() {
    try {
        await cargarDatosPaciente();
    } catch (error) {
        console.warn("No se pudieron cargar los datos del paciente.", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    initTopbarMenu();
    initAlarmaModal();
    await cargarDatosPacienteSeguro();
    setTimeout(() => {
        cargarDatosPacienteSeguro();
    }, 300);
    initMedicamentos();
});

window.addEventListener("pageshow", async (event) => {
    if (!event.persisted) return;

    await cargarDatosPacienteSeguro();
    await cargarMedicamentos();
});
