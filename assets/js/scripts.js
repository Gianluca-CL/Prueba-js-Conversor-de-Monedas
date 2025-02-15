const inputMonto = document.getElementById("monto");
const selectMoneda = document.getElementById("moneda");
const botonConvertir = document.getElementById("convertir");
const resultado = document.getElementById("resultado");
const errorMensaje = document.getElementById("error");
const ctx = document.getElementById("grafico").getContext("2d");
let chart;


async function obtenerTipoCambio() {
    try {
        const respuesta = await fetch("https://mindicador.cl/api");
        if (!respuesta.ok) throw new Error("Error en la respuesta de la API");
        
        const datos = await respuesta.json();
        return {
            dolar: datos.dolar.valor,
            euro: datos.euro.valor
        };
    } catch (error) {
        errorMensaje.textContent = "No se pudo obtener los valores de la API.";
        return null;
    }
}


async function convertirMoneda() {
    errorMensaje.textContent = ""; 
    resultado.textContent = ""; 

    const monto = parseFloat(inputMonto.value);
    if (isNaN(monto) || monto <= 0) {
        errorMensaje.textContent = "Ingrese un monto válido.";
        return;
    }

    const tipoCambio = await obtenerTipoCambio();
    if (!tipoCambio) return; 

    const monedaSeleccionada = selectMoneda.value;
    const tasaCambio = tipoCambio[monedaSeleccionada];

    const conversion = (monto / tasaCambio).toFixed(2);
    resultado.textContent = `El equivalente es ${conversion} ${monedaSeleccionada.toUpperCase()}`;

    obtenerHistorial(monedaSeleccionada);
}


async function obtenerHistorial(moneda) {
    try {
        const respuesta = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!respuesta.ok) throw new Error("No se pudo obtener el historial.");
        
        const datos = await respuesta.json();
        const ultimos10Dias = datos.serie.slice(0, 10).reverse();

        
        const labels = ultimos10Dias.map(d => d.fecha.split("T")[0]);
        const valores = ultimos10Dias.map(d => d.valor);

        renderizarGrafico(labels, valores);
    } catch (error) {
        errorMensaje.textContent = "No se pudo obtener el historial.";
    }
}


function renderizarGrafico(labels, valores) {
    if (chart) chart.destroy(); 

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Valor en los últimos 10 días",
                data: valores,
                borderColor: "blue",
                borderWidth: 2,
                fill: false
            }]
        }
    });
}


botonConvertir.addEventListener("click", convertirMoneda);
