function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function esErrorRedFetch(error) {
    const message = String(error?.message || "").toLowerCase();
    return error?.name === "AbortError"
        || (error instanceof TypeError && message.includes("failed to fetch"));
}

export async function conRetry(operacion, retries = 1) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await operacion();
        } catch (error) {
            lastError = error;
            if (!esErrorRedFetch(error) || attempt === retries) {
                throw error;
            }
            await sleep(300);
        }
    }

    throw lastError;
}

function normalizarEnfermedad(texto = "") {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function hashTexto(texto) {
    return [...texto].reduce(
        (acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0,
        0
    );
}

function obtenerEstiloEnfermedad(enfermedad) {
    const clave = normalizarEnfermedad(enfermedad);
    const hash = Math.abs(hashTexto(clave));
    const hue = hash % 360;
    const saturation = 58 + (hash % 16);
    const lightness = 82 + (hash % 10);

    return {
        bg: `hsl(${hue} ${saturation}% ${lightness}%)`,
        border: `hsl(${hue} ${Math.max(42, saturation - 12)}% ${Math.max(66, lightness - 15)}%)`,
        text: "#1f2937"
    };
}

export function renderEnfermedades(enfermedades = [], expanded = false) {
    if (!enfermedades.length) {
        return `
            <span class="condition-badge condition-empty">
                Sin enfermedades registradas
            </span>
        `;
    }

    const visibles = expanded ? enfermedades : enfermedades.slice(0, 3);
    const faltantes = Math.max(enfermedades.length - 3, 0);

    const tags = visibles.map(e => {
        const estilo = obtenerEstiloEnfermedad(e);
        return `
        <span class="condition-badge"
              style="--tag-bg:${estilo.bg};--tag-text:${estilo.text};--tag-border:${estilo.border};">${e}</span>
    `;
    }).join("");

    if (enfermedades.length <= 3) return tags;

    const boton = expanded
        ? `<button class="btn-see-more" data-expanded="true">- Menos</button>`
        : `<button class="btn-see-more" data-expanded="false">+${faltantes}</button>`;

    return `${tags}${boton}`;
}
