const ctx = document.getElementById('vehiculos_involucrados').getContext('2d');
const labels = [
    "Automóvil",
    "Motocicleta",
    "Bicicleta",
    "Camioneta",
    "Camión",
    "Tractor",
    "Ferrocarril",
];

chart_vehiculos_involucrados = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Frecuencia',
            data: null,
            backgroundColor: ['#ff0000', '#008000', '#FF5F1F', '#0000FF', '#FFFF00', '#800080', '#00FFFF'],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 7
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Disable maintaining aspect ratio
        plugins: {
            legend: {
                display: false
              },
            title: {
                display: true,
                text: 'Distribución de los accidentes por magnitud (2025)',
                padding: {
                    top: 0,
                    bottom: 0
                }
            },
        }
    }
});

