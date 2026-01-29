import {
    obtenerMisMedicinas,
    registrarMedicina,
    eliminarMedicina,
    actualizarMedicina
} from "./services/medicina.service.js";
import { protectPage } from "./guard.js";

// Protege la página (JWT + rol)
protectPage();

const container = document.getElementById("medContainer");
const modal = document.getElementById("modalMed");
const form = document.getElementById("medForm");

let medicinas = [];

// ===============================
// Cargar medicinas del paciente
// ===============================
let cargandoMedicinas = false;

async function cargarMedicinas() {
    if (cargandoMedicinas) return;

    cargandoMedicinas = true;

    try {
        medicinas = await obtenerMisMedicinas();
        renderMeds(medicinas);
    } catch (error) {
        if (error.name === "AbortError") return;
        console.warn(error);
    }
    finally {
        cargandoMedicinas = false;
    }
}


// ===============================
// Renderizar tarjetas
// ===============================
function renderMeds(lista) {
    container.innerHTML = "";

    if (!lista || lista.length === 0) {
        container.innerHTML = "<p>No tienes medicinas registradas.</p>";
        return;
    }

    lista.forEach((med) => {
        const card = `
            <div class="med-card glass-card" data-id="${med.id}">
                
            <button class="btn-delete" data-id="${med.id}" title="Eliminar">✖</button>

                <div>
                    <span class="type">${med.dosageForm}</span>
                    <h4>${med.nombre}</h4>
                    <p style="font-size: 0.8rem; color: #64748b;">
                        Expira: ${formatDate(med.expirationDate)}
                    </p>

                </div>

                <div class="card-footer">
                    <span class="registered-by">
                        Registrado por: ${med.registradoPorNombre}
                    </span>

                    <div class="card-actions">
                        <button class="btn-edit">✏️</button>
                        <button class="btn-reminder">⏰</button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", card);
    });
}

// ===============================
function abrirModalEditar(med) {
    document.getElementById("modalTitle").innerText = "Editar Medicina";

    document.getElementById("editId").value = med.id;
    document.getElementById("name").value = med.nombre;
    document.getElementById("dosageForm").value = med.dosageForm;
    document.getElementById("expirationDate").value =
        med.expirationDate.split("T")[0];

    modal.classList.add("active");
}
// ===============================

container.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-delete")) {
        const id = e.target.dataset.id;

        if (!confirm("¿Deseas eliminar esta medicina?")) return;

        try {
            await eliminarMedicina(id);
            await cargarMedicinas(); // recarga solo las ACTIVAS
        } catch (error) {
            console.error(error);
            alert("Error al eliminar la medicina");
        }
    }

    if (e.target.classList.contains("btn-edit")) {
        const card = e.target.closest(".med-card");
        const id = card.dataset.id;

        const med = medicinas.find(m => m.id == id);
        abrirModalEditar(med);
    }
});


// ===============================
// Abrir modal (nueva medicina)
// ===============================
document.getElementById("btnOpenModal").onclick = () => {
    document.getElementById("modalTitle").innerText = "Registrar Medicina";
    form.reset();
    modal.classList.add("active");
};

// ===============================
// Cerrar modal
// ===============================
document.getElementById("btnCloseModal").onclick = () => {
    modal.classList.remove("active");
};

// ===============================
// Guardar medicina
// ===============================
form.onsubmit = async (e) => {
    e.preventDefault();

    const id = document.getElementById("editId").value;

    const dto = {
        nombre: document.getElementById("name").value.trim(),
        dosageForm: document.getElementById("dosageForm").value,
        expirationDate: document.getElementById("expirationDate").value
    };

    try {
        if (id) {
            await actualizarMedicina(id, dto); // PUT
        } else {
            await registrarMedicina(dto); // POST
        }

        modal.classList.remove("active");
        form.reset();
        document.getElementById("editId").value = "";
        await cargarMedicinas();

    } catch (error) {
        console.error(error);
        alert(error.message || "Error al guardar la medicina");
    }
};

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
}


// ===============================
// Carga inicial
// ===============================
document.addEventListener("DOMContentLoaded", cargarMedicinas);
