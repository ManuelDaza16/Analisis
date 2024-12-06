// Variable global para almacenar los datos
let itemsGlobal = [];

// Variable global para almacenar los impuestos
let taxesData = [];
let taxesTable = null; // Variable para almacenar la instancia de Tabulator

let combosData = []; // Variable para almacenar los datos de combos
let combosTable = null; // Variable para la instancia de Tabulator

const toggleSwitch = document.getElementById('status')

const taxesTableBody = document.getElementById("taxesTableBody");

let filteredItems;

VirtualSelect.init({
    ele: '#typeItem',
    maxWidth: "100%",
    placeholder: "Selecionar",
    options: [
        { label: 'Producto', value: 'producto' },
        { label: 'Servicios', value: 'servicios' },
        { label: 'Combo', value: 'combo' },
    ],
});

toggleSwitch.addEventListener("change", () => {
    if (toggleSwitch.checked) {
        console.log(true);
    } else {
        console.log(false);
    }
})

// Opciones para los selects
const taxTypeOptions = [
    { label: "01 - IVA", value: "01 - IVA" },
    { label: "02 - IC", value: "02 - IC" },
    { label: "03 - RETE FUENTE", value: "03 - RETE FUENTE" },
    { label: "04 - INC Bolsas", value: "04 - INC Bolsas" },
    { label: "05 - INC Combustibles", value: "05 - INC Combustibles" }
];

const measureUnitOptions = [
    { label: "NIU-número de", value: "NIU-número de" },
    { label: "KG-kilogramos", value: "KG-kilogramos" },
    { label: "LT-litros", value: "LT-litros" },
    { label: "M-metros", value: "M-metros" }
];

// Función para agregar una nueva fila
const addRow = () => {
    const row = document.createElement("tr");

    // Columna Tipo Impuesto
    const taxTypeCell = document.createElement("td");
    const taxTypeSelect = document.createElement("div");
    VirtualSelect.init({
        ele: taxTypeSelect,
        options: taxTypeOptions,
        search: true,
        placeholder: "Seleccione..."
    });
    taxTypeCell.appendChild(taxTypeSelect);

    // Columna Tasa Impuesto
    const taxRateCell = document.createElement("td");
    const taxRateInput = document.createElement("input");
    taxRateInput.type = "number";
    taxRateInput.className = "form-control";
    taxRateCell.appendChild(taxRateInput);

    // Columna Valor Nominal
    const nominalValueCell = document.createElement("td");
    const nominalValueInput = document.createElement("input");
    nominalValueInput.type = "number";
    nominalValueInput.className = "form-control";
    nominalValueCell.appendChild(nominalValueInput);

    // Columna Unidad de Medida
    const measureUnitCell = document.createElement("td");
    const measureUnitSelect = document.createElement("div");
    VirtualSelect.init({
        ele: measureUnitSelect,
        options: measureUnitOptions,
        search: true,
        placeholder: "Seleccione..."
    });
    measureUnitCell.appendChild(measureUnitSelect);

    // Columna Acciones
    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-danger btn-sm";
    deleteButton.innerText = "Eliminar";
    deleteButton.onclick = () => row.remove();
    actionsCell.appendChild(deleteButton);

    // Agregar celdas a la fila
    row.appendChild(taxTypeCell);
    row.appendChild(taxRateCell);
    row.appendChild(nominalValueCell);
    row.appendChild(measureUnitCell);
    row.appendChild(actionsCell);

    // Agregar fila a la tabla
    taxesTableBody.appendChild(row);
};

// Agregar evento al botón
document.getElementById("addRow").addEventListener("click", addRow);

// Agregar una fila inicial
addRow();

