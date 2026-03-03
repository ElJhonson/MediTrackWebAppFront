import {
    AUTH_ENDPOINTS,
    STORAGE_KEYS,
    ROLES,
    ROUTES
} from "/js/core/config.js";
import {
    saveSession,
    isAuthenticated,
    startSessionExpiryWatcher
} from "/js/core/auth.js";
import { notifyError } from "/js/core/notify.js";

const loginForm = document.getElementById("loginForm");
const phoneInput = document.getElementById("phoneNumber");
const passwordInput = document.getElementById("password");
const PHONE_DIGITS = 10;

function sanitizePhoneValue(value) {
    return String(value || "").replace(/\D/g, "").slice(0, PHONE_DIGITS);
}

function setupPhoneInputValidation(input) {
    if (!input) return;

    const normalizePhone = () => {
        input.value = sanitizePhoneValue(input.value);
    };

    input.addEventListener("input", normalizePhone);
    input.addEventListener("paste", () => setTimeout(normalizePhone, 0));
}

function applySpanishValidationMessages(form) {
    if (!form) return;

    const fields = form.querySelectorAll("input, select, textarea");

    fields.forEach((field) => {
        field.addEventListener("invalid", () => {
            if (field.validity.valueMissing) {
                field.setCustomValidity("Este campo es obligatorio.");
                return;
            }

            if (field.id === "phoneNumber") {
                const digits = sanitizePhoneValue(field.value);
                if (digits.length !== PHONE_DIGITS) {
                    field.setCustomValidity("El numero de telefono debe tener 10 digitos.");
                    return;
                }
            }

            field.setCustomValidity("Valor no valido.");
        });

        field.addEventListener("input", () => {
            field.setCustomValidity("");
        });
    });
}

function redirectIfAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const rol = localStorage.getItem(STORAGE_KEYS.ROLE);

    if (!token) return;

    if (!isAuthenticated()) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ROLE);
        localStorage.removeItem(STORAGE_KEYS.NAME);
        return;
    }

    startSessionExpiryWatcher();

    if (rol === ROLES.PACIENTE) {
        window.location.replace(ROUTES.DASHBOARD_PACIENTE);
        return;
    }

    if (rol === ROLES.CUIDADOR) {
        window.location.replace(ROUTES.DASHBOARD_CUIDADOR);
    }
}

redirectIfAuthenticated();
window.addEventListener("pageshow", redirectIfAuthenticated);
setupPhoneInputValidation(phoneInput);
applySpanishValidationMessages(loginForm);

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phoneNumber = sanitizePhoneValue(phoneInput.value.trim());
    phoneInput.value = phoneNumber;
    const password = passwordInput.value.trim();

    if (phoneNumber.length !== PHONE_DIGITS) {
        notifyError("El numero de telefono debe tener 10 digitos");
        return;
    }

    if (!password) {
        notifyError("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber, password })
        });

        if (!response.ok) {
            notifyError("Credenciales incorrectas");
            return;
        }

        const data = await response.json();
        saveSession(data);

        const rol = localStorage.getItem(STORAGE_KEYS.ROLE);

        switch (rol) {
            case ROLES.PACIENTE:
                window.location.replace(ROUTES.DASHBOARD_PACIENTE);
                break;
            case ROLES.CUIDADOR:
                window.location.replace(ROUTES.DASHBOARD_CUIDADOR);
                break;
            default:
                notifyError(`Rol no reconocido: ${rol || "desconocido"}`);
                window.location.replace(ROUTES.LOGIN);
        }
    } catch (error) {
        console.error(error);
        notifyError("Error de conexion con el servidor");
    }
});

const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordGroup = document.querySelector(".password-group");

togglePasswordBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordGroup.classList.add("visible");
    } else {
        passwordInput.type = "password";
        passwordGroup.classList.remove("visible");
    }
});

const modal = document.getElementById("roleModal");
const btnOpen = document.getElementById("btnOpenModal");
const btnClose = document.getElementById("btnCloseModal");

btnOpen.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
});

btnClose.addEventListener("click", () => {
    modal.classList.remove("active");
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("active");
    }
});
