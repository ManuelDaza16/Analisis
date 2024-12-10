// Variable global para almacenar los datos
let itemsGlobal = [];

// Variable global para almacenar los impuestos
let taxesData = [];
let taxesTable = null; // Variable para almacenar la instancia de Tabulator

let combosData = []; // Variable para almacenar los datos de combos
let combosTable = null; // Variable para la instancia de Tabulator

const toggleSwitch = document.getElementById('status')



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



//Funcion para sugerir precio de venta
$(document).ready(function() {
    $('#salesPrice').on('input', function() {
        const salesPrice = parseFloat($(this).val()) || 0;
        const unitPrice = parseFloat($('#unitPrice').val()) || 0;
        const totalTaxes = parseFloat($('#totalTaxes').val()) || 0;
        const recommendedPrice = unitPrice + totalTaxes;

        $('#totalPriceSuggestion').text(recommendedPrice.toFixed(2));

        // Si el precio de venta es menor que el recomendado, muestra el mensaje
        if (salesPrice < recommendedPrice) {
            $('#priceSuggestion').show();  // Muestra el mensaje
        } else {
            $('#priceSuggestion').hide();  // Oculta el mensaje
        }
    });
});

//Agregar un nuevo impuesto
$(document).ready(function () {
    const modal = $("#addTaxes"); 
  
    modal.find("#taxes-btn-save").on("click", function (e) {
      
        e.preventDefault(); 

        // Capturar los datos del formulario
        const taxName = modal.find("#taxName").val().trim(); // Nombre del impuesto
        const taxType = modal.find("#taxType").val(); // Tipo de impuesto (Porcentual o Nominal)
        const taxId = 0;

        const taxData = {
            id: taxId, // Enviamos el id relacionado con el tipo de impuesto
            name: taxName,
            typeTaxe: taxType
        };
       
        console.log("Datos que se enviarán al servidor:", taxData);
        // Validar los campos
        if (!taxName) {
            Swal.fire({
                icon: "warning",
                title: "¡Falta información!",
                text: "Por favor, ingresa el nombre del impuesto.",
                confirmButtonText: "Entendido",
            });
            return;
        }
        if (!taxType) {
            Swal.fire({
                icon: "warning",
                title: "¡Falta información!",
                text: "Por favor, selecciona un tipo de impuesto.",
                confirmButtonText: "Entendido",
            });
            return;
        }

  
        // Enviar los datos con AJAX
        $.ajax({
            url: "http://3.17.151.214/impuestos", 
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(taxData),
            success: function (response) {
                Swal.fire({
                    icon: "success",
                    title: "¡Enviado!",
                    text: `Impuesto enviado exitosamente: ${response.message}`,
                    confirmButtonText: "Cerrar",
                });
                
                modal.modal("hide"); // Ocultar el modal tras el envío
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: "error",
                    title: "Error al enviar",
                    text: `No se pudo enviar el impuesto. Detalle: ${xhr.responseText || error}`,
                    confirmButtonText: "Cerrar",
                });
            },
        });
    });
});

