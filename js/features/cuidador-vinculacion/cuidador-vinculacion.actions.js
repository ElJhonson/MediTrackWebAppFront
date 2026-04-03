import { notifyError, notifySuccess, notifyInfo } from "../../core/notify.js";
import {
    obtenerMisDatosPaciente,
    buscarCuidadorPorCodigo,
    vincularCuidadorPaciente,
    desvincularCuidadorPaciente
} from "../../services/paciente.service.js";
import {
    sanitizeCodigoCuidador,
    esCodigoCuidadorValido,
    obtenerCodigoCuidadorGuardado,
    guardarCodigoCuidador,
    limpiarCodigoCuidadorGuardado,
    normalizarInfoCuidador,
    obtenerNombreCuidadorBusqueda,
    obtenerTelefonoCuidadorBusqueda
} from "./cuidador-vinculacion.utils.js";
import {
    renderSinCuidador,
    renderConCuidador,
    renderErrorState
} from "./cuidador-vinculacion.dom.js";

export function createCuidadorVinculacionActions({
    caregiverPanel,
    caregiverStatus,
    modal,
    onUnauthorized
}) {
    async function vincularCuidador(codigo) {
        try {
            await vincularCuidadorPaciente(codigo);
            guardarCodigoCuidador(codigo);

            await cargarEstadoCuidador();
            return true;
        } catch (error) {
            notifyError(error?.message || "No se pudo vincular el cuidador");
            return false;
        }
    }

    async function desvincularCuidador() {
        try {
            await desvincularCuidadorPaciente();
            limpiarCodigoCuidadorGuardado();

            await cargarEstadoCuidador();
            return true;
        } catch (error) {
            notifyError(error?.message || "No se pudo desvincular el cuidador");
            return false;
        }
    }

    function bindVincularFlow() {
        const { codeInput, btnLinkCaregiver } = renderSinCuidador(caregiverPanel, caregiverStatus);

        const normalizarCodigoInput = () => {
            if (!codeInput) return;
            codeInput.value = sanitizeCodigoCuidador(codeInput.value);
        };

        codeInput?.addEventListener("input", normalizarCodigoInput);
        codeInput?.addEventListener("paste", () => setTimeout(normalizarCodigoInput, 0));

        btnLinkCaregiver?.addEventListener("click", async () => {
            const codigo = sanitizeCodigoCuidador(codeInput?.value);
            if (codeInput) {
                codeInput.value = codigo;
            }

            if (!codigo) {
                notifyInfo("Ingresa un codigo de vinculacion para continuar.");
                codeInput?.focus();
                return;
            }

            if (!esCodigoCuidadorValido(codigo)) {
                notifyError("El codigo debe tener exactamente 6 caracteres alfanumericos.");
                codeInput?.focus();
                return;
            }

            btnLinkCaregiver.disabled = true;
            btnLinkCaregiver.textContent = "Buscando...";

            modal.openLoadingModal("Validando codigo y buscando cuidador...");

            try {
                const cuidadorEncontrado = await buscarCuidadorPorCodigo(codigo);
                modal.closeConfirmModal(true);

                const nombreCuidador = obtenerNombreCuidadorBusqueda(cuidadorEncontrado);
                const mensajeConfirmacion = nombreCuidador
                    ? `Deseas vincularte con el cuidador ${nombreCuidador}?`
                    : "Deseas vincularte con este cuidador?";

                modal.openConfirmModal({
                    title: "Confirmar vinculacion",
                    message: mensajeConfirmacion,
                    confirmText: "Confirmar",
                    pendingText: "Vinculando...",
                    onConfirm: async () => {
                        const ok = await vincularCuidador(codigo);
                        if (ok) {
                            modal.closeConfirmModal(true);
                            notifySuccess("Cuidador vinculado correctamente.");
                        }

                        return false;
                    }
                });
            } catch (error) {
                modal.closeConfirmModal(true);
                notifyError(error?.message || "No se pudo validar el codigo del cuidador");
            } finally {
                btnLinkCaregiver.disabled = false;
                btnLinkCaregiver.textContent = "Vincular cuidador";
            }
        });
    }

    function bindCuidadorVinculado(cuidadorInfo) {
        const { btnUnlinkCaregiver } = renderConCuidador(caregiverPanel, caregiverStatus, cuidadorInfo);

        btnUnlinkCaregiver?.addEventListener("click", () => {
            modal.openConfirmModal({
                title: "Confirmar desvinculacion",
                message: "Deseas desvincular a tu cuidador actual?",
                confirmText: "Desvincular",
                pendingText: "Desvinculando...",
                onConfirm: async () => {
                    const ok = await desvincularCuidador();
                    if (ok) {
                        modal.closeConfirmModal(true);
                        notifySuccess("Cuidador desvinculado correctamente.");
                    }

                    return false;
                }
            });
        });
    }

    async function cargarEstadoCuidador() {

        try {
            const paciente = await obtenerMisDatosPaciente();

            if (!paciente) {
                onUnauthorized();
                return;
            }

            const cuidadorInfo = normalizarInfoCuidador(paciente);
            if (cuidadorInfo.hasCaregiver) {
                if (!cuidadorInfo.codigo) {
                    cuidadorInfo.codigo = obtenerCodigoCuidadorGuardado();
                }

                if (cuidadorInfo.codigo) {
                    guardarCodigoCuidador(cuidadorInfo.codigo);
                }

                if (cuidadorInfo.codigo) {
                    try {
                        const cuidadorDetalle = await buscarCuidadorPorCodigo(cuidadorInfo.codigo);
                        const nombreDetalle = obtenerNombreCuidadorBusqueda(cuidadorDetalle);
                        const telefonoDetalle = obtenerTelefonoCuidadorBusqueda(cuidadorDetalle);

                        if (nombreDetalle) {
                            cuidadorInfo.nombre = nombreDetalle;
                        }

                        if (telefonoDetalle) {
                            cuidadorInfo.telefono = telefonoDetalle;
                        }
                    } catch {
                        // Si falla la consulta de detalle, se conserva la info de /misdatos.
                    }
                }

                bindCuidadorVinculado(cuidadorInfo);
                return;
            }

            limpiarCodigoCuidadorGuardado();
            bindVincularFlow();
        } catch (error) {
            notifyError(error?.message || "No se pudo cargar la informacion del cuidador");
            const { btnRetry } = renderErrorState(caregiverPanel, caregiverStatus);
            btnRetry?.addEventListener("click", () => {
                cargarEstadoCuidador();
            });
        }
    }

    return {
        cargarEstadoCuidador
    };
}
