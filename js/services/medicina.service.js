import { API_BASE_URL } from "../core/config.js";
import { getAccessToken } from "../core/auth.js";
import { extraerMensajeError } from "./http-error.util.js";

const BASE_URL = `${API_BASE_URL}/medicinas`;

// Registrar nueva medicina
export async function registrarMedicina(dto) {
    const token = getAccessToken();

    const response = await fetch(`${BASE_URL}/registrar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dto)
    });

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al registrar medicina");
    }

    return response.json();
}

// Obtener medicinas del paciente actual
export async function obtenerMisMedicinas() {
    const token = getAccessToken();

    const response = await fetch(`${BASE_URL}/mias`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error real del servidor");
    }


    return response.json();
}

//Actualizar medicina por ID
export async function actualizarMedicina(id, dto) {
    const token = getAccessToken();

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dto)
    });

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al actualizar la medicina");
    }

    return response.json();
}



// Eliminar medicina por ID
export async function eliminarMedicina(id) {
    const token = getAccessToken();

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const msg = await extraerMensajeError(response);
        throw new Error(msg || "Error al eliminar la medicina");
    }
}
