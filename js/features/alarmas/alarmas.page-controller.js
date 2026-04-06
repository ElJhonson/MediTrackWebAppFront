import { initAlarmasTopbar } from "./alarmas.topbar.js";
import { bindUiEvents } from "./alarmas.events.js";
import { loadAlarmsFromApi, showToast, initDeleteModal, loadTodayAlarmsFromApi, loadMedsCountFromApi } from "./alarmas.controller.js";
import { renderAlarms } from "./alarmas.render.js";
import { alarmasState } from "./alarmas.state.js";

export async function initAlarmasPage() {
  initAlarmasTopbar();
  initDeleteModal();
  bindUiEvents();
  await Promise.all([loadAlarmsFromApi(), loadTodayAlarmsFromApi(), loadMedsCountFromApi()]);

  const paramId = new URLSearchParams(window.location.search).get("id");
  if (paramId) {
    const id = Number(paramId);
    const existe = alarmasState.alarms.find(a => Number(a.id) === id);
    if (existe) alarmasState.selectedId = id;
  }

  renderAlarms();
}
