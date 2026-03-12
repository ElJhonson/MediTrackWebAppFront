import { protectPage } from "../guards/guard.js";
import { initDashboardPaciente } from "../features/dashboard-paciente/dashboard-paciente.controller.js";

protectPage();

document.addEventListener("DOMContentLoaded", async () => {
    await initDashboardPaciente();
});