//Funcion para actualizar el total de impuestos
$(document).ready(function () {
    const unitPriceInput = $('#unitPrice'); // Precio unitario
    const taxesTableBody = $('#taxesTableBody'); // Cuerpo de la tabla
    const taxesTotalInput = $('#totalTaxes'); // Campo de total de impuestos

    const btnUpdateTaxes=document.getElementById("btnUpdateTotalTaxes");


    // Función para calcular el total de impuestos
    function calculateTotalTaxes() {
        const unitPrice = parseFloat(unitPriceInput.val()) || 0; // Obtener el precio unitario
        let totalTaxes = 0;

        // Iterar sobre todas las filas de la tabla
        taxesTableBody.find('tr').each(function () {
            const taxRate = parseFloat($(this).find('td:nth-child(2)').text()) || 0; // Leer Tasa Impuesto
            const nominalValue = parseFloat($(this).find('td:nth-child(3)').text()) || 0; // Leer Valor Nominal

            // Calcular impuestos proporcionales y nominales
            const proportionalTax = (taxRate / 100) * unitPrice;

            // Sumar al total de impuestos
            totalTaxes += proportionalTax + nominalValue;
        });

        // Actualizar el campo de Total Impuestos
        taxesTotalInput.val(totalTaxes.toFixed(2));
    }

    // Evento para detectar cambios en el precio unitario
    unitPriceInput.on('input', function () {
        calculateTotalTaxes();
    });

    // Evento para recalcular impuestos cuando se agrega o elimina una fila
    $('#addRow').on('click', function () {
        calculateTotalTaxes();
    });

    $(btnUpdateTaxes).click(function(){
        calculateTotalTaxes();
    })
    // Evento para recalcular impuestos cuando se elimina una fila
    taxesTableBody.on('click', '.btn-danger', function () {
        calculateTotalTaxes();
    });

});

//Funciones para agregar nueva fila de impuestos "actualizado"
$(document).ready(function(){
    


  const taxesTableBody = document.getElementById("taxesTableBody");
    const addRow=()=>{
        const taxSelect2 = document.getElementById("taxSelect2");
        const taxRateInput = document.getElementById("tax-rate");
        const nominalValueInput = document.getElementById("nominal-value");
        const taxSelect3 = document.getElementById("taxSelect3");

        if (!taxSelect2.value || !taxRateInput.value || !nominalValueInput.value || !taxSelect3.value) {
            // Si algún campo está vacío, agregar el borde rojo en el campo vacío
            if (!taxSelect2.value) taxSelect2.classList.add('border-danger');
            if (!taxRateInput.value) taxRateInput.classList.add('border-danger');
            if (!nominalValueInput.value) nominalValueInput.classList.add('border-danger');
            if (!taxSelect3.value) taxSelect3.classList.add('border-danger');
            
            alert("Hay Campos Vacios");
            return;
        } else {
            // Limpiar los bordes rojos si los campos están completos
            taxSelect2.classList.remove('border-danger');
            taxRateInput.classList.remove('border-danger');
            nominalValueInput.classList.remove('border-danger');
            taxSelect3.classList.remove('border-danger');
        }


        const row = document.createElement("tr");

        // Columna Tipo Impuesto
        const taxTypeCell = document.createElement("td");
        taxTypeCell.textContent = taxSelect2.options[taxSelect2.selectedIndex].text;
    
        // Columna Tasa Impuesto
        const taxRateCell = document.createElement("td");
        taxRateCell.textContent = taxRateInput.value;
    
        // Columna Valor Nominal
        const nominalValueCell = document.createElement("td");
        nominalValueCell.textContent = nominalValueInput.value;
    
        // Columna Unidad de Medida
        const measureUnitCell = document.createElement("td");
        measureUnitCell.textContent = taxSelect3.options[taxSelect3.selectedIndex].text;
    
        // Columna Acciones (Botón Eliminar)
        const actionsCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.innerText = "Eliminar";
        deleteButton.onclick = () => row.remove();  // Eliminar la fila
        actionsCell.appendChild(deleteButton);
    
        // Agregar las celdas a la fila
        row.appendChild(taxTypeCell);
        row.appendChild(taxRateCell);
        row.appendChild(nominalValueCell);
        row.appendChild(measureUnitCell);
        row.appendChild(actionsCell);
    
        // Agregar la fila al cuerpo de la tabla
        taxesTableBody.appendChild(row);
       
    
        // Limpiar los campos de la fila activa después de agregarla
        taxSelect2.value = '';
        taxRateInput.value = '';
        nominalValueInput.value = '';
        taxSelect3.value = '';

    }
document.getElementById("addRow").addEventListener("click", addRow);


function fillTaxSelect2(taxesData) {
    const taxSelect = document.getElementById('taxSelect2');

    // Limpiar el select antes de llenarlo
    taxSelect.innerHTML = '<option value="">Selecciona un impuesto</option>';
  
    // Recorrer los impuestos y agregar las opciones al select
    taxesData.forEach(tax => {
        const option = document.createElement('option');
        option.value = tax.id;  // Usamos el ID del impuesto como valor
        option.textContent = tax.name;  // Mostramos el nombre del impuesto
        taxSelect.appendChild(option);
    });
}

function loadTaxesData2() {
    fetch("http://3.17.151.214/impuestos") // Ruta de la BD
    .then(response => response.json())
    .then(data => {
        fillTaxSelect2(data.data); // acceder al array de impuestos
    })
    .catch(error => console.error('Error al cargar la base de datos:', error));
}
$('#btnModalItem').click( function () {
    // Llamar a la función que carga los datos de los impuestos
    loadTaxesData2();
});

function fillTaxSelect3(taxesData) {
    const taxSelect = document.getElementById('taxSelect3');

    // Limpiar el select antes de llenarlo
    taxSelect.innerHTML = '<option value="">Selecciona Unidad</option>';
  
    // Recorrer los impuestos y agregar las opciones al select
    taxesData.forEach(tax => {
        const option = document.createElement('option');
        option.value = tax.id;  // Usamos el ID del impuesto como valor
        option.textContent = tax.name;  // Mostramos el nombre del impuesto
        taxSelect.appendChild(option);
    });
}


function loadTaxesData3() {
    fetch("http://3.17.151.214/medidas") // Ruta de la BD
    .then(response => response.json())
    .then(data => {
        fillTaxSelect3(data.data); // acceder al array de impuestos
    })
    .catch(error => console.error('Error al cargar la base de datos:', error));
}
$('#btnModalItem').click( function () {
    // Llamar a la función que carga los datos de los impuestos
    loadTaxesData3();
});


});

