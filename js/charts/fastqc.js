
const bdFastqcBaseSequenceQuality = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        chartData.set(pid, Array.from(data.data[0], x => parseFloat(x[1])))
    }

    return getLineSeries(chartData).then((res) => {

        const myChart = new Chart({
            title: "Per base sequence quality scores",
            axisLabels: {x: "Position in read (bp)", y: "Quality score"},
            series: res
        });

        myChart.extend("yAxis", {
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
        });
        return myChart.layout
    });
};


const bdFastqcSequenceQuality = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        chartData.set(pid, Array.from(data.data[0],
                x => {return {x: parseInt(x[0]), y: parseFloat(x[1])}}))
    }

    return getLineSeries(chartData).then((res) => {

        const myChart = new Chart({
            title: "Per sequence quality scores",
            axisLabels: {x: "Quality score", y: "Position in read (bp)"},
            series: res
        });

        myChart.extend("xAxis", {
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
        });
        return myChart.layout
    });
};


const bdFastqcGcContent = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        const gcVals = Array.from(data.data[0], x => parseFloat(x[1]));
        const totalBp = gcVals.reduce((a, b) => a + b, 0);
        chartData.set(pid, Array.from(gcVals, x => (x / totalBp) * 100))
    }

    return getLineSeries(chartData).then((res) => {

        const myChart = new Chart({
            title: "GC percentage",
            axisLabels: {x: "Quality score", y: "Normalized read count"},
            series: res
        });
        return myChart.layout
    });
};


const bdFastqcSequenceLength = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        chartData.set(pid, Array.from(data.data[0],
                x => { return {
                    x: parseInt(x[0].split("-")[0]),
                    y: parseFloat(x[1])
                }}))
    }

    return getLineSeries(chartData).then((res) => {

        const myChart = new Chart({
            title: "Distribution of sequence length",
            axisLabels: {x: "Base pair", y: "Count"},
            series: res
        });
        return myChart.layout
    });
};


const bdFastqcNContent = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        chartData.set(pid, Array.from(data.data[0],
            x => parseFloat(x[1])))
    }

    return getLineSeries(chartData).then((res) => {

        const myChart = new Chart({
            title: "Distribution of sequence length",
            axisLabels: {x: "Base pair", y: "Count"},
            series: res
        });
        return myChart.layout
    });
};

/*
    Charts built with FastQC results
 */

const ProcessFastQcData = async (rawReports) => {

    let chartObject = {};

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

            // Get data for per base sequence quality
            const qualData = plotData.base_sequence_quality;
            baseSequenceQuality.set(pid,{
                data: Array.from(qualData.data[0], x => parseFloat(x[1])),
                status: qualData.status
            });

            // Get data for sequence quality
            const seqQualData = plotData.sequence_quality;
            sequenceQuality.set(pid, {
                data: Array.from(seqQualData.data[0],
                        x => {return {x: parseInt(x[0]), y: parseFloat(x[1])}}),
                status: seqQualData.status
            });

            // Get data for sequence length distribution
            const seqLenData = plotData.sequence_length_dist;
            sequenceLength.set(pid, {
                data: Array.from(seqLenData.data[0],
                        x => { return {x: parseInt(x[0].split("-")[0]), y: parseFloat(x[1])} }),
                status: seqLenData.status
            });

            // Get data for N content
            const nContentData = plotData.base_n_content;
            nContent.set(pid, {
                data: Array.from(nContentData.data[0], x => parseFloat(x[1])),
                status: nContentData.status
            });

            // Get data for GC content
            const gcData = plotData.base_gc_content;
            // Normalize read counts across samples by averaging over the total bp
            const gcVals = Array.from(gcData.data[0], x => parseFloat(x[1]));
            const totalBp = gcVals.reduce((a, b) => a + b, 0);
            gcContent.set(pid, {
                data: Array.from(gcVals, x => (x / totalBp) * 100),
                status: gcData.status
            });
        }
    }

    chartObject.baseSequenceQuality = await getBaseSequenceQualityChart(baseSequenceQuality);
    chartObject.sequenceQuality = await getSequenceQualityChart(sequenceQuality);
    chartObject.gcContent = await getGcContentChart(gcContent);
    chartObject.sequenceLength = await getSequenceLengthChart(sequenceLength);
    chartObject.nContent = await getNContentChart(nContent);

    return chartObject;
};


const getBaseSequenceQualityChart = async (mapObject) => {

    const chartSeries = getLineSeries(mapObject).then((res) => {

        return {
            chart: {
                zoomType: "x"
            },
            title: {
                text: "Per base sequence quality scores"
            },
            xAxis: {
                title: {
                    text: "Position in read (bp)"
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
            series: res
        };
    });

    return chartSeries

};


const getSequenceQualityChart = (mapObject) => {

    const chartSeries = getLineSeries(mapObject).then((res) => {

        return {
            chart: {
                zoomType: "x"
            },
            title: {
                text: "Per base sequence quality scores"
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
            series: res
        }
    });

    return chartSeries

};


const getGcContentChart = (mapObject) => {

    const chartSeries = getLineSeries(mapObject).then((res) => {

        return {
            chart: {
                zoomType: "x"
            },
            title: {
                text: "GC distribution over all sequences "
            },
            xAxis: {
                title: {
                    text: "GC percentage"
                }
            },
            yAxis: {
                title: {
                    text: "Normalized read count"
                }
            },
            legend: {
                enabled: false
            },
            series: res
        }

    });

    return chartSeries

};


const getSequenceLengthChart = (mapObject) => {

    const chartSeries = getLineSeries(mapObject).then((res) => {

        return {
            chart: {
                zoomType: "x"
            },
            title: {
                text: "Distribution of sequence length"
            },
            xAxis: {
                title: {
                    text: "Base pair"
                }
            },
            yAxis: {
                title: {
                    text: "Count"
                }
            },
            legend: {
                enabled: false
            },
            series: res
        }

    });

    return chartSeries

};


const getNContentChart = (mapObject) => {

    const chartSeries = getLineSeries(mapObject).then((res) => {

        return {
            chart: {
                zoomType: "x"
            },
            title: {
                text: "Per base N content"
            },
            xAxis: {
                title: {
                    text: "Base pair"
                }
            },
            yAxis: {
                title: {
                    text: "Count"
                }
            },
            legend: {
                enabled: false
            },
            series: res
        }

    });

    return chartSeries

};


/**
 *
 * @param mapObject
 */
const getLineSeries = async (mapObject) => {

    let seriesArray = [];

    for (const [k, v] of mapObject.entries()) {
        seriesArray.push({
            name: k,
            type: "line",
            data: v,
            color: "grey"
        })
    }

    return seriesArray;

};
