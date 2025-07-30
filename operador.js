const plugin_operador = [{
  id: "customEventListener",
  afterEvent: (chart, evt) => {
    if (evt.event.type === "click") {
      // 1) Barras existentes
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
        const array_ofMarkers = capa_actual.features.filter(feature => {
          return (
            (feature.properties.ID_OPER === label) && 
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
        array_ofMarkers.forEach(feature => {
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
  }
}];

const ctx = document.getElementById("operador").getContext("2d");
chart_operador = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],       // luego los llenas dinámicamente
    datasets: [{
      label: "Frecuencia",
      data: [],        // inicializado como array
      backgroundColor: [
        "rgba(255, 0, 0, 0.2)",
        "rgba(0, 128, 0, 0.2)",
        "rgba(255, 95, 31, 0.2)",
        "rgba(0, 0, 255, 0.2)",
        "rgba(255, 255, 0, 0.2)",
        "rgba(128, 0, 128, 0.2)",
      ],
      borderColor: "rgba(255, 255, 255, 1)",
      borderWidth: 3,
      hoverOffset: 7,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Operador (2025)",
        padding: { top: 0, bottom: 0 },
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          callback: value => Number.isInteger(value) ? value : null,
        },
      },
    },
  },
  plugins: plugin_operador,
});
