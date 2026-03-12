import { protectPage } from "../guards/guard.js";
import { initCuidadorMedicinasPage } from "../features/cuidador-medicinas/cuidador-medicinas.controller.js";

protectPage();

document.addEventListener("DOMContentLoaded", async () => {
    await initCuidadorMedicinasPage();
});
