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


const getAssemblyPath = (sampleId) => {

    const assemblySuffix = "/results/assembly/pilon/sample_polished.assembly.fasta";
    let filePath;

    for (const el of data.results){

        if (el.report_json.task === "pilon"){
            const pid = `${el.project_id}.${el.sample_name}`;
            if (sampleId === pid){
                filePath = el.report_json.workdir.split("/").slice(0, -3).join("/") + assemblySuffix;
            }
        }
    }

    return filePath;
};