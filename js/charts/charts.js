/*globals Highcharts, bdFastqcBaseSequenceQuality, HighlightLineSeries, bdFastqcSequenceQuality, bdFastqcGcContent, bdFastqcSequenceLength, bdFastqcNContent, assemblyContigSize, highlightBoxPlot */

/**
 * Main chart manager and interface for:
 *      - Add/Overwrite data from the reports array
 *      - Triggers chart building and retains a reference to each existing chart
 *      - Highlight samples/series for charts
 */
class ChartManager {

    constructor () {

        // Stores the raw report data
        this.rawData = [];

        // Map of the builder methods for each chart type/container
        this.charts = new Map([
            // HTML container of the chart
            ["fastqcbaseSequenceQuality",
                {
                    // JSON 'location' of the data relevant to the plot
                    path: "plotData.base_sequence_quality",
                    // Reference to the function that will build the chart
                    build: bdFastqcBaseSequenceQuality,
                    // Reference to the function that will be called to
                    // highlight samples
                    highlight: HighlightLineSeries,
                    // Will store the JSON object with the necessary
                    // information to produce the chart
                    chartOptions: null,
                    // Determine whether the plot should be built when calling
                    // buildAllCharts or not. False values are for plots
                    // that are in tabbed containers and are not immediately
                    // shown.
                    atInit: true
                }
            ],
            ["fastqcsequenceQuality",
                {
                    path: "plotData.sequence_quality",
                    build: bdFastqcSequenceQuality,
                    highlight: HighlightLineSeries,
                    chartOptions: null,
                    atInit: false,
                }
            ],
            ["fastqcgcContent",
                {
                    path: "plotData.base_gc_content",
                    build: bdFastqcGcContent,
                    highlight: HighlightLineSeries,
                    chartOptions: null,
                    atInit: false
                }
            ],
            ["fastqcsequenceLength",
                {
                    path: "plotData.sequence_length_dist",
                    build: bdFastqcSequenceLength,
                    highlight: HighlightLineSeries,
                    chartOptions: null,
                    atInit: false
                }
            ],
            ["fastqcnContent",
                {
                    path: "plotData.base_n_content",
                    build: bdFastqcNContent,
                    highlight: HighlightLineSeries,
                    chartOptions: null,
                    atInit: false
                }
            ],
            ["assemblyContigSize",
                {
                    path: "plotData.size_dist",
                    build: assemblyContigSize,
                    highlight: highlightBoxPlot,
                    chartOptions: null,
                    atInit: true
                }
            ]
        ]);
    }

    /**
     * Inserts/appends data into the Charts object using the
     * `addReportData` method by passing the reports array.
     * @param {Array} reportsData - Report data as an array of JSON objects
     * @param {boolean} [overwrite=false=>] append - When true, overwrites the
     * `rawData` property with the provided reports. Otherwise, appends to it.
     * @returns {Promise.<void>}
     */
    async addReportData(reportsData, overwrite) {
        // Set default value to append
        if ( !overwrite ) {
            overwrite = false;
        }

        if ( overwrite === true ) {
            this.rawData = await this.rawData.concat(reportsData);
        } else {
            this.rawData = reportsData;
        }
    }

    /**
     * Wrapper that builds all plots stored in the `charts` Map object.
     * Each value in the `charts` Map is expected to be a JSON object with
     * the `build` key that contains the build function as a value. This
     * means that all charts can be built by using simply:
     *
     *      this.chart.get("SomeChart").build(*args)
     *
     * After each chart is built, the chartOptions is updated with the new
     * chart and the chart is rendered into the corresponding container if
     * the `atInit` property of the JSON is true.
     */
    async buildAllCharts() {

        for (const [container, obj] of this.charts.entries()) {
            // Call the builder function and provide the rawData array
            const chartJson = await obj.build(this.rawData, obj.path);
            obj.chartOptions = chartJson;
            // Build plots scheduled for the init
            if (obj.atInit === true) {
                this.buildChart(container);
            }
        }
    }

    /**
     * Renders a chart to the corresponding container.
     *
     * The only required information is the `container` argument. This
     * method will fetch the `chartOptions` for the corresponding
     * container from the `charts` property.
     *
     * By default the chart is not rendered if it is already present
     * in the HTML. The `redraw` options allows forcing the redrawing
     * of the chart, which triggers the animation.
     *
     * @param {String} container - ID of the HTML container where
     * the chart should be rendered.
     * @param {boolean} redraw - If true, forces the chart redrawing
     * even if it was already rendered.
     */
    buildChart(container, redraw) {

        // Set default value for redraw to not repeat the drawing
        // of a chart
        if (!redraw) {
            redraw = false;
        }

        const c = $("#" + container).highcharts();

        if (c) {
           if (redraw === true) {
               c.destroy();
               this.buildChart(container);
           }
        } else {
            // Get chart options for this container
            Highcharts.chart(container, this.charts.get(container).chartOptions);
        }
    }

    /**
     * Wrapper that highlights/selects of any number of samples
     *
     * If the charts in the `charts` property have the `highlight` key,
     * the function in the corresponding value will be called to
     * do the highlighting/selection of that chart. If the chart does not
     * have a `highlight` key, then it is ignored.
     *
     * The required argument is an array of objects that must contain two
     * key:value pairs:
     *
     *      [{samples: ["A", "B", "C"], color: "red"},
     *       {samples: ["D", "E"], color: "blue"}]
     *
     * @param [Array] selection
     */
    async highlightCharts(selection){
        for (const [container, opts] of this.charts.entries()) {

            // Ignore charts that lack the highlight method
            if (opts.highlight === undefined){
                continue;
            }

            // If the chart has not be initialized, force it
            if (!$("#" + container).highcharts()) {
                this.buildChart(container);
            }

            // Call the highlighter function
            const chartObj = $("#" + container).highcharts();
            opts.highlight(chartObj, [{samples: ["1.HSM742d0C1_S37"], color:"blue"}]);

        }
    }

}


class Chart {

    /**
     *
     * @param chartOptions
     */
    constructor (opts) {

        this.title = opts.title;
        this.axisLabels = opts.axisLabels;
        this.series = opts.series;

        this.layout = {
            chart: {
                zoomType: "x"
            },
            title: {
                text: this.title
            },
            plotOptions: {},
            legend: {
                enabled: false
            },
            xAxis: {
                title: {
                    text: this.axisLabels.x
                }
            },
            yAxis: {
                title: {
                    text: this.axisLabels.y
                }
            },
            series: this.series
        };
    }
    extend(key, obj) {
        $.extend(this.layout[key], obj);
    }
}


const getTaskReport = (rawData, task, path) => {

    const getValue = (obj, path) => {
        return path.split(".").reduce((prev, curr) => {
            return prev ? prev[curr] : null;
        }, obj || self);
    };

    const data = new Map;

    for (const r of rawData) {
        // Get unique ID of project + sample name
        const pid = `${r.project_id}.${r.sample_name}`;
        // Find specified task and add plot data JSON to array
        if (r.report_json.task === task) {
            data.set(pid, getValue(r.report_json, path));
        }
    }

    return data;
};