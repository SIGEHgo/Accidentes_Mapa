const plugin_actualizar_eleccion_cruzada_clase = [
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
              feature.properties.CLASE.includes(label) &
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
            let radius = 300;
            const interval = setInterval(() => {
              radius -= 20;
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
const clase_accidente = new Promise((resolve, reject) => {
  fetch("Datos/Graficas/clase.csv")
    .then((response) => response.text())
    .then((data) => {
      const filas = data.trim().split("\n");
      const dia = [];
      const frecuencia2021 = [];
      const frecuencia2022 = [];
      const frecuencia2023 = [];
      const frecuencia2025 = [];

      for (let i = 1; i < filas.length; i++) {
        const columnas = filas[i].split(",");
        if (columnas.length >= 5) {
          dia.push(columnas[0].replace(/"/g, ""));
          frecuencia2021.push(columnas[1]);
          frecuencia2022.push(columnas[2]);
          frecuencia2023.push(columnas[3]);
          frecuencia2025.push(columnas[4]);
        }
      }
      resolve({
        dia,
        frecuencia2021,
        frecuencia2022,
        frecuencia2023,
        frecuencia2025,
      });
    });
});

let frecuencias_clase_accidente = {};
let chart_clase_accidente = null;

clase_accidente.then(
  ({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_clase_accidente = {
      2021: frecuencia2021,
      2022: frecuencia2022,
      2023: frecuencia2023,
      2025: frecuencia2025,
    };

    const ctx = document.getElementById("clase_accidente").getContext("2d");
    chart_clase_accidente = new Chart(ctx, {
      type: "pie",
      data: {
        labels: dia,
        datasets: [
          {
            label: "Frecuencia",
            data: frecuencias_clase_accidente["2025"],
            backgroundColor: [
              "rgba(110, 172, 218,0.6)",
              "rgba(226, 226, 182,0.6)",
              "rgba(2, 21, 38,0.6)",
            ],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverOffset: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Disable maintaining aspect ratio
        plugins: {
          title: {
            display: true,
            text: "Distribución de los accidentes por magnitud (2025)",
            padding: {
              top: 0,
              bottom: 0,
            },
          },
        },
      },
      plugins: plugin_actualizar_eleccion_cruzada_clase,
    });
  }
);
