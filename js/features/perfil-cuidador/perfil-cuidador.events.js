export function bindPerfilCuidadorEvents(elements, handlers) {
	elements.accountMenuBtn.addEventListener("click", (event) => {
		event.stopPropagation();
		handlers.onToggleAccountMenu();
	});

	elements.btnLogout.addEventListener("click", () => {
		handlers.onLogout();
	});

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

	window.addEventListener("click", (event) => {
		if (!elements.accountMenuWrap.contains(event.target)) {
			handlers.onCloseAccountMenu();
		}
	});

	window.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			handlers.onCloseAccountMenu();
		}
	});
}
