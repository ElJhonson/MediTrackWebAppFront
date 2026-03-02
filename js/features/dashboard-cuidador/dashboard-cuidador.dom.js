import { renderEnfermedades } from "./dashboard-cuidador.utils.js";

export function setPacientesLoading(elements, loading) {
    if (!loading) return;
    elements.patientContainer.innerHTML = `
        <div class="patients-loading">Cargando pacientes...</div>
    `;
}

export function cerrarAccountMenu(elements) {
    if (!elements.accountMenuWrap || !elements.accountMenuBtn) return;
    elements.accountMenuWrap.classList.remove("open");
    elements.accountMenuBtn.setAttribute("aria-expanded", "false");
}

export function cerrarModal(elements) {
    elements.modal.style.display = "none";
    elements.registerForm.reset();
    elements.passwordInput.type = "password";
    elements.passwordGroup.classList.remove("visible");
}

export function renderPacientes(elements, pacientesConDetalle) {
    elements.patientCount.textContent = `Pacientes Asignados (${pacientesConDetalle.length})`;
    elements.patientContainer.innerHTML = "";

    if (!pacientesConDetalle.length) {
        elements.patientContainer.innerHTML = `
            <div class="patients-loading">No hay pacientes registrados todavia.</div>
        `;
        return;
    }

    pacientesConDetalle.forEach(p => {
        const initials = p.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

        const enfermedades = p.enfermedadesCronicas || [];

        const card = document.createElement("div");
        card.className = "patient-card";
        card.innerHTML = `
            <div style="display: flex; align-items: center; width: 100%; margin-bottom: 0.8rem;">
                <div class="patient-avatar">${initials}</div>
                <div class="patient-info" style="flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                        <h4 style="margin: 0;">
                            ${p.name}, 
                            <span class="patient-age-inline">
                                ${p.edad ?? "N/A"} a\u00f1os
                            </span>
                        </h4>
                        <span class="status-badge">Estable</span>
                    </div>

                    <div class="patient-conditions">
                        ${renderEnfermedades(enfermedades, false)}
                    </div>
                </div>
            </div>

            <div class="patient-actions">
                <button class="btn-action btn-profile" data-id="${p.id}">
                    Ver Perfil
                </button>

                <button class="btn-action btn-medicine" data-id="${p.id}">
                    Medicinas
                </button>

                <button class="btn-action btn-notes">
                    Notas
                </button>

                <button class="btn-action btn-menu">
                    â‹®
                </button>
            </div>
        `;

        card.querySelector(".btn-profile")
            .addEventListener("click", () => {
                window.location.href = `../../pages/perfil-paciente.html?id=${p.id}`;
            });

        const conditionsDiv = card.querySelector(".patient-conditions");
        conditionsDiv.addEventListener("click", (e) => {
            const btn = e.target.closest(".btn-see-more");
            if (!btn) return;

            const isExpanded = btn.dataset.expanded === "true";
            conditionsDiv.innerHTML = renderEnfermedades(
                enfermedades,
                !isExpanded
            );
        });

        elements.patientContainer.appendChild(card);
    });
}

