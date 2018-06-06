/*globals
    addFilterButton,
    data,
    dataFilters,
    dataHighlights,
    getReportByFilter,
    getReportInfo,
    getStrainsMetadata,
    Highcharts,
    initReports,
    projectIdMap
    reportInfo,
*/

/**
 * This function is used to ensure that only one of the
 * div elements of the main toggle buttons in the
 * Home page is shown at any given time
 */
const resetHomeOpts = () => {

    const optsDiv = $("#optsContainer");
    for (const el of optsDiv.children()) {
        $(el).css({"display": "none"});
    }
};


/**
 * Provides the toggle behaviour of the project
 * selection/loading in the Innuendo home page.
 * The behavior is bound to the "click" event of the
 * main toggle buttons and is responsible for showing the
 * corresponding div element.
 */
const initHomeButtonsToggle = () => {

    const homeButtons = [
        "#btProjectSelect",
        "#btProjectLoad",
        "#btSavedProject"
    ];

    for (const bt of homeButtons) {

        const btDiv = $(bt);
        const targetDiv = $("#" + btDiv.data("target"));

        btDiv.on("click", () => {

            resetHomeOpts();
            targetDiv.css({"display": "inline-block"});

            // Trigger redraw of table when visible
            if(bt === "#btSavedProject"){
                $("#savedProjects").trigger("redraw");
            }

        });
    }
};


/**
 * Populates the select picker options based on the species and the project name
 *
 * @param {String} container - Id of the container that will be populated
 * @param {Array} speciesData - Array of objects with the ID and name of the
 * available species
 * @param {Array} projectsData - Array of objects with several informative
 * properties of each available project
 */
const populateSelect = (container, speciesData, projectsData) => {
    let options = "";
    const spIdToName = {};

    speciesData.map((sp) => {
        spIdToName[sp.id] = sp.name;
    });

    projectsData.map((entry) => {
        options += "<option value='"+entry.id+"'>"+spIdToName[entry.species_id] + " - " +entry.name+"</option>";
        projectIdMap.set(entry.id, entry.name);
    });

    $("#"+container).empty().append(options).selectpicker("refresh");

};

const initSavedReportsTable = async (userId) => {

    const savedReports = await getSavedReports(userId);
    const resultsSV = await savedReportsTable
        .processSavedReports(savedReports);

    savedReportsTable.addTableHeaders(resultsSV, "saved_reports_table_headers");
    savedReportsTable.addTableData(resultsSV, false);
    savedReportsTable.buildDataTable(true);

};

const populateSelectPHYLOViZ = (container, projectsData) => {
    let options = "";
    projectsData.map((entry) => {
        options += "<option value='"+entry.name+"' species_id='"+entry.species_id+"'>"+entry.name+"</option>";
    });

    $("#"+container).empty().append(options).selectpicker("refresh");
};

/**
 * Converts a Date object to string format in dd-mm-yyyy
 *
 * @param {Date} date - Date object
 * @returns {string} - Date string in dd-mm-yyyy
 */
const convertDate = (date) => {
    return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
};

/**
 * Converts a Date object to string format in yyyy-mm-dd
 *
 * @param {Date} date - Date object
 * @returns {string} - Date string in yyyy-mm-dd
 */
const convertDateInverse = (date) => {
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    if(dd<10){
        dd="0" + dd;
    }
    if(mm<10){
        mm="0" + mm;
    }
    return date.getFullYear() + "-" + mm + "-" + dd;
};


/**
 * Populates the sample and project counter indicators in the home page when
 * selecting a project.
 * @param {Array} reportInfo - List of objects with the sample names associated
 * with each selected project. The relevant key from the object file is
 * 'sample_name'
 */
const populateProjectIndicator = (reportInfo) => {

    // Home screen elements
    const projectDiv = $("#projectCounter");
    const sampleDiv = $("#sampleCounter");
    // Navbar elements
    const navProjectDiv = $("#navProjectCounter");
    const navSampleDiv = $("#navSampleCounter");

    let samples = [];
    let projects = [];
    for (const el of reportInfo) {
        if (!samples.includes(el.sample_name)) {
            samples.push(el.sample_name);
        }
        if (!projects.includes(el.project_id)) {
            projects.push(el.project_id);
        }
    }

    // Home screen update
    sampleDiv.html(`Samples: ${samples.length}`);
    projectDiv.html(`Projects: ${projects.length}`);
    // Navbar update
    navSampleDiv.html(`${samples.length}`);
    navProjectDiv.html(`${projects.length}`);
};

