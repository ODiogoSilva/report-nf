const assemblyContigSize = (rawData, path) => {

    const taskName = "pilon";

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

        myChart.extend("chart", {type: "boxplot"});
        myChart.extend("xAxis", {labels: {
            rotation: -45,
            enabled: true,
            formatter: function() {return res[this.value][0]}
        }});
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

        return myChart.layout
    });
};


const getBoxPlotSeries = async (data) => {
    const series = [];

    for (const [pid, val] of data.entries()) {
        series.push(getBoxValues(val, pid))
    }
    return series
};