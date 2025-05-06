const plugin_actualizar_eleccion_cruzada_edad = [
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
          //console.log(label);
          const bounds = map.getBounds();
          array_ofMarkers = capa_actual.features.filter((feature) => {
            if (
              !bounds.contains(
                L.latLng(
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0]
                )
              )
            ) {
              return false;
            } else {
              const edad =
                feature.properties.EDAD === "Se fugó" ||
                feature.properties.EDAD === "Se ignora edad"
                  ? "Se fugó"
                  : parseInt(feature.properties.EDAD, 10);
              if (
                label === "15-29" &&
                typeof edad === "number" &&
                edad >= 15 &&
                edad <= 29
              ) {
                return true;
              } else if (
                label === "30-59" &&
                typeof edad === "number" &&
                edad >= 30 &&
                edad <= 59
              ) {
                return true;
              } else if (
                label === "60-99" &&
                typeof edad === "number" &&
                edad >= 60 &&
                edad <= 98
              ) {
                return true;
              } else if (
                label === "Desconocido" &&
                (edad === "Se fugó" ||
                  typeof edad !== "number" ||
                  edad < 15 ||
                  edad > 98)
              ) {
                return true;
              }
              return false;
            }
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
const grupo_edad = new Promise((resolve, reject) => {
  fetch("Datos/Graficas/grupo_edad.csv")
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

let frecuencias_grupo_edad = {};
let chart_grupo_edad = null;

grupo_edad.then(
  ({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_grupo_edad = {
      2021: frecuencia2021,
      2022: frecuencia2022,
      2023: frecuencia2023,
      2025: frecuencia2025,
    };

    const ctx = document.getElementById("grupo_edad").getContext("2d");
    chart_grupo_edad = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dia,
        datasets: [
          {
            label: "Frecuencia",
            data: frecuencias_grupo_edad["2025"],
            backgroundColor: [
              "rgba(255, 76, 76, 0.2)", // 15-29 años: Rojo vibrante
              "rgba(255, 195, 0,  0.2)", // 30-59 años: Amarillo fuerte
              "rgba(0, 123, 255,  0.2)", // 60-99 años: Azul fuerte
              "rgba(14, 4, 4, 0.3)", // Desconocido: Gris oscuro
            ],
            borderColor: "rgba(0, 0, 0, 1)", // Color del borde
            borderWidth: 0.3,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Distribución de accidentes por grupos de edad (2025)",
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
      plugins: plugin_actualizar_eleccion_cruzada_edad,
    });
  }
);
