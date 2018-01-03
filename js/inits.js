/**
 * This function is used to ensure that only one of the
 * div elements of the main toggle buttons in the
 * Home page is shown at any given time
 */
const resetHomeOpts = () => {

    const optsDiv = $("#optsContainer");
    for (const el of optsDiv.children()) {
        $(el).css({"display": "none"})
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


const convertDate = (date) => {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
};

const convertDateInverse = (date) => {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
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


const populateFilter = (data) => {
    let optionsName = "";
    let optionsDate = "";
    let totalDates = [];
    let totalNames = [];

    data.map((entry) => {
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
 * Initialize the project selection picker. This function provides controls
 * the appearance of the filters and submission button when one or more
 * projects are selected.
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
            if (el.timestamp >= minTimeFilter && el.timestamp <= maxTimeFilter && !strainsForRequest.includes(el.sample_name)){
                strainsForRequest.push(el.sample_name);
            }
        }
    }

    const res = await getReportByFilter(
        {
            selectedProjects: selectedProjects,
            selectedStrains:strainsForRequest.join()
        }
    );

    return res

};


/**
 * Initializes the behaviour of the submit button in the project selection
 * div of the home page.
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

        console.log(res)

        await initReports(scope, res, false);

        loadingGif.css({display: "none"})

    })
};
