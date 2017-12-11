/*
    Charts built with FastQC results
 */

const ProcessFastQcData = async (rawReports) => {

    let processedData = {};

    let gcContent = {},
        nContent = {},
        sequenceQuality = {},
        sequenceContent = {},
        sequenceLength = {};

    for ( const r of rawReports ) {

        const pid = `${r.sample_name}`;

        if ( r.report_json.task === "fastqc" ) {

            const plotData = r.report_json.plotData;

            // Get data for sequence quality
            const qualData = plotData.base_sequence_quality;
            sequenceQuality[pid] = Array.from(qualData.data[0], x => x[1])
        }

    }

    return processedData;
};