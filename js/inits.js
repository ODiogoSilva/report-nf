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
        "#btProjectLoad"
    ];

    for (const bt of homeButtons) {

        const btDiv = $(bt);
        const targetDiv = $("#" + btDiv.data("target"));

        btDiv.on("click", () => {

            resetHomeOpts();
            targetDiv.css({"display": "inline-block"})

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

/**
 * Converts a Date object to string format in dd-mm-yyyy
 *
 * @param {Date} date - Date object
 * @returns {string} - Date string in dd-mm-yyyy
 */
const convertDate = (date) => {
    return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
};

/**
 * Converts a Date object to string format in yyyy-mm-dd
 *
 * @param {Date} date - Date object
 * @returns {string} - Date string in yyyy-mm-dd
 */
const convertDateInverse = (date) => {
    let dd = date.getDate();
    let mm = date.getMonth()+1;
    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    return date.getFullYear() + '-' + mm + '-' + dd
};


/**
 * Populates the sample and project counter indicators in the home page when
 * selecting a project.
 * @param {int} projectNum - Number of selected projects
 * @param {Array} reportInfo - List of objects with the sample names associated
 * with each selected project. The relevant key from the object file is
 * 'sample_name'
 */
const populateProjectIndicator = (projectNum, reportInfo) => {

    // Home screen elements
    const projectDiv = $("#projectCounter");
    const sampleDiv = $("#sampleCounter");
    // Navbar elements
    const navProjectDiv = $("#navProjectCounter");
    const navSampleDiv = $("#navSampleCounter");

    let samples = [];
    for (const el of reportInfo) {
        if (!samples.includes(el.sample_name)) {
            samples.push(el.sample_name)
        }
    }

    // Home screen update
    sampleDiv.html(`Samples: ${samples.length}`);
    projectDiv.html(`Projects: ${projectNum}`);
    // Navbar update
    navSampleDiv.html(`${samples.length}`);
    navProjectDiv.html(`${projectNum}`);
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


let reportInfo = "";
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

            // Use the report information to populate the filter elements
            populateFilter(reportInfo);
            // Update project and sample number indicators
            populateProjectIndicator(selectedOpts.length, reportInfo);

            // Display filter elements and submission button
            $("#submitDiv").css({display: "inline-block"});
            $("#homeFilters").css({display: "block"});
            $(".pcounter").css({display: "inline-block"})
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
            populateProjectIndicator(selectedOpts.length, reportInfo);
        } else {
            alert("oOOOPs")
        }

    })

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
                selectedProjects: selectedProjects,
                selectedStrains: strainsForRequest.join()
            }
        );

        const resMetadata = await getStrainsMetadata(
            {
                selectedStrains: strainsForRequest.join()
            }
        );

        console.log(resMetadata);

    return [res, resMetadata]

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
    })
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

        await initReports(scope, res, false);

        loadingGif.css({display: "none"})

    })
};
