/*global innucaTable, data, Highcharts */

let windowSize;

const syncCharts = [
    "gccontent",
    "coverage",
    "sw-abricate-chart",
    "sw-prokka-chart",
    "sw-chewbbaca-chart"
];

const humanReadable = (number) => {
    const suffix = ["", "KB", "MB", "GB", "TB"];
    const i = parseInt(Math.floor(Math.log(number) / Math.log(1000)));
    if (i === 0) {
        return number + " " + suffix[i];
    }
    return (number / Math.pow(1000, i)).toFixed(1) + " " + suffix[i];
};

const populateHeader = (sample) => {

    let qcColor;

    // Get QC div and add to container
    const qc = innucaTable.getValue(sample, "qc");
    const qcContainer = $("#qcContainer");
    qcContainer.html(qc.html());
    qcColor = qc.css("background-color");
    qcContainer.css({"color": qcColor});

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

    return qcColor;

};


const sparkline = (sample, color) => {

    let sparklineDataTemp = [];
    let sparklineData;
    let dataSeries;
    let maxBp;

    // Get BP data for current sample from report_json.plotData.sparkline
    for ( const el of data.results ) {
        const pid = `${el.project_id}.${el.sample_name}`;
        if ( pid === sample && (el.report_json.plotData || {}).sparkline )  {
            // Populate an array of arrays, with the processId and BP data
            // this will allow the data to be sorted according to process ID
            sparklineDataTemp.push([parseInt(el.process_id),
                                    parseInt(el.report_json.plotData.sparkline)]);
        }
    }

    // Get sorted BP data
    sparklineData = Array.from(sparklineDataTemp.sort(), (x) => x[1]);
    // Get maximum value for sample
    maxBp = Math.max(...sparklineData);
    // Get data series, already in percentage
    dataSeries = Array.from(sparklineData, (x) => parseFloat(x / maxBp));

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
            color
        }]

    });

};

const updateLabels = (el, fw, idx) => {

    const AxisStyle = {
        title: {
            style: {
                fontWeight: fw,
            }
        },
    };

    let AxisArray;

    if ( idx === 0 ) {
        AxisArray = [{}, AxisStyle];
    } else {
        AxisArray = [AxisStyle, {}];
    }

    el.chart.update({
        yAxis: AxisArray,
        xAxis: AxisArray
    });
};


/**
 *
 * @param el
 * @param reset
 */
const highLightScatter = (el, type) => {

    const cat = [el.x, el.x2];
    const points = el.series.chart.series[1].data;

    // Exit if the scatter data series is absent
    if ( points.length === 0 ) {
        return;
    }

    // Check if each point is within range and modify style attributes
    // accordingly
    let modifiedPoints = [];
    for (const p of points) {
        if ( cat[0] <= p.y && p.y < cat[1] ) {
            modifiedPoints.push({x: p.x, y: p.y, marker: {fillColor: "#84bcff", radius: 5, }});
        } else {
            modifiedPoints.push({x: p.x, y:p.y, marker: {fillColor: "black", radius: 3}});
        }
    }

    // Update scatter with modified points
    el.series.chart.series[1].update({
        data: modifiedPoints
    });

    // Highlight currently selected bar
    let modifiedBar = [];
    for (const b of el.series.chart.series[0].data) {
        if ( b.index === el.index ) {
            modifiedBar.push({"color": "#84bcff"});
        } else {
            modifiedBar.push({"color": "grey"});
        }
    }
    el.series.chart.series[0].update({
        data: modifiedBar
    });
};


const highlightHist = (el) => {

    const yval = el.y;
    const bars = el.series.chart.series[0].data;
    const points = el.series.chart.series[1].data;

    if ( bars.length === 0 ){
        return;
    }

    let modifiedBars = [];
    for ( const b of bars ){
        if ( b.x <= yval && yval < b.x2 ) {
            modifiedBars.push({"color": "#84bcff"});
        } else {
            modifiedBars.push({"color": "grey"});
        }
    }
    el.series.chart.series[0].update({data: modifiedBars});

    let modifiedPoints = [];
    for ( const p of points ) {
        if ( p.index === el.index ) {
            modifiedPoints.push({x: p.x, y: p.y, marker: {fillColor: "#84bcff", radius: 5, }});
        } else {
            modifiedPoints.push({x: p.x, y:p.y, marker: {fillColor: "black", radius: 3}});
        }
    }
    el.series.chart.series[1].update({
        data: modifiedPoints
    });

};


