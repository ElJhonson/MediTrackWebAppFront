export function bindCuidadorMedicinasEvents(elements, handlers) {
    elements.accountMenuBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = elements.accountMenuWrap.classList.toggle("open");
        elements.accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    elements.patientProfileSelectorBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = elements.patientProfileSelectorWrap.classList.toggle("open");
        elements.patientProfileSelectorBtn.setAttribute("aria-expanded", String(isOpen));
    });

    window.addEventListener("click", (event) => {
        if (!elements.accountMenuWrap.contains(event.target)) {
            handlers.onCloseAccountMenu();
        }

        if (!elements.patientProfileSelectorWrap.contains(event.target)) {
            handlers.onClosePatientSelector();
        }

        if (event.target === elements.modalMed) {
            handlers.onCloseModal();
        }

        if (event.target === elements.modalDeleteConfirm) {
            handlers.onDeleteConfirmChoice(false);
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            handlers.onCloseAccountMenu();
            handlers.onClosePatientSelector();
            handlers.onCloseModal();
            handlers.onDeleteConfirmChoice(false);
        }
    });

    elements.btnLogout.addEventListener("click", () => {
        handlers.onLogout();
    });

    elements.patientProfileDropdown.addEventListener("click", async (event) => {
        const option = event.target.closest("button.patient-option");
        if (!option) return;

        const selectedId = option.dataset.patientId;
        if (!selectedId) return;

        handlers.onClosePatientSelector();
        await handlers.onChangePaciente(selectedId);
    });

    elements.btnOpenModal.addEventListener("click", () => {
        handlers.onOpenCreateModal();
    });

    elements.btnCloseModal.addEventListener("click", () => {
        handlers.onCloseModal();
    });

    elements.btnCloseDeleteConfirm.addEventListener("click", () => {
        handlers.onDeleteConfirmChoice(false);
    });

    elements.btnCancelDelete.addEventListener("click", () => {
        handlers.onDeleteConfirmChoice(false);
    });

    elements.btnConfirmDelete.addEventListener("click", () => {
        handlers.onDeleteConfirmChoice(true);
    });

    elements.medForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await handlers.onSubmitForm();
    });

    elements.medContainer.addEventListener("click", async (event) => {
        const button = event.target.closest("button");
        if (!button) return;

        const id = button.dataset.id;
        if (!id) return;

        if (button.classList.contains("btn-edit")) {
            await handlers.onEditMedicina(id, button);
            return;
        }

        if (button.classList.contains("btn-delete")) {
            await handlers.onDeleteMedicina(id);
            return;
        }

        if (button.classList.contains("btn-reminder")) {
            handlers.onReminderInfo();
        }
    });
}
