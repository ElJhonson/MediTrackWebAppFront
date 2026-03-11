import { API_BASE_URL } from "../core/config.js";
import { authFetch } from "../core/http.js";
import { extraerMensajeError } from "../utils/http-error.util.js";

const BASE_URL = `${API_BASE_URL}/pacientes`;

export async function obtenerMisDatosPaciente() {
    const response = await authFetch(`${BASE_URL}/misdatos`);

    if (response.status === 401 || response.status === 403) {
        return null;
    }

    if (!response.ok) {
        const msg = await extraerMensajeError(
            response,
            "Error al obtener datos del paciente"
        );
        throw new Error(msg || "Error al obtener datos del paciente");
    }

    return response.json();
}
