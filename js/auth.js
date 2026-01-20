import { STORAGE_KEYS } from "./config.js";

export function saveSession({ accessToken, refreshToken }) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

    const payload = parseJwt(accessToken);
    localStorage.setItem(STORAGE_KEYS.ROLE, payload.rol);
    localStorage.setItem(STORAGE_KEYS.NAME, payload.name);
}

export function getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function isAuthenticated() {
    return !!getAccessToken();
}

export function logout() {
    localStorage.clear();
    window.location.href = "/index.html";
}

function parseJwt(token) {
    return JSON.parse(atob(token.split(".")[1]));
}
