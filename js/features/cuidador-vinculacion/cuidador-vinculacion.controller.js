import { logout } from "../../core/auth.js";
import { STORAGE_KEYS } from "../../core/config.js";
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
import { createModalController } from "./cuidador-vinculacion.modal.js";

export function initCuidadorVinculacion() {
    const caregiverPanel = document.getElementById("caregiverPanel");
    const caregiverStatus = document.getElementById("caregiverStatus");
    const accountMenuWrap = document.getElementById("accountMenuWrap");
    const accountMenuBtn = document.getElementById("accountMenuBtn");
    const btnLogout = document.getElementById("btnLogout");
    const patientDisplayName = document.getElementById("patient-display-name");
    const patientAvatar = document.getElementById("patient-avatar");

    const confirmModal = document.getElementById("confirmModal");
    const confirmTitle = document.getElementById("confirmTitle");
    const confirmMessage = document.getElementById("confirmMessage");
    const confirmActions = confirmModal?.querySelector(".modal-actions");
    const confirmActionBtn = document.getElementById("confirmActionBtn");
    const cancelActionBtn = document.getElementById("cancelActionBtn");

    const modal = createModalController({
        confirmModal,
        confirmTitle,
        confirmMessage,
        confirmActions,
        confirmActionBtn,
        cancelActionBtn
    });

    function initHeader() {
        const name = String(localStorage.getItem(STORAGE_KEYS.NAME) || "Paciente").trim();
        const shortName = name.split(" ").slice(0, 2).join(" ") || "Paciente";

        if (patientDisplayName) {
            patientDisplayName.textContent = shortName;
        }

        if (patientAvatar) {
            const initials = shortName
                .split(" ")
                .map((part) => part[0] || "")
                .join("")
                .substring(0, 2)
                .toUpperCase();
            patientAvatar.textContent = initials;
        }
    }

    function closeAccountMenu() {
        if (!accountMenuWrap || !accountMenuBtn) return;
        accountMenuWrap.classList.remove("open");
        accountMenuBtn.setAttribute("aria-expanded", "false");
    }

    function setupTopbarNavActive() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll(".nav-links a");

        navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (!href) return;

            const linkPath = new URL(href, window.location.origin).pathname;
            if (linkPath === currentPath) {
                link.classList.add("active");
            }
        });
    }

    async function vincularCuidador(codigo) {
        try {
            await vincularCuidadorPaciente(codigo);
            guardarCodigoCuidador(codigo);

            notifySuccess("Cuidador vinculado correctamente.");
            await cargarEstadoCuidador();
        } catch (error) {
            notifyError(error?.message || "No se pudo vincular el cuidador");
        }
    }

    async function desvincularCuidador() {
        try {
            await desvincularCuidadorPaciente();
            limpiarCodigoCuidadorGuardado();

            notifySuccess("Cuidador desvinculado correctamente.");
            await cargarEstadoCuidador();
        } catch (error) {
            notifyError(error?.message || "No se pudo desvincular el cuidador");
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
                modal.closeConfirmModal();

                const nombreCuidador = obtenerNombreCuidadorBusqueda(cuidadorEncontrado);
                const mensajeConfirmacion = nombreCuidador
                    ? `Deseas vincularte con el cuidador ${nombreCuidador}?`
                    : "Deseas vincularte con este cuidador?";

                modal.openConfirmModal({
                    title: "Confirmar vinculacion",
                    message: mensajeConfirmacion,
                    confirmText: "Confirmar",
                    onConfirm: async () => {
                        await vincularCuidador(codigo);
                    }
                });
            } catch (error) {
                modal.closeConfirmModal();
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
                onConfirm: async () => {
                    await desvincularCuidador();
                }
            });
        });
    }

    async function cargarEstadoCuidador() {
        caregiverStatus.textContent = "Cargando informacion del cuidador...";

        try {
            const paciente = await obtenerMisDatosPaciente();

            if (!paciente) {
                logout();
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

    function setupTopbarEvents() {
        accountMenuBtn?.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = accountMenuWrap.classList.toggle("open");
            accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
        });

        window.addEventListener("click", (event) => {
            if (!accountMenuWrap?.contains(event.target)) {
                closeAccountMenu();
            }

            if (event.target === confirmModal) {
                modal.closeConfirmModal();
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeAccountMenu();
                modal.closeConfirmModal();
            }
        });

        btnLogout?.addEventListener("click", () => {
            logout();
        });
    }

    initHeader();
    setupTopbarNavActive();
    setupTopbarEvents();
    confirmModal?.setAttribute("inert", "");
    cargarEstadoCuidador();
}
