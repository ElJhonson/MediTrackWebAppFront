import {
    AUTH_ENDPOINTS,
    STORAGE_KEYS,
    ROLES,
    ROUTES
} from "/js/config.js"; import { saveSession } from "/js/auth.js";

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
        saveSession(data);

        const rol = localStorage.getItem(STORAGE_KEYS.ROLE);

        switch (rol) {
            case ROLES.PACIENTE:
                window.location.href = ROUTES.DASHBOARD_PACIENTE;
                break;

            case ROLES.CUIDADOR:
                window.location.href = ROUTES.DASHBOARD_CUIDADOR;
                break;

            default:
                alert('Rol no reconocido:', rol);
                window.location.href = ROUTES.LOGIN;
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
});


// mostrar - ocultar password
document.querySelector(".toggle-password")?.addEventListener("click", () => {
    passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
});

const modal = document.getElementById("roleModal");
const btnOpen = document.getElementById("btnOpenModal");
const btnClose = document.getElementById("btnCloseModal");

// modal
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
function filterMeds(categoria) {
    const medicinas = document.querySelectorAll('.med-card');
    
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    medicinas.forEach(card => {
        // Simulamos la lógica: 
        // En un caso real, compararías fechas o estados de tu base de datos
        if (categoria === 'todas') {
            card.style.display = 'flex';
        } else if (categoria === 'vencidas') {
            // Ejemplo: solo mostrar tarjetas que tengan una clase 'alerta'
            card.style.display = card.classList.contains('urgent') ? 'flex' : 'none';
        } else {
            card.style.display = 'flex'; // 'hoy' por defecto
        }
    });
}