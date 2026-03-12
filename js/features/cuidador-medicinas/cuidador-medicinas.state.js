export const cuidadorMedicinasState = {
    pacienteId: null,
    pacienteNombre: "Paciente",
    lista: [],
    pacientes: [],
    cuidadorNombre: "Cuidador"
};

export function getCuidadorMedicinasElements() {
    return {
        accountMenuWrap: document.getElementById("accountMenuWrap"),
        accountMenuBtn: document.getElementById("accountMenuBtn"),
        caregiverAvatar: document.getElementById("caregiverAvatar"),
        caregiverName: document.getElementById("caregiverName"),
        btnLogout: document.getElementById("btnLogout"),
        patientSubtitle: document.getElementById("patientSubtitle"),
        patientNameTitle: document.getElementById("patientNameTitle"),
        patientMeta: document.getElementById("patientMeta"),
        patientAvatar: document.getElementById("pacienteAvatar"),
        quickTotalMedicinas: document.getElementById("quickTotalMedicinas"),
        quickPorVencer: document.getElementById("quickPorVencer"),
        patientProfileSelectorWrap: document.getElementById("patientProfileSelectorWrap"),
        patientProfileSelectorBtn: document.getElementById("patientProfileSelectorBtn"),
        patientProfileDropdown: document.getElementById("patientProfileDropdown"),
        medContainer: document.getElementById("medContainer"),
        modalMed: document.getElementById("modalMed"),
        modalDeleteConfirm: document.getElementById("modalDeleteConfirm"),
        btnOpenModal: document.getElementById("btnOpenModal"),
        btnCloseModal: document.getElementById("btnCloseModal"),
        btnCloseDeleteConfirm: document.getElementById("btnCloseDeleteConfirm"),
        btnCancelDelete: document.getElementById("btnCancelDelete"),
        btnConfirmDelete: document.getElementById("btnConfirmDelete"),
        modalTitle: document.getElementById("modalTitle"),
        medForm: document.getElementById("medForm"),
        editId: document.getElementById("editId"),
        name: document.getElementById("name"),
        dosageForm: document.getElementById("dosageForm"),
        expirationDate: document.getElementById("expirationDate")
    };
}

export function hasRequiredCuidadorMedicinasElements(elements) {
    return Boolean(
        elements.accountMenuWrap
        && elements.accountMenuBtn
        && elements.caregiverAvatar
        && elements.caregiverName
        && elements.btnLogout
        && elements.patientSubtitle
        && elements.patientNameTitle
        && elements.patientMeta
        && elements.patientAvatar
        && elements.quickTotalMedicinas
        && elements.quickPorVencer
        && elements.patientProfileSelectorWrap
        && elements.patientProfileSelectorBtn
        && elements.patientProfileDropdown
        && elements.medContainer
        && elements.modalMed
        && elements.modalDeleteConfirm
        && elements.btnOpenModal
        && elements.btnCloseModal
        && elements.btnCloseDeleteConfirm
        && elements.btnCancelDelete
        && elements.btnConfirmDelete
        && elements.modalTitle
        && elements.medForm
        && elements.editId
        && elements.name
        && elements.dosageForm
        && elements.expirationDate
    );
}
