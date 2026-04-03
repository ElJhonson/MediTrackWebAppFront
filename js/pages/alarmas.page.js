import { protectPage } from "../guards/guard.js";
import { initAlarmasPage } from "../features/alarmas/alarmas.page-controller.js";

protectPage();

document.addEventListener("DOMContentLoaded", async () => {
  await initAlarmasPage().catch(error => {
    console.error("Error inicializando alarmas:", error);
  });
});