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
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
    );

    return JSON.parse(jsonPayload);
}

