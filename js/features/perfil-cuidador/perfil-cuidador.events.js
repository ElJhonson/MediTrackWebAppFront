export function bindPerfilCuidadorEvents(elements, handlers) {
    elements.btnBackToDashboard.addEventListener("click", () => {
        handlers.onBack();
    });
}