//Funcion para crear nuevo item
$(document).ready(function () {
    
    const modal = $("#addItems"); 
    $("#btnSaveNewItem").click(function(e){

   // modal.find("#btnSaveItem").on("click", function (e) {
      
        e.preventDefault(); 
    
        // Capturar los datos del formulario
        const idItem = 0;
        const codeItem = modal.find("#itemCode").val().trim(); 
        const typeItem = $('#typeItem').val(); 
        const nameItem = modal.find("#name").val().trim();
        const descriptionItem = modal.find("#itemDescription").val().trim();
        const unitPriceItem = modal.find("#unitPrice").val().trim();
        const totalTaxesItem = modal.find("#totalTaxes").val().trim();
        const salesPriceItem = modal.find("#salesPrice").val().trim(); 
        const statusItem = modal.find("#status").prop("checked"); 

        const taxData = {
            id: idItem, 
            code: codeItem ,
            typeItem: typeItem,
            name:nameItem,
            description:descriptionItem,
            unitPrice:unitPriceItem,
            totalTaxes:totalTaxesItem,
            salesPrice: salesPriceItem,
            status:statusItem,
        };
       
        console.log("Datos que se enviarán al servidor:", taxData);
        // Validar los campos
        if (!codeItem || !nameItem || !unitPriceItem || !salesPriceItem) {
            Swal.fire({
                icon: "error",
                title: "Campos vacíos",
                text: "Por favor, complete todos los campos requeridos.",
                confirmButtonText: "Cerrar",
            });
            return;
        }
  
        // Enviar los datos con AJAX
        $.ajax({
            url: "http://3.17.151.214/items", 
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(taxData),
            success: function (response) {
                Swal.fire({
                    icon: "success",
                    title: "¡Enviado!",
                    text: `Item enviado exitosamente: ${response.message}`,
                    confirmButtonText: "Cerrar",
                });
                
                modal.modal("hide"); // Ocultar el modal tras el envío
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: "error",
                    title: "Error al enviar",
                    text: `No se pudo enviar el impuesto. Detalle: ${xhr.responseText || error}`,
                    confirmButtonText: "Cerrar",
                });
            },
        });
    });
});