function showTaxesModal(itemId) {
    // Llamada AJAX para obtener los impuestos
    $.ajax({
        url: `http://3.17.151.214/item/impuestos/${itemId}`, // Construye la URL con el ID
        method: "GET",
        dataType: "json",
        success: (response) => {
            if (response.success) {
                taxesData = response.data;
                buildTaxesTable(); // Construye la tabla de impuestos

                // Configura un temporizador para cerrar SweetAlert después de 2 segundos
                Swal.fire({
                    icon: "success",
                    title: "¡Datos cargados!",
                    text: "Los impuestos se cargaron correctamente.",
                    timer: 2000, // 2 segundos
                    showConfirmButton: false,
                }).then(() => {
                    // Muestra el modal de impuestos después de que se cierre SweetAlert
                    const taxesModal = new bootstrap.Modal(document.getElementById('taxesModal'));
                    taxesModal.show();
                });
            } else {
                // Cierra el SweetAlert y muestra un error
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.message || "Hubo un problema al cargar los impuestos.",
                    timer: 2000, // 2 segundos
                    showConfirmButton: false,
                });
            }
        },
        error: (xhr, status, error) => {
            // Muestra un mensaje de error con SweetAlert
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `No se pudieron cargar los impuestos para el ítem ID ${itemId}. Por favor, intenta nuevamente.`,
                timer: 2000, // 2 segundos
                showConfirmButton: false,
            });
            console.error(`Error al obtener impuestos para el ítem ID ${itemId}:`, error);
        },
    });
}

// Función para mostrar el modal de combos
function showCombosModal(itemId) {
    // Llamada AJAX para obtener los combos
    $.ajax({
        url: `http://3.17.151.214/item/combos/${itemId}`, // URL corregida
        method: "GET",
        dataType: "json",
        success: (response) => {
            if (response.success) {
                combosData = response.data; // Guarda los datos de combos
                buildCombosTable(); // Construye la tabla de combos

                // Configura un temporizador para cerrar SweetAlert después de 2 segundos
                Swal.fire({
                    icon: "success",
                    title: "¡Datos cargados!",
                    text: "Los impuestos se cargaron correctamente.",
                    timer: 2000, // 2 segundos
                    showConfirmButton: false,
                }).then(() => {
                    // Muestra el modal de impuestos después de que se cierre SweetAlert
                    const combosModal = new bootstrap.Modal(document.getElementById('combosModal'));
                    combosModal.show();
                });
            } else {
                // Cierra el SweetAlert y muestra un error
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.message || "Hubo un problema al cargar los combos.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        },
        error: (xhr, status, error) => {
            // Cierra el SweetAlert y muestra un error
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `No se pudieron cargar los combos para el ítem ID ${itemId}. Por favor, intenta nuevamente.`,
                timer: 2000,
                showConfirmButton: false,
            });
            console.error(`Error al obtener combos para el ítem ID ${itemId}:`, error);
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
            { title: "Tipo", field: "typeTaxe", headerFilter: true },
            { title: "Tasa Impuesto (%)", field: "ratePercentage", formatter: "money", formatterParams: { precision: 2 }, headerFilter: true },
            { title: "Valor Nominal", field: "rateNominal", headerFilter: true },
            { title: "Unidad de Medida", field: "MesureUnit", headerFilter: true, visible: true }, // Opcional
        ],
    });
}

