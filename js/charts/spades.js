
/*
    Charts built with the spades results
 */

/* Function to process input for for each spades graph */
const processSpadesData = async (raw_reports) => {

    const storage_dist = {};
    const storage_cov = {};
    const processed_data = {};

    for ( const r of raw_reports ) {

        if (r.process_id === "6") {
            storage_dist[`${r.sample_name}_${r.pipeline_id}`] = r.report_json.size_dist;
            storage_cov[`${r.sample_name}_${r.pipeline_id}`] = r.report_json.coverage_dist;
        }
    }

    // processed_data.storage_dist = await getHighchartsSeries("bellcurve", storage_dist);
    // processed_data.storage_cov = await getHighchartsSeries("bellcurve", storage_cov);
    processed_data.boxplot_size = await getHighchartsSeries("boxplot", storage_dist);
    processed_data.boxplot_cov = await getHighchartsSeries("boxplot", storage_dist);

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
                type: "bellcurve",
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
            zoomType: "x",
            type: "boxplot"
        },
        title: {text: title},
        xAxis: {title: "Samples"},
        yAxis: {title: "Size"},
        series: [{
            name: "Size distribution",
            data: data,
        }]
    });

    console.log(spades_size_bp);

    return spades_size_bp

};

/* Build all spades distribution plots */
const buildSpadesDistribution = (data, container, title) => {

    try{
        const available_chart = $('#'+container).Highcharts();
        available_chart.destroy();
    }
    catch(e){
        console.log("Chart does not exists");
    }

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
