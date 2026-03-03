import { logout } from "../../core/auth.js";
import { notifyError, notifyInfo } from "../../core/notify.js";
import {
    PHONE_DIGITS,
    sanitizePhoneValue,
    setupPhoneInputValidation,
    applySpanishValidationMessages,
    setupPasswordConfirmationValidation,
    passwordsMatch,
    setupPasswordToggle
} from "../../core/form-validation.js";
import { cerrarAccountMenu, cerrarModal } from "./dashboard-cuidador.dom.js";

export function bindDashboardCuidadorEvents(elements, handlers) {
    setupPhoneInputValidation(elements.registerForm?.phoneNumber);
    setupPasswordConfirmationValidation(elements.passwordInput, elements.confirmPasswordInput);
    applySpanishValidationMessages(elements.registerForm);
    setupPasswordToggle(elements.togglePasswordBtn, elements.passwordInput);
    setupPasswordToggle(elements.toggleConfirmPasswordBtn, elements.confirmPasswordInput);

    elements.btnAddPatient.addEventListener("click", () => {
        elements.modal.style.display = "flex";
    });

    elements.btnCloseModal.addEventListener("click", () => {
        cerrarModal(elements);
    });

    elements.btnLogout?.addEventListener("click", () => {
        logout();
    });

    elements.accountMenuBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = elements.accountMenuWrap.classList.toggle("open");
        elements.accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    window.addEventListener("click", (e) => {
        if (!elements.accountMenuWrap?.contains(e.target)) {
            cerrarAccountMenu(elements);
        }

        if (e.target === elements.modal) {
            cerrarModal(elements);
        }
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarAccountMenu(elements);
    });

    elements.btnCopy.addEventListener("click", async () => {
        const codigoTexto = elements.linkCode.textContent.trim();

        if (!codigoTexto) {
            notifyInfo("El cÃ³digo aÃºn no estÃ¡ disponible");
            return;
        }

        try {
            await navigator.clipboard.writeText(codigoTexto);

            const originalTitle = elements.btnCopy.title;
            elements.btnCopy.title = "Â¡Copiado!";
            elements.btnCopy.style.color = "var(--accent-lime)";

            setTimeout(() => {
                elements.btnCopy.title = originalTitle;
                elements.btnCopy.style.color = "";
            }, 2000);
        } catch (error) {
            console.error("Error al copiar:", error);
            notifyError("No se pudo copiar el cÃ³digo. Intenta de nuevo.");
        }
    });

    elements.registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        elements.registerForm.phoneNumber.value = sanitizePhoneValue(
            elements.registerForm.phoneNumber.value
        );

        if (elements.registerForm.phoneNumber.value.length !== PHONE_DIGITS) {
            notifyError("El numero de telefono debe tener 10 digitos");
            return;
        }

        if (!elements.registerForm.reportValidity()) {
            return;
        }

        if (!passwordsMatch(elements.passwordInput, elements.confirmPasswordInput)) {
            notifyError("Las contraseñas no coinciden");
            return;
        }

        await handlers.onRegistrarPaciente();
    });
}

