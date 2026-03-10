import { logout } from "../../core/auth.js";
import { notifyError, notifySuccess } from "../../core/notify.js";
import {
    obtenerMisDatosCuidador,
    obtenerPacientesDelCuidador,
    registrarPacienteDesdeCuidador,
    obtenerPacientePorId
} from "../../services/cuidador.service.js";
import { conRetry, esErrorRedFetch } from "./dashboard-cuidador.utils.js";
import {
    cerrarModal,
    renderPacientes,
    setPacientesLoading
} from "./dashboard-cuidador.dom.js";

export async function cargarDatosCuidador(elements) {
    try {
        const cuidador = await conRetry(() => obtenerMisDatosCuidador(), 1);

        const nombreCorto = cuidador.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .join(" ");

        if (elements.caregiverName) {
            elements.caregiverName.textContent = nombreCorto;
        }

        const initials = nombreCorto
            .split(" ")
            .map(part => part[0] || "")
            .join("")
            .substring(0, 2)
            .toUpperCase();

        if (elements.caregiverAvatar) {
            elements.caregiverAvatar.textContent = initials;
        }

        elements.linkCode.textContent = cuidador.codigoVinculacion;
    } catch (error) {
        if (esErrorRedFetch(error)) {
            console.warn("Error de red temporal al cargar datos del cuidador.");
            return;
        }

        console.error(error);
        logout();
    }
}

export async function cargarPacientes(elements) {
    setPacientesLoading(elements, true);

    try {
        const pacientes = await conRetry(() => obtenerPacientesDelCuidador(), 1);

        const pacientesConDetalle = await Promise.all(
            pacientes.map(async (paciente) => {
                const enfermedadesLista = Array.isArray(paciente.enfermedadesCronicas)
                    ? paciente.enfermedadesCronicas
                    : [];

                if (enfermedadesLista.length > 0) {
                    return paciente;
                }

                try {
                    const detalle = await conRetry(
                        () => obtenerPacientePorId(paciente.id),
                        1
                    );

                    return {
                        ...paciente,
                        enfermedadesCronicas: detalle.enfermedadesCronicas || []
                    };
                } catch {
                    return {
                        ...paciente,
                        enfermedadesCronicas: []
                    };
                }
            })
        );

        renderPacientes(elements, pacientesConDetalle);
    } catch (error) {
        elements.patientContainer.innerHTML = "";

        if (esErrorRedFetch(error)) {
            notifyError("No se pudo conectar al servidor. Intenta recargar en unos segundos.");
            return;
        }

        console.error("Error cargando pacientes:", error);
        notifyError("No se pudieron cargar los pacientes.");
    }
}

export async function registrarPacienteDesdeFormulario(elements) {
    const dto = {
        name: elements.registerForm.name.value.trim(),
        phoneNumber: elements.registerForm.phoneNumber.value.trim(),
        edad: Number(elements.registerForm.edad.value),
        password: elements.registerForm.password.value
    };

    try {
        await registrarPacienteDesdeCuidador(dto);
        notifySuccess("Paciente registrado con éxito");
        cerrarModal(elements);
        await cargarPacientes(elements);
    } catch (error) {
        console.error("Error al registrar:", error);
        notifyError(error.message || "Error al registrar paciente");
    }
}
