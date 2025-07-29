const ctx = document.getElementById("operador").getContext("2d");
chart_operador = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Frecuencia",
        data: null,
        backgroundColor: [
          "rgba(255, 0, 0, 0.2)",
          "rgba(0, 128, 0, 0.2)",
          "rgba(255, 95, 31, 0.2)",
          "rgba(0, 0, 255, 0.2)",
          "rgba(255, 255, 0, 0.2)",
          "rgba(128, 0, 128, 0.2)",
        ],
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 3,
        hoverOffset: 7,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false, // Disable maintaining aspect ratio
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Operador (2025)",
        padding: {
          top: 0,
          bottom: 0,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1, // Ensure only integer values
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value;
            }
          },
        },
      },
    },
  },
  //plugins: plugin_actualizar_eleccion_cruzada_vehiculos,
});
