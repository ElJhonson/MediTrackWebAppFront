import { API_BASE_URL } from "../core/config.js";
import { authFetch } from "../core/http.js";
import { extraerMensajeError } from "../utils/http-error.util.js";

const BASE_URL = `${API_BASE_URL}/alarmas`;

/**
 * Crear configuración de alarma
 * @param {Object} dto AlarmaConfigRequestDto
 */
export async function crearAlarmaConfig(dto) {
    const response = await authFetch(`${BASE_URL}/crear`, {
        method: "POST",
        body: JSON.stringify(dto)
    });

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al crear la alarma");
    }

    return response.json();
}

/**
 * Obtener configuraciones de alarma del paciente actual
 */
export async function obtenerMisAlarmasConfig() {
    const response = await authFetch(`${BASE_URL}/mias`);

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al obtener alarmas");
    }

    return response.json();
}

/**
 * Obtener configuraciones de alarma por medicina
 * @param {number|string} medicinaId
 */
export async function obtenerAlarmasPorMedicina(medicinaId) {
    const response = await authFetch(`${BASE_URL}/medicina/${medicinaId}`);

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al obtener alarmas por medicina");
    }

    return response.json();
}

/**
 * Obtener alarmas del dia del paciente actual
 */
export async function obtenerAlarmasDelDia() {
    const response = await authFetch(`${BASE_URL}/hoy`);

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al obtener alarmas del dia");
    }

    return response.json();
}

/**
 * Actualizar una configuracion de alarma por id
 * @param {number|string} id
 * @param {Object} dto AlarmaConfigRequestDto
 */
export async function actualizarAlarmaConfig(id, dto) {
    const response = await authFetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto)
    });

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al actualizar la alarma");
    }

    return response.json();
}

/**
 * Actualizar estado de una alarma por id
 * @param {number|string} id
 * @param {string} estado EstadoAlarma del backend
 */
export async function actualizarEstadoAlarma(id, estado) {
    const response = await authFetch(
        `${BASE_URL}/${id}/estado?estado=${encodeURIComponent(estado)}`,
        { method: "PATCH" }
    );

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al actualizar estado de la alarma");
    }
}

/**
 * Eliminar configuracion de alarma por id
 * @param {number|string} id
 */
export async function eliminarAlarmaConfig(id) {
    const response = await authFetch(`${BASE_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al eliminar la alarma");
    }
}
