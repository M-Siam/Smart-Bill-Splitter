let chartInstance = null;

function updateChart(results) {
    const ctx = document.getElementById('contribution-chart').getContext('2d');
    const data = {
        labels: results.map(r => r.member),
        datasets: [{
            data: results.map(r => r.total),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        }]
    };

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data,
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Contribution Breakdown' }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}