/**
 * Populates the sample and date picker filters according to the data from the
 * selected projects.
 *
 * This function is responsible for updating the pickers of both home and
 * navbar elements.
 *
 * @param {Array} projectsData - Array of objects, each with information of
 * a project
 */
const populateFilter = (projectsData) => {
    let optionsName = "";
    let optionsDate = "";
    let totalDates = [];
    let totalNames = [];

    projectsData.map((entry) => {
        if(totalDates.indexOf(entry.timestamp) < 0){
            optionsDate += "<option value='"+entry.timestamp+"'>"+entry.timestamp+"</option>";
            totalDates.push(new Date(entry.timestamp));
        }
        if(totalNames.indexOf(entry.sample_name) < 0){
            optionsName += "<option value='"+entry.sample_name+"'>"+entry.sample_name+"</option>";
            totalNames.push(entry.sample_name);
        }
    });

    const maxDate = new Date(Math.max.apply(null, totalDates));
    const minDate = new Date(Math.min.apply(null, totalDates));

    // Populate home screen elements
    $("#maxTimeFilter").attr("value", convertDateInverse(maxDate));
    $("#minTimeFilter").attr("value", convertDateInverse(minDate));
    // Populate navbar elements
    $("#navMaxTimeFilter").attr("value", convertDateInverse(maxDate));
    $("#navMinTimeFilter").attr("value", convertDateInverse(minDate));

    const datepickerOpts = {
        autoclose: true,
        format: "yyyy-mm-dd",
        startDate: minDate,
        autoApply: true,
        endDate: maxDate,
        keepEmptyValues: true
    };

    $("#timeFilterRange").datepicker(datepickerOpts);
    $("#navTimeFilterRange").datepicker(datepickerOpts);

    /*
        Select all values of selectpicker by default. All sample names are selected.
     */
    $("#f_by_name").empty().append(optionsName).selectpicker("refresh").selectpicker("selectAll");
    $("#navSamplePicker").empty().append(optionsName).selectpicker("refresh").selectpicker("selectAll");

};

/**
 * This function reads a file from the Load from file option on the Home page
 */
const readReportFile = (files) => {
    const data = files;

    const reader = new FileReader();

    reader.onload = (e) => {
        let reportsData;
        try{
            reportsData = JSON.parse(e.target.result);
        }
        catch(e){
            const alertText = "<div class='alert alert-danger alert-dismissable fade in' aria-label='close'>" +
                "<a href='#' class='close' data-dismiss='alert' aria-label='close'>×</a>Unsupported file format</div>";

            $("#alertDiv").empty().append(alertText).css({"display":"block"});
            return;
        }
        $("#body_container").trigger("dropFile",[reportsData]);
    };

    reader.readAsText(data[0]);
};


/**
 * Initialize the project selection picker. This function is responsible
 * for several tasks:
 *
 *      - Controls the appearance/removal of filter and submission elements
 *      - Populates the filter sample and date pickers according to the
 *      selected projects
 *      - Populates the project and sample counter indicators
 */
const initProjectSelection = () => {

    // Trigger events when the main project dropdown is closed
    $("#project_select").on("hide.bs.select", async () => {
        // Get the report info object containng the timestamp and sample
        // name information
        const selectedOpts = $("#project_select").val();

        // Only proceed when at least one project has been selected
        if (selectedOpts.length > 0) {

            // Get report information for the selected projects
            // (sample names and time stamps)
            reportInfo = await getReportInfo(selectedOpts);

            if (reportInfo.length !== 0){
                // Use the report information to populate the filter elements
                populateFilter(reportInfo);
                // Update project and sample number indicators
                populateProjectIndicator(reportInfo);

                // Display filter elements and submission button
                $("#submitDiv").css({display: "inline-block"});
                $("#homeFilters").css({display: "block"});
                $(".pcounter").css({display: "inline-block"});
            }

            /*
            Trigger custom event case from iframe
             */
            $("#project_select").trigger("endLoad");

        } else {
            // When no valid projects are selected, hide the filter elements
            // and submission button
            $("#submitDiv").css({display: "none"});
            $("#homeFilters").css({display: "none"});
            $(".pcounter").css({display: "none"});
        }
    });

};


/**
 * Initializes the project resubmission button in the navbar. Like the
 * initProjectSelection function, this function is responsible for updating
 * the filter and indicator elements.
 */
