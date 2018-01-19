/*globals chewbbacaToReportId, chewbbacaTable, data, sendFile */
/*
    Function to process chewBBACA data to load into the DataTable
 */

const processChewbbaca = (reportsData) => {

    const chewbbacaData = {};
    let chewbbacaHeaders = ["", "id", "Sample"];
    let dataKey = "";
    const chewbbacaDataArray = [];

    /* Get headers */
    let firstTime = true;
    for (const report of reportsData) {
        if (report.report_json.task === "chewbbaca"){
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
        }
    ];

    chewbbacaHeaders.map((x) => {
        if (x === "Sample") {
            chewbbacaColumnMapping.push({"data": "sample_name", "title":"Sample"});
        }
        else if (x !== "") {
            chewbbacaColumnMapping.push({"data": x, "title":x});
        }
    });

    /* Get data for each strain to add to the table */

    for (const [index, report] of reportsData.entries()) {
        if (report.report_json.task === "chewbbaca"){

            chewbbacaToReportId[report.sample_name] = index;

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

            dataObject["sample_name"] = report.sample_name;

            report.report_json.cagao[1][dataKey].map( (j, i) => {
                dataObject[report.report_json.cagao[1].header[i]] = report.report_json.cagao[1][dataKey][i];
            });

            dataObject["project_id"] = report.project_id;
            dataObject["pipeline_id"] = report.pipeline_id;
            dataObject["process_id"] = report.process_id;

            chewbbacaDataArray.push(dataObject);

        }
    }

    chewbbacaData.headers = chewbbacaHeaders;
    chewbbacaData.columnMapping = chewbbacaColumnMapping;
    chewbbacaData.data = chewbbacaDataArray;

    return chewbbacaData;

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
        for (const [index, report] of data.entries()){
            if (index === chewbbacaToReportId[value.id]) {
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
