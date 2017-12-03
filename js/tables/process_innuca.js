/**
 *
 * @param warn_object
 */
const get_qc = (qcObject) => {

    let low = [];
    let moderate = [];
    let high = [];

    const qcPicker = {
        "low": ["#42f480", "A"],
        "moderate": ["#d1cc51", "B"],
        "high": ["#f79d54", "C"],
        "fail": ["#d64944", "F"],
        "error": ["#000000", "E"]
    };
    let qcColor;
    let qcValue;
    let qcMsg;

    // If the current sample has the fails property, return the fail QC
    // badge and exit
    if (Object.keys(qcObject.fails).length !== 0) {
        qcColor = qcPicker.fail[0];
        qcValue = qcPicker.fail[1];
        let fail_msg = Object.values(qcObject.fails).toString().replace("_", " ");
        qcMsg = `<div class='badge-qc tooltip-qc' 
                       style="background: ${qcColor}">
                    <span class='tooltip-qc-text'>
                        <div>
                            <ul>
                                <li>Fail reason:</li>
                                    <ul>${fail_msg}</ul>
                            </ul>
                        </div>
                    </span>${qcValue}</div>`;

        return qcMsg
    }

    // If the sample has not yet finished but did not fail, return the loader
    // div
    if (qcObject.status === "pending"){
        qcMsg = "<div class='loader'></div>";
        return qcMsg
    }

    // If the sample has finished without failing or errors, evaluate the
    // QC grade
    for (const warn of Object.values(qcObject.warnings)) {
        for (const w of warn.value) {
            // Get severity of error
            const severity = w.split(":")[1];
            const warning_cat = w.split(":")[0].replace(/_/g, " ");
            const warn_msg = `<li>${warn.process}: ${warning_cat}</li>`;
            switch (severity) {
                case "low":
                    low.push(warn_msg);
                    low.push(warn_msg);
                    break;
                case "moderate":
                    moderate.push(warn_msg);
                    break;
                case "high":
                    high.push(warn_msg);
                    break;
            }
        }
    }

    // Determine the badge color and grade with the priority being from
    // high to low
    if (high.length > 0) {
        qcColor = qcPicker.high[0];
        qcValue = qcPicker.high[1];
    } else if (moderate.length > 0) {
        qcColor = qcPicker.moderate[0];
        qcValue = qcPicker.moderate[1];
    } else {
        qcColor = qcPicker.low[0];
        qcValue = qcPicker.low[1];
    }

    qcMsg = `<div class='badge-qc tooltip-qc' style="background: ${qcColor}">
                <span class='tooltip-qc-text'>
                    <div>
                        <ul>
                            <li>Low severity:</li>
                                <ul>${low.join("")}</ul>
                            <li>Moderate severity:</li>
                                <ul>${moderate.join("")}</ul>
                            <li>High severity:</li>
                                <ul>${high.join("")}</ul>
                        </ul>
                    </div>
                </span>${qcValue}</div>`;

    return qcMsg

};


/**
 * Function to process INNuca data to load into the DataTable
 * @param reportsData
 */
