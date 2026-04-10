import { crearAlarmaConfig } from "../../services/alarma.service.js";

function _clearAlarmaErrors(elements) {
    [elements.alarmaFechaInicio, elements.alarmaFechaFin, elements.alarmaFrecuenciaHoras].forEach(el => {
        el.classList.remove("input-error");
        el.parentElement.querySelector(".field-error-msg")?.remove();
    });
}

function _mostrarModoCrear(elements) {
    elements.modalAlarmaTitle.textContent = "Programar recordatorio";
    elements.alarmaForm.reset();
    _clearAlarmaErrors(elements);
    [elements.alarmaFechaInicio, elements.alarmaFechaFin, elements.alarmaFrecuenciaHoras].forEach(el => {
        el.disabled = false;
    });
    elements.btnGuardarAlarma.style.display = "";
    elements.btnVerDetallesAlarma.style.display = "none";
}

function _mostrarModoVer(elements, config, pacienteId) {
    elements.modalAlarmaTitle.textContent = "Configuración de alarma";
    _clearAlarmaErrors(elements);
    elements.alarmaFechaInicio.value = config.fechaInicio?.slice(0, 16) ?? "";
    elements.alarmaFechaFin.value = config.fechaFin?.slice(0, 16) ?? "";
    elements.alarmaFrecuenciaHoras.value = config.frecuenciaHoras;
    [elements.alarmaFechaInicio, elements.alarmaFechaFin, elements.alarmaFrecuenciaHoras].forEach(el => {
        el.disabled = true;
    });
    elements.btnGuardarAlarma.style.display = "none";
    elements.btnVerDetallesAlarma.style.display = "";
    const configId = config.id ?? config.configId ?? "";
    const params = new URLSearchParams();
    if (pacienteId) params.set("pacienteId", pacienteId);
    if (configId)   params.set("id", configId);
    const qs = params.toString();
    elements.btnVerDetallesAlarma.href = `/pages/cuidador-alarmas.html${qs ? "?" + qs : ""}`;
}

export function createCuidadorAlarmaModule({ elements, state, notify, onAlarmaGuardada }) {
    function cerrar() {
        elements.modalAlarma.classList.remove("active");
    }

    function init() {
        if (!elements.modalAlarma) return;

        elements.btnCloseAlarma.onclick = cerrar;
        elements.btnCancelAlarma.onclick = cerrar;

        elements.alarmaForm.onsubmit = async (e) => {
            e.preventDefault();

            const inicioEl = elements.alarmaFechaInicio;
            const finEl    = elements.alarmaFechaFin;
            const frecEl   = elements.alarmaFrecuenciaHoras;

            const fields = [
                { el: inicioEl, valid: !!inicioEl.value },
                { el: finEl,    valid: !!finEl.value },
                { el: frecEl,   valid: !!frecEl.value }
            ];

            let hasError = false;
            fields.forEach(({ el, valid }) => {
                el.classList.toggle("input-error", !valid);
                let errMsg = el.parentElement.querySelector(".field-error-msg");
                if (!valid) {
                    hasError = true;
                    if (!errMsg) {
                        errMsg = document.createElement("span");
                        errMsg.className = "field-error-msg";
                        errMsg.textContent = "Este campo es obligatorio";
                        el.parentElement.appendChild(errMsg);
                    }
                    el.addEventListener("input", function clear() {
                        if (el.value) {
                            el.classList.remove("input-error");
                            errMsg?.remove();
                            el.removeEventListener("input", clear);
                        }
                    });
                    el.addEventListener("change", function clearSel() {
                        if (el.value) {
                            el.classList.remove("input-error");
                            errMsg?.remove();
                            el.removeEventListener("change", clearSel);
                        }
                    });
                } else if (errMsg) {
                    errMsg.remove();
                }
            });

            if (hasError) return;

            const dto = {
                medicinaId: Number(elements.alarmaMedicinaId.value),
                pacienteId: Number(state.pacienteId),
                fechaInicio: inicioEl.value,
                fechaFin: finEl.value,
                frecuenciaHoras: Number(frecEl.value)
            };

            elements.btnGuardarAlarma.disabled = true;
            elements.btnGuardarAlarma.textContent = "Guardando...";

            try {
                const nuevaConfig = await crearAlarmaConfig(dto);
                const medicinaId = dto.medicinaId;
                const configGuardada = nuevaConfig ?? { ...dto };

                const yaExiste = state.alarmasConfig.findIndex(a => Number(a.medicinaId) === medicinaId);
                if (yaExiste >= 0) {
                    state.alarmasConfig[yaExiste] = configGuardada;
                } else {
                    state.alarmasConfig.push(configGuardada);
                }

                onAlarmaGuardada?.();
                notify.success("Alarma configurada con éxito");
                cerrar();
            } catch (error) {
                console.error("Error al configurar alarma:", error);
                notify.error(error.message || "Hubo un error al guardar la alarma.");
            } finally {
                elements.btnGuardarAlarma.disabled = false;
                elements.btnGuardarAlarma.textContent = "Guardar alarma";
            }
        };
    }

    function abrir(medicinaId, medicinaNombre = "") {
        if (!elements.modalAlarma) return;

        elements.alarmaMedicinaId.value = medicinaId;
        elements.modalAlarmaMedicinaNombre.textContent = medicinaNombre;

        const config = state.alarmasConfig.find(a => Number(a.medicinaId) === Number(medicinaId));
        if (config) {
            _mostrarModoVer(elements, config, state.pacienteId);
        } else {
            _mostrarModoCrear(elements);
        }

        elements.modalAlarma.classList.add("active");
    }

    return { init, abrir, cerrar };
}
