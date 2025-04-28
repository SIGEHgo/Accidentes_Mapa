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

  tipo_accidente.then(({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    const frecuencias = {
      "2021": frecuencia2021,
      "2022": frecuencia2022,
      "2023": frecuencia2023,
      "2025": frecuencia2025
    };

    const ctx = document.getElementById('tipo_accidente').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dia,
        datasets: [{
          label: 'Frecuencia',
          data: frecuencias["2021"],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }], 
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          title: {
            display: true,
            text: 'Tipo de Accidente (2021)'
          },
          legend: {
            display: false
          }
        }
      }
    });
  });