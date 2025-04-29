const posible_causa = new Promise((resolve, reject) => {
    fetch("Datos/Graficas/posible_causa.csv")
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


  let frecuencias_posible_causa = {};
  let chart_posible_causa = null;

  posible_causa.then(({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_posible_causa = {
      "2021": frecuencia2021,
      "2022": frecuencia2022,
      "2023": frecuencia2023,
      "2025": frecuencia2025
    };

    const ctx = document.getElementById('posible_causa').getContext('2d');
    chart_posible_causa = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dia,
        datasets: [{
          label: 'Frecuencia',
          data: frecuencias_posible_causa["2025"],
          backgroundColor: [
            `rgba(100, 120, 150, 0.7)`,   //Gris azulado
            `rgba(0, 128, 80, 0.7)`,     //Verde esmeralda
            `rgba(255, 223, 70, 0.7)`,   //Amarillo
            `rgba(255, 140, 0, 0.7)`,    //Naranja
            `rgba(255, 99, 71, 0.7)`,    //Rojo coral
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
            text: 'Posible Causa (2025)'
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