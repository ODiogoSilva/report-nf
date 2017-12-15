
/*
    Function to process chewBBACA data to load into the DataTable
 */

const processChewbbaca = (reports_data) => {

    const chewbbacaData = {};
    let chewbbacaHeaders = ["", "id"];
    let dataKey = "";
    const chewbbacaDataArray = [];

    /* Get headers */
    let firstTime = true;
    for (const report of reports_data) {
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
                if (type === 'display') {
                    return '<input type="checkbox" class="editor-active">';
                }
                return data;
            },
            className: "dt-body-center"
        }
    ];

    chewbbacaHeaders.map((x) => {
        if (x !== "") chewbbacaColumnMapping.push({"data": x, "title":x});
    });

    /* Get data for each strain to add to the table */

    for (const [index, report] of reports_data.entries()) {
        if (report.report_json.task === "chewbbaca"){

            chewbbacaToReportId[report.sample_name] = index;

            let data_object = {
                "active": 0,
                "id": report.sample_name
            };

            Object.keys(report.report_json.cagao[1]).map((key) => {
                if (key !== "header") dataKey = key;
            });

            report.report_json.cagao[1][dataKey].map( (j, i) => {
                data_object[report.report_json.cagao[1].header[i]] = report.report_json.cagao[1][dataKey][i]
            });

            chewbbacaDataArray.push(data_object);

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

    selectedData.each((value, i) =>{
        for (const [index, report] of data.entries()){
            if (index === chewbbacaToReportId[value.id]) {
                auxBody = [];

                if (firstTime) {
                    firstTime = false;
                    headers = headers.concat(report.report_json.cagao[0].header);
                }

                for (d in report.report_json.cagao[0]) {
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

    for (const profile in body) {
        downloadString += (body[profile].join("\t") + "\n")
    }

    // Send to download
    const fileName = Math.random().toString(36).substring(7);
    sendFile(fileName, downloadString);
    return true;


};
