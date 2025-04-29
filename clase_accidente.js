const clase_accidente = new Promise((resolve, reject) => {
    fetch("Datos/Graficas/clase.csv")
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

  let frecuencias_clase_accidente = {};
  let chart_clase_accidente = null;

  clase_accidente.then(({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_clase_accidente = {
      "2021": frecuencia2021,
      "2022": frecuencia2022,
      "2023": frecuencia2023,
      "2025": frecuencia2025
    };

    const ctx = document.getElementById('clase_accidente').getContext('2d');
    chart_clase_accidente = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: dia,
        datasets: [{
          label: 'Frecuencia',
          data: frecuencias_clase_accidente["2025"],
          backgroundColor: ['#0F1AF2', '#EF4BF2', '#ff0000'],
        }]
      },
      options: {
        maintainAspectRatio: false, // Disable maintaining aspect ratio
      }
    });
  });