const initNavSelection = () => {

    $("#navProjectPicker").on("hide.bs.select", async () => {

        const selectedOpts = $("#navProjectPicker").val();

        // Only proceed when at least one project has been selected
        if (selectedOpts.length > 0) {

            // Get report information for the selected projects
            // (sample names and time stamps)
            reportInfo = await getReportInfo(selectedOpts);

            // Use the report information to populate the filter elements
            populateFilter(reportInfo);
            // Update project and sample number indicators
            populateProjectIndicator(reportInfo);
        }
    });
};

/**
 * Filter metadata based on the selected strains
 * @param reportInfo
 * @param selectedSamples
 * @returns {[null,null]}
 */
const getMetadataMapping = (reportInfo, selectedSamples) => {

    let projectAr = [];
    let sampleAr = [];

    for (const el of reportInfo) {
        if (selectedSamples.includes(el.sample_name)){
            projectAr.push(el.project_id);
            sampleAr.push(el.sample_name);
        }
    }

    const projectStr = projectAr.join();
    const sampleStr = sampleAr.join();

    return [projectStr, sampleStr];

};


/**
 * Wrapper of the routine used to submit a request for project/sample data.
 * It receives the Ids of the relevant picker elements and returns the
 * request result.
 *
 * @param {Object} selectorIds - The Ids of the picker elements used to fetch
 * the project, sample and date information for sending the request.
 * @returns {Promise.<Array>} - Array of JSON objects with the request result
 */
const submissionRoutine = async (selectorIds) => {

    // Set selector objects according to the ids provided in
    // selectorIds
    const projectSelect = $(selectorIds.projectSelect);
    const selectedProjects = projectSelect.val().join();
    const selectedStrains = $(selectorIds.sampleSelect).val();
    const maxTimeFilter = $(selectorIds.maxTime).val();
    const minTimeFilter = $(selectorIds.minTime).val();

    const strainsForRequest = [];

    console.log(reportInfo);

    const projectSampleMap = await getMetadataMapping(reportInfo, selectedStrains);

    for (const el of reportInfo){
        if (selectedStrains.includes(el.sample_name)){
            const dt = new Date(el.timestamp);
            const mind = new Date(minTimeFilter);
            const maxd = new Date(maxTimeFilter);
            if (dt >= mind && dt <= maxd && !strainsForRequest.includes(el.sample_name)){
                strainsForRequest.push(el.sample_name);
            }
        }
    }

    const res = await getReportByFilter(
        {
            selectedProjects,
            selectedStrains: strainsForRequest.join()
        }
    );

    const resMetadata = await getStrainsMetadata(
        {
            selectedProjects: projectSampleMap[0],
            selectedStrains: projectSampleMap[1]
        }
    );

    console.log(resMetadata);

    return {
        results: res,
        metadataResults: resMetadata
    };

};


/**
 * This function returns
 * @param selectedStrains
 * @param selectedProjects
 * @returns {Promise.<{results: *, metadataResults: *}>}
 */
const getSavedReportStrains =  async (selectedStrains, selectedProjects) => {

    const res = await getReportByFilter(
        {
            selectedProjects,
            selectedStrains: selectedStrains
        }
    );

    const strainArray = selectedStrains.split(",");

    let projectAr = [];
    let sampleAr = [];

    for (const process of res) {
        if (strainArray.indexOf(process.sample_name) > -1){
            projectAr.push(process.project_id);
            sampleAr.push(process.sample_name);
        }
    }

    const projectStr = projectAr.join();
    const sampleStr = sampleAr.join();

    const resMetadata = await getStrainsMetadata(
        {
            selectedProjects: projectStr,
            selectedStrains: sampleStr
        }
    );

    return {
        results: res,
        metadataResults: resMetadata
    };

};


/**
 * Initializes the behaviour of the submit button in the project selection
 * div of the home page.
 * @param scope - Angular $scope object
 */
const initProjectSubmission = (scope) => {

    $("#submitProject").on("click", async () => {

        const loadingGif = $("#waiting_gif");

        loadingGif.css({display: "block"});
        $("#homeInnuendo").css({display: "none"});

        const res = await submissionRoutine(
            {
                projectSelect: "#project_select",
                sampleSelect: "#f_by_name",
                maxTime: "#maxTimeFilter",
                minTime: "#minTimeFilter"
            });

        // Update navbar project picker
        $("#navProjectPicker").val($("#project_select").val()).selectpicker("refresh");
        $("#navSamplePicker").val($("#f_by_name").val()).selectpicker("refresh");

        await initReports(scope, res, false);

        loadingGif.css({display: "none"});
        $("#row-main").css({display: "block"});
        $("#current_workflow").css({display:"block"});

        //Case loading reports directly from the project page of the platform
        try {
            window.parent.$("#overlayProjects").css({"display":"none"});
            window.parent.$("#overlayWorking").css({"display":"none"});
            window.parent.$("#single_project_controller_div").css({"display":"block"});
            window.parent.$("#submission_status").empty();
        }
        catch (e) {
            console.log("Not from the single project page");
        }
    });
};

