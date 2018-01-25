/*globals getTaskReport, Chart */

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
            color: "#626262"
        });
    }

    return seriesArray;

};

const bdFastqcBaseSequenceQuality = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        chartData.set(pid, Array.from(data.data[0], (x) => parseFloat(x[1])));
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
        return myChart.layout;
    });
};


const bdFastqcSequenceQuality = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        chartData.set(pid, Array.from(data.data[0],
            (x) => {return {x: parseInt(x[0]), y: parseFloat(x[1])};}));
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
        return myChart.layout;
    });
};


const bdFastqcGcContent = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        const gcVals = Array.from(data.data[0], (x) => parseFloat(x[1]));
        const totalBp = gcVals.reduce((a, b) => a + b, 0);
        chartData.set(pid, Array.from(gcVals, (x) => (x / totalBp) * 100));
    }

    return getLineSeries(chartData).then((res) => {

        const myChart = new Chart({
            title: "GC percentage",
            axisLabels: {x: "Quality score", y: "Normalized read count"},
            series: res
        });
        return myChart.layout;
    });
};


const bdFastqcSequenceLength = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        chartData.set(pid, Array.from(data.data[0],
            (x) => { return {
                    x: parseInt(x[0].split("-")[0]),
                    y: parseFloat(x[1])
                };}));
    }

    return getLineSeries(chartData).then((res) => {

        const myChart = new Chart({
            title: "Distribution of sequence length",
            axisLabels: {x: "Base pair", y: "Count"},
            series: res
        });
        return myChart.layout;
    });
};


const bdFastqcNContent = (rawData, path) => {

    const taskName = "fastqc";
    const chartData = new Map;

    // Get JSON report array
    const dataObj = getTaskReport(rawData, taskName, path);

    for (const [pid, data] of dataObj.entries()) {
        chartData.set(pid, Array.from(data.data[0],
            (x) => parseFloat(x[1])));
    }

    return getLineSeries(chartData).then((res) => {

        const myChart = new Chart({
            title: "Distribution of sequence length",
            axisLabels: {x: "Base pair", y: "Count"},
            series: res
        });
        return myChart.layout;
    });
};


const HighlightLineSeries = (chartObj, selection) => {

    const highlightedSeries = [];
    let sel;

    for (const series of chartObj.series) {
        if (selection.has(series.name)) {
            sel = selection.get(series.name);
            highlightedSeries.push({color: sel.color, zIndex: 100});
        } else {
            highlightedSeries.push({color: "#626262", zIndex: 1});
        }
    }

    chartObj.update({series: highlightedSeries});

};
