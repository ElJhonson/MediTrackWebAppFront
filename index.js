import { AUTH_ENDPOINTS, STORAGE_KEYS } from "/js/config.js";
import { saveSession } from "/js/auth.js";

const loginForm = document.getElementById("loginForm");
const phoneInput = document.getElementById("phoneNumber");
const passwordInput = document.getElementById("password");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phoneNumber = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (!phoneNumber || !password) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber, password })
        });

        if (!response.ok) {
            alert("Credenciales incorrectas");
            return;
        }

        const data = await response.json();

        // 1. Guardar sesión (JWT manda)
        saveSession(data);

        // 2. Leer rol desde localStorage (extraído del JWT)
        const rol = localStorage.getItem(STORAGE_KEYS.ROLE);

        // 3. Redirección por rol
        if (rol === "PACIENTE") {
            window.location.href = "/pages/dashboard-paciente.html";
        } else if (rol === "CUIDADOR") {
            window.location.href = "/pages/dashboard-cuidador.html";
        } else {
            console.error("Rol no reconocido:", rol);
            window.location.href = "/index.html";
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
});


// Toggle password
document.querySelector(".toggle-password")?.addEventListener("click", () => {
    passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
});
// ... tu código anterior de login ...

const modal = document.getElementById("roleModal");
const btnOpen = document.getElementById("btnOpenModal");
const btnClose = document.getElementById("btnCloseModal");

// Abrir modal
btnOpen.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
});

// Cerrar modal al dar clic en X
btnClose.addEventListener("click", () => {
    modal.classList.remove("active");
});

// Cerrar modal al dar clic fuera del contenedor blanco
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("active");
    }
});