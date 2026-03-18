export function createFormSubmitLock(config) {
    const {
        form,
        submitButton,
        fields = [],
        buttons = [],
        getIdleText = () => submitButton?.textContent || "Guardar",
        getPendingText = () => "Guardando..."
    } = config;

    let locked = false;

    function setLocked(nextLocked, context = {}) {
        locked = Boolean(nextLocked);

        if (form) {
            form.dataset.submitting = locked ? "true" : "false";
        }

        if (submitButton) {
            submitButton.disabled = locked;
            submitButton.textContent = locked
                ? getPendingText(context)
                : getIdleText(context);
        }

        fields.forEach((field) => {
            if (field) field.disabled = locked;
        });

        buttons.forEach((button) => {
            if (button) button.disabled = locked;
        });
    }

    return {
        isLocked: () => locked,
        setLocked
    };
}
