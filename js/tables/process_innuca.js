/*globals sliderMap, dataFilters, projectSampleMap */

/**
 *
 * @param qcObject
 */
const getQc = (qcObject, sample) => {

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
        qcDiv = `<div id=${sample} class='badge-qc tooltip-qc' 
                       style="background: ${qcColor}">
                    ${qcValue}</div>`;
        qcMsg = `<span class='tooltip-qc-text'>
                        <div>
                            <ul>
                                <li>Fail reason:</li>
                                    <ul><li>${failMsg}</li></ul>
                            </ul>
                        </div>
                    </span>`;
        return {
            qcDiv,
            qcMsg
        };
    }

    // If the sample has not yet finished but did not fail, return the loader
    // div
    if (qcObject.status === "pending"){
        qcDiv = "<div class='loader'></div>";
        return {
            qcDiv
        };
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

    qcDiv = `<div id=${sample} class='badge-qc tooltip-qc' style="background: ${qcColor}">
                ${qcValue}</div>`;
    qcMsg = `<span class='tooltip-qc-text'>
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
                </span>`;

    return {
        qcDiv,
        qcMsg
    };

};

/**
 * Sets the maximum value for the dataFilters
 * @param header
 * @param value
 */
const setMaxFilters = (header, value) => {

    const sliderMap = new Map([
        ["bp", $("#sliderbp")],
        ["reads", $("#sliderrn")],
        ["coverage (2nd)", $("#sliderc")],
        ["contigs", $("#slidercn")],
        ["assembled bp", $("#sliderabp")]
    ]);

    // Skip, if header is not present in filters object
    if (!dataFilters.hasOwnProperty(header)) {return;}

    if ( value > dataFilters[header].max ) {
        dataFilters[header].max = value;
        sliderMap.get(header).slider({max: value});
        sliderMap.get(header).slider("setValue", [0, value]);
    }

};

/**
 * Parses the raw JSON report data and returns processed data for building
 * the summary table.
 *
 * @param reportJSON (Array): Array of objects containing the report JSON data
 * @returns {{storage: Map, sortedColumns: Array, storageIds: Array, qcStorage: Map, columnBars: {}, headers: Array}}
 *
 *      - storage (Map): Maps each sample id (sample name + pipeline id) to
 *      another Map object containing the key:value pairs for each cell in the
 *      table. Example: [("active", 0), ("Sample", "Sample A") ... ]
 *
 *      - sortedColumns (Array): Sorted array of the table column headers,
 *      except for the starting headers ("qc", "id" and "sample")
 *
 *      - storageIds (Array): Stores the sample ids (sample name + pipeline id)
 *
 *      - qcStorage (Map): Maps each sample id to an object containing the
 *      warnings and fail information
 *
 *      - columnBars (Object): Contains the table headers that should be filled
 *      with a column bar and an array of their values. This is used to
 *      calculate the maximum value for each column and set the correct
 *      proportions for each cell
 *
 *      - headers (Array): Array with the complete set of table headers
 *
 */
const parseReport = (reportJSON) => {

    let storage = new Map();
    let storageIds = [];
    let columns = new Map();
    let qcStorage = new Map();
    let sortedColumns = [];

    // These headers are always present in the beginning of the table
    // The first element corresponds to the select checkbox column
    let startHeaders = ["", "qc", "id", "Sample"];

    // Holds an object containing the table headers tha should be filled with
    // a column bar and an array of their values
    let columnBars = {};

    for (const report of reportJSON) {

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
                ["qc", ""],
                ["projectId", projectId]
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
                        columnBars[header] = [cell.value];
                    } else {
                        columnBars[header].push(cell.value);
                    }
                }
            }
        }
    }

    // Sort the column headers according to the process id
    columns = [...columns.entries()].sort( (a,b) => {return a[1] - b[1];});
    for (let c of columns) {
        sortedColumns.push(c[0]);
    }

    // Add the final headers to the table data object
    let headers = startHeaders.concat(sortedColumns);

    return {
        storage,
        sortedColumns,
        storageIds,
        qcStorage,
        columnBars,
        headers
    };

};

