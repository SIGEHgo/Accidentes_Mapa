let chart_edad = null;
let hist_edad = Array(4).fill(0);
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
              ((feature.properties.EDAD === "Se fugó ") |
                (feature.properties.EDAD === "Se ignora edad")) &
              (label === "Desconocido")
            ) {
              return bounds.contains(
                L.latLng(
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0]
                )
              );
            } else {
              if (
                (parseInt(feature.properties.EDAD) >=
                  Number(label.slice(0, 2))) &
                (parseInt(feature.properties.EDAD) <= Number(label.slice(3, 5)))
              ) {
                return bounds.contains(
                  L.latLng(
                    feature.geometry.coordinates[1],
                    feature.geometry.coordinates[0]
                  )
                );
              }
            }
          });
          //console.log(Number(label.slice(3,5)))

          // ///TRY
          // ((feature.properties.EDAD>=Number(label.slice(0,2)) && feature.properties.EDAD<=Number(label.slice(4,5))) ||
          // ((feature.properties.EDAD==="Se fugó " || feature.properties.EDAD==="Se ignora edad") && label==="Desconocido")) & bounds.contains(
          //   L.latLng(
          //     feature.geometry.coordinates[1],
          //     feature.geometry.coordinates[0]
          //   )

          // ////

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
promesa_primera_edad = new Promise((resolve, reject) => {
  gjson2025.features.forEach((feature) => {
    if (feature.properties.EDAD != null) {
      const edad =
        feature.properties.EDAD === "Se fugó" ||
        feature.properties.EDAD === "Se ignora edad"
          ? "Se fugó"
          : parseInt(feature.properties.EDAD, 10);
      if (typeof edad === typeof "a") {
        hist_edad[3] += 1;
      } else {
        if (typeof edad === "number" && edad >= 60 && edad <= 99) {
          hist_edad[2] += 1;
        }
        if (typeof edad === "number" && edad >= 30 && edad <= 59) {
          hist_edad[1] += 1;
        }
        if (typeof edad === "number" && edad >= 15 && edad <= 29) {
          hist_edad[0] += 1;
        }
      }
    }
  });
  resolve();
});
promesa_primera_edad.then(() => {
  const ctx = document.getElementById("grupo_edad").getContext("2d");
  chart_grupo_edad = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["15-29", "30-59", "60-99", "Desconocido"],
      datasets: [
        {
          label: "Frecuencia",
          data: hist_edad,
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
});
