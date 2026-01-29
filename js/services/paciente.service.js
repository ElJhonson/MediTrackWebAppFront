import { API_BASE_URL } from "../config.js";
import { authFetch } from "../http.js";

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