const processInnuca = (reportsData) => {

    // Instantiate the object with the table data
    const innucaData = {
        "data": {}
    };

    console.log(reportsData);

    let storage = new Map();
    let columns = new Map();
    let qcStorage = new Map();

    // Holds an object containing the table headers tha should be filled with
    // a column bar and an array of their values
    let columnBars = {};
    // These headers are always present in the beginning of the table
    let start_headers = ["", "qc", "id", "Sample"];

    for (const report of reportsData) {

        const projectId = report.project_id;
        const sampleName = report.sample_name;
        const pipelineId = report.pipeline_id;
        const processId = report.process_id;
        const id = `${sampleName}_${pipelineId}`;

        const jr = report.report_json;

        // If the current combination of pipeline_id and sample_name
        // has not been added to the storage object, create a new
        // entry with the sample name key. This ensures that,
        // regardless of the order of the processes in the JSON,
        // there is always a storage entry for any given sample.
        if (!storage.has(id)) {
            // This object is create with a few table items that are always
            // present in the table
            storage.set(id, new Map([
                    ["active", 0],
                    ["Sample", sampleName],
                    ["id", `${projectId}.${pipelineId}`],
                    ["qc", ""]
                ]));
            qcStorage.set(id, {"warnings": {}, "fails": {}});
        }

        // If the current json report has a warnings property, parse the QC
        // results
        if (jr.hasOwnProperty("warnings")) {
            qcStorage.get(id).warnings[processId] = jr.warnings;
        }

        // If the current json report has a fail property, parse to the QC
        // results
        if (jr.hasOwnProperty("fail")) {
            qcStorage.get(id).fails[processId] = jr.fail
        }

        // If the current json report has a table-row property, parse it
        // to the data table
        if (jr.hasOwnProperty("table-row")) {

            // Add each individual cell from the current process id
            for (const cell of jr["table-row"]) {
                const header = cell.header.replace("_", " ");
                storage.get(id).set(header, cell.value);

                // Add the column header to the columns array, if it doesn't
                // exist yet
                if (!columns.has(header)) {
                    columns.set(header, processId)
                }

                // If the current column has the column-bar attribute, add it
                // to the column_bars array
                if (cell.hasOwnProperty("column-bar")){
                    if (!columnBars.hasOwnProperty(header)){
                        columnBars[header] = [cell.value]
                    } else {
                        columnBars[header].push(cell.value)
                    }
                }
            }
        }
    }

    //
    // At this point, the table data and headers were already gathered.
    //

    // Sort the column headers according to the process id
    let sorted_columns = [];
    for (let c of columns.keys()) {
        sorted_columns.push(c)
    }
    sorted_columns.sort((x, y) => {
        return x[1].length - y[1].length;
    });

    // Add the final headers to the table data object
    innucaData.headers = start_headers.concat(sorted_columns);

    innucaData.data = [];
    // Populate table data
    storage.forEach((v, k) => {

        let dataObject = {};

        // Check if current sample has finished
        const last_header = innucaData.headers[innucaData.headers.length - 1];
        if (v.has(last_header)) {
            qcStorage.get(k).status = "finished";
        } else {
            qcStorage.get(k).status = "pending";
        }

        let qc_msg = get_qc(qcStorage.get(k));

        v.set("qc", qc_msg);

        // Iterate over all expected columns in the table. If one or more
        // columns are missing from any given taxa, those columns are filled
        // with NA. This occurs when the pipeline stopped in the middle of the
        // run
        sorted_columns.map((f) => {
            // The field does not exist, fill with NA
            if (!(v.has(f))){
                v.set(f,
                    "<div class='table-cell'>" +
                        "<div class='table-bar-text'>NA</div>" +
                    "</div>")
            // The field exists, do some pre-processing
            } else {
                let prop;
                // Check if the current column has the column-bar attribute.
                // If so, change the value cell to display a column bar
                // based on its value
                if (columnBars.hasOwnProperty(f)){
                    if (f === "trimmed"){
                        prop = parseFloat(v.get(f))
                    } else {
                        prop = (parseFloat(v.get(f)) /
                            Math.max(...columnBars[f])) * 100;
                    }
                    const out_div = `<div class='table-cell'><div class="table-bar-text">${v.get(f)}</div><div class='table-bar' style='width:${prop}%'></div>${v.get(f)}</div>`;
                    v.set(f, out_div)
                }
            }
        });

        // Convert Map to object data type
        v.forEach((v, k) => { dataObject[k] = v });
        innucaData.data.push(dataObject)
    });

    // Create mappings for column headers
    const mappings = innucaData.headers.slice(1).map((x) => {
        return {"data": x}
    });

    innucaData.column_mapping = [
        {
            data:   "active",
            render: function ( data, type, row ) {
                if ( type === 'display' ) {
                    return '<input type="checkbox" class="editor-active">';
                }
                return data;
            },
            className: "dt-body-center"
        },
    ].concat(mappings);

    return innucaData

};