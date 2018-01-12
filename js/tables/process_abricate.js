
const parseAbricateReport = (data) => {

    let storage = new Map();
    let startHeaders = ["id", "Sample"];
    let columns = [];
    let columnBars = {};

    for (const report of data) {

        const jr = report.report_json;
        const sampleName = report.sample_name;
        const id = `${sampleName}_${report.pipeline_id}`;

        if (!storage.has(id)) {
            storage.set(id, new Map([
                ["active", 0],
                ["Sample", sampleName],
                ["id", `${report.project_id}.${report.pipeline_id}`],
                ["projectId", `${report.project_id}`]
            ]));
        }

        if (jr.hasOwnProperty("tableRow")) {

            for (const cell of jr.tableRow) {

                if (cell.table !== "abricate") {
                    continue
                }

                const header = cell.header.replace("_", " ");
                storage.get(id).set(header, cell.value);

                if (!columns.includes(header)) {
                    columns.push(header);
                }

                if (!columnBars.hasOwnProperty(header)) {
                    columnBars[header] = [cell.value]
                } else {
                    columnBars[header].push(cell.value)
                }
            }
        }
    }

    let headers = startHeaders.concat(columns.sort());

    return {
        storage,
        headers,
        columns,
        columnBars
    }

};


const createAbricateData = (parsedObj) => {

    let data = [];

    for (const [k, v] of parsedObj.storage.entries()) {

        let dataObject = {};

        parsedObj.headers.map((col) => {

            if (!(v.has(col))){
                v.set(col,
                    "<div class='table-cell'>" +
                    "<div class='table-bar-text'>NA</div>" +
                    "</div>")
            } else {
                if (parsedObj.columns.includes(col)){
                    const maxValue = Math.max(...parsedObj.columnBars[col]);
                    const prop = (parseFloat(v.get(col)) / maxValue) * 100;
                    v.set(col, `<div id="${col.replace(/ |\\(|\\)/g, "")}" onclick="" class='table-cell table-link'><div class='table-bar' style='width:${prop}%'></div>${v.get(col)}</div>`)
                } else {
                    v.set(col, `<div id="${col.replace(/ |\\(|\\)/g, "")}" class='table-cell'>${v.get(col)}</div>`)
                }

            }
        });

        // Convert Map object data type
        v.forEach((v, k) => { dataObject[k] = v });
        data.push(dataObject)
    }

    const mappings = parsedObj.headers.map((x) => {
        return {"data": x, "title": x};
    });

    return {
        data,
        mappings
    }

};


const processAbricate = async (reportsData) => {

    const abricateData = {};

    const parsedJson = await parseAbricateReport(reportsData);
    const tableData = await createAbricateData(parsedJson);

    abricateData.data = tableData.data;
    abricateData.headers = parsedJson.columns;
    abricateData.columnMapping = [
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

    console.log(abricateData)

    return abricateData;

};