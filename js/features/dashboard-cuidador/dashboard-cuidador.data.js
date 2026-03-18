import { logout } from "../../core/auth.js";
import { notifyError, notifySuccess } from "../../core/notify.js";
import {
    obtenerMisDatosCuidador,
    obtenerPacientesDelCuidador,
    registrarPacienteDesdeCuidador,
    obtenerPacientePorId,
    desvincularPacienteDelCuidador
} from "../../services/cuidador.service.js";
import { conRetry, esErrorRedFetch } from "./dashboard-cuidador.utils.js";
import {
    closeUnlinkConfirmModal,
    cerrarModal,
    renderPacientes,
    setRegisterFormLocked,
    setUnlinkConfirmationLocked,
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

export async function cargarPacientes(elements, handlers = {}) {
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

        renderPacientes(elements, pacientesConDetalle, handlers);
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

export async function registrarPacienteDesdeFormulario(elements, handlers = {}) {
    if (elements.registerForm?.dataset.submitting === "true") return;

    const dto = {
        name: elements.registerForm.name.value.trim(),
        phoneNumber: elements.registerForm.phoneNumber.value.trim(),
        edad: Number(elements.registerForm.edad.value),
        password: elements.registerForm.password.value
    };

    try {
        setRegisterFormLocked(elements, true);
        await registrarPacienteDesdeCuidador(dto);
        await cargarPacientes(elements, handlers);
        setRegisterFormLocked(elements, false);
        cerrarModal(elements);
        notifySuccess("Paciente registrado con éxito");
    } catch (error) {
        console.error("Error al registrar:", error);
        notifyError(error.message || "Error al registrar paciente");
        setRegisterFormLocked(elements, false);
    }
}

export async function desvincularPacienteDesdeDashboard(elements, paciente, handlers = {}) {
    if (!paciente?.id) {
        notifyError("No se pudo identificar el paciente a desvincular");
        return;
    }

    try {
        await desvincularPacienteDelCuidador(paciente.id);
        await cargarPacientes(elements, handlers);
        closeUnlinkConfirmModal(elements);
        notifySuccess("Paciente desvinculado correctamente");
    } catch (error) {
        console.error("Error al desvincular paciente:", error);
        setUnlinkConfirmationLocked(elements, false);
        notifyError(error.message || "No se pudo desvincular al paciente");
    }
}
