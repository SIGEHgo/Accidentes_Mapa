const grupo_edad = new Promise((resolve, reject) => {
    fetch("Datos/Graficas/grupo_edad.csv")
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


  let frecuencias_grupo_edad = {};
  let chart_grupo_edad = null;

  grupo_edad.then(({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_grupo_edad = {
      "2021": frecuencia2021,
      "2022": frecuencia2022,
      "2023": frecuencia2023,
      "2025": frecuencia2025
    };

    const ctx = document.getElementById('grupo_edad').getContext('2d');
    chart_grupo_edad = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dia,
        datasets: [{
          label: 'Frecuencia',
          data: frecuencias_grupo_edad["2025"],
          backgroundColor: [
            "rgba(255, 76, 76, 0.5)",  // 15-29 años: Rojo vibrante
            "rgba(255, 195, 0,  0.5)",  // 30-59 años: Amarillo fuerte
            "rgba(0, 123, 255,  0.5)",  // 60-99 años: Azul fuerte
            "rgba(108, 117, 125,  0.5)" // Desconocido: Gris oscuro
          ],
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
            text: 'Distribución de accidentes por grupos de edad (2025)'
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