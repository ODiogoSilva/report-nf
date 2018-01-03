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
    const projectDiv = $("#projectCounter");
    const sampleDiv = $("#sampleCounter");

    let samples = [];
    for (const el of reportInfo) {
        if (!samples.includes(el.sample_name)) {
            samples.push(el.sample_name)
        }
    }

    sampleDiv.html(`Samples: ${samples.length}`);
    projectDiv.html(`Projects: ${projectNum}`);
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

    $("#maxTimeFilter").attr("value", convertDateInverse(maxDate));
    $("#minTimeFilter").attr("value", convertDateInverse(minDate));

    $("#timeFilterRange").datepicker({
        autoclose: true,
        format: "yyyy-mm-dd",
        startDate: minDate,
        autoApply: true,
        endDate: maxDate,
        keepEmptyValues: true
    });

    /*
        Select all values of selectpicker by default. All sample names are selected.
     */
    $("#f_by_name").empty().append(optionsName).selectpicker("refresh").selectpicker("selectAll");

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
 * Initialize the project selection picker. This function provides controls
 * the appearance of the filters and submission button when one or more
 * projects are selected.
 */

let reportInfo = "";

const initProjectSelection = () => {

    // Trigger events when the main project dropdown is closed
    $("#project_select").on("hide.bs.select", async () => {
        // Get the report info object containng the timestamp and sample
        // name information
        const selectedOpts = $("#project_select").val();

        if (selectedOpts.length > 0) {
            reportInfo = await getReportInfo(selectedOpts);

            populateFilter(reportInfo);
            populateProjectIndicator(selectedOpts.length, reportInfo);

            $("#submitDiv").css({display: "inline-block"});
            $("#homeFilters").css({display: "block"});
            $(".pcounter").css({display: "inline-block"})
        } else {
            $("#submitDiv").css({display: "none"});
            $("#homeFilters").css({display: "none"});
            $(".pcounter").css({display: "none"});
        }
    });

};


/**
 * Initializes the behaviour of the submit button in the project selection
 * div of the home page.
 */
const initProjectSubmission = (scope) => {

    $("#submitProject").on("click", async () => {

        $("#waiting_gif").css({display: "block"});
        $("#homeInnuendo").css({display: "none"});

        const selectedProjects = $("#project_select").val().join();
        const selectedStrains = $("#f_by_name").val();
        const maxTimeFilter = $("#maxTimeFilter").val();
        const minTimeFilter = $("#minTimeFilter").val();

        //const res = await getReportsByProject(selectedProjects);
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

        await initReports(scope, res, false);

        $("#waiting_gif").css({display: "none"});
        $("#row-main").css({display: "block"});
        $("#current_workflow").css({display:"block"});

        console.log(res)
    })
};
