import { protectPage } from "../guards/guard.js";
import { initCuidadorVinculacion } from "../features/cuidador-vinculacion/cuidador-vinculacion.controller.js";

protectPage();

document.addEventListener("DOMContentLoaded", () => {
    initCuidadorVinculacion();
});
