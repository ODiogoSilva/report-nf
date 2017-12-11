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

    Highcharts.chart("distribution-size-container", {
        chart: {
            zoomType: "x",
            height: "500px"
        },
        exporting: {
            sourceWidth: 1070,
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
            color: "grey",
            point: {
                events: {
                    mouseOver: function () {
                        updateLabels(this, "bold", 0);
                        highLightScatter(this)
                    },
                    mouseOut: function () {updateLabels(this, "normal", 0)},
                    click: function () {
                        highLightScatter(this)
                    }
                }
            }
        }, {
            name: "Data",
            type: "scatter",
            data: distData,
            id: "d",
            color: "black",
            marker: {
                radius: 3
            },
            point: {
                events: {
                    mouseOver: function () {updateLabels(this, "bold", 1)},
                    mouseOut: function () {updateLabels(this, "normal", 1)}
                }
            }
        }]
    })

};


const updateLabels = (el, fw, idx) => {

    const AxisStyle = {
        title: {
            style: {
                fontWeight: fw,
            }
        },
        labels: {
            style: {
                fontWeight: fw,
            }
        }
    };

    let AxisArray;

    if ( idx === 0 ) {
        AxisArray = [{}, AxisStyle];
    } else {
        AxisArray = [AxisStyle, {}];
    }

    el.series.chart.update({
        yAxis: AxisArray,
        xAxis: AxisArray
    })
};

const highLightScatter = (el) => {

    const cat = [el.x, el.x2];
    const points = el.series.chart.series[1].data;

    // Exit if the scatter data series is absent
    if ( points.length === 0 ) {
        return
    }

    // Check if each point is within range and modify style attributes
    // accordingly
    let modifiedPoints = [];
    for (const p of points) {
        if ( cat[0] <= p.y && p.y < cat[1] ) {
            modifiedPoints.push({x: p.x, y: p.y, marker: {fillColor: "#84bcff", radius: 5, }})
        } else {
            modifiedPoints.push({x: p.x, y:p.y, marker: {fillColor: "black", radius: 3}})
        }
    }

    // Update scatter with modified points
    el.series.chart.series[1].update({
        data: modifiedPoints
    });

    // Highlight currently selected bar
    for (const b of el.series.chart.series[0].data) {
        if ( b.index === el.index ) {
            b.update({"color": "#84bcff"})
        } else {
            b.update({"color": "grey"})
        }
    }
};


