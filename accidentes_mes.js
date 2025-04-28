const accidentes_por_mes = new Promise((resolve, reject) => {
  fetch("Datos/Graficas/accidentes_por_mes.csv")
    .then(response => response.text())
    .then(data => {
      const filas = data.trim().split("\n");
      const dia = [];
      const frecuencia2021 = [];
      const frecuencia2022 = [];
      const frecuencia2023 = [];
      const frecuencia2025 = [];

      for (let i = 1; i < filas.length; i++) {
        const columnas = filas[i].split(",");
        if (columnas.length >= 5) {
          dia.push(columnas[0].replace(/"/g, ''));
          frecuencia2021.push(columnas[1]);
          frecuencia2022.push(columnas[2]);
          frecuencia2023.push(columnas[3]);
          frecuencia2025.push(columnas[4]);
        }
      }
      resolve({dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 });
    })
});

let frecuencias_accidentes_mes = {};
let chart_accidentes_por_mes=null;

accidentes_por_mes.then(({dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
  frecuencias_accidentes_mes = {
    "2021": frecuencia2021,
    "2022": frecuencia2022,
    "2023": frecuencia2023,
    "2025": frecuencia2025
  };

  const ctx = document.getElementById('accidentes_mes').getContext('2d');
  chart_accidentes_por_mes = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Número de accidentes',                       // Nombre del dataset
        data: frecuencias_accidentes_mes["2025"],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',         // color del área bajo la línea
        borderColor: 'rgba(54, 162, 235, 1)',               // color de la línea
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgba(54, 162, 235, 1)',
        pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)', // resalta el punto en hover
        tension: 0.3,                                         // suaviza las curvas
        fill: true
      }]
    },
    options: {
      plugins: {
        tooltip: {
          enabled: true,     // Aparece cuando pasas el mouse encima de un punto
          callbacks: {      // <-- AQUI AÑADIMOS LA PERSONALIZACION
            title: function(tooltipItems) {
              const meses_largos = {
                'Ene': 'Enero',
                'Feb': 'Febrero',
                'Mar': 'Marzo',
                'Abr': 'Abril',
                'May': 'Mayo',
                'Jun': 'Junio',
                'Jul': 'Julio',
                'Ago': 'Agosto',
                'Sep': 'Septiembre',
                'Oct': 'Octubre',
                'Nov': 'Noviembre',
                'Dic': 'Diciembre'
              };
              const mes_corto = tooltipItems[0].label;
              return meses_largos[mes_corto] || mes_corto; // Si no encuentra, deja el mismo label
            }
          }
        },
        datalabels: {
          anchor: 'end',    // Posición de las etiquetas: al final (arriba) del punto
          align: 'top',     // Alineación: encima del punto
          color: '#333',    // Color del texto de las etiquetas
          font: {
              weight: 'bold'  // Hace que el texto de las etiquetas esté en negritas
          }
        },
        title: {
          display: true,
          text: 'Número de accidentes por mes (2025)'
        },
        legend: {
          display: false  // Quitar el pequeño cuadro para desactivar grafica
        }
      },
      scales: {
        y: {
            beginAtZero: true  // Hace que el eje Y comience en 0 para no cortar los datos
        }
      },
      animation: {
        duration: 1500,           // Duración de la animación (en milisegundos)
        easing: 'easeOutQuart'    // Tipo de animación: más suave y elegante
      },
    },
    // plugins: [ChartDataLabels] // pone automáticamente los valores encima de cada punto.
  });
});