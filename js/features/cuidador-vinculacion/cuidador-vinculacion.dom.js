import { escapeHtml } from "./cuidador-vinculacion.utils.js";

export function renderSinCuidador(caregiverPanel, caregiverStatus) {
    caregiverStatus.textContent = "Sin cuidador vinculado";
    caregiverPanel.innerHTML = `
        <article class="caregiver-card">
            <div class="caregiver-header">
                <span class="caregiver-icon" aria-hidden="true">❤️</span>
                <h2 class="caregiver-title">Vincular cuidador</h2>
            </div>
            <p class="caregiver-desc">
                Ingresa el codigo de vinculacion que te proporciono tu cuidador.
            </p>
            <label class="form-label" for="caregiverCode">Codigo del cuidador</label>
            <input
                class="form-input"
                id="caregiverCode"
                name="caregiverCode"
                type="text"
                placeholder="Ej. 1234A5"
                autocomplete="off"
                maxlength="6"
                minlength="6"
                inputmode="text"
                pattern="[A-Z0-9]{6}"
                title="El codigo debe tener exactamente 6 caracteres alfanumericos"
            />
            <div class="button-row">
                <button class="btn btn-primary" id="btnLinkCaregiver" type="button">Vincular cuidador</button>
            </div>
        </article>
    `;

    return {
        codeInput: document.getElementById("caregiverCode"),
        btnLinkCaregiver: document.getElementById("btnLinkCaregiver")
    };
}

export function renderConCuidador(caregiverPanel, caregiverStatus, cuidadorInfo) {
    caregiverStatus.textContent = `Cuidador vinculado: ${cuidadorInfo.nombre}`;
    caregiverPanel.innerHTML = `
        <article class="caregiver-card">
            <div class="caregiver-header">
                <span class="caregiver-icon" aria-hidden="true">🩺</span>
                <h2 class="caregiver-title">Cuidador vinculado</h2>
            </div>
            <p class="caregiver-desc">
                Actualmente tienes un cuidador asignado a tu cuenta.
            </p>
            <div class="caregiver-data">
                <div class="data-item">
                    <span class="data-label">Nombre del cuidador</span>
                    <strong class="data-value">${escapeHtml(cuidadorInfo.nombre || "No disponible")}</strong>
                </div>
                <div class="data-item">
                    <span class="data-label">Telefono</span>
                    <strong class="data-value">${escapeHtml(cuidadorInfo.telefono || "No disponible")}</strong>
                </div>
            </div>
            <div class="button-row">
                <button class="btn btn-danger" id="btnUnlinkCaregiver" type="button">Desvincular cuidador</button>
            </div>
        </article>
    `;

    return {
        btnUnlinkCaregiver: document.getElementById("btnUnlinkCaregiver")
    };
}

export function renderErrorState(caregiverPanel, caregiverStatus) {
    caregiverStatus.textContent = "No se pudo cargar la informacion";
    caregiverPanel.innerHTML = `
        <article class="caregiver-card">
            <div class="caregiver-header">
                <span class="caregiver-icon" aria-hidden="true">⚠</span>
                <h2 class="caregiver-title">No fue posible cargar esta seccion</h2>
            </div>
            <p class="caregiver-desc">
                Intenta nuevamente en unos segundos.
            </p>
            <div class="button-row">
                <button class="btn btn-secondary" id="btnRetry" type="button">Reintentar</button>
            </div>
        </article>
    `;

    return {
        btnRetry: document.getElementById("btnRetry")
    };
}