/* Función para agregar una nueva fila
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
*/
// Agregar evento al botón
document.getElementById("addRow").addEventListener("click", addRow);

// Agregar una fila inicial
// addRow();

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

// Cargar datos Items con jQuery AJAX 
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

// Construir tabla consulta de items
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

const btnNominal = document.getElementById("btnNominal");
const btnPorcentual = document.getElementById("btnPorcentual");
const nominalContainer = document.getElementById("table-taxes-2");
const porcentualContainer = document.getElementById("table-taxes-1");

// Mostrar Nominal
/* btnNominal.addEventListener("click", () => {
    nominalContainer.style.display = "block"; 
    porcentualContainer.style.display = "none"; 

    btnNominal.classList.add("btn-dark");
    btnNominal.classList.remove("btn-outline-dark");
    btnPorcentual.classList.add("btn-outline-dark");
    btnPorcentual.classList.remove("btn-dark");
});*/

// Mostrar Porcentual
btnPorcentual.addEventListener("click", () => {
    porcentualContainer.style.display = "block"; 
    nominalContainer.style.display = "none"; 
  
/*
    btnPorcentual.classList.add("btn-dark");
    btnPorcentual.classList.remove("btn-outline-dark");
    btnNominal.classList.add("btn-outline-dark");
    btnNominal.classList.remove("btn-dark"); */
});


let tableTaxesP;  // declaracion de la tabla 


btnPorcentual.addEventListener("click", () => {
    porcentualContainer.style.display = "block"; 
    nominalContainer.style.display = "none"; 


    if (tableTaxesP) {
        tableTaxesP.destroy(); 
    }

    buildPorcentualTable();
});


// Construir tabla consulta de impuestos Porcentuales
function buildPorcentualTable() {
        tableTaxesP = new Tabulator("#table-taxes-1", {
        ajaxURL: "http://3.17.151.214/impuestos",  
        ajaxConfig: "GET",
        layout: "fitColumns",
        responsiveLayout: "collapse",
        tableClass: "table table-striped table-bordered table-hover",
        initialLocale: "es-419",
        langs: {
            "es-419": {
                data: {
                    loading: "Cargando datos...",
                    error: "Error al cargar datos.",
                },
            },
        },
        ajaxResponse: function(url, params, response) {
            // Verifica la estructura de la respuesta del servidor
            console.log("Respuesta del servidor:", response);

            if (response && response.data && Array.isArray(response.data)) {
                return response.data; // Pasamos solo el array de datos a Tabulator
            } else {
                console.error("La respuesta del servidor no tiene un formato adecuado.");
                return []; // Devuelve un array vacío en caso de error
            }
        },
        columns: [
            { title: "#", field: "id", width: 80, hozAlign: "center", headerSort: false, headerFilter: true },
            { title: "Nombre", field: "name", headerFilter: true, widthGrow: 2 },
            { title: "Tipo", field: "typeTaxe", widthGrow: 3.5 }
        ]
    });
}

