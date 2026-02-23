import { protectPage } from "../guards/guard.js";
import { initDashboardCuidador } from "../features/dashboard-cuidador/dashboard-cuidador.controller.js";

protectPage();

document.addEventListener("DOMContentLoaded", () => {
    initDashboardCuidador();
});
