import {
  obtenerMisAlarmasConfig,
  obtenerAlarmasDelDia,
  actualizarAlarmaConfig,
  eliminarAlarmaConfig
} from "../../services/alarma.service.js";
import { obtenerMedicinasPaciente } from "../../services/medicina.service.js";
import { obtenerPacientesDelCuidador } from "../../services/cuidador.service.js";

export async function obtenerPacientesVinculados() {
  return obtenerPacientesDelCuidador();
}

export async function obtenerAlarmasConfigPaciente(pacienteId) {
  const id = Number(pacienteId);
  if (!id || !Number.isFinite(id) || id <= 0) {
    console.warn("[cuidador-alarmas] obtenerAlarmasConfigPaciente: pacienteId inválido:", pacienteId);
    return [];
  }
  return obtenerMisAlarmasConfig(id);
}

export async function obtenerAlarmasDelDiaPaciente(pacienteId) {
  const id = Number(pacienteId);
  if (!id || !Number.isFinite(id) || id <= 0) {
    console.warn("[cuidador-alarmas] obtenerAlarmasDelDiaPaciente: pacienteId inválido:", pacienteId);
    return [];
  }
  return obtenerAlarmasDelDia(id);
}

export async function obtenerMedsCountPaciente(pacienteId) {
  const id = Number(pacienteId);
  if (!id || !Number.isFinite(id) || id <= 0) return 0;
  const lista = await obtenerMedicinasPaciente(id);
  return Array.isArray(lista) ? lista.length : 0;
}

export async function actualizarAlarmaPaciente(id, dto) {
  return actualizarAlarmaConfig(id, dto);
}

export async function eliminarAlarmaPaciente(id) {
  return eliminarAlarmaConfig(id);
}
