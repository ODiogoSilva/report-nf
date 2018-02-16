/*globals
    data,
    modalAlert,
    dataFilters,
    dataHighlights
*/

/**
 * Function to send file to user, client-side
 * @param filename
 * @param text
 */
const sendFile = (filename, text) => {

    window.URL = window.URL || window.webkitURL;

    const csvData = new Blob([text], { type: "application/json" });
    const csvUrl = window.URL.createObjectURL(csvData);

    const element = document.createElement("a");
    element.href =  csvUrl;
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

const saveStatusFile = () => {
    const fileName = $("#save_file_name").val();
    if (fileName !== "") {
        const saveObject = {
            data,
            dataFilters,
            dataHighlights
        };
        const dataString = JSON.stringify(saveObject);
        sendFile(fileName, dataString);
    }
    else {
        modalAlert("Please select a file name first.");
    }
};


const getAssemblyPath = (sampleId, pipelineId) => {

    const assemblySuffix = `/results/assembly/pilon/sample_${pipelineId}_polished.assembly.fasta`;
    let filePath;
    let sampleName;

    for (const el of data.results){

        if (el.report_json.task === "pilon"){
            const pid = `${el.project_id}.${el.sample_name}`;
            if (sampleId === pid){
                filePath = el.report_json.workdir.split("/").slice(0, -3).join("/") + assemblySuffix;
                sampleName = el.sample_name
            }
        }
    }

    return [filePath, sampleName];
};

const getAssemblies = (dt) => {

    let fileList = [];
    let sampleNames = [];

    $.map(dt.rows(".selected").data(), (d) => {

        const pid = `${d.id.split(".")[0]}.${d.Sample}`;
        const pipelineId = `${d.id.split(".")[1]}`;

        const res = getAssemblyPath(pid, pipelineId);

        fileList.push(res[0]);
        sampleNames.push(res[1]);
    });

    return [fileList, sampleNames];
};