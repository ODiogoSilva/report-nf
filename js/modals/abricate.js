
const getGeneLists = (entry) => {

    let abricateGenes = {};

    for (const el of Object.keys(entry)) {
        if (el.endsWith("geneList")) {
            const dbKey = el.replace("geneList", "");
            abricateGenes[dbKey] = entry[el].sort();
        }
    }

    return abricateGenes

};


const showAbricateModal = (sampleId, sampleName) => {

    let abricateGenes = [];

    $("#abricateModal").modal("show");

    $("#abricateModalTitle").html(`Anti-microbial annotation gene list for sample: <b>${sampleName}</b>`);

    // Get abricate info from sample id
    for (const el of abricateTable.tableData) {
        if ($(el.id).html() === sampleId) {
            abricateGenes = getGeneLists(el);
        }
    }

    // Populate modal
    for (const db of Object.keys(abricateGenes)) {
        const dbSel = $("#" + db);
        dbSel.empty();
        for (const gene of abricateGenes[db]) {
            const itemDiv = `<li class="list-group-item">${gene}<button type="button" class="btn btn-default abricate-btn"><i class="fa fa-bullseye"></i></button></li>`;
            dbSel.append(itemDiv)
        }
    }

};