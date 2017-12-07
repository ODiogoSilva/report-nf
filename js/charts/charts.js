
/* Charts Class
    - Adds reports to the reports array
    - Constructs charts based on the reportsData array
 */
class Charts {

    constructor() {
        this.reportsData = [];
        this.spadesData = {};
    }

    /* Method to add reports to the global reports */
    async addReportData(reportsData, append) {
        if ( append === "true" ) {
            this.reportsData = await this.reportsData.concat(reportsData);
        } else {
            this.reportsData = reportsData
        }
        return true;
    }

    /*
        Method to build all Spades graphs
        Available at charts/spades.js
    */
    buildSpadesGraphs() {
        processSpadesData(this.reportsData).then((processed_data) => {
            this.spadesData.spadesBoxPlot = buildSpadesBoxPlot(
                processed_data.boxplotSize, "spades_1", "Distribution of contig size"
            );
            this.spadesData.spadesSizeDist = buildSpadesDistribution(
                processed_data.storageDist, "container2", "Distribution of contig size"
            );
        });
    }
}


const sampleSelector = (x) => {

    // Get sample name from click event
    const sample = x.point.name;
    for (const el of innucaTable.tableData){
        if (sample === el.Sample) {
            el.active = 1;
            innucaTable.highlightRow(sample)
        }
    }

};


// console.log(innucaTable.tableData)
// for (const el of innucaTable.tableData) {
//     console.log(el.Sample, this.name)
//     if (this.name === el.Sample) {
//         console.log("here")
//         el.active = 1;
//         console.log(innucaTable.tableData)
//     }
// }
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
