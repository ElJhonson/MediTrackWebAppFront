export const PHONE_DIGITS = 10;
export const CURP_LENGTH = 18;

export function sanitizePhoneValue(value) {
    return String(value || "").replace(/\D/g, "").slice(0, PHONE_DIGITS);
}

export function setupPhoneInputValidation(input) {
    if (!input) return;

    const normalizePhone = () => {
        input.value = sanitizePhoneValue(input.value);
    };

    input.addEventListener("input", normalizePhone);
    input.addEventListener("paste", () => setTimeout(normalizePhone, 0));
}

export function sanitizeCurpValue(value) {
    return String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, CURP_LENGTH);
}

export function setupCurpInputValidation(input) {
    if (!input) return;

    const normalizeCurp = () => {
        input.value = sanitizeCurpValue(input.value);
    };

    input.addEventListener("input", normalizeCurp);
    input.addEventListener("paste", () => setTimeout(normalizeCurp, 0));
}

export function isCurpLengthValid(value) {
    return sanitizeCurpValue(value).length === CURP_LENGTH;
}

export function applySpanishValidationMessages(targetForm) {
    if (!targetForm) return;

    const fields = targetForm.querySelectorAll("input, select, textarea");

    fields.forEach((field) => {
        field.addEventListener("invalid", () => {
            if (field.validity.valueMissing) {
                field.setCustomValidity("Este campo es obligatorio.");
                return;
            }

            if (field.id === "phoneNumber") {
                const digits = sanitizePhoneValue(field.value);
                if (digits.length !== PHONE_DIGITS) {
                    field.setCustomValidity("El numero de telefono debe tener 10 digitos.");
                    return;
                }
            }

            field.setCustomValidity("Valor no valido.");
        });

        field.addEventListener("input", () => {
            field.setCustomValidity("");
        });
    });
}

export function setupPasswordConfirmationValidation(passwordInput, confirmPasswordInput) {
    if (!passwordInput || !confirmPasswordInput) return;

    const clear = () => {
        confirmPasswordInput.setCustomValidity("");
    };

    passwordInput.addEventListener("input", clear);
    confirmPasswordInput.addEventListener("input", clear);
}

export function passwordsMatch(passwordInput, confirmPasswordInput) {
    if (!passwordInput || !confirmPasswordInput) return true;
    return passwordInput.value === confirmPasswordInput.value;
}

export function setupPasswordToggle(button, passwordInput) {
    if (!button || !passwordInput) return;

    button.addEventListener("click", (e) => {
        e.preventDefault();

        const group = passwordInput.closest(".password-group");
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";

        if (group) {
            group.classList.toggle("visible", isHidden);
        }
    });
}
