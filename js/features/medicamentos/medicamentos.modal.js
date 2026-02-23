import {
    registrarMedicina,
    actualizarMedicina
} from "../../services/medicina.service.js";
import { notifyError, notifySuccess } from "../../core/notify.js";

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

        try {
            if (id) {
                await actualizarMedicina(id, dto);
                notifySuccess("Medicina actualizada correctamente");
            } else {
                await registrarMedicina(dto);
                notifySuccess("Medicina registrada correctamente");
            }

            modal.classList.remove("active");
            form.reset();
            document.getElementById("editId").value = "";
            await cargarMedicamentos();
        } catch (error) {
            console.error("Error al guardar medicina:", error);
            notifyError(error.message || "No se pudo guardar la medicina");
        }
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
