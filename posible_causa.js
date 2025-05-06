const plugin_actualizar_eleccion_cruzada_causa = [
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
          const bounds = map.getBounds();

          let label = chart.data.labels[index]; // Obtener etiqueta de la barra
          array_ofMarkers = capa_actual.features.filter((feature) => {
            return (
              feature.properties.CAUSAACCI.includes(label) &
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
const posible_causa = new Promise((resolve, reject) => {
  fetch("Datos/Graficas/posible_causa.csv")
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

let frecuencias_posible_causa = {};
let chart_posible_causa = null;

posible_causa.then(
  ({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_posible_causa = {
      2021: frecuencia2021,
      2022: frecuencia2022,
      2023: frecuencia2023,
      2025: frecuencia2025,
    };

    const ctx = document.getElementById("posible_causa").getContext("2d");
    chart_posible_causa = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dia,
        datasets: [
          {
            label: "Frecuencia",
            data: frecuencias_posible_causa["2025"],
            backgroundColor: [
              `rgba(100, 120, 150, 0.4)`, // Gris azulado
              `rgba(0, 128, 80, 0.4)`, // Verde esmeralda
              `rgba(255, 223, 70, 0.4)`, // Amarillo
              `rgba(255, 140, 0, 0.4)`, // Naranja
              `rgba(255, 99, 71, 0.4)`, // Rojo coral
            ],
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Posible causa del accidente (2025)",
          },
          legend: {
            display: false,
          },
        },
        animation: {
          duration: 1500,
          easing: "easeOutCubic",
        },
        scales: {
          x: {
            ticks: {
              callback: function (value) {
                return Number.isInteger(value) ? value : "";
              },
            },
          },
        },
      },
      plugins: plugin_actualizar_eleccion_cruzada_causa,
    });
  }
);
