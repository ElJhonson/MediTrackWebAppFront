export function limpiarMensaje(msg) {
    return String(msg || "")
        .trim()
        .replace(/^"(.*)"$/, "$1")
        .trim();
}

export function normalizarMensajeError(data) {
    if (typeof data === "string") return limpiarMensaje(data);
    if (!data || typeof data !== "object") return "";

    const candidatos = [
        data.message,
        data.mensaje,
        data.error,
        data.detail,
        data.title
    ];

    for (const candidato of candidatos) {
        const limpio = limpiarMensaje(candidato);
        if (limpio) return limpio;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
        const primerError = data.errors[0];
        const limpio = limpiarMensaje(
            typeof primerError === "string"
                ? primerError
                : primerError?.message || primerError?.defaultMessage
        );
        if (limpio) return limpio;
    }

    return "";
}

export async function extraerMensajeError(
    response,
    fallback = `Error HTTP ${response.status}`
) {
    const statusFallback = limpiarMensaje(response.statusText) || fallback;
    const raw = limpiarMensaje(await response.text());

    if (!raw) return statusFallback;

    try {
        const data = JSON.parse(raw);
        return normalizarMensajeError(data) || raw || statusFallback;
    } catch {
        return raw || statusFallback;
    }
}
