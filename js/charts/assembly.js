/*global getTaskReport, Chart, showModelGraphs, getBoxValues */

/**
 *
 * @param data
 * @returns {Promise.<Array>}
 */
const getBoxPlotSeries = async (data) => {
    const series = [];

    for (const [pid, val] of data.entries()) {
        series.push(getBoxValues(val, pid));
    }
    return series;
};


/**
 *
 * @param rawData
 * @param path
 * @returns {Promise.<TResult>}
 */
const assemblyBoxplot = (rawData, path, taskName) => {

    // Get JSON report array
    const chartData = getTaskReport(rawData, taskName, path);

    return getBoxPlotSeries(chartData).then((res) => {

        const myChart = new Chart({
            title: "Distribution of contig size",
            axisLabels: {x: "Samples", y: "Size distribution"},
            series: [{
                name: "Size distribution",
                data: res,
                showInLegend: false
            }]
        });

        myChart.extend("chart", {
            type: "boxplot",
            panKey: "ctrl",
            panning: true
        });
        myChart.extend("xAxis", {labels: {enabled: false}});
        myChart.extend("yAxis", {min:0});

        myChart.layout.plotOptions = {
            boxplot: {
                color: "#787477",
                fillColor: "#aaa",
                cursor: "pointer",
                stemDashStyle: "dot",
                whiskerLength: "20%",
                lineWidth: 2,
                point: {
                    events: {
                        click: showModelGraphs
                    }
                }
            }
        };

        // Add custom tooltip with human readable values
        myChart.layout.tooltip = {
            style: {
                fontSize: "16px"
            },
            formatter() {
                return `<div><b>Sample:</b> ${this.point.name}</div><br>
                        <div> </div><br>
                        <div><i>Minimum: </i>${humanReadable(this.point.low)}</div><br>
                        <div><i>Q1: </i>${humanReadable(this.point.q1)}</div><br>
                        <div><b>Median:</b> ${humanReadable(this.point.median)}</div><br>
                        <div><i>Q3: </i>${humanReadable(this.point.q3)}</div><br>
                        <div><i>Maximum:</i> ${humanReadable(this.point.high)}</div><br>`
            }
        };
        return myChart.layout;
    });
};


const assemblyContigSize = (rawData, path) => {

    return assemblyBoxplot(rawData, path, "pilon");

};


const assemblyContigCoverage = (rawData, path) => {

    return assemblyBoxplot(rawData, path, "assembly_mapping");

};

/**
 *
 * @param chartObj
 * @param selection
 */
const highlightBoxPlot = (chartObj, selection) => {

    const highlightedSeries = [];
    let sel;

    for (const point of chartObj.series[0].data) {
        if (selection.has(point.name)) {
            sel = selection.get(point.name);
            highlightedSeries.push({color: sel.color, name: point.name});
        } else {
            highlightedSeries.push({color: "grey", name: point.name});
        }
    }

    chartObj.series[0].update({data: highlightedSeries});

};