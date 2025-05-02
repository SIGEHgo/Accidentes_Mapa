let chart_afectados = null;
const ctx3 = document.getElementById('afectados').getContext('2d');
chart_afectados = new Chart(ctx3, {
    type: 'bar',
    data: {
        labels:  ["Heridos", "Muertos"],
        datasets: [{
            label: 'Pasajeros',
            backgroundColor: "blue",
            data: null,
        }, {
            label: 'Conductores',
            backgroundColor: "green",
            data: null,
        }],
    },
    options: {
        indexAxis: 'y',
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true
            }
        },
        responsive: true
    }
});

