import { logout } from "../../core/auth.js";
import { STORAGE_KEYS } from "../../core/config.js";
import { cuidadorAlarmasState } from "./cuidador-alarmas.state.js";

export function initCuidadorAlarmasTopbar() {
  const accountMenuWrap = document.getElementById("accountMenuWrap");
  const accountMenuBtn  = document.getElementById("accountMenuBtn");
  const btnLogout       = document.getElementById("btnLogout");
  const cuidadorName    = document.getElementById("cuidadorName");
  const cuidadorAvatar  = document.getElementById("cuidadorAvatar");

  const rawName  = String(localStorage.getItem(STORAGE_KEYS.NAME) || "Cuidador").trim();
  const shortName = rawName.split(" ").slice(0, 2).join(" ") || "Cuidador";

  cuidadorAlarmasState.cuidadorNombre = rawName || shortName;

  if (cuidadorName)   cuidadorName.textContent   = shortName;
  if (cuidadorAvatar) cuidadorAvatar.textContent = shortName
    .split(" ")
    .map(p => p[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const closeMenu = () => {
    accountMenuWrap?.classList.remove("open");
    accountMenuBtn?.setAttribute("aria-expanded", "false");
  };

  accountMenuBtn?.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = accountMenuWrap.classList.toggle("open");
    accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  window.addEventListener("click",   e => { if (!accountMenuWrap?.contains(e.target)) closeMenu(); });
  window.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

  btnLogout?.addEventListener("click", () => logout());
}
