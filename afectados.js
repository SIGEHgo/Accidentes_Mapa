let chart_afectados = null;
const plugin_actualizar_eleccion_cruzada_afectados = [
  {
    id: "customEventListener",
    afterEvent: (chart, evt) => {
      if (evt.event.type == "click") {
        const points = chart.getElementsAtEventForMode(
          evt.event,
          "nearest",
          { intersect: false },
          true
        );
        if (points.length > 0) {
          const datasetIndex = points[0].datasetIndex; // Level (dataset index)
          const index = points[0].index; // Index of the clicked bar
          const label = chart.data.labels[index]; // Label of the bar
          const level = chart.data.datasets[datasetIndex].label; // Level label (dataset label)
          //console.log('Label:', label);
          //console.log('Level:', level);
          //level es pasajeros o conductores
          //label es merto o herido
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
              if ((level == "Pasajeros") & (label == "Muertos")) {
                return (
                  feature.properties.TOT_MUERT - feature.properties.CONDMUE > 0
                );
              } else if ((level == "Pasajeros") & (label == "Heridos")) {
                return (
                  feature.properties.TOT_HER - feature.properties.CONDHER > 0
                );
              } else if ((level == "Conductores") & (label == "Muertos")) {
                return feature.properties.CONDMUE > 0;
              } else if ((level == "Conductores") & (label == "Heridos")) {
                return feature.properties.CONDHER > 0;
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
promesa_primeros_afectados = new Promise((resolve, reject) => {
  let muertos = 0;
  let heridos = 0;
  let cond_heridos = 0;
  let cond_muertos = 0;
  gjson2025.features.forEach((element) => {
    muertos += element.properties.TOT_MUERT;
    heridos += element.properties.TOT_HER;
    cond_muertos += element.properties.CONDMUE;
    cond_heridos += element.properties.CONDHER;
  });
  muertos = muertos - cond_muertos;
  heridos = heridos - cond_heridos;
  resolve({ muertos, heridos, cond_muertos, cond_heridos });
});
promesa_primeros_afectados.then(
  ({ muertos, heridos, cond_muertos, cond_heridos }) => {
    const ctx = document.getElementById("afectados").getContext("2d");
    chart_afectados = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Heridos", "Muertos"],
        datasets: [
          {
            label: "Pasajeros",
            backgroundColor: "rgb(125, 179, 244)",
            data: [heridos, muertos],
          },
          {
            label: "Conductores",
            backgroundColor: "rgba(102, 188, 125, 0.4)",
            data: [cond_heridos, cond_muertos],
          },
        ],
      },
      options: {
        indexAxis: "y",
        scales: {
          x: {
            stacked: true,
            ticks: {
              callback: function (value) {
                return Number.isInteger(value) ? value : null;
              },
            },
          },
          y: {
            stacked: true,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Número de personas involucradas (2025)",
          },
        },
      },
      plugins: plugin_actualizar_eleccion_cruzada_afectados,
    });
  }
);
