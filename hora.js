let chart_hora = null;
let hist_hora = Array(24).fill(0);
const plugin_actualizar_eleccion_cruzada_hora = [
  {
    id: "customEventListener",
    afterEvent: (chart, evt) => {
      if (evt.event.type == "click") {
        const points = chart.getElementsAtEventForMode(
          evt.event,
          "x",
          { intersect: true },
          true
        );
        if (points.length > 0) {
          const datasetIndex = points[0].datasetIndex; // Índice del dataset
          const index = points[0].index; // Índice de la barra clickeada
          let label = chart.data.labels[index]; // Obtener etiqueta de la barra
          //console.log(label.slice(0, -3));
          const bounds = map.getBounds();
          array_ofMarkers = capa_actual.features.filter((feature) => {
            return (
              (feature.properties.HORA === parseFloat(label)) &
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
promesa_primera_hora = new Promise((resolve, reject) => {
  gjson2025.features.forEach((element) => {
    if (element.properties.HORA != null) {
      hist_hora[element.properties.HORA] += 1;
    }
    resolve();
  });
});
promesa_primera_hora.then(() => {
  const ctx = document.getElementById("hora").getContext("2d");
  chart_hora = new Chart(ctx, {
    type: "line",
    data: {
      labels: Array(24)
        .fill(0)
        .map((_, i) => `${i}:00`), // Genera etiquetas de 0:00 a 23:00
      datasets: [
        {
          label: "-",
          data: hist_hora,
          backgroundColor: "rgba(54, 162, 235, 0.2)", // color del área bajo la línea
          borderColor: "rgba(54, 163, 235, 0.6)", // color de la línea
          pointBackgroundColor: "white",
          pointBorderColor: "rgba(54, 163, 235, 0.8)",
          pointHoverBackgroundColor: "rgba(255, 99, 132, 1)", // resalta el punto en hover
          tension: 0.3, // suaviza las curvas
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        xAxes: [
          {
            display: false,
            barPercentage: 1.3,
            ticks: {
              max: 3,
            },
          },
          {
            display: true,
            ticks: {
              autoSkip: false,
              max: 4,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: function (value) {
                if (Number.isInteger(value)) {
                  return value; // Only display integer values
                }
              },
            },
          },
        ],
      },
      plugins: {
        datalabels: {
          anchor: "end", // Posición de las etiquetas: al final (arriba) del punto
          align: "top", // Alineación: encima del punto
          color: "#333", // Color del texto de las etiquetas
          font: {
            weight: "bold", // Hace que el texto de las etiquetas esté en negritas
          },
        },
        title: {
          display: true,
          text: "Horas en las que suceden los accidentes (2025)",
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true, // Hace que el eje Y comience en 0 para no cortar los datos
          ticks: {
            callback: function (value) {
              if (Number.isInteger(value)) {
                return value; // Only display integer values
              }
            },
          },
        },
      },
      animation: {
        duration: 1500, // 1 segundo de animación
        easing: "easeOutCubic", // animación más fluida
      },
    },
    plugins: plugin_actualizar_eleccion_cruzada_hora,
  });
});
