let chart_dia_semana = null;
let hist_diasemana = Array(7).fill(0);
const plugin_actualizar_eleccion_cruzada_diasemana = [
  {
    id: "customEventListener",
    afterEvent: (chart, evt) => {
      if (evt.event.type == "click") {
        const points = chart.getElementsAtEventForMode(
          evt.event,
          "x",
          { intersect: false },
          true
        );
        if (points.length > 0) {
          const datasetIndex = points[0].datasetIndex; // Índice del dataset
          const index = points[0].index; // Índice de la barra clickeada
          let label = chart.data.labels[index]; // Obtener etiqueta de la barra
          const bounds = map.getBounds();
          array_ofMarkers = capa_actual.features.filter((feature) => {
            return (
              (feature.properties.DIASEMANA === (label)) &
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
promesa_primera_diasemana = new Promise((resolve, reject) => {
  gjson2025.features.forEach((element) => {
    if (element.properties.DIASEMANA != null) {
      if (element.properties.DIASEMANA === "Lunes"){
        hist_diasemana[0]+=1
      }
      if (element.properties.DIASEMANA === "Martes"){
        hist_diasemana[1]+=1
      }
      if (element.properties.DIASEMANA === "Miércoles"){
        hist_diasemana[2]+=1
      }
      if (element.properties.DIASEMANA === "Jueves"){
        hist_diasemana[3]+=1
      }
      if (element.properties.DIASEMANA === "Viernes"){
        hist_diasemana[4]+=1
      }
      if (element.properties.DIASEMANA === "Sábado"){
        hist_diasemana[5]+=1
      }
      if (element.properties.DIASEMANA === "Domingo"){
        hist_diasemana[6]+=1
      }
      }
  });
  resolve();
});
promesa_primera_diasemana.then(() => {
 const ctx = document.getElementById("dia_semana").getContext("2d");
    chart_dia_semana = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"],
        datasets: [
          {
            label: "Cantidad de accidentes",
            data: hist_diasemana,
            backgroundColor: [
              `rgba(100, 120, 150, 0.4)`, // Gris azulado
            ],
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Incidencia de accidentes por día de la semana (2025)",
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            ticks: {
              stepSize: 1, // Ensure only integer values
              callback: function (value) {
                return Number.isInteger(value) ? value : null;
              },
            },
          },
        },
        animation: {
          duration: 1500, // 1 segundo de animación
          easing: "easeOutCubic", // animación más fluida
        },
      },
      plugins: plugin_actualizar_eleccion_cruzada_diasemana,
    });
  }
);
