export function limpiarMensaje(msg) {
    if (msg == null) return "";
    if (typeof msg === "object") return "";

    return String(msg || "")
        .trim()
        .replace(/^"(.*)"$/, "$1")
        .trim();
}

function esMensajeGenerico(msg) {
    const texto = limpiarMensaje(msg).toLowerCase();
    return [
        "bad request",
        "unauthorized",
        "forbidden",
        "not found",
        "internal server error",
        "error"
    ].includes(texto);
}

function obtenerMensajeRecursivo(valor, depth = 0) {
    if (depth > 4 || valor == null) return "";

    if (typeof valor === "string" || typeof valor === "number" || typeof valor === "boolean") {
        return limpiarMensaje(valor);
    }

    if (Array.isArray(valor)) {
        for (const item of valor) {
            const candidato = obtenerMensajeRecursivo(item, depth + 1);
            if (candidato && !esMensajeGenerico(candidato)) return candidato;
        }
        return "";
    }

    if (typeof valor === "object") {
        const keysPrioridad = [
            "mensaje",
            "message",
            "error",
            "detail",
            "reason",
            "errorMessage",
            "error_description",
            "descripcion",
            "defaultMessage",
            "title"
        ];

        for (const key of keysPrioridad) {
            if (!(key in valor)) continue;
            const candidato = obtenerMensajeRecursivo(valor[key], depth + 1);
            if (candidato && !esMensajeGenerico(candidato)) return candidato;
        }

        for (const nested of Object.values(valor)) {
            const candidato = obtenerMensajeRecursivo(nested, depth + 1);
            if (candidato && !esMensajeGenerico(candidato)) return candidato;
        }
    }

    return "";
}

function pareceHtml(raw) {
    const text = String(raw || "").trim().toLowerCase();
    return text.startsWith("<!doctype") || text.startsWith("<html") || text.startsWith("<body");
}


export function normalizarMensajeError(data) {
    if (typeof data === "string") return limpiarMensaje(data);
    if (!data || typeof data !== "object") return "";

    // 🔥 PRIMERO manejar errores de validación
    if (data.errors && typeof data.errors === "object") {
        const valores = Object.values(data.errors);

        for (const val of valores) {
            const limpio = limpiarMensaje(val);
            if (limpio && !esMensajeGenerico(limpio)) return limpio;
        }
    }

    // 🔽 DESPUÉS los genéricos
    const candidatos = [
        data.mensaje,
        data.message,
        data.error,
        data.detail,
        data.reason,
        data.title
    ];

    for (const candidato of candidatos) {
        const limpio = limpiarMensaje(candidato);
        if (limpio && !esMensajeGenerico(limpio)) return limpio;
    }

    return obtenerMensajeRecursivo(data);
}

export async function extraerMensajeError(
    response,
    fallback = `Error HTTP ${response.status}`
) {
    const statusFallback = limpiarMensaje(response.statusText) || fallback;
    const responseText = await response.text();

    const raw = limpiarMensaje(responseText);

    if (!raw) return statusFallback;
    if (pareceHtml(responseText)) return statusFallback;

    try {
        const data = JSON.parse(raw);
        return normalizarMensajeError(data) || statusFallback;
    } catch {
        return raw || statusFallback;
    }
}
