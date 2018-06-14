/*globals chewbbacaToReportId, chewbbacaTable, data, sendFile */
/*
    Function to process chewBBACA data to load into the DataTable
 */


const chewbbacaHeaderTooltip = (settings) => {

    const idMap = {
        "EXC": "Exact match",
        "INF": "Inferred allele",
        "LNF": "Locus not found",
        "PLOT": "Possible locus on tip",
        "NIPH": "Non informative paralog hit",
        "ALM": "Allele larger than mode",
        "ASM": "Allele smaller than mode"
    };

    $.map($("#master_table_chewbbaca_wrapper .dataTables_scrollHeadInner thead th"), (el) => {
        const headerSel = $(el);
        const headerId = headerSel[0].innerText;
        if (idMap.hasOwnProperty(headerId)){
            headerSel.attr("data-toggle", "tooltip");
            headerSel.attr("data-placement", "top");
            headerSel.attr("title", idMap[headerId]);
        }
    })

};


const processChewbbaca = (reportsData, metadata) => {

    const chewbbacaData = {};
    let chewbbacaHeaders = ["", "id", "Sample", "Species ID", "Classifier"];
    let dataKey = "";
    const chewbbacaDataArray = [];

    const refDict = {"fail": "label-danger", "warning": "label-warning", "pass": "label-success"};

    const taskExp = new RegExp(`^chewbbaca_[0-9]`);

    /* Get headers */
    let firstTime = true;
    for (const report of reportsData) {
        if (taskExp.test(report.report_json.task) ){
            if (firstTime) {
                chewbbacaHeaders = chewbbacaHeaders.concat(report.report_json.cagao[1].header);
                firstTime = false;
                break;
            }
        }
    }

    /* Set column mapping from the headers */
    let chewbbacaColumnMapping = [
        {
            data: "active",
            render(data, type, row) {
                if (type === "display") {
                    return "<input type='checkbox' class='editor-active'>";
                }
                return data;
            },
            className: "dt-body-center"
        },
        {data: "status", title: "chewBBACA Status"}
    ];

    chewbbacaHeaders.map((x) => {
        if (x === "Sample") {
            chewbbacaColumnMapping.push({"data": "Sample", "title":"Sample"});
        }
        else if (x !== "") {
            chewbbacaColumnMapping.push({"data": x, "title":x});
        }
    });

    /* Get data for each strain to add to the table */

    for (const [index, report] of reportsData.entries()) {
        if (taskExp.test(report.report_json.task)){
            chewbbacaToReportId[report.sample_name] = report.project_id + "." + report.pipeline_id + "." +report.process_id;

            let dataObject = {
                "active": 0,
                "id": `${report.project_id}.${report.pipeline_id}`
            };

            if (!report.report_json.cagao){
                continue;
            }

            Object.keys(report.report_json.cagao[1]).map((key) => {
                if (key !== "header") {
                    dataKey = key;
                }
            });

            dataObject["Sample"] = report.sample_name;

            const lnfPercentage = parseFloat(report.report_json.lnfPercentage) * 100;
            dataObject["status"] = `<div style="text-align: center"><div data-toggle="tooltip" data-placement="top" title="${lnfPercentage.toFixed(2)}% core loci not found" class="label ${refDict[report.report_json.status]}">${report.report_json.status}</div></div>`;

            report.report_json.cagao[1][dataKey].map( (j, i) => {
                dataObject[report.report_json.cagao[1].header[i]] = report.report_json.cagao[1][dataKey][i];
            });

            dataObject["project_id"] = report.project_id;
            dataObject["pipeline_id"] = report.pipeline_id;
            dataObject["process_id"] = report.process_id;

            for (const [index1, metadataentry] of metadata.entries()){
                if (metadataentry.strainID === report.sample_name){
                    dataObject["Classifier"] = metadataentry.classifier;
                    dataObject["Species ID"] = metadataentry.species_id;
                    break;
                }
            }

            chewbbacaDataArray.push(dataObject);

        }
    }

    chewbbacaData.headers = chewbbacaHeaders;
    chewbbacaData.columnMapping = chewbbacaColumnMapping;
    chewbbacaData.data = chewbbacaDataArray;

    return chewbbacaData;

};

/**
 * Construct table dependent on the species selected.
 * @param speciesName
 */
const rebuildChewbbaca = (speciesName) => {

    let species_id = "";

    $.map(chewbbacaTable.tableObj.rows().nodes(), (r) => {
        if($(r).hasClass("selected")){
            $(r).find("input").trigger("click");
        }
    });

    /*chewbbacaTable
        .tableObj.rows().deselect();*/

    chewbbacaTable
        .tableObj
        .columns( 4 ).search('').draw();

    for (const s of speciesDatabase){
        if (speciesName === s.name){
            species_id = s.species_id
        }
    }

    console.log("filter");
    // Filter table content based on species id
    chewbbacaTable
        .tableObj
        .columns( 4 ).search(species_id).draw();

    populateSelectPHYLOViZ("species_database", speciesDatabase, species_id);

};

/**
 * Download profiles from chewbbaca in a tab-delimited format
 */
const downloadProfiles = () => {
    const selectedData = chewbbacaTable.tableObj.rows('.selected').data();
    let headers = ["FILE"];
    let body = [];
    let firstTime = true;
    let dataKey;
    let auxBody = [];

    if (selectedData.length === 0) {
        return false;
    }

    selectedData.each((value, i) => {
        for (const [index, report] of data.results.entries()){
            const indexToCheck = report.project_id + "." + report.pipeline_id + "." +report.process_id;
            if (indexToCheck === chewbbacaToReportId[value.Sample]) {

                auxBody = [];

                if (firstTime) {
                    firstTime = false;
                    headers = headers.concat(report.report_json.cagao[0].header);
                }

                for (const d in report.report_json.cagao[0]) {
                    if (d !== "header"){
                        dataKey = d;
                        break;
                    }
                }

                auxBody.push(report.sample_name);
                auxBody = auxBody.concat(report.report_json.cagao[0][dataKey]);
                body.push(auxBody);

            }
        }
    });

    // Create string for user to download
    let downloadString = "";
    downloadString += (headers.join("\t") + "\n");

    for (const profile of body) {
        downloadString += (profile.join("\t") + "\n");
    }

    // Send to download
    const fileName = Math.random().toString(36).substring(7);
    sendFile(fileName, downloadString);
    return true;


};
