let medicinas = [
    { name: "Amoxicilina", dosageForm: "Cápsula", expirationDate: "2027-05-20" },
    { name: "Lisinopril", dosageForm: "Tableta", expirationDate: "2026-11-12" },
    { name: "Lisinopril", dosageForm: "Tableta", expirationDate: "2026-11-12" },
    { name: "Metformina", dosageForm: "Tableta", expirationDate: "2025-09-30" },
    { name: "Ibuprofeno", dosageForm: "Suspensión", expirationDate: "2024-12-15" },
    { name: "Atorvastatina", dosageForm: "Tableta", expirationDate: "2026-03-22" },
    { name: "Omeprazol", dosageForm: "Cápsula", expirationDate: "2025-07-18" },
    { name: "Amlodipino", dosageForm: "Tableta", expirationDate: "2027-01-05" },
    { name: "Simvastatina", dosageForm: "Tableta", expirationDate: "2026-08-14" },
    { name: "Albuterol", dosageForm: "Inhalador", expirationDate: "2025-11-09" }
];

const container = document.getElementById('medContainer');
const modal = document.getElementById('modalMed');
const form = document.getElementById('medForm');

// Función para pintar las tarjetas
function renderMeds() {
    container.innerHTML = '';
    medicinas.forEach((med, index) => {
        const card = `
            <div class="med-card glass-card">
                <div>
                    <span class="type">${med.dosageForm}</span>
                    <h4>${med.name}</h4>
                    <p style="font-size: 0.8rem; color: #64748b;">Expira: ${med.expirationDate}</p>
                </div>
                <div class="card-footer">
                    <button class="btn-icon btn-edit" onclick="editMed(${index})">📝 Editar</button>
                    <button class="btn-icon btn-reminder" onclick="setReminder('${med.name}')">⏰ Recordatorio</button>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Abrir modal para nueva medicina
document.getElementById('btnOpenModal').onclick = () => {
    document.getElementById('modalTitle').innerText = "Registrar Medicina";
    form.reset();
    document.getElementById('editIndex').value = "";
    modal.classList.add('active');
};

// Función Editar
window.editMed = (index) => {
    const med = medicinas[index];
    document.getElementById('modalTitle').innerText = "Editar Medicina";
    document.getElementById('name').value = med.name;
    document.getElementById('dosageForm').value = med.dosageForm;
    document.getElementById('expirationDate').value = med.expirationDate;
    document.getElementById('editIndex').value = index;
    modal.classList.add('active');
};

// Función Recordatorio
window.setReminder = (name) => {
    alert(`📅 Recordatorio configurado para: ${name}. Te notificaremos en tu móvil.`);
};

// Guardar (Crear o Actualizar)
form.onsubmit = (e) => {
    e.preventDefault();
    const index = document.getElementById('editIndex').value;
    const medData = {
        name: document.getElementById('name').value,
        dosageForm: document.getElementById('dosageForm').value,
        expirationDate: document.getElementById('expirationDate').value
    };

    if (index === "") {
        medicinas.push(medData);
    } else {
        medicinas[index] = medData;
    }

    modal.classList.remove('active');
    renderMeds();
};

document.getElementById('btnCloseModal').onclick = () => modal.classList.remove('active');

function filterMeds() {
    const text = document.getElementById('medSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.med-card');
    
    cards.forEach(card => {
        const name = card.querySelector('h4').innerText.toLowerCase();
        card.style.display = name.includes(text) ? 'flex' : 'none';
    });
}

// Carga inicial
renderMeds();