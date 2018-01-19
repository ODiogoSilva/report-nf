
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
                    continue;
                }

                const header = cell.header.replace("_", " ");
                storage.get(id).set(header, cell.value);
                storage.get(id).set(header + "geneList", cell.geneList);

                if (!columns.includes(header)) {
                    columns.push(header);
                }

                if (!columnBars.hasOwnProperty(header)) {
                    columnBars[header] = [cell.value];
                } else {
                    columnBars[header].push(cell.value);
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
    };

};


const createAbricateData = (parsedObj) => {

    let data = [];

    for (const [k, v] of parsedObj.storage.entries()) {

        let dataObject = {};

        parsedObj.headers.map((col) => {

            const geneList = col + "geneList";
            if (v.has(geneList)) {
                dataObject[geneList] = v.get(v.get(geneList));
            }

            if (!(v.has(col))){
                v.set(col,
                    "<div class='table-cell'>" +
                    "<div class='table-bar-text'>NA</div>" +
                    "</div>");
            } else {
                if (parsedObj.columns.includes(col)){
                    const maxValue = Math.max(...parsedObj.columnBars[col]);
                    const prop = (parseFloat(v.get(col)) / maxValue) * 100;
                    const sampleId = $(v.get("id")).html();
                    const sampleName = $(v.get("Sample")).html();
                    v.set(col, `<div onclick="showAbricateModal('${sampleId}', '${sampleName}')" class='table-cell table-link'><div class='table-bar' style='width:${prop}%'></div>${v.get(col)}</div>`);
                } else {
                    v.set(col, `<div class='table-cell'>${v.get(col)} </div>`);
                }

            }
        });

        // Convert Map object data type
        v.forEach((v, k) => {dataObject[k] = v;});
        data.push(dataObject);
    }

    const mappings = parsedObj.headers.map((x) => {
        return {"data": x, "title": x};
    });

    return {
        data,
        mappings
    };

};


const processAbricate = async (reportsData) => {

    const abricateData = {};

    const parsedJson = await parseAbricateReport(reportsData);
    const tableData = await createAbricateData(parsedJson);

    if (parsedJson.columns.length > 0) {
        abricateData.data = tableData.data;
        abricateData.headers = parsedJson.columns;
        abricateData.columnMapping = [
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
        ].concat(tableData.mappings);
    } else {
        abricateData.data = {};
        abricateData.headers = [];
        abricateData.columnMapping = [];
    }

    return abricateData;

};

/**
 * Function to parse abricate table and retrieve genes
 * @param abricateTable
 */
const generateGenesCSV = (abricateTable) => {

    let firstTime = true;
    const rows = [];
    let keys = ["Sample","cardgeneList", "plasmidfindergeneList", "resfindergeneList", "vfdbgeneList"];
    let fileString = keys.join(";") + "\n";


    $.map(abricateTable.tableObj.rows().data(), (d) => {
        const row = [];
        for (const field of keys) {

            if (field.indexOf("geneList") > -1) {
                try {
                    row.push(d[field].join(","));
                }
                catch (TypeError) {
                    row.push("NA");
                }
            }
            else {
                row.push($(d[field]).html());
            }
        }
        rows.push(row);
    });

    rows.map( (r) => {
        fileString += r.join(";") + "\n";
    });

    downloadAbricateGenesTable("abricateGenes.csv",fileString);

};

/**
 * Function to download file based on a string
 * @param filename
 * @param text
 */
const downloadAbricateGenesTable = (filename, text) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};