const resetHighlight = (ch) => {

    let points = ch.series[1].data;
    let bars = ch.series[0].data;

    let resetPoints = [];
    let resetBars = [];

    for ( const p of points ) {
        resetPoints.push({x: p.x, y:p.y, marker: {fillColor: "black", radius: 3}});
    }

    for ( const b of bars ) {
        resetBars.push({"color": "grey"});
    }

    ch.series[1].update({data: resetPoints});
    ch.series[0].update({data: resetBars});

};


const convertXPosition = (value, contig, xbars) => {

    for (const el of xbars) {
        if (parseInt(contig) === parseInt(el.contig)) {
            return (el.absPosition + value) / el.window;
        }
    }
};


const getAbricateReport = async (sample, xbars) => {

    let categories = [],
        seriesFinal = [];

    windowSize = xbars[0].window;

    let counter = 0;

    for (const el of data.results) {
        const pid = `${el.project_id}.${el.sample_name}`;
        if (pid === sample && el.report_json.task === "abricate") {
            for (const [key, val] of Object.entries(el.report_json.plotData)) {

                tempData = Array.from(val, (x) => {return {
                    x: convertXPosition(x.seqRange[0], x.contig, xbars),
                    x2: convertXPosition(x.seqRange[1], x.contig, xbars),
                    y: counter,
                    gene: x.gene,
                    accession: x.accession,
                    coverage: x.coverage,
                    ident: x["identity"],
                    windowSize
                }});

                categories.push(key);
                seriesFinal.push({name: key, data: tempData, pointWidth: 12, pointRange: 0});
                counter += 1;
            }
        }
    }
    // return {categories, seriesData}
    return {categories, seriesFinal}
};


const getSlidingReport = async (sample) => {

    let gcData,
        xBars,
        covData,
        xLabels;

    // Get data and labels
    for ( const el of data.results ) {
        const pid = `${el.project_id}.${el.sample_name}`;
        if ( pid === sample && (el.report_json.plotData || {}).gcSliding )  {
            xLabels = el.report_json.plotData.gcSliding[1];
            xBars = Array.from(el.report_json.plotData.gcSliding[2], (x) => x.position);
            contigBoundaries = el.report_json.plotData.gcSliding[2];
            gcData = el.report_json.plotData.gcSliding[0];
            covData = el.report_json.plotData.covSliding[0];
        }
    }

    return {gcData, xBars, covData, xLabels};

};

/**
 *
 * @param sample
 */
const sizeDistributionPlot = (sample) => {

    let distData;

    // Get BP data for current sample from report_json.plotData.sparkline
    for ( const el of data.results ) {
        const pid = `${el.project_id}.${el.sample_name}`;
        if ( pid === sample && (el.report_json.plotData || {}).size_dist )  {
            distData = el.report_json.plotData.size_dist;
        }
    }

    Highcharts.chart("distribution-size-container", {
        chart: {
            zoomType: "x",
            height: "500px"
        },
        exporting: {
            sourceWidth: 1170,
            buttons: {
                clearHighlight: {
                    text: "Clear highlights",
                    onclick() {resetHighlight(this);},
                    buttonSpacing: 8,
                    theme: {
                        stroke: "#313131"
                    }
                }
            }
        },
        title: {
            text: "Distribution of contig size"
        },
        xAxis: [{
            title: { text: "Contig" },
            reversed: true
        }, {
            title: { text: "Contig size" },
            opposite: true
        }],

        yAxis: [{
            title: { text: "Contig size" }
        }, {
            title: { text: "Frequency" },
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
            cursor: "pointer",
            events: {
                mouseOver() {updateLabels(this, "bold", 0);},
                mouseOut() {updateLabels(this, "normal", 0);},
            },
            point: {
                events: {
                    click() {highLightScatter(this);},
                }
            }
        }, {
            name: "Data",
            type: "scatter",
            data: distData,
            id: "d",
            color: "black",
            cursor: "pointer",
            marker: {
                radius: 3
            },
            events: {
                mouseOver() {updateLabels(this, "bold", 1);},
                mouseOut() {updateLabels(this, "normal", 1);},
            },
            point: {
                events: {
                    click() {highlightHist(this);}
                }
            }
        }]
    });
};


