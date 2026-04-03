import { logout } from "../../core/auth.js";
import { STORAGE_KEYS } from "../../core/config.js";

export function initAlarmasTopbar() {
  const accountMenuWrap = document.getElementById("accountMenuWrap");
  const accountMenuBtn  = document.getElementById("accountMenuBtn");
  const btnLogout       = document.getElementById("btnLogout");
  const userName        = document.getElementById("alarmas-user-name");
  const userAvatar      = document.getElementById("alarmas-user-avatar");

  const name      = String(localStorage.getItem(STORAGE_KEYS.NAME) || "Paciente").trim();
  const shortName = name.split(" ").slice(0, 2).join(" ") || "Paciente";

  if (userName) userName.textContent = shortName;

  if (userAvatar) {
    userAvatar.textContent = shortName
      .split(" ")
      .map(p => p[0] || "")
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  const closeMenu = () => {
    accountMenuWrap?.classList.remove("open");
    accountMenuBtn?.setAttribute("aria-expanded", "false");
  };

  accountMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = accountMenuWrap.classList.toggle("open");
    accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  window.addEventListener("click",   (e) => { if (!accountMenuWrap?.contains(e.target)) closeMenu(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  btnLogout?.addEventListener("click", () => logout());
}
