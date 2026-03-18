import { API_BASE_URL } from "../core/config.js";
import { authFetch } from "../core/http.js";

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
        const error = await response.text();
        throw new Error(error || "Error al crear la alarma");
    }

    return response.json();
}

/**
 * Obtener configuraciones de alarma del paciente actual
 */
export async function obtenerMisAlarmasConfig() {
    const response = await authFetch(`${BASE_URL}/mias`);

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Error al obtener alarmas");
    }

    return response.json();
}
