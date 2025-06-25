let chart_clase_accidente = null;
let hist_clase_accidente = Array(3).fill(0);
const plugin_actualizar_eleccion_cruzada_clase = [
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
          //console.log(label.slice(0, -3));
          const bounds = map.getBounds();
          array_ofMarkers = capa_actual.features.filter((feature) => {
            return (
              (feature.properties.CLASE === (label)) &
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
    if (element.properties.CLASE != null) {
      if(element.properties.CLASE==="Sólo daños"){
        hist_clase_accidente[0]+=1
      }
      if(element.properties.CLASE==="No fatal"){
        hist_clase_accidente[1]+=1
      }
      if(element.properties.CLASE==="Fatal"){
        hist_clase_accidente[2]+=1
      }
    }
    resolve();
  });
});
promesa_primera_hora.then(() => {
 const ctx = document.getElementById("clase_accidente").getContext("2d");
    chart_clase_accidente = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Sólo daños","No fatal","Fatal"],
        datasets: [
          {
            label: "Frecuencia",
            data: hist_clase_accidente,
            backgroundColor: [
              "rgba(110, 172, 218,0.6)",
              "rgba(226, 226, 182,0.6)",
              "rgba(2, 21, 38,0.6)",
            ],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverOffset: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Disable maintaining aspect ratio
        plugins: {
          title: {
            display: true,
            text: "Distribución de los accidentes por magnitud (2025)",
            padding: {
              top: 0,
              bottom: 0,
            },
          },
        },
      },
      plugins: plugin_actualizar_eleccion_cruzada_clase,
    });
  }
);