// Construir tabla consulta de impuestos Nominales
/*
var tableTaxesN = new Tabulator("#table-taxes-2", {
    ajaxURL: "assets/data/taxesN.json",
 ajaxConfig: "GET",
     layout: "fitColumns",
     responsiveLayout: "collapse",
     tableClass: "table table-striped table-bordered table-hover",
     initialLocale: "es-419",
     langs: {
         "es-419": {
             data: {
                 loading: "Cargando datos...",
                 error: "Error al cargar datos.",
             },
         },
     },
     columns: [
         { title: "#", field: "id", width: 80, hozAlign: "center", headerSort: false, headerFilter: true,widthGrow: 0.5 },
         { title: "Código", field: "code", headerFilter: true, widthGrow: 1 },
         { title: "Nombre", field: "name", headerFilter: true, widthGrow: 2.5 },
         { title: "Descripción", field: "description", widthGrow: 3.8 },
         { title: "Cantidad", field: "value", widthGrow: 1 },
         { title: "Unidad de Medida", field: "unit",headerFilter: true, widthGrow: 1.5 },
         { 
            title: "Tarifa de Impuesto", 
            field: "rate", 
            formatter: "money", 
            formatterParams: {
                symbol: "$", 
                precision: 2 
            },
            hozAlign: "right", // Opcional: alinear los valores a la derecha
            widthGrow: 1.2 // Ajusta el ancho de la columna
        }
       ]
 });
 */
//Mostrar-Ocultar Botones de Impuestos
const btnSearch = document.getElementById("pills-search-tab");
const btnCreate= document.getElementById("pills-create-tab");
const btnDelete=document.getElementById("pills-delete-tab");
const btnSaveOfTaxes=document.getElementById("taxes-btn-cancel");
const btnCancelOfTaxes=document.getElementById("taxes-btn-save");
//Divs
const tableTaxes= document.getElementById("table-taxes-1");

btnSaveOfTaxes.style.display = "block"; 
btnCancelOfTaxes.style.display = "none"; 

btnSearch.addEventListener("click", () => {
    btnSaveOfTaxes.style.display = "block"; 
    btnCancelOfTaxes.style.display = "none"; 
    tableTaxes.style.display="none";
});
btnCreate.addEventListener("click", () => {
    btnSaveOfTaxes.style.display = "block"; 
    btnCancelOfTaxes.style.display = "block";
    tableTaxes.style.display="none"; 
  
});
btnDelete.addEventListener("click", () => {
    btnSaveOfTaxes.style.display = "none"; 
    btnCancelOfTaxes.style.display = "none"; 
    tableTaxes.style.display="none";
    
   
});

//Eliminar un impuesto seleccionado
$(document).ready(function(){

    function deleteTax(taxId){

        $.ajax({
            url: `http://3.17.151.214/impuestos/${taxId}`, // URL de la BD + ID del impuesto
            type: 'DELETE',
            success: function (response) {
                // Si la eliminación es exitosa, mostramos un mensaje y actualizamos el select
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El impuesto ha sido eliminado exitosamente.',
                    confirmButtonText: 'Cerrar'
                });

                // Actualizamos el select después de eliminar el impuesto
                loadTaxesData();  // Vuelve a cargar los impuestos para reflejar el cambio

            }, error: function (xhr, status, error) {
                // Si hubo un error en la solicitud
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `No se pudo eliminar el impuesto. Error: ${xhr.responseText}`,
                    confirmButtonText: 'Cerrar'
                
                });
            }
        });
    }

//Muestra Los impuestos existentes para ELiminar
function fillTaxSelect(taxesData) {
    const taxSelect = document.getElementById('taxSelect');

    // Limpiar el select antes de llenarlo
    taxSelect.innerHTML = '<option value="">Selecciona un impuesto</option>';
  
    // Recorrer los impuestos y agregar las opciones al select
    taxesData.forEach(tax => {
        const option = document.createElement('option');
        option.value = tax.id;  // Usamos el ID del impuesto como valor
        option.textContent = tax.name;  // Mostramos el nombre del impuesto
        taxSelect.appendChild(option);
    });
}

function loadTaxesData() {
    fetch("http://3.17.151.214/impuestos") // Ruta de la BD
    .then(response => response.json())
    .then(data => {
        fillTaxSelect(data.data); // acceder al array de impuestos
    })
    .catch(error => console.error('Error al cargar la base de datos:', error));
}

$('#btnModalTaxe').click( function () {
    // Llamar a la función que carga los datos de los impuestos
    loadTaxesData();
});
//document.addEventListener("DOMContentLoaded",loadTaxesData());

