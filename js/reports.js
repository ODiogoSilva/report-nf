const app = angular.module("reportsApp", []);

let data = "";

/* Function to build tables and graphs based on the reports */
const initReports = (results) => {

    $("#waiting_gif").css({display:"block"});
    $("#row-main").css({display:"none"});

    const charts = new Charts();

    build_table(results);
    data = results;

    charts.addReportData(results).then(() => {
        charts.buildSpadesGraphs();
    });

    $("#waiting_gif").css({display:"none"});
    $("#row-main").css({display:"block"});
    $("#current_workflow").css({display:"block"});

};

/* Populates the select picker options based on the species and the project name */
const populateSelect = (container, species_data, data) => {
    let options = "";
    const sp_id_to_name = {};

    species_data.map((sp) => {
        sp_id_to_name[sp.id] = sp.name;
    });

    data.map((entry) => {
        options += "<option value='"+entry.id+"'>"+sp_id_to_name[entry.species_id] + " - " +entry.name+"</option>";
    });

    $("#"+container).empty().append(options).selectpicker('refresh');

};


/* Angular controller to control the DOM elements from the index.html file */
app.controller("reportsController", function($scope){

    init_table($scope);

    /* Request to get all the available species */
    getSpecies().then((results) => {
       /* Request to get all the available projects */
       getProjects().then((p_results) => {
           populateSelect("project_select", results, p_results);

           $("#submit_project").off("click").on("click", () => {
               /* Request to get the reports for a given project */
               getReportsByProject($("#project_select option:selected").val()).then((results) => {
                   initReports(results);
               }, () => {
                   console.log("No reports for that project.");
               });
           })
       }, () => {
           console.log("No projects for that species");
           populateSelect("project_select", []);
       });
    });

    /* Event to be triggered when a file is dropped into the body of the page */
    $("#body_container").on("dropFile", (ev, results) => {
        /*
            Rebuild tables and graphs
         */
    });

    /* Event to toggle workflows sidebar */
    $('.toggle_sidebar').on("click", () => {
        /* to toggle the sidebar, just switch the CSS classes */
        $("#workflows_sidebar").toggleClass("collapsed_sidebar");
        $("#workflows_content").toggleClass("col-md-12 col-md-8");
        $(".toggle_sidebar").toggleClass("hide_button");
        return false;
    });

    /* Event to trigger workflow change
       Run changes in graphs by workflow here.
     */
    $scope.switch_workflow = (workflow_name) => {
        console.log("Workflow change");
        $scope.workflow_name = workflow_name;
    };

    /* Trigger style of dropdowns */
    $('.selectpicker').selectpicker({
      style: 'btn-info',
      size: 4
    });

    /* Show/hide tabs of spades and its divs */
    $("#spades_ul li").click(function () {
        $("#spades_ul li").removeClass("active");
        $(this).addClass("active");
        $('.box').hide().eq($(this).index()).show();  // hide all divs and show the current div
    });

    $("#waiting_gif").css({display:"none"});
    $("#body_container").css({display:"block"});
});
