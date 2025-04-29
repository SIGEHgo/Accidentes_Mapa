const tipo_accidente = new Promise((resolve, reject) => {
  fetch("Datos/Graficas/tipo_accidente.csv")
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
      resolve({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 });
    })
});


let frecuencias_tipo_accidente = {};
let chart_tipo_accidente = null;

tipo_accidente.then(({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
  frecuencias_tipo_accidente = {
    "2021": frecuencia2021,
    "2022": frecuencia2022,
    "2023": frecuencia2023,
    "2025": frecuencia2025
  };

  const ctx = document.getElementById('tipo_accidente').getContext('2d');
  chart_tipo_accidente = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dia,
      datasets: [{
        label: 'Frecuencia',
        data: frecuencias_tipo_accidente["2025"],
        backgroundColor: "rgba(255, 76, 76, 0.5)",  
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Tipo de accidente (2025)'
        },
        legend: {
          display: false
        }
      },
      animation: {
        duration: 1500, 
        easing: 'easeOutCubic' 
      }
    }
  });
});