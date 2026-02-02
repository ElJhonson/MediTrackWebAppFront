import { obtenerMisDatosPaciente } from "../../services/paciente.service.js";

export async function cargarDatosPaciente() {
    const paciente = await obtenerMisDatosPaciente();
    if (!paciente) return;

    pacienteNombre.innerText = paciente.name;
    pacienteEdad.innerText = paciente.edad ?? "--";

    pacienteCuidador.innerText = paciente.cuidadorName
        ? `Cuidador: ${paciente.cuidadorName}`
        : "Sin cuidador vinculado";

    pacienteAvatar.src =
        `https://ui-avatars.com/api/?name=${encodeURIComponent(paciente.name)}&background=0D8ABC&color=fff`;
}
