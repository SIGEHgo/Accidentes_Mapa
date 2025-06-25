const meses_largos = {
  Ene: "Enero",
  Feb: "Febrero",
  Mar: "Marzo",
  Abr: "Abril",
  May: "Mayo",
  Jun: "Junio",
  Jul: "Julio",
  Ago: "Agosto",
  Sep: "Septiembre",
  Oct: "Octubre",
  Nov: "Noviembre",
  Dic: "Diciembre",
};
let primeros_datos_meses=Array(12).fill(0);
const plugin_actualizar_eleccion_cruzada_mes = [
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
          const datasetIndex = points[0].datasetIndex; 
          const index = points[0].index; 
          let label = chart.data.labels[index]; 
          console.log(label);
          const bounds = map.getBounds();
          array_ofMarkers = capa_actual.features.filter((feature) => {
            return (
              (feature.properties.MES ===
                Object.keys(meses_largos).indexOf(label) + 1) &
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
// const accidentes_por_mes = new Promise((resolve, reject) => {
//   fetch("Datos/Graficas/accidentes_por_mes.csv")
//     .then((response) => response.text())
//     .then((data) => {
//       const filas = data.trim().split("\n");
//       const dia = [];
//       const frecuencia2021 = [];
//       const frecuencia2022 = [];
//       const frecuencia2023 = [];
//       const frecuencia2025 = [];

//       for (let i = 1; i < filas.length; i++) {
//         const columnas = filas[i].split(",");
//         if (columnas.length >= 5) {
//           dia.push(columnas[0].replace(/"/g, ""));
//           frecuencia2021.push(columnas[1]);
//           frecuencia2022.push(columnas[2]);
//           frecuencia2023.push(columnas[3]);
//           frecuencia2025.push(columnas[4]);
//         }
//       }
//       resolve({
//         dia,
//         frecuencia2021,
//         frecuencia2022,
//         frecuencia2023,
//         frecuencia2025,
//       });
//     });
// });
const accidentes_por_mes = new Promise((resolve, reject) => {
  gjson2025.features.forEach((element) => {
    console.log(element.properties.MES)
    if (element.properties.MES != null) {
      
      primeros_datos_meses[parseInt(element.properties.MES)-1] += 1;
    }
    
  });
  console.log(primeros_datos_meses);
  resolve();
})



let frecuencias_accidentes_mes = {};
let chart_accidentes_por_mes = null;

accidentes_por_mes.then(
  () => {
    const ctx = document.getElementById("accidentes_mes").getContext("2d");
    chart_accidentes_por_mes = new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ],
        datasets: [
          {
            label: "Número de accidentes", 
            data: primeros_datos_meses,
            backgroundColor: "rgba(102, 188, 125, 0.4)", 
            borderColor: "rgba(102, 188, 125, 0.4)", 
            pointBackgroundColor: "white",
            pointBorderColor: "rgb(102, 188, 125)",
            pointHoverBackgroundColor: "rgba(255, 99, 132, 1)", 
            tension: 0.3, 
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
          tooltip: {
            enabled: true, 
            callbacks: {
              title: function (tooltipItems) {
                const mes_corto = tooltipItems[0].label;
                return meses_largos[mes_corto] || mes_corto; 
              },
            },
          },
          datalabels: {
            anchor: "end", 
            align: "top", 
            color: "#333",
            font: {
              weight: "bold", 
            },
          },
          title: {
            display: true,
            text: "Número de accidentes por mes (2025)",
          },
          legend: {
            display: false, 
          },
        },
        scales: {
          y: {
            beginAtZero: true, 
            ticks: {
              stepSize: 1, 
              callback: function (value) {
                return Number.isInteger(value) ? value : null; // Solo muestra valores enteros
              },
            },
          },
        },
        animation: {
          duration: 1500, 
          easing: "easeOutQuart", 
        },
      },
      plugins: plugin_actualizar_eleccion_cruzada_mes,
    });
  }
);