/**
 * Initializes the behaviour of the re-submission button in the navbar
 * @param scope - Angular $scope object
 */
const initResubmit = (scope) => {
    $("#resubmitProjects").on("click", async () => {

        const loadingGif = $("#waiting_gif");

        loadingGif.css({display: "block"});

        const res = await submissionRoutine(
            {
                projectSelect: "#navProjectPicker",
                sampleSelect: "#navSamplePicker",
                maxTime: "#navMaxTimeFilter",
                minTime: "#navMinTimeFilter"
            }
        );

        // Update home page pickers
        $("#project_select").val($("#navProjectPicker").val()).selectpicker("refresh");
        $("#f_by_name").val($("#navSamplePicker").val()).selectpicker("refresh");

        charts.resetCharts();
        await initReports(scope, res, false);

        loadingGif.css({display: "none"});

    })
};

/**
 * Function that populates the project/sample filters when loading
 * a JSON file into the reports
 */
const updateInputFilters = () => {

    const projectFilters = dataFilters.projectId.active.concat(dataFilters.projectId.temp);
    const sampleFilters = dataFilters.sample.active.concat(dataFilters.sample.temp);

    for (const el of projectFilters) {
        addFilterButton({
            val: el,
            targetId: "popover_filters_project",
            popoverId: "active_filters_projectid",
            reset: true
        })
    }

    for (const el of sampleFilters) {
        addFilterButton({
            val: el,
            targetId: "popover_filters_sample",
            popoverId: "active_filters_name",
            reset: true
        })
    }

};

/**
 * Updates sliders according to the dataFitler object
 */
const updateSliders = () => {

    const sliderMap = new Map([
        ["bp", $("#sliderbp")],
        ["reads", $("#sliderrn")],
        ["coverage (2nd)", $("#sliderc")],
        ["contigs", $("#slidercn")],
        ["assembled bp", $("#sliderabp")]
    ]);

    let min,
        max;

    for (const [el, sel] of sliderMap.entries()) {
        sel.slider({max: dataFilters[el].max});
        min = dataFilters[el].range[0] ? dataFilters[el].range[0] : 0;
        max = dataFilters[el].range[1] ? dataFilters[el].range[1] : dataFilters[el].max;

        try {
            sel.slider("setValue", [min, max]);
        }
        catch (e){
            console.log(e.message, "Can't assign value to slider");
        }
    }

};


/**
 * Wrapper function that updates elements of the reports sidepanel, including:
 *
 *      - Sample and project filters
 *      - Filter sliders
 */
const updateSidebar = () => {

    updateInputFilters();
    updateSliders();

};


/**
 * Updates the reportInfo object from a Drag and Drop of report file load
 * operation. It crawls through the data JSON and checks for known project
 * Ids
 * @param {Array} dataJSON - The array of JSON with the main report data
 */
const updateReportInfo = (dataJSON) => {

    let projectIds = [];

    for (const el of dataJSON) {
        if (!projectIds.includes(el.project_id)) {
            projectIds.push(el.project_id);
        }
    }

    $("#project_select").selectpicker("val", projectIds);
    $("#navProjectPicker").selectpicker("val", projectIds);

    return getReportInfo(projectIds);

};

/**
 * Initializes the Drag and Drop behaviour for loading report files
 * @param scope - Angular scope object
 */
const initDropFile = (scope) => {

    /* Event to be triggered when a file is dropped into the body of the page */
    $("body").off("dropFile").on("dropFile", async (ev, results) => {
        /*
            Rebuild tables and graphs
         */

        const waitingGif = $("#waiting_gif");
        waitingGif.css({display: "block"});
        $("#homeInnuendo").css({display: "none"});

        data = results.data;
        dataFilters = (results.dataFilters ? results.dataFilters : dataFilters);
        dataHighlights = (results.dataHighlights ? results.dataHighlights : dataHighlights);
        console.log("ADD data");

        // Update sidebar elements (filters and highlights) according to the
        // loaded data
        updateSidebar();
        console.log("sidebar");
        reportInfo = await updateReportInfo(data.results);
        console.log("get info");

        // Use the report information to populate the filter elements
        populateFilter(reportInfo);
        console.log("filter")
        // Update project and sample number indicators
        populateProjectIndicator(reportInfo);
        console.log("project Indicator")

        await initReports(scope, results.data, false);
        console.log("init reports");

        waitingGif.css({display:"none"});
        $("#row-main").css({display:"block"});
        $("#current_workflow").css({display:"block"});

    });

};


