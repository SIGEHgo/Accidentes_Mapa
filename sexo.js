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
              if (label === "Hombre" || label === "Mujer") {
                return feature.properties.SEXO === label;
              } else {
                return (
                  feature.properties.SEXO !== "Hombre" &&
                  feature.properties.SEXO !== "Mujer"
                );
              }
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
const sexo = new Promise((resolve, reject) => {
  fetch("Datos/Graficas/sexo.csv")
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

let frecuencias_sexo = {};
let chart_sexo = null;

sexo.then(
  ({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_sexo = {
      2021: frecuencia2021,
      2022: frecuencia2022,
      2023: frecuencia2023,
      2025: frecuencia2025,
    };

    const ctx = document.getElementById("sexo").getContext("2d");
    chart_sexo = new Chart(ctx, {
      type: "pie",
      data: {
        labels: dia,
        datasets: [
          {
            label: "Accidentados",
            data: frecuencias_sexo["2025"],
            backgroundColor: [
              "rgba(255, 76, 76, 0.4)", // 15-29 años: Rojo vibrante
              "rgba(255, 195, 0,  0.3)", // 30-59 años: Amarillo fuerte
              "rgba(0, 123, 255,  0.3)", // 60-99 años: Azul fuerte
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
  }
);
