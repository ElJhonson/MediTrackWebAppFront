import { protectPage } from "../guards/guard.js";
import { logout } from "../core/auth.js";
import {
    obtenerMisDatosCuidador,
    obtenerPacientesDelCuidador,
    registrarPacienteDesdeCuidador,
    obtenerPacientePorId
} from "../services/cuidador.service.js";

const btnAddPatient = document.querySelector(".btn-add-patient");
const modal = document.getElementById("modalRegister");
const btnCloseModal = document.getElementById("btnCloseModal");
const registerForm = document.getElementById("registerPacienteForm");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordInput = document.getElementById("password");
const passwordGroup = document.querySelector(".password-group");
const patientContainer = document.getElementById("patient-list-container");
const patientCount = document.getElementById("patient-count");
const btnCopy = document.getElementById("btnCopy");
const linkCode = document.getElementById("link-code");

protectPage();

btnAddPatient.addEventListener("click", () => {
    modal.style.display = "flex";
});

btnCloseModal.addEventListener("click", cerrarModal);

window.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
});

// Toggle del candado de contraseña
togglePasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordGroup.classList.add("visible");
    } else {
        passwordInput.type = "password";
        passwordGroup.classList.remove("visible");
    }
});

// Copiar código de vinculación
btnCopy.addEventListener("click", async () => {
    const codigoTexto = linkCode.textContent.trim();
    
    if (!codigoTexto) {
        alert("El código aún no está disponible");
        return;
    }

    try {
        await navigator.clipboard.writeText(codigoTexto);
        
        // Feedback visual
        const originalTitle = btnCopy.title;
        btnCopy.title = "¡Copiado!";
        btnCopy.style.color = "var(--accent-lime)";
        
        setTimeout(() => {
            btnCopy.title = originalTitle;
            btnCopy.style.color = "";
        }, 2000);
    } catch (error) {
        console.error("Error al copiar:", error);
        alert("No se pudo copiar el código. Intenta de nuevo.");
    }
});


async function cargarDatosCuidador() {
    try {
        const cuidador = await obtenerMisDatosCuidador();

        const nombreCorto = cuidador.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .join(" ");

        document.getElementById("caregiver-name").textContent = nombreCorto;
        document.getElementById("link-code").textContent =
            cuidador.codigoVinculacion;

    } catch (error) {
        console.error(error);
        logout();
    }
}

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dto = {
        name: registerForm.name.value.trim(),
        phoneNumber: registerForm.phoneNumber.value.trim(),
        edad: Number(registerForm.edad.value),
        password: registerForm.password.value
    };

    try {
        await registrarPacienteDesdeCuidador(dto);

        alert("Paciente registrado con éxito");
        cerrarModal();
        await cargarPacientes();

    } catch (error) {
        console.error("Error al registrar:", error);
        alert(error.message || "Error al registrar paciente");
    }
});

async function cargarPacientes() {
    // Datos simulados de enfermedades por paciente
    const enfermedadesSimuladas = {
        // Los IDs se usarán como claves
        1: ["Diabetes Tipo 2", "Hipertensión", "Colesterol Alto", "Artritis", "Asma"],
        2: ["Insuficiencia Cardíaca", "Fibrilación Auricular", "Anemia", "Osteoporosis"],
        3: ["EPOC", "Depresión", "Ansiedad", "Migrañas", "Tiroides"],
        default: ["Diabetes", "Hipertensión", "Colesterol"]
    };

    const pacientes = await obtenerPacientesDelCuidador();

    patientCount.textContent = `Pacientes Asignados (${pacientes.length})`;
    patientContainer.innerHTML = "";

    pacientes.forEach(p => {
        const initials = p.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

        // Obtener enfermedades simuladas
        const enfermedades = enfermedadesSimuladas[p.id] || enfermedadesSimuladas.default;
        const enfermedadesVisibles = enfermedades.slice(0, 3);
        const enfermedadesOcultas = enfermedades.slice(3);
        const tieneOcultas = enfermedadesOcultas.length > 0;

        const card = document.createElement("div");
        card.className = "patient-card";

        let enfermedadesHTML = enfermedadesVisibles
            .map(e => `<span class="disease-badge">${e}</span>`)
            .join("");

        card.innerHTML = `
            <div style="display: flex; align-items: center; width: 100%; margin-bottom: 0.8rem;">
                <div class="patient-avatar">${initials}</div>
                <div class="patient-info" style="flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                        <h4 style="margin: 0;">${p.name}, <span class="patient-age-inline">${p.edad ?? "N/A"} años</span></h4>
                        <span class="status-badge">Estable</span>
                    </div>
                    <div class="patient-conditions">
                        ${enfermedades.slice(0, 3).map(e => `<span class="condition-badge">${e}</span>`).join("")}
                        ${enfermedades.length > 3 ? `<button class="btn-see-more" data-expanded="false">+${enfermedadesOcultas.length}</button>` : ""}
                    </div>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn-action btn-profile" data-id="${p.id}" title="Ver Perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Ver Perfil
                </button>
                <button class="btn-action btn-medicine" data-id="${p.id}" title="Medicinas">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v12M6 12h12"></path>
                    </svg>
                    Medicinas
                </button>
                <button class="btn-action btn-notes" data-id="${p.id}" title="Notas">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Notas
                </button>
                <button class="btn-action btn-menu" data-id="${p.id}" title="Más opciones">
                    ⋮
                </button>
            </div>
        `;

        card.querySelector(".btn-profile")
            .addEventListener("click", () => {
                window.location.href =
                    `/views/paciente-perfil.html?id=${p.id}`;
            });

        card.querySelector(".btn-medicine")
            .addEventListener("click", () => {
                window.location.href =
                    `/pages/medicamentos.html?id=${p.id}`;
            });

        card.querySelector(".btn-notes")
            .addEventListener("click", () => {
                alert("Función de notas próximamente");
            });

        card.querySelector(".btn-menu")
            .addEventListener("click", () => {
                alert("Menú de opciones próximamente");
            });

        // Event listener para expandir/contraer enfermedades
        const btnSeeMore = card.querySelector(".btn-see-more");
        if (btnSeeMore) {
            btnSeeMore.addEventListener("click", function expandToggle() {
                const isExpanded = this.dataset.expanded === "true";
                const conditionsDiv = card.querySelector(".patient-conditions");
                
                if (isExpanded) {
                    conditionsDiv.innerHTML = `
                        ${enfermedades.slice(0, 3).map(e => `<span class="condition-badge">${e}</span>`).join("")}
                        <button class="btn-see-more" data-expanded="false">+${enfermedadesOcultas.length}</button>
                    `;
                    card.querySelector(".btn-see-more").addEventListener("click", expandToggle);
                } else {
                    conditionsDiv.innerHTML = `
                        ${enfermedades.map(e => `<span class="condition-badge">${e}</span>`).join("")}
                        <button class="btn-see-more" data-expanded="true">- Menos</button>
                    `;
                    card.querySelector(".btn-see-more").addEventListener("click", expandToggle);
                }
            });
        }

        patientContainer.appendChild(card);
    });
}


function cerrarModal() {
    modal.style.display = "none";
    registerForm.reset();
    passwordInput.type = "password";
    passwordGroup.classList.remove("visible");
}


cargarDatosCuidador();
cargarPacientes();
