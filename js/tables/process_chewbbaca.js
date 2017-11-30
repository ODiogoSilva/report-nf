
/*
    Function to process chewBBACA data to load into the DataTable
 */

const processChewbbaca = (reports_data) => {

    const chewbbaca_data = {};
    let chewbbaca_headers = ["", "id"];
    let data_key = "";
    const chewbbaca_data_array = [];

    /* Get headers */
    let firstTime = true;
    for (const report of reports_data) {
        if (report.report_json.task === "chewbbaca"){
            if (firstTime) {
                chewbbaca_headers = chewbbaca_headers.concat(report.report_json.cagao[1].header);
                firstTime = false;
                Object.keys(report.report_json.cagao[1]).map((key) => {
                    if (key !== "header") data_key = key;
                });
                break;
            }
        }
    }

    chewbbaca_headers.push("Profile");

    /* Set column mapping from the headers */
    let chewbbaca_column_mapping = [
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

    chewbbaca_headers.map((x) => {
        if (x !== "") chewbbaca_column_mapping.push({"data": x});
    });

    /* Get data for each strain to add to the table */
    for (const report of reports_data) {
        if (report.report_json.task === "chewbbaca"){
            let data_object = {
                "active": 0,
                "id": report.sample_name
            }

            report.report_json.cagao[1][data_key].map( (j, i) => {
                data_object[report.report_json.cagao[1].header[i]] = report.report_json.cagao[1][data_key][i]
            });
            data_object["Profile"] = "<button class='btn btn-md btn-primary'>Profile</button>"
            chewbbaca_data_array.push(data_object);

        }
    }

    chewbbaca_data.headers = chewbbaca_headers;
    chewbbaca_data.column_mapping = chewbbaca_column_mapping;
    chewbbaca_data.data = chewbbaca_data_array;

    return chewbbaca_data;

};