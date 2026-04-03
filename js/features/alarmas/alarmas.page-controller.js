import { initAlarmasTopbar } from "./alarmas.topbar.js";
import { bindUiEvents } from "./alarmas.events.js";
import { loadAlarmsFromApi, showToast } from "./alarmas.controller.js";
import { renderAlarms } from "./alarmas.render.js";

export async function initAlarmasPage() {
  initAlarmasTopbar();
  bindUiEvents();
  await loadAlarmsFromApi();
  renderAlarms();
}
