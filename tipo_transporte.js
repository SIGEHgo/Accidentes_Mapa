const plugin_tipo_transporte = [
  {
    id: "customEventListener",
    afterEvent: (chart, evt) => {
      if (evt.event.type === "click") {
        // Barras existentes
        const points = chart.getElementsAtEventForMode(
          evt.event,
          "x",
          { intersect: false },
          true
        );
        console.log("Clickeados:", points);
        if (points.length > 0) {
          const index = points[0].index;
          const label = chart.data.labels[index];
          console.log("Clic en la barra:", label);

          // Dentro de la vista filtro
          const bounds = map.getBounds();
          const array_ofMarkers = capa_actual.features.filter((feature) => {
            return (
              feature.properties["TIPO DE TRANSPORTE"] === label &&
              bounds.contains(
                L.latLng(
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0]
                )
              )
            );
          });
          console.log("Dentro de la vista:", array_ofMarkers);

          // Hacer y animar círculos
          array_ofMarkers.forEach((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            const circle = L.circle([lat, lng], {
              radius: 10,
              weight: 5,
              color: "#e03",
              fill: false,
            }).addTo(map);
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

const ctx12 = document.getElementById("chart_tipo_transporte").getContext("2d");
chart_tipo_transporte = new Chart(ctx12, {
  type: "bar",
  data: {
    labels: [], // luego los llenas dinámicamente
    datasets: [
      {
        label: "Frecuencia",
        data: [], // inicializado como array
        backgroundColor: [
          "rgba(255, 0, 0, 0.2)",
          "rgba(0, 128, 0, 0.2)",
          "rgba(255, 95, 31, 0.2)",
          "rgba(0, 0, 255, 0.2)",
          "rgba(255, 165, 0, 0.2)",
          "rgba(128, 0, 128, 0.2)",
          "rgba(255, 255, 0, 0.2)",
        ],
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 3,
        hoverOffset: 7,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Frecuencia de accidentes según tipo de transporte (2025)",
        padding: { top: 0, bottom: 0 },
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          callback: (value) => (Number.isInteger(value) ? value : null),
        },
      },
    },
  },
  plugins: plugin_tipo_transporte,
});
