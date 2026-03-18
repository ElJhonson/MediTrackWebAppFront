import { getAccessToken } from "./auth.js";

const MUTATING_METHODS = new Set(["POST", "PUT", "DELETE"]);
const inFlightMutations = new Map();

function getMethod(options = {}) {
    return String(options.method || "GET").toUpperCase();
}

function getBodyKey(body) {
    if (!body) return "";
    if (typeof body === "string") return body;
    if (body instanceof FormData) return "[form-data]";

    try {
        return JSON.stringify(body);
    } catch {
        return String(body);
    }
}

function getMutationKey(url, options = {}) {
    const method = getMethod(options);
    const bodyKey = getBodyKey(options.body);
    return `${method}:${url}:${bodyKey}`;
}

function hasContentTypeHeader(headers = {}) {
    return Boolean(headers["Content-Type"] || headers["content-type"]);
}

export async function guardedFetch(url, options = {}) {
    const method = getMethod(options);

    if (!MUTATING_METHODS.has(method)) {
        return fetch(url, options);
    }

    const key = getMutationKey(url, options);
    const existing = inFlightMutations.get(key);
    if (existing) {
        return existing.then((response) => response.clone());
    }

    const requestPromise = fetch(url, options).finally(() => {
        inFlightMutations.delete(key);
    });

    inFlightMutations.set(key, requestPromise);
    return requestPromise.then((response) => response.clone());
}

export async function authFetch(url, options = {}) {
    const token = getAccessToken();

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
    };

    if (!(options.body instanceof FormData) && !hasContentTypeHeader(headers)) {
        headers["Content-Type"] = "application/json";
    }

    return guardedFetch(url, {
        ...options,
        headers
    });
}
