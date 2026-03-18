export function createBlockingConfirmationModal(config) {
    const {
        modal,
        confirmButton,
        cancelButton,
        closeButton,
        idleConfirmText,
        pendingConfirmText,
        showModal,
        hideModal,
        isModalOpen
    } = config;

    let resolver = null;
    let bindingsReady = false;

    function isLocked() {
        return modal?.dataset.locked === "true";
    }

    function setLocked(locked) {
        if (!modal) return;

        modal.dataset.locked = locked ? "true" : "false";

        if (closeButton) closeButton.disabled = locked;
        if (cancelButton) cancelButton.disabled = locked;
        if (confirmButton) {
            confirmButton.disabled = locked;
            confirmButton.textContent = locked ? pendingConfirmText : idleConfirmText;
        }
    }

    function close() {
        if (!modal) return;
        hideModal();
        setLocked(false);
    }

    function respond(confirmed) {
        if (!modal || !resolver || isLocked()) {
            return;
        }

        if (confirmed) {
            setLocked(true);
            resolver(true);
            resolver = null;
            return;
        }

        close();
        resolver(false);
        resolver = null;
    }

    function open() {
        if (!modal) {
            return Promise.resolve(false);
        }

        if (resolver) {
            resolver(false);
            resolver = null;
        }

        setLocked(false);
        showModal();

        return new Promise((resolve) => {
            resolver = resolve;
        });
    }

    function bind() {
        if (bindingsReady || !modal) return;
        bindingsReady = true;

        closeButton?.addEventListener("click", () => respond(false));
        cancelButton?.addEventListener("click", () => respond(false));
        confirmButton?.addEventListener("click", () => respond(true));

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                respond(false);
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isModalOpen()) {
                respond(false);
            }
        });
    }

    return {
        bind,
        open,
        close,
        respond,
        setLocked,
        isLocked
    };
}
