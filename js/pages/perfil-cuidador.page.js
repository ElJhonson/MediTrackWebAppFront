import { protectPage } from "../guards/guard.js";
import { initPerfilCuidador } from "../features/perfil-cuidador/perfil-cuidador.controller.js";

protectPage();

document.addEventListener("DOMContentLoaded", async () => {
    await initPerfilCuidador();
});