//Boton Eliminar
$('#btnDelete').click(function () {
    const selectedTaxId = $('#taxSelect').val();  // Obtener el ID del impuesto seleccionado

    if (!selectedTaxId) {
        Swal.fire({
            icon: 'warning',
            title: '¡Selecciona un impuesto!',
            text: 'Por favor, selecciona un impuesto para eliminar.',
            confirmButtonText: 'Cerrar'
        });
        return;
    }

    // Confirmación antes de eliminar
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Este impuesto será eliminado permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Llamar a la función para eliminar el impuesto seleccionado
            deleteTax(selectedTaxId);
        }
    });
});

});


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

/*
document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.querySelector("#btnsave");
    const nameInput = document.getElementById("name");
    const itemCodeInput = document.getElementById("itemCode");
    const unitPriceInput = document.getElementById("unitPrice");
    const typeItemInput = document.getElementById("typeItem");
    const totalTaxesInput = document.getElementById("totalTaxes");
    const salesPriceInput = document.getElementById("salesPrice");
    const descriptionInput = document.getElementById("itemDescription");

    // Función para validar campos
    const validateFields = () => {
        const name = nameInput.value.trim();
        const itemCode = itemCodeInput.value.trim();
        const unitPrice = unitPriceInput.value.trim();
        const typeItem = typeItemInput.value.trim();
        const totalTaxes = totalTaxesInput.value.trim();
        const salesPrice = salesPriceInput.value.trim();
        const description = descriptionInput.value.trim();

        // Validar que no haya campos vacíos
        if (!name || !itemCode || !unitPrice || !typeItem || !totalTaxes || !salesPrice) {
            Swal.fire({
                icon: "error",
                title: "Campos Requeridos",
                text: "Por favor completa todos los campos obligatorios antes de guardar.",
            });
            return false;
        }

        // Validar que los números no sean negativos
        if (parseFloat(unitPrice) < 0 || parseInt(itemCode) < 0 || parseFloat(totalTaxes) < 0 || parseFloat(salesPrice) < 0) {
            Swal.fire({
                icon: "error",
                title: "Valor Inválido",
                text: "Los valores de Precio Unitario, Código, Total Impuestos y Precio de Venta no pueden ser negativos.",
            });
            return false;
        }

        return {
            name,
            itemCode,
            unitPrice,
            typeItem,
            totalTaxes,
            salesPrice,
            description,
        };
    };

    // Acción al hacer clic en el botón "Guardar"
    saveButton.addEventListener("click", () => {
        const productData = validateFields();
        
        if (!productData) return; // Detiene la ejecución si la validación falla

        // Mostrar el objeto JSON en la consola
        console.log(JSON.stringify(productData, null, 2));

        // Mostrar alerta de éxito
        Swal.fire({
            icon: "success",
            title: "Producto Guardado",
            text: "La información del producto se ha guardado correctamente.",
        });
    });
});
*/
// funcion para impuestos

function toggleTaxFields() {
    const taxType = document.getElementById('taxType').value;
    const taxRateField = document.getElementById('taxRateField');
    const nominalValueField = document.getElementById('nominalValueField');
    const unitMeasureField = document.getElementById('unitMeasureField');
    const itemDescription = document.getElementById('itemDescription');

    if (taxType === 'porcentual') {
        taxRateField.style.display = 'block';
        itemDescription.style.display = 'block';
        nominalValueField.style.display = 'none';
        unitMeasureField.style.display = 'none';
    } else if (taxType === 'nominal') {
        taxRateField.style.display = 'none';
        nominalValueField.style.display = 'block';
        unitMeasureField.style.display = 'block';
    } else {
        taxRateField.style.display = 'none';
        nominalValueField.style.display = 'none';
        unitMeasureField.style.display = 'none';
        itemDescription.style.display = 'none';
    }
}
