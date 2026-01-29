import { API_BASE_URL } from "../core/config.js";
import { authFetch } from "../core/http.js";

const BASE_URL = `${API_BASE_URL}/pacientes`;

export async function obtenerMisDatosPaciente() {
    const response = await authFetch(`${BASE_URL}/misdatos`);

    
    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Error al obtener datos del paciente");
    }

    return response.json();
}
