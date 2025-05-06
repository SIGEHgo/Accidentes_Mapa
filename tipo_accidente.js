const tipo_accidente = new Promise((resolve, reject) => {
  fetch("Datos/Graficas/tipo_accidente.csv")
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

// Variables globales
let frecuencias_tipo_accidente = {};
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
          //console.log(label)
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
// Crear el gráfico una vez que los datos están listos
tipo_accidente.then(
  ({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_tipo_accidente = {
      2021: frecuencia2021,
      2022: frecuencia2022,
      2023: frecuencia2023,
      2025: frecuencia2025,
    };

    const ctx = document.getElementById("tipo_accidente").getContext("2d");
    chart_tipo_accidente = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dia,
        datasets: [
          {
            label: "Frecuencia",
            data: frecuencias_tipo_accidente["2025"],
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
  }
);