const sincronizedSlidingWindow = (sample) => {
    $("#sync-sliding-window").empty();
    /**
     * In order to synchronize tooltips and crosshairs, override the
     * built-in events with handlers defined on the parent element.
     */
    $('#sync-sliding-window').bind('mousemove touchmove touchstart', function (e) {

        let point,
            event;

        for ( const chart of Highcharts.charts) {

            if ( chart === undefined) {
                continue
            }

            if ( chart.renderTo.id === "" ) {
                event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                point = chart.series[0].searchPoint(event, true); // Get the hovered point

                if (point) {
                    point.highlight(e);
                }
            }
        }
    });
    /**
     * Override the reset function, we don't need to hide the tooltips and crosshairs.
     */
    // Highcharts.Pointer.prototype.reset = function () {
    //     return undefined;
    // };

    /**
     * Highlight a point by showing tooltip, setting hover state and draw crosshair
     */
    Highcharts.Point.prototype.highlight = function (event) {
        this.onMouseOver(); // Show the hover marker
        this.series.chart.tooltip.refresh(this); // Show the tooltip
        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };

    /**
     * Synchronize zooming through the setExtremes event handler.
     */
    function syncExtremes(e) {
        let thisChart = this.chart;

        // Prevent feedback loop
        if ( e.trigger !== "syncExtremes" ) {
            Highcharts.each(Highcharts.charts, function (chart) {
                // Ignore undefined charts
                if ( chart === undefined ) {
                    return true
                }
                if ( chart.renderTo.id !== "" ) {
                    return true
                }
                if ( chart !== thisChart ) {
                    // It is null while updating
                    if ( chart.xAxis[0].setExtremes ) {
                        chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
                    }
                }
            });
        }
    }

    let gcData,
        covData,
        xLabels;

    // Get data and labels
    for ( const el of data ) {
        if ( el.sample_name === sample && (el.report_json.plotData || {}).gcSliding )  {
            xLabels = el.report_json.plotData.gcSliding[1];
            xBars = el.report_json.plotData.gcSliding[2];
            gcData = el.report_json.plotData.gcSliding[0];
            covData = el.report_json.plotData.covSliding[0];
        }
    }

    // Get plotlines for contig boundaries
    let contigPlotLines = [];
    for ( const c of xBars ) {
        contigPlotLines.push({
            value: c,
            width: 0.15,
            color: "grey"
        })
    }

    let slidingData = [{
        "data": gcData,
        "title": "GC content",
        "type": "line"
    }, {
        "data": covData,
        "title": "Coverage",
        "type": "area"
    }];

    $.each(slidingData, (i, dataset) => {

        console.log(dataset)
        console.log(i)

        $('<div class="chart">')
            .appendTo("#sync-sliding-window")
            .highcharts({
                chart: {
                    marginLeft: 70,
                    spacingTop: 20,
                    spacingBottom: 10,
                    zoomType: "x",
                    panning: true,
                    panKey: "ctrl",
                    height: 300
                },
                title: {
                    text: dataset.title,
                    margin: 5

                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    categories: Array.from(xLabels, x => parseInt(x.split("_")[1])),
                    crosshair: {
                        width: 10
                    },
                    plotLines: contigPlotLines,
                    events: {
                        setExtremes: syncExtremes
                    },
                    tickInterval: 100,
                    min: 0,
                    max: xLabels.length
                },
                yAxis: {
                    title: {
                        text: null
                    }
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    positioner: function () {
                        return {
                            x: 30, // right aligned
                            y: -10 // align to title
                        };
                    },
                    borderWidth: 0,
                    backgroundColor: "none",
                    pointFormatter: function () {
                        return "<span>Position: <b>" + xLabels[this.x].split("_")[1] + " (Contig: " + xLabels[this.x].split("_")[0] + ")" + "</b></span><br>" +
                               "<span>Value: <b>" + this.y + "</b></span>"
                    },
                    headerFormat: "",
                    shadow: false,
                    style: {
                        fontSize: "12px"
                    },
                    valueDecimals: 2
                },

                series: [{
                    data: dataset.data,
                    type: dataset.type,
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        }
                    }
                }]
            })
    });

    $('<div class="chart">')
        .appendTo("#sync-sliding-window")
        .highcharts({
            chart: {
                marginLeft: 70,
                spacingTop: 10,
                spacingBottom: 10,
                zoomType: "x",
                panning: true,
                panKey: "ctrl",
                height: 130,
                events: {
                    load: function(){
                        this.myTooltip = new Highcharts.Tooltip(this, this.options.tooltip);
                    }
                }
            },
            title: {
                text: "Antimicrobial resistance and virulence annotation",
                margin: 5
            },
            legend: {
                enabled: false
            },
            tooltip: {
                enabled: false,
            },
            plotOptions: {
                series: {
                    stickyTracking: false,
                    events: {
                        click: function(evt) {
                            this.chart.myTooltip.options.enabled = true;
                            this.chart.myTooltip.refresh(evt.point, evt);
                        },
                        mouseOut: function() {
                            this.chart.myTooltip.hide();
                            this.chart.myTooltip.options.enabled = false;
                        }
                    }
                }
            },
            xAxis: {
                plotLines: contigPlotLines,
                events: {
                    setExtremes: syncExtremes
                },
                min: 0,
                max: xLabels.length,
                labels: {
                    enabled: false
                }
            },
            yAxis: {
                title: {
                    text: null
                },
                categories: ["Resfinder", "Card", "VFDB"],

                // labels: {
                //     enabled: false
                // }
            },
            credits: {
                enabled: false
            },
            series: [{
                type: "xrange",
                data: [{x:1, x2: 2, y: 0}, {x:4, x2:7, y: 0}, {x:90, x2:90.5, y:0}, {x:3, x2:4, y: 1}, {x:8, x2:9, y: 2}],
                pointWidth: 20
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
    sizeDistributionPlot(sample);

    sincronizedSlidingWindow(sample);

    $("#modalGraphs").modal("show")

};