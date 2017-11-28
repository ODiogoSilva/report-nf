
/* Charts Class
    - Adds reports to the reports array
    - Constructs charts based on the reports_data array
 */
class Charts {

    constructor() {
        this.reports_data = [];
        this.spades_data = {};
    }

    /* Method to add reports to the global reports */
    async addReportData(reports_data) {
        this.reports_data = await this.reports_data.concat(reports_data);
        return true;
    }

    /*
        Method to build all Spades graphs
        Available at charts/spades.js
    */
    buildSpadesGraphs() {
        processSpadesData(this.reports_data).then((processed_data) => {
            this.spades_data.spades_size_graph = buildSpadesBoxPlot(
                processed_data.boxplot_size, "spades_1", "Distribution of contig size"
            );
            this.spades_data.spades_size_graph = buildSpadesDistribution(
                processed_data.boxplot_cov, "spades_2", "Distribution of contig size"
            );
        });
    }

}


/*
const charts_ar = [c1, c2];

$("#test").click(function () {

    for (const c of charts_ar) {
        c.update({
            xAxis: {
                categories: ["1", "2", "3", "4", "M", "J", "J", "A", "S", "O", "N", "D"]
            },
            series: [{
                data: [10, 10, 10, 10, 10, 10, 10, 1, 1, 1, 1, 1]
            }]
        })
    }
});
*/
