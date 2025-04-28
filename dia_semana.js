const dia_semana_csv = new Promise((resolve, reject) => {
    fetch("Datos/Graficas/dia_semana.csv")
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

  let frecuencias_dia_semana = {};
  let chart_dia_semana = null;
  dia_semana_csv.then(({ dia, frecuencia2021, frecuencia2022, frecuencia2023, frecuencia2025 }) => {
    frecuencias_dia_semana = {
      "2021": frecuencia2021,
      "2022": frecuencia2022,
      "2023": frecuencia2023,
      "2025": frecuencia2025
    };

    const ctx = document.getElementById('dia_semana').getContext('2d');
    chart_dia_semana= new Chart(ctx, {
      type: 'bar',
      data: {
      labels: dia,
      datasets: [{
        label: 'Cantidad de accidentes',
        data: frecuencias_dia_semana["2025"],
        backgroundColor: [
          `rgba(100, 120, 150, 0.7)`,   //Gris azulado
          `rgba(0, 128, 80, 0.7)`,     //Verde esmeralda
          `rgba(255, 223, 70, 0.7)`,   //Amarillo
          `rgba(255, 140, 0, 0.7)`,    //Naranja
          `rgba(255, 99, 71, 0.7)`,    //Rojo coral
          `rgba(135, 206, 235, 0.7)`,  //Azul cielo
          `rgba(180, 130, 255, 0.7)`   //Violeta suave
      ],
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Incidencia de accidentes por día de la semana (2025)'
          },
          legend: {
            display: false
          }
        },
        animation: {
          duration: 1500, // 1 segundo de animación
          easing: 'easeOutCubic' // animación más fluida
        }
      }
    });
  });