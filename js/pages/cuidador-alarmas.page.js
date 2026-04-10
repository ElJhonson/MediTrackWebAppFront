import { protectPage } from "../guards/guard.js";
import { initCuidadorAlarmasPage } from "../features/cuidador-alarmas/cuidador-alarmas.page-controller.js";

protectPage();

document.addEventListener("DOMContentLoaded", async () => {
  await initCuidadorAlarmasPage().catch(error => {
    console.error("Error inicializando cuidador-alarmas:", error);
  });
});
