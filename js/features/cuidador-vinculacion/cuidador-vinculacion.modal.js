import { escapeHtml } from "./cuidador-vinculacion.utils.js";

export function createModalController({
    confirmModal,
    confirmTitle,
    confirmMessage,
    confirmActions,
    confirmActionBtn,
    cancelActionBtn
}) {
    let modalConfirmHandler = null;
    let lastFocusedElement = null;
    let modalLocked = false;
    let confirmButtonIdleText = "Confirmar";
    let confirmButtonPendingText = "Procesando...";

    function setModalLocked(locked, pendingText = "Procesando...") {
        modalLocked = Boolean(locked);

        if (confirmActionBtn) {
            confirmActionBtn.disabled = modalLocked;
            if (modalLocked) {
                confirmActionBtn.textContent = pendingText;
            } else {
                confirmActionBtn.textContent = confirmButtonIdleText;
            }
        }

        if (cancelActionBtn) {
            cancelActionBtn.disabled = modalLocked;
        }
    }

    function openConfirmModal({
        title,
        message,
        confirmText = "Confirmar",
        pendingText = "Procesando...",
        onConfirm
    }) {
        lastFocusedElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmButtonIdleText = confirmText;
        confirmButtonPendingText = pendingText;
        confirmActionBtn.textContent = confirmText;
        confirmActions?.classList.remove("hidden");
        confirmModal.classList.remove("modal-loading");
        modalConfirmHandler = onConfirm;
        setModalLocked(false);

        confirmModal.removeAttribute("inert");
        confirmModal.classList.add("is-open");
        confirmModal.setAttribute("aria-hidden", "false");

        requestAnimationFrame(() => {
            confirmActionBtn?.focus();
        });
    }

    function openLoadingModal(message = "Buscando cuidador...") {
        lastFocusedElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        confirmTitle.textContent = "Buscando cuidador";
        confirmMessage.innerHTML = `
            <span class="modal-loading-content">
                <span class="modal-spinner" aria-hidden="true"></span>
                <span>${escapeHtml(message)}</span>
            </span>
        `;
        confirmActions?.classList.add("hidden");
        confirmModal.classList.add("modal-loading");
        modalConfirmHandler = null;
        setModalLocked(true);

        confirmModal.removeAttribute("inert");
        confirmModal.classList.add("is-open");
        confirmModal.setAttribute("aria-hidden", "false");
    }

    function closeConfirmModal(force = false) {
        if (modalLocked && !force) {
            return;
        }

        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement && confirmModal.contains(activeElement)) {
            activeElement.blur();
        }

        confirmModal.classList.remove("is-open");
        confirmModal.classList.remove("modal-loading");
        confirmModal.setAttribute("aria-hidden", "true");
        confirmModal.setAttribute("inert", "");
        confirmActions?.classList.remove("hidden");
        modalConfirmHandler = null;
        setModalLocked(false);

        const focusTarget = lastFocusedElement;

        if (
            focusTarget
            && document.contains(focusTarget)
            && typeof focusTarget.focus === "function"
        ) {
            requestAnimationFrame(() => {
                focusTarget.focus();
            });
        }

        lastFocusedElement = null;
    }

    cancelActionBtn?.addEventListener("click", closeConfirmModal);

    confirmActionBtn?.addEventListener("click", async () => {
        if (!modalConfirmHandler) {
            closeConfirmModal();
            return;
        }

        const handler = modalConfirmHandler;
        setModalLocked(true, confirmButtonPendingText);

        try {
            const result = await handler();

            if (result === false) {
                setModalLocked(false);
                return;
            }

            setModalLocked(false);
            closeConfirmModal();
        } catch {
            setModalLocked(false);
        }
    });

    return {
        openConfirmModal,
        openLoadingModal,
        closeConfirmModal
    };
}
