export function bindPerfilCuidadorEvents(elements, handlers) {
	elements.btnEditProfile.addEventListener("click", () => {
		handlers.onToggleEdit();
	});

	elements.btnCancelProfile.addEventListener("click", () => {
		handlers.onCancelEdit();
	});

	elements.caregiverProfileForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		await handlers.onSubmit();
	});

	elements.btnContinueReauth.addEventListener("click", () => {
		handlers.onContinueReauth();
	});

	elements.btnCancelReauth.addEventListener("click", () => {
		handlers.onCancelReauth();
	});
}
