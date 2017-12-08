/**
 *
 * @param qcObject
 */
const getQc = (qcObject) => {

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
        let failMsg = Object.values(qcObject.fails).toString().replace(/_/g, " ");
        qcMsg = `<div id="qc" class='badge-qc tooltip-qc' 
                       style="background: ${qcColor}">
                    <span class='tooltip-qc-text'>
                        <div>
                            <ul>
                                <li>Fail reason:</li>
                                    <ul><li>${failMsg}</li></ul>
                            </ul>
                        </div>
                    </span>${qcValue}</div>`;

        return qcMsg
    }

    // If the sample has not yet finished but did not fail, return the loader
    // div
    if (qcObject.status === "pending"){
        qcMsg = "<div class='loader'></div>";
        return qcMsg;
    }

    // If the sample has finished without failing or errors, evaluate the
    // QC grade
    for (const warn of Object.values(qcObject.warnings)) {
        for (const w of warn.value) {
            // Get severity of error
            const severity = w.split(":")[1];
            const warningCat = w.split(":")[0].replace(/_/g, " ");
            const warnMsg = `<li>${warn.process}: ${warningCat}</li>`;
            switch (severity) {
                case "low":
                    low.push(warnMsg);
                    low.push(warnMsg);
                    break;
                case "moderate":
                    moderate.push(warnMsg);
                    break;
                case "high":
                    high.push(warnMsg);
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

    qcMsg = `<div id="qc" class='badge-qc tooltip-qc' style="background: ${qcColor}">
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

    return qcMsg;

};

/**
 * Sets the maximum value for the dataFilters
 * @param header
 * @param value
 */
const setMaxFilters = (header, value) => {

    sliderMap = new Map([
        ["bp", $("#sliderbp")],
        ["reads", $("#sliderrn")],
        ["coverage (2nd)", $("#sliderc")],
        ["contigs", $("#slidercn")],
        ["assembled bp", $("#sliderabp")]
    ]);

    // Skip, if header is not present in filters object
    if (!dataFilters.hasOwnProperty(header)) {return}

    if ( value > dataFilters[header].max ) {
        dataFilters[header].max = value;
        sliderMap.get(header).slider({max: value});
        sliderMap.get(header).slider("setValue", [0, value]);
    }

};

/**
 * Function to process INNuca data to load into the DataTable
 * @param reportsData
 */
const processInnuca = (reportsData, setMax) => {

    // Instantiate the object with the table data
    const innucaData = {
        "data": {}
    };

    let storage = new Map();
    let storageIds = [];
    let columns = new Map();
    let qcStorage = new Map();

    // Holds an object containing the table headers tha should be filled with
    // a column bar and an array of their values
    let columnBars = {};
    // These headers are always present in the beginning of the table
    let startHeaders = ["", "qc", "id", "Sample"];

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
            storageIds.push(id);
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
            qcStorage.get(id).fails[processId] = jr.fail;
        }

        // If the current json report has a table-row property, parse it
        // to the data table
        if (jr.hasOwnProperty("tableRow")) {

            // Add each individual cell from the current process id
            for (const cell of jr.tableRow) {
                const header = cell.header.replace("_", " ");
                storage.get(id).set(header, cell.value);

                // Add the column header to the columns array, if it doesn't
                // exist yet
                if (!columns.has(header)) {
                    columns.set(header, processId);
                }

                // If the current column has the column-bar attribute, add it
                // to the column_bars array
                if (cell.hasOwnProperty("columnBar")){
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
    columns = [...columns.entries()].sort( (a,b) => {return a[1] - b[1]});
    let sortedColumns = [];
    for (let c of columns) {
        sortedColumns.push(c[0]);
    }

    // Add the final headers to the table data object
    innucaData.headers = startHeaders.concat(sortedColumns);

    innucaData.data = [];
    // Populate table data
    storage.forEach((v, k) => {

        let dataObject = {};

        // Check if current sample has finished
        const lastHeader = innucaData.headers[innucaData.headers.length - 1];
        if (v.has(lastHeader)) {
            qcStorage.get(k).status = "finished";
        } else {
            qcStorage.get(k).status = "pending";
        }

        // Get QC message for a sample
        let qcMsg = getQc(qcStorage.get(k));
        v.set("qc", qcMsg);

        // Iterate over all expected columns in the table. If one or more
        // columns are missing from any given taxa, those columns are filled
        // with NA. This occurs when the pipeline stopped in the middle of the
        // run
        sortedColumns.map((f) => {
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
                        maxValue = Math.max(...columnBars[f]);
                        prop = (parseFloat(v.get(f)) / maxValue) * 100;
                        // Set/Update maximum filters value
                        if ( setMax === true ) {setMaxFilters(f, maxValue)}
                    }
                    const outDiv = `<div id="${f.replace(/ |\(|\)/g, "")}" class='table-cell'><div class='table-bar' style='width:${prop}%'></div>${v.get(f)}</div>`;
                    v.set(f, outDiv);
                }
            }
        });

        // Convert Map to object data type
        v.forEach((v, k) => { dataObject[k] = v });
        innucaData.data.push(dataObject);
    });

    // Create mappings for column headers
    const mappings = innucaData.headers.slice(1).map((x) => {
        return {"data": x, "title": x};
    });

    innucaData.columnMapping = [
        {
            data:   "active",
            render: function ( data, type, row ) {
                if ( type === "display" ) {
                    return '<input type="checkbox" class="editor-active">';
                }
                return data;
            },
            className: "dt-body-center"
        },
    ].concat(mappings);

    innucaData.ids = storageIds;

    console.log(innucaData);

    return innucaData;

};