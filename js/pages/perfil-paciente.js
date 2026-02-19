import {
    obtenerPacientePorId,
    actualizarPacienteDesdeCuidador
} from "../services/cuidador.service.js";

let enfermedades = [];
let modoEdicion = false;
const coloresEnfermedad = new Map();

function obtenerPacienteIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}


async function cargarPerfil() {
    try {
        const pacienteId = obtenerPacienteIdDesdeURL();

        if (!pacienteId) {
            alert("Paciente no especificado");
            return;
        }

        const data = await obtenerPacientePorId(pacienteId);

        document.getElementById('display-name').innerText = data.name;
        document.getElementById('nombre').value = data.name;
        document.getElementById('edad').value = data.edad;
        document.getElementById('curp').value = data.curp;
        document.getElementById('phoneNumber').value = data.phoneNumber;

        const initials = data.name
            .split(" ")
            .map(p => p[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

        document.getElementById('avatar-initials').innerText = initials;

        enfermedades = [...(data.enfermedadesCronicas || [])];
        renderTags();

        document.getElementById("loading").classList.add("hidden");
        document.getElementById("profile-card").classList.remove("hidden");

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}



function renderTags() {
    const container = document.getElementById('diseases-container');

    container.innerHTML = enfermedades.map((enf, index) => {
        const estilo = obtenerEstiloTag(enf);

        return `
            <span class="tag"
                  style="--tag-bg:${estilo.bg};--tag-text:${estilo.text};--tag-border:${estilo.border};">
                <span class="tag-text">${enf}</span>
                ${modoEdicion ? `<button type="button"
                                         class="remove-tag"
                                         data-index="${index}"
                                         aria-label="Eliminar enfermedad">x</button>` : ""}
            </span>
        `;
    }).join('');
}

function normalizarEnfermedad(valor) {
    return valor
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function crearColorSuaveAleatorio() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(55 + Math.random() * 20);
    const lightness = Math.floor(82 + Math.random() * 10);

    return {
        bg: `hsl(${hue} ${saturation}% ${lightness}%)`,
        border: `hsl(${hue} ${Math.max(42, saturation - 12)}% ${Math.max(66, lightness - 15)}%)`,
        text: "#1f2937"
    };
}

function obtenerEstiloTag(enfermedad) {
    const key = normalizarEnfermedad(enfermedad);

    if (!coloresEnfermedad.has(key)) {
        coloresEnfermedad.set(key, crearColorSuaveAleatorio());
    }

    return coloresEnfermedad.get(key);
}


function toggleEdit() {
    modoEdicion = !modoEdicion;

    const btn = document.getElementById('edit-btn');

    document.querySelectorAll('#profile-form input')
        .forEach(input => {
            if (
                !input.classList.contains("readonly-field") &&
                input.id !== "nombre"
            ) {
                input.disabled = !modoEdicion;
            }
        });

    document.getElementById('actions-bar')
        .classList.toggle('hidden', !modoEdicion);

    document.getElementById('add-disease-box')
        .classList.toggle('hidden', !modoEdicion);

    btn.innerText = modoEdicion ? "Viendo Perfil" : "Editar Perfil";
    renderTags();
}


function togglePhoneVisibility() {
    const input = document.getElementById('phoneNumber');
    const btn = document.getElementById('toggle-phone');

    const visible = input.type === "text";

    input.type = visible ? "password" : "text";
    btn.innerText = visible ? "Ver" : "Ocultar";
}

function toggleCurpVisibility() {
    const input = document.getElementById('curp');
    const btn = document.getElementById('toggle-curp');

    const visible = input.type === "text";

    input.type = visible ? "password" : "text";
    btn.innerText = visible ? "Ver" : "Ocultar";
}


function addDiseaseTag() {
    const input = document.getElementById('new-disease-input');
    const value = input.value.trim();

    if (!value) return;

    const nuevaEnfermedad = normalizarEnfermedad(value);
    const yaExiste = enfermedades.some(
        e => normalizarEnfermedad(e) === nuevaEnfermedad
    );

    if (yaExiste) {
        alert("Esa enfermedad ya está registrada.");
        return;
    }

    enfermedades.push(value);
    renderTags();

    input.value = "";
}


function cancelEdit() {
    if (confirm("¿Descartar cambios?")) {
        location.reload();
    }
}


function removeDisease(index) {
    enfermedades.splice(index, 1);
    renderTags();
}

function handleDiseaseActions(e) {
    const removeBtn = e.target.closest(".remove-tag");
    if (!removeBtn) return;

    const index = Number(removeBtn.dataset.index);
    if (Number.isNaN(index)) return;

    removeDisease(index);
}

async function guardarCambiosPaciente(e) {
    e.preventDefault();

    if (!modoEdicion) return;

    const pacienteId = obtenerPacienteIdDesdeURL();

    if (!pacienteId) {
        alert("Paciente no especificado");
        return;
    }

    const dto = {
        name: document.getElementById("nombre").value.trim(),
        edad: Number(document.getElementById("edad").value),
        curp: document.getElementById("curp").value.trim(),
        phoneNumber: document.getElementById("phoneNumber").value.trim(),
        enfermedadesCronicas: [...enfermedades]
    };

    try {
        await actualizarPacienteDesdeCuidador(pacienteId, dto);

        document.getElementById("display-name").innerText = dto.name;

        const initials = dto.name
            .split(" ")
            .map(p => p[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

        document.getElementById("avatar-initials").innerText = initials;
        toggleEdit();
        alert("Datos del paciente actualizados correctamente");
    } catch (error) {
        console.error(error);
        alert(error.message || "No se pudo actualizar el paciente");
    }
}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("edit-btn")
        .addEventListener("click", toggleEdit);

    document.getElementById("toggle-phone")
        .addEventListener("click", togglePhoneVisibility);

    document.getElementById("toggle-curp")
        .addEventListener("click", toggleCurpVisibility);

    document.querySelector(".btn-add-tag")
        .addEventListener("click", addDiseaseTag);

    document.querySelector(".btn-cancel-flat")
        .addEventListener("click", cancelEdit);

    document.getElementById("profile-form")
        .addEventListener("submit", guardarCambiosPaciente);

    document.getElementById("diseases-container")
        .addEventListener("click", handleDiseaseActions);

});


cargarPerfil();
