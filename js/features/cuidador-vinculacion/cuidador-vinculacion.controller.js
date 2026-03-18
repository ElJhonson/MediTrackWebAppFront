import { logout } from "../../core/auth.js";
import { createModalController } from "./cuidador-vinculacion.modal.js";
import { initCuidadorVinculacionTopbar } from "./cuidador-vinculacion.topbar.js";
import { createCuidadorVinculacionActions } from "./cuidador-vinculacion.actions.js";

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

    const actions = createCuidadorVinculacionActions({
        caregiverPanel,
        caregiverStatus,
        modal,
        onUnauthorized: logout
    });

    initCuidadorVinculacionTopbar({
        accountMenuWrap,
        accountMenuBtn,
        btnLogout,
        patientDisplayName,
        patientAvatar,
        confirmModal,
        modal,
        onLogout: logout
    });

    confirmModal?.setAttribute("inert", "");
    actions.cargarEstadoCuidador();
}
