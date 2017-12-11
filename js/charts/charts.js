
/* Charts Class
    - Adds reports to the reports array
    - Constructs charts based on the reportsData array
 */
class Charts {

    constructor() {
        this.reportsData = [];
        this.spadesData = {};
        this.fastqcData = {};
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

    /*
        Method to build all Spades graphs
        Available at charts/spades.js
    */
    buildFastQcGraphs() {
        ProcessFastQcData(this.reportsData).then((processedData) => {
            this.fastqcData.sequenceQualityPlot = buildFqBaseQualPlot(
                processedData.baseSequenceQuality, "fastqcBaseSequenceQuality", "Per base sequence quality scores"
            );
            this.fastqcData.sequenceQualityPlot = buildFqQualPlot(
                processedData.sequenceQuality, "fastqcSequenceQuality", "Per base sequence quality scores"
            );
            this.fastqcData.gcContent = buildFqGenericLine(
                processedData.gcContent, "fastqcGcContent",
                "GC distribution over all sequences ", {x: "GC percentage", y: "Read percentage"}
            );
            this.fastqcData.gcContent = buildFqGenericLine(
                processedData.sequenceLength, "fastqcSequenceDistribution",
                "Distribution of sequence length", {x: "Base pair", y: "count"}
            );
            this.fastqcData.gcContent = buildFqGenericLine(
                processedData.nContent, "fastqcBaseNContent",
                "Per base N content", {x: "Base pair", y: "Count"}
            );
        })
    }
}
