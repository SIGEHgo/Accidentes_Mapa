let frecuencias_tipo_accidente = Array(13).fill(0);
let chart_tipo_accidente = null;
const plugin_actualizar_eleccion_cruzada = [
  {
    id: "customEventListener",
    afterEvent: (chart, evt) => {
      if (evt.event.type == "click") {
        const points = chart.getElementsAtEventForMode(
          evt.event,
          "y",
          { intersect: false },
          true
        );
        if (points.length > 0) {
          const datasetIndex = points[0].datasetIndex; // Índice del dataset
          const index = points[0].index; // Índice de la barra clickeada

          let label = chart.data.labels[index]; // Obtener etiqueta de la barra
          const bounds = map.getBounds();
          array_ofMarkers = capa_actual.features.filter((feature) => {
            return (
              feature.properties.TIPACCID.includes(label) &
              bounds.contains(
                L.latLng(
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0]
                )
              )
            );
          });

          array_ofMarkers.forEach((marker) => {
            const [lng, lat] = marker.geometry.coordinates;

            // Create a circle with animation
            const circle = L.circle([lat, lng], {
              radius: 10,
              weight: 5,
              color: "#e03",
              stroke: true,
              fill: false,
            }).addTo(map);

            // Animate the circle
            animateCircle(circle);
          });

          function animateCircle(circle) {
            const zoom = map.getZoom();
            console.log("Zoom actual:", zoom);

            let radius;
            let disminuye;

            if (zoom < 10) {
              radius = 3500;
              disminuye = 350;
            } else if (zoom < 12) {
              radius = 1500;
              disminuye = 150;
            } else if (zoom < 14) {
              radius = 500;
              disminuye = 50;
            } else {
              radius = 100;
              disminuye = 10;
            }

            const interval = setInterval(() => {
              radius -= disminuye;
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
    },
  },
];
const tipo_accidente = new Promise((resolve, reject) => {
  gjson2025.features.forEach((element) => {
    if (element.properties.TIPACCID != null) {
      switch (element.properties.TIPACCID) {
        case "Colisión con objeto fijo":
          frecuencias_tipo_accidente[0] += 1;
          break;
        case "Colisión con vehículo automotor":
          frecuencias_tipo_accidente[1] += 1;
          break;
        case "Colisión con motocicleta":
          frecuencias_tipo_accidente[2] += 1;
          break;
        case "Volcadura":
          frecuencias_tipo_accidente[3] += 1;
          break;
        case "Salida del camino":
          frecuencias_tipo_accidente[4] += 1;
          break;
        case "Colisión con peatón (atropellamiento)":
          frecuencias_tipo_accidente[5] += 1;
          break;
        case "Colisión con ciclista":
          frecuencias_tipo_accidente[6] += 1;
          break;
        case "Otro":
          frecuencias_tipo_accidente[7] += 1;
          break;
        case "Colisión con ferrocarril":
          frecuencias_tipo_accidente[8] += 1;
          break;
        case "Colisión con animal":
          frecuencias_tipo_accidente[9] += 1;
          break;
        case "Caída de pasajero":
          frecuencias_tipo_accidente[10] += 1;
          break;
        case "Incendio":
          frecuencias_tipo_accidente[11] += 1;
          break;
        case "Colisión entre transporte público":
          frecuencias_tipo_accidente[12] += 1;
          break;
      }
    }
  });
  resolve();
});

// Variables globales

// Crear el gráfico una vez que los datos están listos
tipo_accidente.then(() => {
  const ctx = document.getElementById("tipo_accidente").getContext("2d");
  // Etiquetas de tipos de accidente en el mismo orden que los índices
  const etiquetas_tipo_accidente = [
    "Colisión con objeto fijo",
    "Colisión con vehículo automotor",
    "Colisión con motocicleta",
    "Volcadura",
    "Salida del camino",
    "Colisión con peatón (atropellamiento)",
    "Colisión con ciclista",
    "Otro",
    "Colisión con ferrocarril",
    "Colisión con animal",
    "Caída de pasajero",
    "Incendio",
    "Colisión entre transporte público",
  ];
  const sortedData_inicial = frecuencias_tipo_accidente
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value);

  const sortedValues_inicial = sortedData_inicial.map((item) => item.value);
  const sortedIndexes_inicial = sortedData_inicial.map(
    (item) => etiquetas_tipo_accidente[item.index]
  );
  chart_tipo_accidente = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedIndexes_inicial,
      datasets: [
        {
          label: "Frecuencia",
          data: sortedValues_inicial,
          backgroundColor: "rgba(226, 226, 182,0.4)",
          borderColor: "rgba(9, 86, 70, 0.6)",
          borderWidth: 1,
        },
      ],
    },
    responsive: true,
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Distribución de accidentes por tipo (2025)",
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          ticks: {
            mirror: true,
            padding: 0,
            crossAlign: "near",
          },
        },
        x: {
          ticks: {
            callback: function (value) {
              return Number.isInteger(value) ? value : "";
            },
          },
        },
      },
      layout: {
        padding: 0,
      },
    },
    plugins: plugin_actualizar_eleccion_cruzada,
  });
});
