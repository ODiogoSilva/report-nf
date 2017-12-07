const humanReadable = (number) => {
    const suffix = ["", "KB", "MB", "GB", "TB"];
    const i = parseInt(Math.floor(Math.log(number) / Math.log(1000)));
    if (i === 0) return number + " " + suffix[i];
    return (number / Math.pow(1000, i)).toFixed(1) + " " + suffix[i];
};

const populateHeader = (sample) => {

    let qcColor;

    // Get QC div and add to container
    const qc = innucaTable.getValue(sample, "qc");
    $("#qcContainer").html(qc);
    qcColor = qc.css("background-color")

    // Base pairs
    const bp = innucaTable.getValue(sample, "bp")[0].innerText;
    $("#bpContainer").html(humanReadable(bp));

    // Reads
    const reads = innucaTable.getValue(sample, "reads")[0].innerText;
    $("#readsContainer").html(humanReadable(reads));

    // Coverage
    const coverage = innucaTable.getValue(sample, "coverage (2nd)")[0].innerText;
    $("#covContainer").html(humanReadable(coverage));

    // Contigs
    const contigs = innucaTable.getValue(sample, "contigs")[0].innerText;
    $("#contigsContainer").html(humanReadable(contigs));

    // Assembled bp
    const assembledbp = innucaTable.getValue(sample, "assembled bp")[0].innerText;
    $("#assembledContainer").html(humanReadable(assembledbp));

    return qcColor

};


const sparkline = (sample, color) => {

    let sparklineDataTemp = [];
    let sparklineData;
    let dataSeries;
    let maxBp;

    // Get BP data for current sample from report_json.plotData.sparkline
    for ( const el of data ) {
        if ( el.sample_name === sample && (el.report_json.plotData || {}).sparkline )  {
            // Populate an array of arrays, with the processId and BP data
            // this will allow the data to be sorted according to process ID
            sparklineDataTemp.push([parseInt(el.process_id),
                                    parseInt(el.report_json.plotData.sparkline)])
        }
    }

    // Get sorted BP data
    sparklineData = Array.from(sparklineDataTemp.sort(), x => x[1]);
    // Get maximum value for sample
    maxBp = Math.max(...sparklineData);
    // Get data series, already in percentage
    dataSeries = Array.from(sparklineData, x => parseFloat(x / maxBp))

    console.log(maxBp)
    console.log(dataSeries)

    console.log(sparklineData)

    Highcharts.chart("sparkline-container", {
        chart: {
            type: "area"
        },
        title: {
            text: "Data loss sparkline"
        },
        xAxis: {
            categories: ["Original", "Trimmomatic", "Spades", "Pilon"],
            tickLength: 0,
            min: 0.5,
            max: 2.5,
            labels: {
                enabled: false
            },
            title: {
                text: null
            }
        },
        yAxis: {
            max: 1,
            labels: {
                enabled: true
            },
            title: {
                text: null
            }
        },
        tooltip: {
            useHTML: true,
            header: "DAFUQ",
            valueDecimals: 2
        },
        legend: {
            enabled: false
        },
        series: [{
            name: sample,
            data: dataSeries,
            color: color
        }]

    })

};


/**
 *
 * @param sample
 */
sizeDistributionPlot = (sample) => {

    let distData;

    // Get BP data for current sample from report_json.plotData.sparkline
    for ( const el of data ) {
        if ( el.sample_name === sample && (el.report_json.plotData || {}).size_dist )  {
            distData = el.report_json.plotData.size_dist
        }
    }

    console.log(distData)

    Highcharts.chart("distribution-size-container", {
        chart: {
            zoomType: "x",
            height: "500px"
        },
        title: {
            text: "Distribution of contig size"
        },
        xAxis: [{
            title: { text: 'Data' },
            reversed: true
        }, {
            title: { text: 'Histogram' },
            opposite: true
        }],

        yAxis: [{
            title: { text: 'Data' }
        }, {
            title: { text: 'Histogram' },
            opposite: true
        }],
        series: [{
            name: "Histogram",
            type: "histogram",
            xAxis: 1,
            yAxis: 1,
            baseSeries: "d",
            zIndex: -1,
        }, {
            name: "Data",
            type: "scatter",
            data: distData,
            id: "d",
            marker: {
                radius: 1.5
            }
        }]
    })

};

/**
 *
 * @param sample
 * @param data
 */
const showModelGraphs = (sample) => {

    let qcColor;

    if ( sample.hasOwnProperty("point") ) {
        sample = sample.point.name;
    }

    // Set title with sample name
    $("#modalTitle").html(`Hello there, ${sample}`);

    // Populate header row
    qcColor = populateHeader(sample);

    // Generate sparkline
    sparkline(sample, qcColor);

    // Generate contig size distribution plot
    sizeDistributionPlot(sample)

    $("#modalGraphs").modal("show")

};