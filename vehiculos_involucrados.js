const plugin_actualizar_eleccion_cruzada_vehiculos=[{
    id: 'customEventListener',
    afterEvent: (chart, evt) => {
        if (evt.event.type == 'click') {
            const points = chart.getElementsAtEventForMode(evt.event, 'x', { intersect: false }, true);
            if (points.length > 0) {
                const datasetIndex = points[0].datasetIndex;  // Índice del dataset
                const index = points[0].index;  // Índice de la barra clickeada
                
                let label = chart.data.labels[index];  // Obtener etiqueta de la barra
                console.log(label);
                array_ofMarkers = capa_actual.features.filter((feature) => {
                    const vehi_invol = feature.properties.vehi_invol.toUpperCase();
                    switch (label) {
                        case "Automóvil":
                            return vehi_invol.includes("AUTOMOVIL");
                        case "Motocicleta":
                            return vehi_invol.includes("MOTOCICLET");
                        case "Bicicleta":
                            return vehi_invol.includes("BICICLETA");
                        case "Camioneta":
                            return vehi_invol.includes("CAMIONETA");
                        case "Camión":
                            return vehi_invol.includes("CAMPASAJ") || 
                                   vehi_invol.includes("PASCAMION") || 
                                   vehi_invol.includes("MICROBUS") || 
                                   vehi_invol.includes("CAMION") || 
                                   vehi_invol.includes("OMNIBUS");
                        case "Tractor":
                            return vehi_invol.includes("TRACTOR");
                        case "Ferrocarril":
                            return vehi_invol.includes("FERROCARRI");
                        default:
                            return false;
                    }
                });
  
                array_ofMarkers.forEach((marker) => {
                    const [lng, lat] = marker.geometry.coordinates;
  
                    // Create a circle with animation
                    const circle = L.circle([lat, lng], {
                        radius: 10,
                        weight: 5,
                        color: '#e03',
                        stroke: true,
                        fill: false
                    }).addTo(map);
  
                    // Animate the circle
                    animateCircle(circle);
                });
  
                function animateCircle(circle) {
                    let radius = 100;
                    const interval = setInterval(() => {
                        radius -= 5;
                        if (radius < 5) {
                            map.removeLayer(circle);
                            clearInterval(interval);
                        } else {
                            circle.setRadius(radius);
                        }
                    }, 100);
                }
            }
        }
    }
  }]
const ctx4 = document.getElementById('vehiculos_involucrados').getContext('2d');
const labels = [
    "Automóvil",
    "Motocicleta",
    "Bicicleta",
    "Camioneta",
    "Camión",
    "Tractor",
    "Ferrocarril",
];

chart_vehiculos_involucrados = new Chart(ctx4, {
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
    },
    plugins:plugin_actualizar_eleccion_cruzada_vehiculos
});

