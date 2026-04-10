export const cuidadorAlarmasState = {
  // Contexto del cuidador y paciente seleccionado
  pacienteId: null,
  pacienteNombre: "Paciente",
  pacientes: [],
  cuidadorNombre: "Cuidador",

  // Datos de alarmas
  alarms: [],
  todayAlarms: [],
  medsCount: 0,

  // UI
  selectedId: null,
  currentFilter: "all",
  searchQuery: ""
};
