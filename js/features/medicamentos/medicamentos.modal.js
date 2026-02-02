import {
    registrarMedicina,
    actualizarMedicina
} from "../../services/medicina.service.js";

import { cargarMedicamentos } from "./medicamentos.controller.js";

const modal = document.getElementById("modalMed");
const form = document.getElementById("medForm");

export function initMedicamentosModal() {

    document.getElementById("btnOpenModal").onclick = () => {
        document.getElementById("modalTitle").innerText = "Registrar Medicina";
        form.reset();
        modal.classList.add("active");
    };

    document.getElementById("btnCloseModal").onclick = () => {
        modal.classList.remove("active");
    };

    form.onsubmit = async (e) => {
        e.preventDefault();

        const id = document.getElementById("editId").value;

        const dto = {
            nombre: document.getElementById("name").value.trim(),
            dosageForm: document.getElementById("dosageForm").value,
            expirationDate: document.getElementById("expirationDate").value
        };

        if (id) {
            await actualizarMedicina(id, dto);
        } else {
            await registrarMedicina(dto);
        }

        modal.classList.remove("active");
        form.reset();
        document.getElementById("editId").value = "";
        await cargarMedicamentos();
    };
}

export function abrirModalEditar(med) {
    document.getElementById("modalTitle").innerText = "Editar Medicina";
    document.getElementById("editId").value = med.id;
    document.getElementById("name").value = med.nombre;
    document.getElementById("dosageForm").value = med.dosageForm;
    document.getElementById("expirationDate").value =
        med.expirationDate.split("T")[0];

    modal.classList.add("active");
}
