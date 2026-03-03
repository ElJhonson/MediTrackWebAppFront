import { API_BASE_URL } from "../core/config.js";
import { saveSession } from "../core/auth.js";
import { notifyError } from "../core/notify.js";
import {
    PHONE_DIGITS,
    sanitizePhoneValue,
    setupPhoneInputValidation,
    applySpanishValidationMessages,
    setupPasswordConfirmationValidation,
    passwordsMatch,
    setupPasswordToggle
} from "../core/form-validation.js";

const form = document.getElementById("registerCuidadorForm");
const phoneInput = document.getElementById("phoneNumber");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPasswordBtn");

function limpiarMensaje(msg) {
    return String(msg || "")
        .trim()
        .replace(/^"(.*)"$/, "$1")
        .trim();
}

function obtenerMensajeError(data) {
    if (typeof data === "string") return limpiarMensaje(data);
    if (!data || typeof data !== "object") return "";

    const candidatos = [
        data.message,
        data.mensaje,
        data.error,
        data.detail,
        data.title
    ];

    for (const candidato of candidatos) {
        const limpio = limpiarMensaje(candidato);
        if (limpio) return limpio;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
        const primerError = data.errors[0];
        return limpiarMensaje(
            typeof primerError === "string"
                ? primerError
                : primerError?.message || primerError?.defaultMessage
        );
    }

    return "";
}

setupPhoneInputValidation(phoneInput);
setupPasswordConfirmationValidation(passwordInput, confirmPasswordInput);
applySpanishValidationMessages(form);
setupPasswordToggle(togglePasswordBtn, passwordInput);
setupPasswordToggle(toggleConfirmPasswordBtn, confirmPasswordInput);

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cuidador = {
        name: form.name.value,
        phoneNumber: sanitizePhoneValue(form.phoneNumber.value),
        relacionConPaciente: form.relacionConPaciente.value,
        password: form.password.value
    };

    if (cuidador.phoneNumber.length !== PHONE_DIGITS) {
        notifyError("El numero de telefono debe tener 10 digitos");
        return;
    }

    if (!passwordsMatch(passwordInput, confirmPasswordInput)) {
        notifyError("Las contraseñas no coinciden");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cuidadores/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cuidador)
        });

        if (!response.ok) {
            const statusFallback =
                limpiarMensaje(response.statusText) || `Error HTTP ${response.status}`;
            const raw = limpiarMensaje(await response.text());
            let msg = raw || statusFallback;

            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    msg = obtenerMensajeError(data) || raw || statusFallback;
                } catch {
                    msg = raw || statusFallback;
                }
            }

            throw new Error(msg || "Error al registrar cuidador");
        }

        const data = await response.json();

        saveSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
        });

        window.location.replace("../pages/dashboard-cuidador.html");

    } catch (error) {
        notifyError(error.message || "No se pudo crear la cuenta");
        console.error(error);
    }
});

