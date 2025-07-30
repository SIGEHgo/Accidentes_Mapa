let chart_posible_causa = null;
let hist_posible_causa = Array(5).fill(0);
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
          let label = chart.data.labels[index]; // Obtener etiqueta de la barra
          //console.log(label.slice(0, -3));
          const bounds = map.getBounds();
          array_ofMarkers = capa_actual.features.filter((feature) => {
            return (
              (feature.properties.CAUSAACCI === label) &
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
promesa_primera_causa = new Promise((resolve, reject) => {
  gjson2025.features.forEach((element) => {
    if (element.properties.CAUSAACCI != null) {
      if (element.properties.CAUSAACCI == "Conductor") {
        //console.log("AAAAA")
        hist_posible_causa[0] += 1;
      } else {
        if (element.properties.CAUSAACCI === "Falla del vehículo") {
          hist_posible_causa[1] += 1;
        } else {
          if (element.properties.CAUSAACCI === "Mala condición del camino") {
            hist_posible_causa[2] += 1;
          } else {
            if (element.properties.CAUSAACCI === "Peatón o pasajero") {
              hist_posible_causa[3] += 1;
            } else {
              if (element.properties.CAUSAACCI === "Otra") {
                hist_posible_causa[4] += 1;
              }
            }
          }
        }
      }
    } else {
    }
  });
  resolve();
});
promesa_primera_causa.then(() => {
  const ctx = document.getElementById("posible_causa").getContext("2d");
  chart_posible_causa = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Conductor",
        "Falla del vehículo",
        "Mala condición del camino",
        "Peatón o pasajero",
        "Otra",
      ],
      datasets: [
        {
          label: "Frecuencia",
          data: hist_posible_causa,
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
});
