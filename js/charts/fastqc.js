/*
    Charts built with FastQC results
 */

const ProcessFastQcData = async (rawReports) => {

    let processedData = {};

    let gcContent = new Map,
        nContent = new Map,
        baseSequenceQuality = new Map,
        sequenceContent = new Map,
        sequenceLength = new Map,
        sequenceQuality = new Map;

    for ( const r of rawReports ) {

        const pid = `${r.sample_name}`;

        if ( r.report_json.task === "fastqc" ) {

            const plotData = r.report_json.plotData;

            console.log(plotData)

            // Get data for per base sequence quality
            const qualData = plotData.base_sequence_quality;
            baseSequenceQuality.set(pid, Array.from(qualData.data[0], x => parseFloat(x[1])));

            // Get data for sequence quality
            const seqQualData = plotData.sequence_quality;
            sequenceQuality.set(pid, Array.from(seqQualData.data[0],
                    x => {return {x: parseInt(x[0]), y: parseFloat(x[1])}}));

            // Get data for sequence length distribution
            const seqLenData = plotData.sequence_length_dist;
            sequenceLength.set(pid, Array.from(seqLenData.data[0],
                x => { return {x: parseInt(x[0].split("-")[0]), y: parseFloat(x[1])} }));

            // Get data for N content
            const nContentData = plotData.base_n_content;
            nContent.set(pid, Array.from(nContentData.data[0], x => parseFloat(x[1])));

            // Get data for GC content
            const gcData = plotData.base_gc_content;
            // Normalize read counts across samples by averaging over the total bp
            const gcVals = Array.from(gcData.data[0], x => parseFloat(x[1]));
            const totalBp = gcVals.reduce((a, b) => a + b, 0);
            gcContent.set(pid, Array.from(gcVals, x => (x / totalBp) * 100));
        }

    }

    processedData.baseSequenceQuality = await getLineSeries(baseSequenceQuality);
    processedData.sequenceQuality = await getLineSeries(sequenceQuality);
    processedData.gcContent = await getLineSeries(gcContent);
    processedData.sequenceLength = await getLineSeries(sequenceLength);
    processedData.nContent = await getLineSeries(nContent);

    return processedData;
};

/**
 *
 * @param mapObject
 */
const getLineSeries = (mapObject) => {

    let seriesArray = [];

        mapObject.forEach( (k, v) => {
        seriesArray.push({
            name: v,
            type: "line",
            data: k,
            color: "grey"
        });
    });

    return seriesArray;

};


const buildFqGenericLine = (data, container, title, axisTitles) => {

    const hPlot = Highcharts.chart(container, {
        chart: {
            zoomType: "x"
        },
        title: {
            text: title
        },
        xAxis: {
            title: {
                text: axisTitles.x
            }
        },
        yAxis: {
            title: {
                text: axisTitles.y
            }
        },
        legend: {
            enabled: false
        },
        series: data
    });

    return hPlot;

};


const buildFqBaseQualPlot = (data, container, title) => {

    const fastqcLine = Highcharts.chart(container, {
        chart: {
            zoomType: "x"
        },
        title: {
            text: title
        },
        xAxis: {
            title: {
                text: "Base pairs"
            }
        },
        legend: {
            enabled: false
        },
        yAxis: {
            min: 0,
            max: 45,
            title: {
                text: "Quality score"
            },
            plotBands: [{
                color: "rgba(170,255,170,.3)",
                from: 28,
                to: 45,
            }, {
                color: "rgba(255,255,170,.3)",
                from: 20,
                to: 28
            }, {
                color: "rgba(255,170,170,.3)",
                from: 0,
                to: 20
            }]
        },
        series: data
    });

    return fastqcLine

};


const buildFqQualPlot = (data, container, title) => {

    console.log(data);

    const fastqcLine = Highcharts.chart(container, {
        chart: {
            zoomType: "x"
        },
        title: {
            text: title
        },
        xAxis: {
            title: {
                text: "Read count"
            },
            min: 0,
            max: 45,
            plotBands: [{
                color: "rgba(170,255,170,.3)",
                from: 28,
                to: 45,
            }, {
                color: "rgba(255,255,170,.3)",
                from: 20,
                to: 28
            }, {
                color: "rgba(255,170,170,.3)",
                from: 0,
                to: 20
            }]
        },
        legend: {
            enabled: false
        },
        yAxis: {
            title: {
                text: "Quality score"
            }
        },
        series: data
    });

    return fastqcLine

};