
const spades_dist = (results) => {

    const storage_dist = {};
    const storage_cov = {};

    for ( const r of results ) {

        if (r.process_id === "6") {
            storage_dist[`${r.sample_name}_${r.pipeline_id}`] = r.report_json.size_dist
            storage_cov[`${r.sample_name}_${r.pipeline_id}`] = r.report_json.coverage_dist
        }
    }

    console.log(storage_dist)

    let chart_size = Object.keys(storage_dist).map((key) => {
        return {
            name: key,
            type: "bellcurve",
            baseSeries: key,
            data: storage_dist[key],
            id: key,
        }
    });

    let chart_cov = Object.keys(storage_dist).map((key) => {
        return {
            name: key,
            type: "bellcurve",
            baseSeries: key,
            data: storage_cov[key],
            id: key
        }
    });

    function getBoxValues(data) {
        var boxValues = {};
        boxValues.x = Math.random() * 100;
        boxValues.low    = Math.min.apply(Math,data);
        boxValues.q1     = getPercentile(data, 25);
        boxValues.median = getPercentile(data, 50);
        boxValues.q3     = getPercentile(data, 75);
        boxValues.high   = Math.max.apply(Math,data);
        return boxValues;
    }

    let boxplot_data = Object.keys(storage_dist).map((key) => {
        return getBoxValues(storage_dist[key]);
    });

    const spades_size = Highcharts.chart("spades_1", {
        title: {text: "Distribution of contig size"},
        xAxis: [{
            min: 0,
            title: { text: 'Size' }
        }],
        yAxis: [{
            title: { text: 'Frequency' }
        }],
        series: chart_size
    });

    const spades_cov = Highcharts.chart("spades_2", {
        title: {text: "Distribution of contig size"},
        xAxis: [{
            min: 0,
            title: { text: 'Size' }
        }],
        yAxis: [{
            title: { text: 'Frequency' }
        }],
        series: chart_cov
    });

    console.log(boxplot_data[0])

    const spades_size_box = Highcharts.chart("container2", {
        title: {text: "Distribution of contig size"},
        chart: {
            type: "candlestick"
        },
        xAxis: {
            title: { text: 'Size' }
        },
        yAxis: {
            // type: 'logarithmic',
            // minorTickInterval: 0.1,
            title: { text: 'Frequency' }
        },
        series: [{
            name: "coco",
            data: boxplot_data,
            tooltip: {
                headerFormat: '<em>Experiment No {point.key}</em><br/>'
            }
        }]
    })

};

//get any percentile from an array
function getPercentile(data, percentile) {
    data.sort(numSort);
    var index = (percentile/100) * data.length;
    var result;
    if (Math.floor(index) == index) {
        result = (data[(index-1)] + data[index])/2;
    }
    else {
        result = data[Math.floor(index)];
    }
    return result;
}
//because .sort() doesn't sort numbers correctly
function numSort(a,b) {
    return a - b;
}

const build_charts = (results) => {

    spades_dist(results)

    // const c1 = Highcharts.chart("spades_1", {
    //
    //     title: {
    //         text: 'Spades 1'
    //     },
    //
    //     subtitle: {
    //         text: 'Plain'
    //     },
    //
    //     xAxis: {
    //         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    //     },
    //
    //     series: [{
    //         type: 'column',
    //         colorByPoint: true,
    //         data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
    //         showInLegend: false
    //     }]
    // });

    // const c2 = Highcharts.chart("spades_2", {
    //
    //     title: {
    //         text: 'Spades 2'
    //     },
    //
    //     subtitle: {
    //         text: 'Plain'
    //     },
    //
    //     xAxis: {
    //         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    //     },
    //
    //     series: [{
    //         type: 'column',
    //         colorByPoint: true,
    //         data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
    //         showInLegend: false
    //     }]
    // });

    const charts_ar = [c1, c2];

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

}


