import { obtenerPacientePorId } from "../services/cuidador.service.js";

let enfermedades = [];
let modoEdicion = false;

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

        let colorClass = 'tag-default';
        const name = enf.toLowerCase();

        if (name.includes('diabetes')) colorClass = 'tag-diabetes';
        else if (name.includes('hiperten')) colorClass = 'tag-hipertension';
        else if (name.includes('colester')) colorClass = 'tag-colesterol';

        return `
            <span class="tag ${colorClass}">
                ${enf}
                ${modoEdicion ? `<button type="button"
                                         class="remove-tag"
                                         onclick="removeDisease(${index})">×</button>` : ""}
            </span>
        `;
    }).join('');
}


function toggleEdit() {
    modoEdicion = !modoEdicion;

    const btn = document.getElementById('edit-btn');

    document.querySelectorAll('#profile-form input')
        .forEach(input => {
            if (!input.classList.contains("readonly-field")) {
                input.disabled = !modoEdicion;
            }
        });

    document.getElementById('actions-bar')
        .classList.toggle('hidden', !modoEdicion);

    document.getElementById('add-disease-box')
        .classList.toggle('hidden', !modoEdicion);

    btn.innerText = modoEdicion ? "Viendo Perfil" : "Editar Perfil";
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

    if (!enfermedades.includes(value)) {
        enfermedades.push(value);
        renderTags();
    }

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

});


cargarPerfil();