const c1 = Highcharts.chart("container", {

    title: {
        text: 'Chart.update'
    },

    subtitle: {
        text: 'Plain'
    },

    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },

    series: [{
        type: 'column',
        colorByPoint: true,
        data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
        showInLegend: false
    }]
});

const c2 = Highcharts.chart("container2", {

    title: {
        text: 'Chart.update'
    },

    subtitle: {
        text: 'Plain'
    },

    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },

    series: [{
        type: 'column',
        colorByPoint: true,
        data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
        showInLegend: false
    }]
});

charts_ar = [c1, c2];

$("#test").click(function () {

    for (const c of charts_ar) {
        c.update({
            xAxis: {
                categories: ["1", "2", "3", "4", "M", "J", "J", "A", "S", "O", "N", "D"]
            },
            series: [{
                data: [10, 10, 10, 10, 10, 10, 10, 1, 1, 1, 1, 1]
            }]
        })
    }
});
