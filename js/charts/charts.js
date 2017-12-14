/**
 * Main chart manager and interface for:
 *      - Add/Overwrite data from the reports array
 *      - Triggers chart building and retains a reference to each existing chart
 *      - Get/set specific charts
 */
class ChartManager {

    constructor () {

        this.charts = [];

        // Stores the raw report data
        this.rawData = [];

        // Map of the builder methods for each chart type/container
        this.builder = new Map([
            ["fastqcbaseSequenceQuality",
                {
                    path: "plotData.base_sequence_quality",
                    build: bdFastqcSequenceQuality,
                }
            ]
        ]);
    }

    /**
     * Inserts / appends data into the Charts object using the
     * `addReportData` method by passing the reports array.
     * @param {Array} reportsData - Report data as an array of JSON objects
     * @param {boolean} [overwrite=false=>] append - Whether
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
     *
     */
    async buildAllCharts() {

        for (const [container, opts] of this.builder.entries()) {
            const data = await opts.build(this.rawData, opts.path);
            console.log(data)
            Highcharts.chart(container, data)
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
            return prev ? prev[curr] : null
        }, obj || self)
    };

    const data = new Map;

    for (const r of rawData) {
        // Get unique ID of project + sample name
        const pid = `${r.project_id}.${r.sample_name}`;
        // Find specified task and add plot data JSON to array
        if (r.report_json.task === task) {
            data.set(pid, getValue(r.report_json, path))
        }
    }

    return data
};