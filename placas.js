let chart_placas = null;
let hist_placas = Array(7).fill(0);
const plugin_actualizar_eleccion_cruzada_placas = [
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
              (feature.properties.PLACAS === (label)) &&
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
promesa_primera_placas = new Promise((resolve, reject) => {
  gjson2025.features.forEach((element) => {
    if (element.properties.PLACAS != null) {
      if (element.properties.PLACAS === "A51392K"){
        hist_placas[0]+=1
      }
      if (element.properties.PLACAS === "A52579K"){
        hist_placas[1]+=1
      }
      if (element.properties.PLACAS === "A55434K"){
        hist_placas[2]+=1
      }
      if (element.properties.PLACAS === "A55543K"){
        hist_placas[3]+=1
      }
      if (element.properties.PLACAS === "A56032K"){
        hist_placas[4]+=1
      }
      if (element.properties.PLACAS === "A56215K"){
        hist_placas[5]+=1
      }
      if (element.properties.PLACAS === "A56263K"){
        hist_placas[6]+=1
      }
      }
  });
  resolve();
    console.log(hist_placas);
});

promesa_primera_placas.then(() => {
 const ctx = document.getElementById("placas").getContext("2d");
    chart_placas = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["A51392K","A52579K","A55434K","A55543K","A56032K","A56215K","A56263K"],
        datasets: [
          {
            label: "Placas",
            data: hist_placas,
            backgroundColor: [
              `rgba(100, 120, 150, 0.4)`, // Gris azulado
            ],
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Placas (2025)",
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
      plugins: plugin_actualizar_eleccion_cruzada_placas,
    });
  }
);