function buildCombosTable() {
    const combosTableContainer = document.getElementById("combosTableContainer");

    // Limpia el contenedor antes de construir la tabla
    combosTableContainer.innerHTML = "";

    // Crear instancia de Tabulator si no existe, reutilizar si ya está creada
    combosTable = new Tabulator(combosTableContainer, {
        data: combosData, // Usa los datos de combos
        layout: "fitColumns",
        responsiveLayout: "collapse",
        columns: [
            { title: "ID", field: "id", width: 70 },
            { title: "Código", field: "code", headerFilter: true },
            { title: "Nombre", field: "name", headerFilter: true },
            { title: "Descripción", field: "description" },
            { title: "Precio Unitario", field: "unitPrice", formatter: "money", formatterParams: { precision: 2 }, headerFilter: true },
            { title: "Total Impuestos", field: "totalTaxes", formatter: "money", formatterParams: { precision: 2 } },
            { title: "Precio Venta", field: "salesPrice", formatter: "money", formatterParams: { precision: 2 } },
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
                // Filtrar items que no sean de tipo "combo"
                filteredItems = itemsGlobal.filter(item => item.typeItem !== "combo");
                addRowToCombosTable(filteredItems);
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
        data: itemsGlobal,
        layout: "fitColumns",
        responsiveLayout: "collapse",
        tableClass: "table table-striped table-bordered table-hover",
        pagination: "local",
        paginationSize: 10,
        locale: true,
        langs: {
            "es-419": { // Cambia "es-es" por "es-419"
                "columns": {
                    "name": "Nombre", // Traducción de columnas (si es dinámico)
                },
                "pagination": {
                    "first": "Primera",
                    "first_title": "Primera página",
                    "last": "Última",
                    "last_title": "Última página",
                    "prev": "Anterior",
                    "prev_title": "Página anterior",
                    "next": "Siguiente",
                    "next_title": "Página siguiente",
                    "page_size": "Tamaño de página",
                },
                "groups": {
                    "item": "ítem",
                    "items": "ítems",
                },
                "data": {
                    "loading": "Cargando datos...",
                    "error": "Error al cargar datos.",
                },
                "paginationCounter": {
                    "showing": "Mostrando",
                    "of": "de",
                    "pages": "páginas",
                },
            },
        },
        initialLocale: "es-419",
        paginationSizeSelector: [10, 20, 50, 100],
        columns: [
            { title: "#", field: "id", width: 80, hozAlign: "center", headerSort: false, headerFilter: true },
            { title: "Código", field: "code", headerFilter: true, widthGrow: 1 },
            { title: "Tipo", field: "typeItem", headerFilter: true, widthGrow: 1 },
            { title: "Nombre", field: "name", headerFilter: true, widthGrow: 2 },
            { title: "Descripción", field: "description", widthGrow: 3.5 },
            { title: "Precio Unitario", field: "unitPrice", formatter: "money", formatterParams: { symbol: "$", precision: 2 }, widthGrow: 1.2 },
            { title: "Precio Venta", field: "salesPrice", formatter: "money", formatterParams: { symbol: "$", precision: 2 }, widthGrow: 1 },
            { title: "Total Impuestos", field: "totalTaxes", formatter: "money", formatterParams: { symbol: "$", precision: 2 }, widthGrow: 1.2 },
            { title: "Estado", field: "status", formatter: "tickCross", sorter: "boolean", hozAlign: "center", widthGrow: 0.99 },
            {
                title: "Impuestos",
                formatter: () => "<button class='btn btn-dark btn-sm'><i class='bx bx-show me-2'></i> Ver</button>",
                hozAlign: "center",
                widthGrow: 1,
                cellClick: (e, cell) => {
                    const itemId = cell.getRow().getData().id;
                    showTaxesModal(itemId);
                },
            },
            {
                title: "Items Combo",
                formatter: (cell) => {
                    const rowData = cell.getRow().getData();
                    // Mostrar el botón solo si el tipo es "combo"
                    return rowData.typeItem === "combo" ? "<button class='btn btn-primary btn-sm'><i class='bx bx-show me-2'></i> Ver</button>" : "";
                },
                hozAlign: "center",
                cellClick: (e, cell) => {
                    const rowData = cell.getRow().getData();
                    if (rowData.typeItem === "combo") {
                        const itemId = rowData.id;
                        showCombosModal(itemId); // Llama a la función para mostrar el modal de combos
                    }
                },
            },
            {
                title: "Acciones",
                formatter: () => `
                    <button class='btn btn-warning btn-sm me-1'><i class='bx bx-edit-alt fs-4'></i></button>
                    <button class='btn btn-danger btn-sm delete-btn'><i class='bx bxs-trash-alt'></i></button>
                `,
                width: 100,
                hozAlign: "center",
                cellClick: (e, cell) => {
                    const target = e.target.closest('.delete-btn'); // Asegúrate de que sea el botón de eliminación
                    if (target) {
                        const itemId = cell.getRow().getData().id;
                        deleteItem(itemId, cell.getRow()); // Llama a la función de eliminación
                    }
                },
            }
        ],
    });
}

function deleteItem(itemId, row) {
    // Muestra una confirmación antes de eliminar
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará el ítem permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#F54E41",
        cancelButtonColor: "#111430",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            // Realiza la solicitud AJAX
            $.ajax({
                url: `http://3.17.151.214/items/${itemId}`, // URL para eliminar
                method: "DELETE",
                success: (response) => {
                    if (response.success) {
                        // Elimina la fila de la tabla
                        row.delete();

                        // Muestra un mensaje de éxito
                        Swal.fire({
                            title: "¡Eliminado!",
                            text: "El ítem se eliminó correctamente.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    } else {
                        // Maneja errores del servidor
                        Swal.fire({
                            title: "Error",
                            text: response.message || "No se pudo eliminar el ítem.",
                            icon: "error",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                },
                error: (xhr, status, error) => {
                    // Maneja errores de la solicitud
                    Swal.fire({
                        title: "Error",
                        text: `No se pudo eliminar el ítem. Error: ${error}`,
                        icon: "error",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    console.error(`Error al eliminar el ítem ID ${itemId}:`, error);
                },
            });
        }
    });
}

function addRowToCombosTable(filteredItems) {
    const combosTableBody = document.getElementById("combosTableBody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>
            <div class="virtual-select select-code"></div>
        </td>
        <td>
            <div class="virtual-select select-name"></div>
        </td>
        <td>
            <input type="text" class="form-control item-type" placeholder="Tipo de item" disabled>
        </td>
        <td>
            <input type="number" class="form-control unit-price" placeholder="Precio Unitario" disabled>
        </td>
        <td>
            <input type="number" class="form-control sales-price" placeholder="Precio Venta" disabled>
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm" onclick="deleteRow(this)"><i class='bx bxs-trash-alt'></i></button>
        </td>
    `;

    combosTableBody.appendChild(newRow);

    const codeSelectElement = newRow.querySelector(".select-code");
    const nameSelectElement = newRow.querySelector(".select-name");
    const itemTypeInput = newRow.querySelector(".item-type");
    const unitPriceInput = newRow.querySelector(".unit-price");
    const salesPriceInput = newRow.querySelector(".sales-price");

    // Inicializar Virtual Select para código
    const codeSelect = VirtualSelect.init({
        ele: codeSelectElement,
        placeholder: "Seleccionar código",
        options: filteredItems.map(item => ({
            label: item.code,
            value: item.id,
        })),
    });

    // Inicializar Virtual Select para nombre
    const nameSelect = VirtualSelect.init({
        ele: nameSelectElement,
        placeholder: "Seleccionar nombre",
        options: filteredItems.map(item => ({
            label: item.name,
            value: item.id,
        })),
    });

    // Función para actualizar los campos de la fila
    function updateRowFields(selectedItem) {
        if (selectedItem) {
            itemTypeInput.value = selectedItem.typeItem;
            unitPriceInput.value = selectedItem.unitPrice;
            salesPriceInput.value = selectedItem.salesPrice;
        }
    }

    // Evento change para el selector de código
    codeSelectElement.addEventListener('change', function() {
        const selectedId = codeSelect.getValue();
        const selectedItem = filteredItems.find(item => item.id == selectedId);
        updateRowFields(selectedItem);
        // Sincronizar el selector de nombre sin disparar el evento change
        nameSelect.setValue(selectedId, true);
    });

    // Evento change para el selector de nombre
    nameSelectElement.addEventListener('change', function() {
        const selectedId = nameSelect.getValue();
        const selectedItem = filteredItems.find(item => item.id == selectedId);
        updateRowFields(selectedItem);
        // Sincronizar el selector de código sin disparar el evento change
        codeSelect.setValue(selectedId, true);
    });
}

// Función para eliminar una fila
function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
}

document.addEventListener('DOMContentLoaded', function () {
    loadData()

    // Evento para limpiar la tabla al cerrar el modal
    document.getElementById("taxesModal").addEventListener("hidden.bs.modal", () => {
        if (taxesTable) {
            taxesTable.clearData();
        }
    });

    // Evento para limpiar la tabla al cerrar el modal
    document.getElementById("combosModal").addEventListener("hidden.bs.modal", () => {
        if (combosTable) {
            combosTable.clearData();
        }
    });

    // Escucha cambios en el Virtual Select
    document.querySelector('#typeItem').addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        const combosTableContainer = document.getElementById('combosTableAdd');

        if (selectedValue === 'combo') {
            combosTableContainer.style.display = 'table'; // Muestra la tabla
        } else {
            combosTableContainer.style.display = 'none'; // Oculta la tabla
        }
    });

})