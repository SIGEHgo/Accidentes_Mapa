let chart_hora = null;

const ctx2 = document.getElementById('hora').getContext('2d');
chart_hora = new Chart(ctx2, {
    type: 'line',
    data: {
    labels: Array(24).fill(0).map((_, i) => `${i}:00`), // Genera etiquetas de 0:00 a 23:00
    datasets: [{
    label: '-',
    data: null,
    backgroundColor: 'rgba(54, 162, 235, 0.2)',         // color del área bajo la línea
    borderColor: 'rgba(54, 162, 235, 1)',               // color de la línea
    pointBackgroundColor: 'white',
    pointBorderColor: 'rgba(54, 162, 235, 1)',
    pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)', // resalta el punto en hover
    tension: 0.3,                                         // suaviza las curvas
    fill: true
    }]
    },
    options: {
    scales: {
        xAxes: [{
            display: false,
            barPercentage: 1.3,
            ticks: {
            max: 3,
            }
        }, {
            display: true,
            ticks: {
            autoSkip: false,
            max: 4,
            }
        }],
        yAxes: [{
            ticks: {
            beginAtZero: true
            }
        }]
        },
    plugins: {
        datalabels: {
            anchor: 'end',    // Posición de las etiquetas: al final (arriba) del punto
            align: 'top',     // Alineación: encima del punto
            color: '#333',    // Color del texto de las etiquetas
            font: {
                weight: 'bold'  // Hace que el texto de las etiquetas esté en negritas
            }
            },
        title: {
        display: true,
        text: 'Horas en las que suceden los accidentes (2025)'
        },
        legend: {
        display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true  // Hace que el eje Y comience en 0 para no cortar los datos
        }
        },
    animation: {
        duration: 1500, // 1 segundo de animación
        easing: 'easeOutCubic' // animación más fluida
    }
    }
});