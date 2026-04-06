import { crearAlarmaConfig } from "../../services/alarma.service.js";
import { notifyError, notifySuccess } from "../../core/notify.js";
import { medicamentosState } from "./medicamentos.state.js";

const modal = document.getElementById("modalAlarma");
const form = document.getElementById("alarmaForm");
const title = document.getElementById("modalAlarmaTitle");
const medicinaNombreLabel = document.getElementById("modalAlarmaMedicinaNombre");
const btnGuardar = document.getElementById("btnGuardarAlarma");
const btnVerDetalles = document.getElementById("btnVerDetallesAlarma");

function cerrarModalAlarma() {
    modal.classList.remove("active");
}

function _mostrarModoCrear() {
    title.textContent = "Programar recordatorio";
    form.reset();
    ["fechaInicio", "fechaFin", "frecuenciaHoras"].forEach(id => {
        document.getElementById(id).disabled = false;
    });
    btnGuardar.style.display = "";
    btnVerDetalles.style.display = "none";
}

function _mostrarModoVer(config) {
    title.textContent = "Configuración de alarma";
    document.getElementById("fechaInicio").value = config.fechaInicio?.slice(0, 16) ?? "";
    document.getElementById("fechaFin").value = config.fechaFin?.slice(0, 16) ?? "";
    document.getElementById("frecuenciaHoras").value = config.frecuenciaHoras;
    ["fechaInicio", "fechaFin", "frecuenciaHoras"].forEach(id => {
        document.getElementById(id).disabled = true;
    });
    btnGuardar.style.display = "none";
    btnVerDetalles.style.display = "";
}

export function initAlarmaModal() {
    document.getElementById("btnCloseAlarma").onclick = () => cerrarModalAlarma();
    document.getElementById("btnCancelAlarma").onclick = () => cerrarModalAlarma();

    form.onsubmit = async (e) => {
        e.preventDefault();

        const dto = {
            medicinaId: Number(document.getElementById("alarmaMedicinaId").value),
            fechaInicio: document.getElementById("fechaInicio").value,
            fechaFin: document.getElementById("fechaFin").value,
            frecuenciaHoras: Number(document.getElementById("frecuenciaHoras").value)
        };

        try {
            const nuevaConfig = await crearAlarmaConfig(dto);

            // Actualizar estado local para que el ícono refleje la alarma sin recargar
            const medicinaId = dto.medicinaId;
            const yaExiste = medicamentosState.alarmasConfig.findIndex(a => a.medicinaId == medicinaId);
            const configGuardada = nuevaConfig ?? { ...dto };
            if (yaExiste >= 0) {
                medicamentosState.alarmasConfig[yaExiste] = configGuardada;
            } else {
                medicamentosState.alarmasConfig.push(configGuardada);
            }

            // Actualizar visualmente solo el botón de esa tarjeta
            const btn = document.querySelector(`.btn-reminder[data-id="${medicinaId}"]`);
            if (btn) {
                btn.classList.add("has-alarm");
                btn.title = "Ver configuración de alarma";
            }

            notifySuccess("Alarma configurada con exito");
            cerrarModalAlarma();
            form.reset();
        } catch (error) {
            console.error("Error al configurar alarma:", error);
            notifyError(error.message || "Hubo un error al guardar la alarma.");
        }
    };
}

// Funcion llamada desde el boton del reloj en el render
export function abrirModalAlarma(medicinaId, medicinaNombre = "", config = null) {
    document.getElementById("alarmaMedicinaId").value = medicinaId;
    medicinaNombreLabel.textContent = medicinaNombre;

    if (config) {
        _mostrarModoVer(config);
    } else {
        _mostrarModoCrear();
    }

    modal.classList.add("active");
}
