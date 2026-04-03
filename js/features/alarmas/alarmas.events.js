import { alarmasState } from "./alarmas.state.js";
import { renderAlarms } from "./alarmas.render.js";
import { toggleAlarm, deleteAlarm } from "./alarmas.controller.js";

export function bindUiEvents() {
  document.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(x => x.classList.remove("active"));
      tab.classList.add("active");
      alarmasState.currentFilter = tab.dataset.filter;
      alarmasState.expandedId = null;
      renderAlarms();
    });
  });

  document.getElementById("searchInput").addEventListener("input", e => {
    alarmasState.searchQuery = e.target.value;
    renderAlarms();
  });

  document.getElementById("alarmList").addEventListener("click", e => {
    const btn = e.target.closest(".btn-action");
    if (!btn) return;
    e.stopPropagation();
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "toggle") toggleAlarm(id);
    if (btn.dataset.action === "delete") deleteAlarm(id);
  });
}
