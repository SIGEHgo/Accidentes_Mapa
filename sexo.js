const sexo = new Promise((resolve, reject) => {
    fetch("Datos/Graficas/sexo.csv")
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

  let frecuencias_sexo = {};
  let chart_sexo = null;

  sexo.then(({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_sexo = {
      "2021": frecuencia2021,
      "2022": frecuencia2022,
      "2023": frecuencia2023,
      "2025": frecuencia2025
    };

    const ctx = document.getElementById('sexo').getContext('2d');
    chart_sexo = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: dia,
        datasets: [{
          label: 'Accidentados',
          data: frecuencias_sexo["2025"],
          backgroundColor: ['#0F1AF2', '#EF4BF2', '#ff0000'],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Disable maintaining aspect ratio
        plugins: {
          title: {
            display: true,            
            text: 'Accidentes por género (2025)', 
            padding: {
              top: 0,
              bottom: 0
            }
          },
        }
      }
    }
  );
  });
