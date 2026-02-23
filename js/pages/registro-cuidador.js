import { API_BASE_URL } from "../core/config.js";
import { saveSession } from "../core/auth.js";
import { notifyError } from "../core/notify.js";

const form = document.getElementById("registerCuidadorForm");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordGroup = document.querySelector(".password-group");

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

// Toggle de contraseña
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

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cuidador = {
        name: form.name.value,
        phoneNumber: form.phoneNumber.value,
        relacionConPaciente: form.relacionConPaciente.value,
        password: form.password.value
    };

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
