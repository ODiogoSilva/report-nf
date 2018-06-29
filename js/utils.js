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

/**
 * Function triggered when a user saves a report status to the database
 * @returns {Promise.<void>}
 */
const saveReport = async () => {

    const projectSelect = $("#navProjectPicker");
    const selectedProjects = projectSelect.val().join();
    const selectedStrains = $("#navSamplePicker").val().join();

    const requestObject = {
        "projects_id": selectedProjects,
        "strain_names": selectedStrains,
        "filters": JSON.stringify(dataFilters),
        "highlights": JSON.stringify(dataHighlights),
        "user_id": USERID,
        "username": USERNAME,
        "description": $("#save_report_description").val(),
        "name": $("#save_report_name").val(),
        "is_public": $("#save_report_checkbox").is(':checked')
    };

    // Save report on database
    await saveReportRequest(requestObject);

    // Update Saved reports table
    await initSavedReportsTable(USERID);

    showLabel($("#save_report_message"), "Report saved!", "success");
};

/**
 * This function provides a routine to load saved reports. It requires
 * information about the selected strains, their projects, the highlights
 * and the filters.
 * @returns {Promise.<void>}
 */
const loadSavedReport = async () => {

    const selectedReportData = $.map(savedReportsTable.tableObj.rows(".selected").data(), (d) => {
        return d;
    });

    if (selectedReportData.length === 0){
        return
    }

    // Load working gif
    const loadingGif = $("#waiting_gif");

    loadingGif.css({display: "block"});
    $("#homeInnuendo").css({display: "none"});

    // Assign data to highlights and filter
    dataHighlights = JSON.parse(selectedReportData[0].highlights);
    dataFilters = JSON.parse(selectedReportData[0].filters);

    const project_ids = selectedReportData[0].projects_id.split(",");
    const selectedNames = selectedReportData[0].strain_names.split(",");

    //Trigger changes on Projects and Samples selectors
    $("#btProjectSelect").trigger("click");

    // Selects projects from the projects dropdown
    for (const project_id of project_ids){
        $("#project_select").find('option[value="' + String(project_id) + '"]').prop("selected",true);
        $("#navProjectPicker").find('option[value="' + String(project_id) + '"]').prop("selected",true);
        $('.selectpicker').trigger('change');
    }

    // Trigger hide on project dropdown
    $("#project_select").trigger("hide.bs.select");

    // Select strains from the strains dropdown
    $("#project_select").off("endLoad").on("endLoad", () => {
        $("#f_by_name option:selected").prop("selected", false);

        $.each(selectedNames, (i,e) => {
            $("#f_by_name option[value='" + e + "']").prop("selected", true);
        });
    });

    // Refresh the selected options on the selectpicker
    $(".selectpicker").selectpicker("refresh");

    const reportData = await getSavedReportStrains(selectedReportData[0].strain_names,
        selectedReportData[0].projects_id);

    /*updateSidebar();
    console.log(reportInfo);
    // Use the report information to populate the filter elements
    populateFilter(reportInfo);
    // Update project and sample number indicators
    populateProjectIndicator(reportInfo);
    */
    await initReports(sc, reportData, false);

    updateHighlightLabels();

    loadingGif.css({display: "none"});
    $("#row-main").css({display: "block"});
    $("#current_workflow").css({display:"block"});

};


const getAssemblyPath = (sampleId, pipelineId) => {

    let assemblySuffix = '/results/assembly/';
    let filePath;
    let sampleName;

    for (const el of data.results){

        if (el.report_json.task.indexOf("pilon") > -1){
            const pid = `${el.project_id}.${el.sample_name}`;
            if (sampleId === pid){
                //assemblySuffix = assemblySuffix + el.report_json.task + `/${el.sample_name}_trim_spades3111_proc_filt_polished.fasta`;
                assemblySuffix = assemblySuffix + el.report_json.task + `/sample_trim_spades3111_proc_filt_polished.fasta`;
                filePath = el.report_json.workdir.split("/").slice(0, -3).join("/") + assemblySuffix;
                sampleName = el.sample_name
            }
        }
    }

    console.log([filePath, sampleName]);

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