const highlightColorPickers = () => {

    // const presetColors = {
    //     name: "swatches",
    //     colors: {
    //         "black": "#000000",
    //         "white": "#ffffff",
    //         "red": "#FF0000",
    //         "default": "#777777",
    //         "primary": "#337ab7",
    //         "success": "#5cb85c",
    //         "info": "#5bc0de",
    //         "warning": "#f0ad4e",
    //         "danger": "#d9534f"
    //     },
    //     namesAsValues: true
    // };

    $("#cpSample").colorpicker({
        "color": "#7BB312",
        "container": true,
        // "extensions": [presetColors]
    });
    $("#cpProject").colorpicker({
        "color": "#7BB312",
        "container": true,
        // "extensions": [presetColors]
    });

};

const highlightSelectize = () => {

    $("#highlightSampleVal, #highlightProjectVal").selectize({
        plugins: ["remove_button"],
        delimiter: ",",
        hideSelected: true,
        create: (input) => {
            return {
                value: input,
                text: input
            };
        }
    });

    $("#highlightModalSelection").selectize({
        delimiter: ","
    });

};


const initHighlights = () => {

    highlightColorPickers();
    highlightSelectize();

};


/**
 * Cleans the Highcharts from the sample specific modal. This prevents
 * Highcharts from continuously storing the synchronized charts in the
 * main Highcharts.charts object.
 */
const initSampleSpecificModal = () => {

    // Sanitize charts when closing the modal
    $("#modalGraphs").on("hide.bs.modal", () => {

        // Destroy the abricate selectize box for correct re-intialization
        $("#abricateSelectize")[0].selectize.destroy();

        $("#sparkline-container").highcharts().destroy();
        $("#distribution-size-container").highcharts().destroy();

        Highcharts.each(Highcharts.charts, (chart) => {
            if (chart) {
                if (chart.renderTo.id === "") {
                    chart.destroy();
                }
            }
        });
    });

};


/**
 *
 * @returns {Map}
 */
const getVersionInfo = () => {

    const versionMap = new Map();

    for (const el of data.results) {
        // Get version information, if any
        if (el.report_json.versions) {
            const ver = el.report_json.versions;
            for (const prog of ver){
                const programId = `${prog.program}.${prog.version}`;

                if (!versionMap.has(programId)){
                    versionMap.set(programId, {
                        name: prog.program,
                        version: prog.version,
                        samples: [el.sample_name]
                    });
                } else {
                    if (!versionMap.get(programId).samples.includes(el.sample_name)) {
                        versionMap.get(programId).samples.push(el.sample_name);
                    }
                }
            }
        }
    }

    const sortedVersionMap = new Map([...versionMap.entries()].sort((a, b) => {
        return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
    }));

    return sortedVersionMap;
};


const getVersionLabel = (pid, info) => {

    const divId = pid.split(".").join("");

    const template = "<div class='version-container'>" +
        "<span class='version-program'>{{ name }}</span>" +
        "<span data-toggle='collapse' href='#{{ divId }}Version' class='version-counter label label-default'>{{ sampleNumber }}</span>" +
        "<span class='label label-success version-label'>{{ version }}</span>" +
        "</div>" +
        "<div class='collapse' id='{{ divId }}Version'>" +
            "<ul>" +
                "{{#samples}}<li>{{.}}</li>{{/samples}}" +
            "</ul>" +
        "</div>";

    const div = Mustache.to_html(template, {
        name: info.name,
        sampleNumber: info.samples.length,
        version: info.version,
        divId,
        samples: info.samples
    });

    return div;

};


/**
 *
 * @param versionMap
 */
const populateVersionInfo = async (versionMap) => {

    const containerSel = $("#navDetails");
    containerSel.empty();

    for (const [pid, info] of versionMap.entries()){
        const versionDiv = await getVersionLabel(pid, info);
        containerSel.append(versionDiv);
    }

};


const initDetails = async () => {

    const versionInfo = await getVersionInfo();
    populateVersionInfo(versionInfo);

};


