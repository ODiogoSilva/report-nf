/*globals abricateTable */

const getGeneLists = (entry) => {

    let abricateGenes = {};

    for (const el of Object.keys(entry)) {
        if (el.endsWith("geneList")) {
            const dbKey = el.replace("geneList", "");
            abricateGenes[dbKey] = entry[el].sort();
        }
    }

    return abricateGenes;

};


const findAbricateGene = async (sampleId, geneName, database) => {

    // Show sample specific modal
    showModelGraphs(sampleId);

    const modalSel = $("#modalGraphs");

    // Trigger actions only after the modal graph has been shown
    modalSel.off("shown.bs.modal").on("shown.bs.modal", () => {

        document.getElementById("sync-sw-abricate").scrollIntoView(true);

        const abricateSel = $("#abricateSelectize")[0].selectize;

        abricateSel.addItem(geneName);
        console.log(geneName)
        console.log(abricateSel)
        $("#abricateSearch").trigger("click");

    });


    modalSel.on("hidden.bs.modal", () => {
        modalSel.off("shown.bs.modal");

    })

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
        const dbSel = $("#modal" + db);
        const sid = `${sampleId.split(".")[0]}.${sampleName.replace(/ /g,"")}`;
        dbSel.empty();
        for (const gene of abricateGenes[db]) {
            const itemDiv = `<li class="list-group-item">${gene}<button onclick="findAbricateGene('${sid}', '${gene}', '${db}')" type="button" class="btn btn-default abricate-btn"><i class="fa fa-bullseye"></i></button></li>`;
            dbSel.append(itemDiv);
        }
    }

};