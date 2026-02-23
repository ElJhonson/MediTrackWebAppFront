import { protectPage } from "../guards/guard.js";
import {
    initMedicamentos,
    cargarMedicamentos
} from "../features/medicamentos/medicamentos.controller.js";
import { cargarDatosPaciente } from "../features/paciente/paciente.controller.js";
import { initAlarmaModal } from "../features/medicamentos/medicamentos.alarma.js"; 

protectPage();

async function cargarDatosPacienteSeguro() {
    try {
        await cargarDatosPaciente();
    } catch (error) {
        console.warn("No se pudieron cargar los datos del paciente.", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    initAlarmaModal();
    await cargarDatosPacienteSeguro();
    setTimeout(() => {
        cargarDatosPacienteSeguro();
    }, 300);
    initMedicamentos();
});

window.addEventListener("pageshow", async (event) => {
    if (!event.persisted) return;

    await cargarDatosPacienteSeguro();
    await cargarMedicamentos();
});
