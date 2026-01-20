import { protectPage } from "./guard.js";
import { STORAGE_KEYS } from "./config.js";
import { logout } from "./auth.js";

protectPage();

const name = localStorage.getItem(STORAGE_KEYS.NAME);

if (!name) {
    logout();
}

document.querySelector("h1").textContent = `Bienvenido, ${name}`;
