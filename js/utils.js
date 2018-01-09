/*globals data */

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
            "data": data,
            "dataFilters": dataFilters,
            "dataHighlights": dataHighlights
        };
        const dataString = JSON.stringify(saveObject);
        sendFile(fileName, dataString);
    }
    else {
        modalAlert("Please select a file name first.");
    }
};