/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes(e) {

    if (!e.animation){
        e.animation = false
    }

    let thisChart = this.chart;
    WebuiPopovers.hideAll();

    // Prevent feedback loop
    if ( e.trigger !== "syncExtremes" ) {
        Highcharts.each(Highcharts.charts, function (chart) {

            if (!chart) {
                return true;
            }

            if (syncCharts.includes(chart.userOptions.id)){
                if (chart !== thisChart){
                    // It is null while updating
                    if ( chart.xAxis[0].setExtremes ) {
                        chart.xAxis[0].setExtremes(e.min, e.max, undefined, e.animation, { trigger: "syncExtremes" });
                    }
                }
            }
        });
    }
}

const abricatePopover = (el) => {

    buildGauge(el.coverage, "coverageGauge", "coverage");
    buildGauge(el.ident, "identityGauge", "identity");
    populateAbricateReport(el);

    return function(){return $(".abricate-popover").html()}

};

const populateAbricateReport = (el) => {

    $("#abr-gene-name").html(el.gene);
    $("#abr-gene-length").html(Math.round((el.x2 - el.x) * el.windowSize), 0);
    $("#abr-gene-position").html(`${Math.round(el.x * el.windowSize)} - ${Math.round(el.x2 * el.windowSize)}`);
    $("#abr-database").html(el.yCategory);
    $("#abr-accession").html(el.accession)

};


const buildGauge = (value, container, title) => {

    Highcharts.chart(container, {
        chart: {
            type: "solidgauge",
            backgroundColor: "transparent",
            height: 80,
        },
        // title: null,
        title: {
            text: title,
            margin: 2,
            style: {"fontSize": "11px", fontWeight: "bold"}
        },
        pane: {
            center: ['50%', '70%'],
            size: '130%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: '#fff',
                innerRadius: '75%',
                outerRadius: '100%',
                shape: 'arc',
                borderColor: 'transparent'
            }
        },
        tooltip: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        yAxis: {
            min: 0,
            max: 100,
            stops: [
                [0.1, "#e74c3c"], // red
                [0.5, "#f1c40f"], // yellow
                [0.9, "#2ecc71"] // green
            ],
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0,
            gridLineWidth: 0,
            gridLineColor: "transparent",
            padding: 0,
            labels: {
                enabled: false
            },
            title: {
                enabled: false
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            solidgauge: {
                innerRadius: "75%",
                dataLabels: {
                    y: -45,
                    borderWidth: 0,
                    useHTML: true
                },
                animation: {
                    duration: 0
                }
            }
        },
        series: [{
            data: [value],
            dataLabels: {
                format: "<p style='text-align:center;'>{y}%</p>",
                y: 33
            }
        }]
    });
};

