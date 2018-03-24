
const parseTypingReport = (rdata) => {

    const headerConversion = {
        "seq_typing": "Serotyping",
        "patho_typing": "Pathotyping"
    };

    let storage = new Map();
    let startHeaders = ["id", "Sample"];
    let columns = [];

    for (const report of rdata) {

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

        let header;

        if (jr.hasOwnProperty("typing")) {
            header = headerConversion[jr.task.split("_").splice(0,2).join("_")];
            storage.get(id).set(header, Object.values(jr.typing)[0]);
        }
        if (jr.hasOwnProperty("expectedSpecies")) {
            header = "mlst";
            storage.get(id).set(header, `${jr.species} (${jr.st})`);
        }

        if (header){
            if (!columns.includes(header)){
                columns.push(header);
            }
        }
    }

    let headers = startHeaders.concat(columns.sort());

    return {
        storage,
        headers,
        columns
    }
};


const createTypingData = (parsedObj) => {

    let data = [];

    for (const [k, v] of parsedObj.storage.entries()){

        let dataObject = {};

        parsedObj.headers.map((col) => {

            if (!(v.has(col))) {
                v.set(col, "<div class='table-cell'><div>Not run</div></div>");
            } else {
                v.set(col, `<div class='table-cell'>${v.get(col)}</div>`);
            }
        });

        v.forEach((v, k) => {dataObject[k] = v;});
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


const processTyping = async (reportsData) => {

    const typingData = {};

    const parsedJson = await parseTypingReport(reportsData);
    const tableData = await createTypingData(parsedJson);

    if (parsedJson.columns.length > 0) {
        typingData.data = tableData.data;
        typingData.headers = parsedJson.columns;
        typingData.columnMapping = [
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
        typingData.data = [];
        typingData.headers = [];
        typingData.columnMapping = [];
    }

    return typingData;

};