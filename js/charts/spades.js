
/*
    Charts built with the spades results
 */

/* Function to process input for for each spades graph */
const processSpadesData = async (raw_reports) => {

    const storage_dist = {};
    const processed_data = {};

    for ( const r of raw_reports ) {

        const pid = `${r.sample_name}`;

        if (r.report_json.task === "pilon") {
            storage_dist[pid] = r.report_json["plot-data"]["size_dist"];
            // storage_cov[pid] = r.report_json["plot-data"]["coverage_dist"];
        }
    }

    processed_data.storageDist = await getHighchartsSeries("bellcurve", storage_dist);
    // processed_data.storage_cov = await getHighchartsSeries("bellcurve", storage_cov);
    processed_data.boxplotSize = await getHighchartsSeries("boxplot", storage_dist);
    // processed_data.boxplot_cov = await getHighchartsSeries("boxplot", storageDist);

    return processed_data;

};

/* Function to return an array of Highchart Series to use as input for the Charts */
const getHighchartsSeries = (chart_type, data) => {

    let series_array;

    if (chart_type === "boxplot") {
        series_array = Object.keys(data).map((key) => {
            return getBoxValues(data[key], key);
        });
    }
    else{
        series_array = Object.keys(data).map((key) => {
            return {
                name: key,
                type: "histogram",
                baseSeries: key,
                data: data[key],
                id: key,
            }
        });
    }

    return series_array;

};

const buildSpadesBoxPlot = (data, container, title) => {

    const spades_size_bp = Highcharts.chart(container, {
        chart: {
            zoomType: "xy",
            type: "boxplot",
        },
        title: {text: title},
        xAxis: {title: "Samples"},
        yAxis: {
            title: "Size",
            min: 0
        },
        series: [{
            name: "Size distribution",
            data: data,
        }],
        plotOptions: {
            series: {
                cursor: "pointer",
                point: {
                    events: {
                        click: sampleSelector
                    }
                }
            }
        }
    });

    console.log(spades_size_bp);

    return spades_size_bp

};

/* Build all spades distribution plots */
const buildSpadesDistribution = (data, container, title) => {

    // try{
    //     const available_chart = $('#'+container).Highcharts();
    //     available_chart.destroy();
    // }
    // catch(e){
    //     console.log(e);
    // }

    console.log(data)

    const spades_size = Highcharts.chart(container, {
        chart: {zoomType: "x"},
        title: {text: title},
        xAxis: [{
            min: 0,
            title: { text: 'Size' }
        }],
        yAxis: [{
            title: { text: 'Frequency' }
        }],
        series: data
    });

    return spades_size;
};

function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(function(x) {
            console.log(V)
            return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
    };
}
function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}
