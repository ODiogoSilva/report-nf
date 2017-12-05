const humanReadable = (number) => {
    const suffix = ["", "KB", "MB", "GB", "TB"];
    const i = parseInt(Math.floor(Math.log(number) / Math.log(1000)));
    if (i === 0) return number + " " + suffix[i];
    return (number / Math.pow(1000, i)).toFixed(1) + " " + suffix[i];
};

const populateHeader = (sample) => {

    // Get QC div and add to container
    const qc = innuca_table.getValue(sample, "qc");
    $("#qcContainer").html(qc.clone());

    // Base pairs
    const bp = innuca_table.getValue(sample, "bp")[0].innerText;
    $("#bpContainer").html(humanReadable(bp));

    // Reads
    const reads = innuca_table.getValue(sample, "reads")[0].innerText;
    $("#readsContainer").html(humanReadable(reads));

    // Coverage
    const coverage = innuca_table.getValue(sample, "coverage1st")[0].innerText;
    $("#covContainer").html(humanReadable(coverage));

    // Contigs
    const contigs = innuca_table.getValue(sample, "contigs")[0].innerText;
    $("#contigsContainer").html(humanReadable(contigs));

    // Assembled bp
    const assembledbp = innuca_table.getValue(sample, "assembledbp")[0].innerText;
    $("#assembledContainer").html(humanReadable(assembledbp));

};

/**
 *
 * @param sample
 * @param data
 */
const showModelGraphs = (sample) => {

    if ( sample.hasOwnProperty("point") ) {
        sample = sample.point.name;
    }

    // Set title with sample name
    $("#modalTitle").html(`Hello there, ${sample}`);

    // Populate header row
    populateHeader(sample);

    $("#modalGraphs").modal("show")

};