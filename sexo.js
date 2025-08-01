let chart_sexo = null;
let hist_genero = Array(3).fill(0);
const plugin_actualizar_eleccion_cruzada_genero = [
  {
    id: "customEventListener",
    afterEvent: (chart, evt) => {
      if (evt.event.type == "click") {
        const points = chart.getElementsAtEventForMode(
          evt.event,
          "nearest",
          { intersect: true },
          true
        );
        if (points.length > 0) {
          const datasetIndex = points[0].datasetIndex; // Índice del dataset
          const index = points[0].index; // Índice de la barra clickeada
          let label = chart.data.labels[index]; // Obtener etiqueta de la barra
          const bounds = map.getBounds();
          array_ofMarkers = capa_actual.features.filter((feature) => {
            return (
              (feature.properties.SEXO === label) &
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
promesa_primera_genero = new Promise((resolve, reject) => {
  gjson2025.features.forEach((feature) => {
    if (feature.properties.SEXO != null) {
      if (feature.properties.SEXO === "Hombre") {
        hist_genero[0] += 1;
      } else {
        if (feature.properties.SEXO === "Mujer") {
          hist_genero[1] += 1;
        }
        if (feature.properties.SEXO === "Se fugó") {
          hist_genero[2] += 1;
        }
      }
    }
  });
  resolve();
});
promesa_primera_genero.then(() => {
  const ctx = document.getElementById("sexo").getContext("2d");
  chart_sexo = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Hombre", "Mujer", "Se fugó"],
      datasets: [
        {
          label: "Accidentados",
          data: hist_genero,
          backgroundColor: [
            "rgba(0, 123, 255,  0.3)",
            "rgba(255, 76, 76, 0.4)", // 15-29 años: Rojo vibrante
            "rgba(255, 195, 0,  0.3)", // 30-59 años: Amarillo fuerte
            "rgba(108, 117, 125,  0.1)", // Desconocido: Gris oscuro
          ],
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Disable maintaining aspect ratio
      plugins: {
        title: {
          display: true,
          text: "Accidentes por género (2025)",
          padding: {
            top: 0,
            bottom: 0,
          },
        },
      },
    },
    plugins: plugin_actualizar_eleccion_cruzada_genero,
  });
});
