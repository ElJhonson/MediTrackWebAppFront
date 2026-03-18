import { ROLES, STORAGE_KEYS } from "../../core/config.js";

export function createCuidadorMedicinasActions({
    elements,
    state,
    data,
    dom,
    notify
}) {
    let submitInFlight = false;
    let editModalInFlight = false;

    function validarRolCuidador() {
        const role = localStorage.getItem(STORAGE_KEYS.ROLE);
        if (role !== ROLES.CUIDADOR) {
            window.location.replace("/index.html");
            return false;
        }

        return true;
    }

    function setTopbarData() {
        const rawName = String(localStorage.getItem(STORAGE_KEYS.NAME) || "Cuidador").trim();
        const shortName = rawName.split(" ").slice(0, 2).join(" ") || "Cuidador";
        state.cuidadorNombre = rawName || shortName;

        elements.caregiverName.textContent = shortName;
        elements.caregiverAvatar.textContent = shortName
            .split(" ")
            .map((part) => part[0] || "")
            .join("")
            .substring(0, 2)
            .toUpperCase();
    }

    async function bootstrapPacientes() {
        const params = new URLSearchParams(window.location.search);
        const pacienteIdParam = params.get("pacienteId");
        const pacienteNombreParam = params.get("pacienteNombre");

        try {
            state.pacientes = await data.obtenerPacientesVinculados();
        } catch (error) {
            notify.error(error.message || "No se pudieron obtener los pacientes vinculados");
            window.location.replace("/pages/dashboard-cuidador.html");
            return;
        }

        if (!Array.isArray(state.pacientes) || state.pacientes.length === 0) {
            notify.error("No tienes pacientes vinculados para gestionar medicinas.");
            window.location.replace("/pages/dashboard-cuidador.html");
            return;
        }

        state.pacienteId = pacienteIdParam || String(state.pacientes[0].id);
        state.pacienteNombre = pacienteNombreParam || "Paciente";

        if (!state.pacientes.some((p) => String(p.id) === String(state.pacienteId))) {
            state.pacienteId = String(state.pacientes[0].id);
        }

        dom.renderPatientSelectorDropdown(elements, state);
        await cargarHeaderPaciente(state.pacienteId);
        await cargarMedicinasPaciente(state.pacienteId);
    }

    async function cargarMedicinasPaciente(pacienteId) {
        dom.setMedicinasLoading(elements);

        try {
            state.lista = await data.obtenerMedicinasPorPaciente(pacienteId);
            dom.renderMedicinas(elements, state.lista);
            dom.renderQuickStats(elements, state.lista);
        } catch (error) {
            console.error("Error al cargar medicinas:", error);
            dom.setMedicinasLoadError(elements);
            dom.renderQuickStats(elements, []);
            notify.error(error.message || "No se pudieron cargar las medicinas");
        }
    }

    async function guardarDesdeFormulario() {
        if (submitInFlight) return;

        const id = elements.editId.value;
        const dto = dom.getFormPayload(elements);
        const isEditing = Boolean(id);

        submitInFlight = true;
        setSubmitButtonLocked(true, isEditing);

        try {
            if (id) {
                await data.actualizarMedicinaPaciente(id, dto);
                notify.success("Medicina actualizada correctamente");
            } else {
                await data.registrarMedicinaPaciente(dto, state.pacienteId);
                notify.success("Medicina registrada correctamente");
            }

            dom.closeModal(elements);
            await cargarMedicinasPaciente(state.pacienteId);
        } catch (error) {
            console.error("Error al guardar medicina:", error);
            notify.error(error.message || "No se pudo guardar la medicina");
        } finally {
            submitInFlight = false;
            setSubmitButtonLocked(false, isEditing);
        }
    }

    async function abrirEdicion(id, triggerButton) {
        if (editModalInFlight) return;

        editModalInFlight = true;
        if (triggerButton) {
            triggerButton.disabled = true;
        }

        try {
            let med = state.lista.find((item) => String(item.id) === String(id));
            if (!med) {
                med = await data.obtenerDetalleMedicina(id);
            }

            if (!med) {
                notify.error("No se encontró la medicina para editar");
                return;
            }

            dom.fillEditModal(elements, med);
        } catch (error) {
            console.error("Error al abrir edicion de medicina:", error);
            notify.error(error.message || "No se pudo cargar la medicina");
        } finally {
            editModalInFlight = false;
            if (triggerButton) {
                triggerButton.disabled = false;
            }
        }
    }

    async function eliminarMedicina(id) {
        const confirmado = await dom.solicitarConfirmacionEliminacion(elements);
        if (!confirmado) return;

        try {
            await data.eliminarMedicinaPaciente(id);
            notify.success("Medicina eliminada correctamente");
            await cargarMedicinasPaciente(state.pacienteId);
        } catch (error) {
            console.error("Error al eliminar medicina:", error);
            notify.error(error.message || "No se pudo eliminar la medicina");
        }
    }

    async function cambiarPaciente(pacienteId) {
        state.pacienteId = pacienteId;
        dom.syncPatientInUrl(state, pacienteId);

        await cargarHeaderPaciente(pacienteId);
        dom.renderPatientSelectorDropdown(elements, state);
        await cargarMedicinasPaciente(pacienteId);
    }

    async function cargarHeaderPaciente(pacienteId) {
        try {
            const paciente = await data.obtenerDetallePaciente(pacienteId);
            dom.setPatientHeader(elements, state, paciente);
        } catch {
            const fallback = state.pacientes.find((p) => String(p.id) === String(pacienteId));
            dom.setPatientHeader(elements, state, fallback || { name: state.pacienteNombre });
        }
    }

    function setSubmitButtonLocked(locked, isEditing) {
        const submitButton = elements.medForm?.querySelector(".btn-save");
        if (!submitButton) return;

        submitButton.disabled = locked;
        if (locked) {
            submitButton.textContent = isEditing ? "Actualizando..." : "Registrando...";
            return;
        }

        submitButton.textContent = isEditing ? "Guardar Cambios" : "Registrar Medicina";
    }

    return {
        validarRolCuidador,
        setTopbarData,
        bootstrapPacientes,
        cargarMedicinasPaciente,
        guardarDesdeFormulario,
        abrirEdicion,
        eliminarMedicina,
        cambiarPaciente,
        cargarHeaderPaciente
    };
}