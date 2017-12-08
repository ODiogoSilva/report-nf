
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

    chewbbacaHeaders.push("Profile");

    /* Set column mapping from the headers */
    let chewbbacaColumnMapping = [
        {
            data: "active",
            render: function (data, type, row) {
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
    for (const report of reports_data) {
        if (report.report_json.task === "chewbbaca"){
            let data_object = {
                "active": 0,
                "id": report.sample_name
            }

            Object.keys(report.report_json.cagao[1]).map((key) => {
                if (key !== "header") dataKey = key;
            });

            report.report_json.cagao[1][dataKey].map( (j, i) => {
                data_object[report.report_json.cagao[1].header[i]] = report.report_json.cagao[1][dataKey][i]
            });
            data_object["Profile"] = "<button class='btn btn-md btn-primary'>Profile</button>"
            chewbbacaDataArray.push(data_object);

        }
    }

    chewbbacaData.headers = chewbbacaHeaders;
    chewbbacaData.columnMapping = chewbbacaColumnMapping;
    chewbbacaData.data = chewbbacaDataArray;

    return chewbbacaData;

};