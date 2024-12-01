// Variable global para almacenar los datos
let itemsGlobal = [];

// Variable global para almacenar los impuestos
let taxesData = [];
let taxesTable = null; // Variable para almacenar la instancia de Tabulator

// Función para abrir el modal y mostrar los impuestos
function showTaxesModal(itemId) {
    // Llamada AJAX para obtener los impuestos
    $.ajax({
        url: `http://3.17.151.214/item/impuestos/${itemId}`, // Construye la URL con el ID
        method: "GET",
        dataType: "json",
        success: (response) => {
            if (response.success) {
                taxesData = response.data; // Guarda los datos de impuestos
                buildTaxesTable(); // Construye la tabla de impuestos
                const taxesModal = new bootstrap.Modal(document.getElementById('taxesModal'));
                taxesModal.show(); // Muestra el modal
            } else {
                console.error("Error en la respuesta:", response.message);
            }
        },
        error: (xhr, status, error) => {
            console.error(`Error al obtener impuestos para el ítem ID ${itemId}:`, error);
        },
    });
}

// Función para construir la tabla de impuestos
function buildTaxesTable() {
    const taxesTableContainer = document.getElementById("taxesTableContainer");

    // Limpia el contenedor antes de construir la tabla
    taxesTableContainer.innerHTML = "";

    // Crear instancia de Tabulator si no existe, reutilizar si ya está creada
    taxesTable = new Tabulator(taxesTableContainer, {
        data: taxesData, // Usa los datos de impuestos
        layout: "fitColumns",
        responsiveLayout: "collapse",
        columns: [
            { title: "ID", field: "id", width: 70 },
            { title: "Nombre", field: "name", headerFilter: true },
            { title: "Valor", field: "value", formatter: "money", formatterParams: { precision: 2 }, headerFilter: true },
            { title: "Tipo", field: "typeTaxe", headerFilter: true },
            { title: "Unidad de Medida", field: "measureUnit", headerFilter: true, visible: true }, // Opcional
        ],
    });
}

// Cargar datos con jQuery AJAX
function loadData() {
    $.ajax({
        url: 'http://3.17.151.214/items', // Cambia esta URL por tu endpoint real
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                itemsGlobal = response.data; // Guarda los datos en la variable global
                buildTable(); // Construye la tabla con JavaScript puro
            } else {
                console.error('Error en la respuesta:', response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al realizar la solicitud AJAX:', error);
        }
    });
}

function buildTable() {
    const tableContainer = document.getElementById("table-container");

    const table = new Tabulator(tableContainer, {
        data: itemsGlobal, // Usa los datos globales cargados
        layout: "fitColumns",
        responsiveLayout: "collapse", // Habilita diseño responsivo
        movableColumns: true, // Permite mover columnas
        tooltips: true, // Habilita tooltips para las celdas
        tableClass: "table table-striped table-bordered table-hover", // Aplica clases de Bootstrap
        columns: [
            { title: "#", field: "id", width: 70, hozAlign: "center", headerSort: false },
            { title: "Código", field: "code", headerFilter: true, minWidth: 100 },
            { title: "Tipo", field: "typeItem", headerFilter: true, minWidth: 120 },
            { title: "Nombre", field: "name", headerFilter: true, minWidth: 150 },
            { title: "Precio Unitario", field: "unitPrice", formatter: "money", formatterParams: { symbol: "$", precision: 2 }, minWidth: 120 },
            { title: "Precio Venta", field: "salesPrice", formatter: "money", formatterParams: { symbol: "$", precision: 2 }, minWidth: 120 },
            { title: "Estado", field: "status", formatter: "tickCross", sorter: "boolean", hozAlign: "center", width: 100 },
            {
                title: "Ver Impuestos",
                formatter: () => "<button class='btn btn-info btn-sm'>Ver</button>",
                width: 150,
                hozAlign: "center",
                cellClick: (e, cell) => {
                    const itemId = cell.getRow().getData().id; // Captura el ID del ítem
                    showTaxesModal(itemId); // Llama a la función para abrir el modal
                },
            },
            {
                title: "Ítems de Combo",
                formatter: () => "<button class='btn btn-secondary btn-sm'>Ver</button>",
                width: 150,
                hozAlign: "center",
                cellClick: (e, cell) => {
                    const itemId = cell.getRow().getData().id;

                    // Llamada AJAX para obtener los ítems del combo
                    $.ajax({
                        url: `http://3.17.151.214/items/${itemId}/combo`,
                        method: "GET",
                        dataType: "json",
                        success: (response) => {
                            console.log(`Ítems del combo para el ID ${itemId}:`, response.data);
                        },
                        error: (xhr, status, error) => {
                            console.error(`Error al obtener ítems del combo para ID ${itemId}:`, error);
                        },
                    });
                },
            },
            {
                title: "Acciones",
                formatter: () => `
                    <button class='btn btn-warning btn-sm me-1'>Editar</button>
                    <button class='btn btn-danger btn-sm'>Eliminar</button>
                `,
                width: 200,
                hozAlign: "center",
                cellClick: (e, cell) => {
                    const action = e.target.innerText.trim();
                    const rowData = cell.getRow().getData();

                    if (action === "Editar") {
                        console.log("Editar ítem:", rowData);
                    } else if (action === "Eliminar") {
                        console.log("Eliminar ítem:", rowData);
                    }
                },
            },
        ],
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadData()

    // Evento para limpiar la tabla al cerrar el modal
    document.getElementById("taxesModal").addEventListener("hidden.bs.modal", () => {
        if (taxesTable) {
            taxesTable.clearData(); // Limpia los datos de la tabla
        }
    });
})