/**
 * From an object with the processed JSON information from the `parseReport`
 * function, create/set the HTML div elements for the final table
 *
 * @param parsedJson (Object) : Processed JSON report. See `parseReport`
 * documentation
 * @param setMax (boolean) : Determines whether the report app filters should
 * be updated with this new data or not. This should be set to false when
 * the table is being created after a filtering instruction, in which it is
 * not desirable to update the min/max values of the filters.
 * @returns {{data: Array, mappings}}
 *
 *      - data (Array): Array of JSON objects ready for jquery data table
 *      - mappings (Array): Array of objects ready for jquery data table
 *      mappings
 */
const createTableData = (parsedJson, setMax) => {

    let data = [];
    let qcMap = new Map();

    for (const [k, v] of parsedJson.storage.entries()) {

        let dataObject = {};

        // Add current sample to the project-sample mapping
        let sampleName = v.get("Sample");
        let projectId = v.get("projectId");
        if (projectSampleMap.has(sampleName)) {
            projectSampleMap.get(sampleName).push(projectId);
        } else {
            projectSampleMap.set(sampleName, [projectId]);
        }

        // Check if current sample has finished
        const lastHeader = parsedJson.headers[parsedJson.headers.length - 1];
        if (v.has(lastHeader)) {
            parsedJson.qcStorage.get(k).status = "finished";
        } else {
            parsedJson.qcStorage.get(k).status = "pending";
        }

        // Get QC message for a sample
        let qcObj = getQc(parsedJson.qcStorage.get(k), v.get("Sample"));
        v.set("qc", qcObj.qcDiv);
        qcMap.set(k, qcObj.qcMsg);

        // Iterate over all expected columns in the table. If one or more
        // columns are missing from any given taxa, those columns are filled
        // with NA. This occurs when the pipeline stopped in the middle of the
        // run
        parsedJson.sortedColumns.map((col) => {
            // The field does not exist, fill with NA
            if (!(v.has(col))){
                v.set(col,
                    "<div class='table-cell'>" +
                    "<div class='table-bar-text'>NA</div>" +
                    "</div>");
                // The field exists, do some pre-processing
            } else {
                let prop;
                // Check if the current column has the column-bar attribute.
                // If so, change the value cell to display a column bar
                // based on its value
                if (parsedJson.columnBars.hasOwnProperty(col)){
                    if (col === "trimmed"){
                        prop = parseFloat(v.get(col));
                    } else {
                        const maxValue = Math.max(...parsedJson.columnBars[col]);
                        prop = (parseFloat(v.get(col)) / maxValue) * 100;
                        // Set/Update maximum filters value
                        if ( setMax === true ) {setMaxFilters(col, maxValue);}
                    }
                    const outDiv = `<div id="${col.replace(/ |\(|\)/g, "")}" class='table-cell'><div class='table-bar' style='width:${prop}%'></div>${v.get(col)}</div>`;
                    v.set(col, outDiv);
                }
            }
        });

        // Convert Map to object data type
        v.forEach((v, k) => { dataObject[k] = v ;});
        dataObject.qcMsg = qcObj.qcMsg;
        data.push(dataObject);

    }

    // Create mappings for column headers
    const mappings = parsedJson.headers.slice(1).map((x) => {
        return {"data": x, "title": x};
    });

    return {
        data,
        mappings,
        qcMap
    }

};


/**
 * Function to process INNuca data to load into the DataTable
 * @param reportsData
 */
const processInnuca = async (reportsData, setMax) => {

    // Instantiate the object with the table data
    const innucaData = {};

    // Parse the raw report JSON array into an object with several
    // properties required for building the table
    const parsedJson = await parseReport(reportsData);

    // Process the parsed JSON and prepare the table data
    const tableData = await createTableData(parsedJson, setMax);

    // Set table data and return
    innucaData.data = tableData.data;
    innucaData.ids = parsedJson.storageIds;
    innucaData.headers = parsedJson.headers;
    innucaData.qcMap = tableData.qcMap;
    innucaData.columnMapping = [
        {
            data:   "active",
            render( data, type, row ) {
                if ( type === "display" ) {
                    return "<input type='checkbox' class='editor-active'>";
                }
                return data;
            },
            className: "dt-body-center"
        },
    ].concat(tableData.mappings);

    return innucaData;

};