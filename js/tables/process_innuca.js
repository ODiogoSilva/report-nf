/**
 * Function to process INNuca data to load into the DataTable
 * @param reports_data
 */
const processInnuca = (reports_data) => {

    // Instantiate the object with the table data
    const innuca_data = {
        "data": {}
    };


    let columns = {};
    let storage = {};
    let warnings = {};
    // Holds an object containing the table headers tha should be filled with
    // a column bar and an array of their values
    let column_bars = {};
    // These headers are always present in the beginning of the table
    let start_headers = ["", "qc", "id", "Sample"];

    for (const report of reports_data) {

        const project_id = report.project_id;
        const sample_name = report.sample_name;
        const pipeline_id = report.pipeline_id;
        const process_id = report.process_id;
        const id = `${sample_name}_${pipeline_id}`;

        const jr = report.report_json;

        // If the current combination of pipeline_id and sample_name
        // has not been added to the storage object, create a new
        // entry with the sample name key. This ensures that,
        // regardless of the order of the processes in the JSON,
        // there is always a storage entry for any given sample.
        if (!storage[id]) {
            // This object is create with a few table items that are always
            // present in the table
            storage[id] =
                {
                    "active": 0,
                    "Sample": sample_name,
                    "id": `${project_id}.${pipeline_id}`,
                    "qc": ""
                };
            warnings[id] = {}
        }

        // If the current json report has a warnings property, parse the QC
        // results
        if (jr.hasOwnProperty("warnings")) {
            warnings[id][process_id] = jr.warnings;
        }

        // If the current json report has a table-row property, parse it
        // to the data table
        if (jr.hasOwnProperty("table-row")) {

            // Add each individual cell from the current process id
            for (const cell of jr["table-row"]) {
                header = cell.header;
                storage[id][cell.header] = cell.value;

                // Add the column header to the columns array, if it doesn't
                // exist yet
                if (!columns.hasOwnProperty(cell.header)) {
                    columns[cell.header] = process_id
                }

                // If the current column has the column-bar attribute, add it
                // to the column_bars array
                if (cell.hasOwnProperty("column-bar")){
                    if (!column_bars.hasOwnProperty(cell.header)){
                        column_bars[cell.header] = [cell.value]
                    } else {
                        column_bars[cell.header].push(cell.value)
                    }
                }
            }
        }
    }

    //
    // At this point, the table data and headers were already gathered.
    //

    // Sort the column headers according to the process id
    let sorted_columns = Object.keys(columns).sort((a, b) => {
        return columns[a].localeCompare(columns[b])
    });

    // Add the final headers to the table data object
    innuca_data.headers = start_headers.concat(sorted_columns);

    // Populate table data
    innuca_data.data = Object.keys(storage).map((x) => {

        qc_msg = get_qc(warnings[x]);

        storage[x]["qc"] = qc_msg;

        // Iterate over all expected columns in the table. If one or more
        // columns are missing from any given taxa, those columns are filled
        // with NA. This occurs when the pipeline stopped in the middle of the
        // run
        sorted_columns.map((f) => {
            // The field does not exist, fill with NA
            if (!(storage[x].hasOwnProperty(f))){
                storage[x][f] = "NA"
            // The field exists, do some pre-processing
            } else {
                let prop;
                // Check if the current column has the column-bar attribute.
                // If so, change the value cell to display a column bar
                // based on its value
                if (column_bars.hasOwnProperty(f)){
                    if (f === "trimmed"){
                        prop = parseFloat(storage[x][f])
                    } else {
                        prop = (parseFloat(storage[x][f]) /
                            Math.max(...column_bars[f])) * 100;
                    }
                    const out_div = `<div class='table-cell'><div class="table-bar-text">${storage[x][f]}</div><div class='table-bar' style='width:${prop}%'></div>${storage[x][f]}</div>`;
                    storage[x][f] = out_div
                }
            }
        });
        return storage[x]
    });

    // Create mappings for column headers
    const mappings = innuca_data.headers.slice(1).map((x) => {
        return {"data": x}
    });

    innuca_data.column_mapping = [
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

    console.log(innuca_data);

    return innuca_data

};

/**
 *
 * @param warn_object
 */
const get_qc = (warning_object) => {

    let low = [];
    let moderate = [];
    let high = [];

    const qc_picker = {
        "low": ["#42f480", "A"],
        "moderate": ["#d1cc51", "B"],
        "high": ["#f79d54", "C"]
    };
    let qc_color;
    let qc_value;

    for (warn of Object.values(warning_object)) {
        for (w of warn.value) {
            // Get severity of error
            const severity = w.split(":")[1];
            const warn_msg = `<li>${warn.process}: ${w.split(":")[0]}</li>`;
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
                    break
            }
        }
    }

    if (high.length > 0) {
        qc_color = qc_picker.high[0];
        qc_value = qc_picker.high[1];
    } else if (moderate.length > 0) {
        qc_color = qc_picker.moderate[0];
        qc_value = qc_picker.moderate[1];
    } else {
        qc_color = qc_picker.low[0];
        qc_value = qc_picker.low[1];
    }

    // for (ar of [low, moderate, high]) {
    //     console.log(ar)
    // }

    qc_msg = `<div class='badge-qc tooltip-qc' style="background: ${qc_color}">
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
                </span>${qc_value}</div>`;
    console.log(qc_msg)

    return qc_msg

}