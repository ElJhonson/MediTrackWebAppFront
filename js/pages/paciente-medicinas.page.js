import { protectPage } from "../guards/guard.js";
import {
    initPacienteMedicinasPage,
    onPacienteMedicinasPageShow
} from "../features/paciente-medicinas/paciente-medicinas.page-controller.js";

protectPage();

document.addEventListener("DOMContentLoaded", async () => {
    await initPacienteMedicinasPage();
});

window.addEventListener("pageshow", async (event) => {
    await onPacienteMedicinasPageShow(event);
});
