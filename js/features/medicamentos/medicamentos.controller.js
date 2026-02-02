import {
    obtenerMisMedicinas,
    eliminarMedicina
} from "../../services/medicina.service.js";

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
    medicamentosState.lista = await obtenerMisMedicinas();
    renderMeds(medicamentosState.lista);
    medicamentosState.cargando = false;
}

export function initMedicamentos() {
    initMedicamentosModal();
    cargarMedicamentos();

    container.addEventListener("click", async (e) => {

        if (e.target.classList.contains("btn-delete")) {
            const id = e.target.dataset.id;
            if (!confirm("¿Deseas eliminar esta medicina?")) return;

            await eliminarMedicina(id);
            await cargarMedicamentos();
        }

        if (e.target.classList.contains("btn-edit")) {
            const card = e.target.closest(".med-card");
            const id = card.dataset.id;
            const med = medicamentosState.lista.find(m => m.id == id);
            abrirModalEditar(med);
        }
    });
}
