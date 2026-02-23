import {
    obtenerMisMedicinas,
    eliminarMedicina
} from "../../services/medicina.service.js";
import { notifyError, notifySuccess } from "../../core/notify.js";

import { medicamentosState } from "./medicamentos.state.js";
import { renderMeds } from "./medicamentos.render.js";
import {
    initMedicamentosModal,
    abrirModalEditar
} from "./medicamentos.modal.js";

const container = document.getElementById("medContainer");

export async function cargarMedicamentos() {
    if (medicamentosState.cargando) return;

    medicamentosState.cargando = true;
    container.innerHTML = `<p class="med-loading">Cargando medicamentos...</p>`;

    try {
        medicamentosState.lista = await obtenerMisMedicinas();
        renderMeds(medicamentosState.lista);
    } catch (error) {
        console.error("Error al cargar medicamentos:", error);
        container.innerHTML = `<p class="med-loading">No se pudieron cargar los medicamentos.</p>`;
    } finally {
        medicamentosState.cargando = false;
    }
}


export function initMedicamentos() {
    if (medicamentosState.inicializado) {
        cargarMedicamentos();
        return;
    }

    medicamentosState.inicializado = true;
    initMedicamentosModal();
    cargarMedicamentos();

    container.addEventListener("click", async (e) => {
        const id = e.target.dataset.id || e.target.closest("button")?.dataset.id;

        // Caso Eliminar 
        if (e.target.classList.contains("btn-delete")) {
            if (!confirm("¿Deseas eliminar esta medicina?")) return;
            try {
                await eliminarMedicina(id);
                notifySuccess("Medicina eliminada correctamente");
                await cargarMedicamentos();
            } catch (error) {
                console.error("Error al eliminar medicina:", error);
                notifyError(error.message || "No se pudo eliminar la medicina");
            }
        }

        // Caso Editar 
        if (e.target.classList.contains("btn-edit")) {
            const med = medicamentosState.lista.find(m => m.id == id);
            abrirModalEditar(med);
        }

        // Caso Alarma 
        if (e.target.classList.contains("btn-reminder")) {
            import("./medicamentos.alarma.js").then(module => {
                module.abrirModalAlarma(id);
            });
        }
    });
}
