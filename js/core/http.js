import { getAccessToken } from "./auth.js";

export async function authFetch(url, options = {}) {
    const token = getAccessToken();

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
}