const slidingReport = (sample) => {

    const finalRes = getSlidingReport(sample).then((res) => {

        // Get plotlines for contig boundaries
        let contigPlotLines = [];
        for (const c of res.xBars) {
            contigPlotLines.push({
                value: c,
                width: 0.15,
                color: "grey"
            });
        }

        let slidingData = [{
            "data": res.gcData,
            "title": "GC content",
            "type": "line"
        }, {
            "data": res.covData,
            "title": "Coverage",
            "type": "area"
        }];

        res.contingPlotLines = contigPlotLines;

        $.each(slidingData, (i, dataset) => {

            const chartId = dataset.title.replace(" ","").toLowerCase();

            // Append the GC content and coverage charts
            $("<div class='chart'>")
                .appendTo("#sync-sliding-window")
                .highcharts({
                    id: chartId,
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
                        categories: Array.from(res.xLabels, (x) => parseInt(x.split("_")[1])),
                        crosshair: {
                            width: 10
                        },
                        plotLines: contigPlotLines,
                        events: {
                            setExtremes: syncExtremes
                        },
                        tickInterval: 100,
                        min: 0,
                        max: res.xLabels.length
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
                        positioner() {
                            return {
                                x: 30, // right aligned
                                y: -10 // align to title
                            };
                        },
                        borderWidth: 0,
                        backgroundColor: "none",
                        pointFormatter() {
                            return "<span>Position: <b>" + res.xLabels[this.x].split("_")[1] + " (Contig: " + res.xLabels[this.x].split("_")[0] + ")" + "</b></span><br>" +
                                "<span>Value: <b>" + this.y + "</b></span>";
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
        return res
    });
    return finalRes
};


const prokkaReport = (sample, res) => {

    const seriesHeight = 20;

    // Append the  chart
    $("<div class='chart'>")
        .appendTo("#sync-sw-prokka")
        .highcharts({
            id: "sw-prokka-chart",
            chart: {
                marginLeft: 70,
                spacingTop: 20,
                spacingBottom: 10,
                zoomType: "x",
                panning: true,
                panKey: "ctrl",
                height: 60,
                type: "xrange"
            },
            title: {
                text: "Prokka Annotation",
                margin: 5
            },
            lang: {
                noData: "No annotation data"
            },
            exporting: {
                enabled: false
            },
            credits: {
                enabled: false
            },
        })
};


const chewbbacaReport = (sample, res) => {

    const seriesHeight = 20;
    // const chartHeight = 60 + (seriesHeight * abrRes.categories.length);

    // Append the  chart
    $("<div class='chart'>")
        .appendTo("#sync-sw-chewbbaca")
        .highcharts({
            id: "sw-chewbbaca-chart",
            chart: {
                marginLeft: 70,
                spacingTop: 20,
                spacingBottom: 10,
                zoomType: "x",
                panning: true,
                panKey: "ctrl",
                height: 60,
                type: "xrange"
            },
            title: {
                text: "Chewbbaca",
                margin: 5
            },
            lang: {
                noData: "No MLST data"
            },
            exporting: {
                enabled: false
            },
            credits: {
                enabled: false
            },
        })
};

/**
 * Zooms on the abricate xrange plot by fetching the gene and range
 * from the select picker value.
 */
const abricateZoomGene = () => {

    const abricateSel = $("#abricateSelectize");
    const geneName = abricateSel.val();

    if (!geneName){
        return;
    }

    const geneOpts = abricateSel[0].selectize.options[geneName];
    const newRange = [geneOpts.range[0] - (geneOpts.range[0] * 0.001),
        geneOpts.range[1] + (geneOpts.range[1] * 0.001)];

    syncExtremes({
        min: newRange[0],
        max: newRange[1],
        animation: true
    });

    Highcharts.each(Highcharts.charts, (chart) => {

        if (!chart){
            return;
        }

        if (chart.userOptions.id === "sw-abricate-chart") {
            chart.showResetZoom();
        }
    });
};


/**
 * Triggered when selecting an item in the gene selector navigator.
 * Adds a plotBand to all sync charts on the position of the gene.
 */
const abricateHighlightSelection = () => {

    const abricateSel = $("#abricateSelectize");
    const geneName = abricateSel.val();
    const geneOpts = abricateSel[0].selectize.options[geneName];

    // When the gene selection is clear, the range does not exist
    let highlightRange;
    try {
        highlightRange = [
            geneOpts.range[0] - (geneOpts.range[0] * 0.005),
            geneOpts.range[1] + (geneOpts.range[1] * 0.005)
        ];
    } catch (err) {
        highlightRange = null;
    }

    // Add/remove plotBands in every synced chart
    Highcharts.each(Highcharts.charts, (chart) => {

        if (syncCharts.includes(chart.userOptions.id)){

            if (!chart){
                return;
            }

            // Removes previously added plotBand
            if (!chart.xAxis.plotBands){
                chart.xAxis[0].removePlotBand("geneHighlight");
            }

            // If a range could be determined, add a new plotBand
            if (highlightRange) {
                chart.xAxis[0].addPlotBand({
                    id: "geneHighlight",
                    color: "rgba(169, 255, 176, 0.5)",
                    from: highlightRange[0],
                    to: highlightRange[1]
                })
            }
        }
    })
};


const abricateNavigation = (data) => {

    let optgroups = [];
    let options = [];

    const abricateSel = $("#abricateSelectize");

    for (const el of data) {
        optgroups.push({
            id: el.name,
            name: el.name
        });

        for (const gene of el.data) {
            options.push({
                id: gene.gene,
                gene: gene.gene,
                database: el.name,
                range: [gene.x, gene.x2]
            })
        }
    }

    abricateSel.selectize({
        options,
        optgroups,
        labelField: "gene",
        valueField: "id",
        optgroupField: "database",
        optgroupLabelField: 'name',
        optgroupValueField: "id",
        searchField: ["gene"],
        plugins: ["optgroup_columns"]
    });

    $("#abricateSearch").on("click", abricateZoomGene);
    abricateSel.on("change", abricateHighlightSelection);
};


const abricateReport = (sample, res) => {

    getAbricateReport(sample, contigBoundaries).then((abrRes) => {

        const seriesHeight = 20;
        const chartHeight = 60 + (seriesHeight * abrRes.categories.length);

        // Append the  chart
        $("<div class='chart'>")
            .appendTo("#sync-sw-abricate")
            .highcharts({
                id: "sw-abricate-chart",
                chart: {
                    marginLeft: 70,
                    spacingTop: 10,
                    spacingBottom: 10,
                    zoomType: "x",
                    panning: true,
                    panKey: "ctrl",
                    height: chartHeight,
                    type: "xrange",
                },
                lang: {
                    noData: "No annotation data"
                },
                title: {
                    text: "Antimicrobial resistance and virulence annotation",
                    margin: 5
                },
                tooltip: {
                    positioner() {
                        return {
                            x: 30,
                            y: 0
                        };
                    },
                    pointFormatter() {
                        return `<span>Gene: <b>${this.gene}</b> (Click for details)</span>`
                    },
                    borderWidth: 0,
                    backgroundColor: "none",
                    headerFormat: "",
                    shadow: false
                },
                plotOptions: {
                    series: {
                        cursor: "pointer",
                        borderColor: "#fff",
                        point: {
                            events: {
                                click() {
                                    console.log(this)
                                    const sel = $(this.graphic.element);
                                    sel.webuiPopover({
                                        title: "Abricate summary report",
                                        width: "450",
                                        animation: "pop",
                                        trigger: "manual",
                                        content: abricatePopover(this),
                                        closeable: true,
                                    }).webuiPopover("show");
                                }
                            }
                        }
                    },
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: {
                    min: 0,
                    max: res.xLabels.length,
                    plotLines: res.contigPlotLines,
                    events: {
                        setExtremes: syncExtremes
                    },
                    labels: {
                        enabled: false
                    }
                },
                yAxis: {
                    categories: abrRes.categories,
                    title: {
                        text: null
                    },
                },
                credits: {
                    enabled: false
                },
                series: abrRes.seriesFinal
            });

        // Initialize the navigation buttons and selector for abricate
        abricateNavigation(abrRes.seriesFinal);
    });
};


const sincronizedSlidingWindow = async (sample) => {

    $("#sync-sliding-window").empty();
    $("#sync-sw-abricate").empty();
    $("#sync-sw-prokka").empty();
    $("#sync-sw-chewbbaca").empty();
    /**
     * In order to synchronize tooltips and crosshairs, override the
     * built-in events with handlers defined on the parent element.
     */
    $(".sync-plots").bind("mousemove", function (e) {

        let point,
            event;

        for ( const chart of Highcharts.charts) {

            if ( chart === undefined) {
                continue;
            }

            if ( chart.renderTo.id === "" ) {

                // if (chart.userOptions.chart.type === "xrange"){
                //     continue
                // }

                event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart

                // Provide custom "crosshair" for each y series in the
                // xrange chart
                if (chart.userOptions.chart.type === "xrange"){
                    for (const s of chart.series) {
                        // Remove previous path
                        $("#" + s.userOptions.name).remove();
                        // Get nearest point for current series

                        if (!s) {
                            continue
                        }

                        point = s.searchPoint(event, true);

                        if (!point) {
                            continue
                        }

                        // Get corrected coordinates for crosshairs
                        const crossX = point.plotX + chart.plotBox.x;
                        const crossY = point.plotY + chart.plotBox.y - 10;
                        const crossOffSet = point.plotY + chart.plotBox.y + 10;

                        chart.renderer.path(["M", crossX, crossY, "V", crossOffSet])
                            .attr({"stroke-width": 5, stroke: point.color, id:s.userOptions.name, zIndex: -1, opacity: .7})
                            .add()
                    }

                } else {

                    // Get the hovered point
                    point = chart.series[0].searchPoint(event, true);
                    if (point) {
                        point.highlight(e);
                    }
                }
            }
        }
    });

    /**
     * Highlight a point by showing tooltip, setting hover state and draw crosshair
     */
    Highcharts.Point.prototype.highlight = function (event) {
        this.onMouseOver(); // Show the hover marker
        this.series.chart.tooltip.refresh(this); // Show the tooltip
        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };

    const res = await slidingReport(sample);
    await abricateReport(sample, res);
    await prokkaReport(sample, res);
    await chewbbacaReport(sample, res);

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

    $("#modalGraphs").modal("show");

};