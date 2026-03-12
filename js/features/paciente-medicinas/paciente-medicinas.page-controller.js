import { cargarDatosPaciente } from "../paciente/paciente.controller.js";
import {
    cargarMedicamentos,
    initMedicamentos
} from "./medicamentos.controller.js";
import { initAlarmaModal } from "./medicamentos.alarma.js";
import { initPacienteMedicinasTopbar } from "./paciente-medicinas.topbar.js";

export async function initPacienteMedicinasPage() {
    initPacienteMedicinasTopbar();
    initAlarmaModal();

    await cargarDatosPacienteSeguro();

    setTimeout(() => {
        cargarDatosPacienteSeguro();
    }, 300);

    initMedicamentos();
}

export async function onPacienteMedicinasPageShow(event) {
    if (!event.persisted) return;

    await cargarDatosPacienteSeguro();
    await cargarMedicamentos();
}

async function cargarDatosPacienteSeguro() {
    try {
        await cargarDatosPaciente();
    } catch (error) {
        console.warn("No se pudieron cargar los datos del paciente.", error);
    }
}
