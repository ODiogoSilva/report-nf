const app = angular.module("reportsApp", []);

let data = "";

const charts = new Charts();


/**
 * Function to build tables and graphs based on the reports
 * @param scope
 * @param results
 */
const initReports = (scope, results) => {

    $("#waiting_gif").css({display:"block"});
    $("#row-main").css({display:"none"});

    // build_table(results);
    data = results;

    /* Init tables */
    const innuca_table = new Table("master_table_innuca");
    const chewbbaca_table = new Table("master_table_chewbbaca");
    const prokka_table = new Table("master_table_prokka");

    /* Launch Tables */
    innuca_table.processInnuca(results).then( async (results_ch) => {
        await innuca_table.addTableHeaders(scope, results_ch,
            "table_headers_innuca");
        await innuca_table.addTableData(results_ch);
        await innuca_table.buildDataTable();
    });

    chewbbaca_table.processChewbbaca(results).then( async (results_ch) => {
        await chewbbaca_table.addTableHeaders(scope, results_ch,
            "table_headers_chewbbaca");
        await chewbbaca_table.addTableData(results_ch);
        await chewbbaca_table.buildDataTable();
    });

    prokka_table.processProkka(results).then( async (results_ch) => {
        await prokka_table.addTableHeaders(scope, results_ch,
            "table_headers_prokka");
        await prokka_table.addTableData(results_ch);
        await prokka_table.buildDataTable();
    });

    /*.then( (results_ch) => {
        console.log(results_ch);
        return chewbbaca_table.addTableData(results_ch);
    }).then( (results_ch) => {
        console.log(results_ch);
        return chewbbaca_table.buildDataTable();
    });*/



    // charts.addReportData(results).then(() => {
    //     charts.buildSpadesGraphs();
    // });

    $("#waiting_gif").css({display:"none"});
    $("#row-main").css({display:"block"});
    $("#current_workflow").css({display:"block"});

};

const modalAlert = (text, callback) => {

    $('#buttonSub').off("click");
    $('#buttonCancelAlert').off("click");

    $('#modalAlert .modal-body').empty();
    $('#modalAlert .modal-body').append("<p>"+text+"</p>");

    $('#buttonSub').one("click", function(){
        $('#modalAlert').modal("hide");
        console.log("Alert");

        setTimeout(function(){return callback()}, 400);
    });

    $('#modalAlert').modal("show");

};

/**
 * Populates the select picker options based on the species and the project name
 * @param container
 * @param species_data
 * @param data
 */
const populateSelect = (container, species_data, data) => {
    let options = "";
    const sp_id_to_name = {};

    species_data.map((sp) => {
        sp_id_to_name[sp.id] = sp.name;
    });

    data.map((entry) => {
        options += "<option value='"+entry.id+"'>"+sp_id_to_name[entry.species_id] + " - " +entry.name+"</option>";
    });

    $("#"+container).empty().append(options).selectpicker('refresh').selectpicker('setStyle', 'btn-default');

};


/* Angular controller to control the DOM elements from the index.html file */
app.controller("reportsController", function($scope){

    $scope.workflow_charts = {
        "INNUca": [
            ["Table 1", "#table1_div"],
            ["Graph 1", "#spades_graph_container"],
            ["Graph 2", "#container2"]

        ]
    };

    init_table($scope);

    /* Request to get all the available species */
    getSpecies().then((results) => {
       /* Request to get all the available projects */
       getProjects().then((p_results) => {
           populateSelect("project_select", results, p_results);

           $("#submit_project").off("click").on("click", () => {

               $("#reset_project").css({display:"inline-block"});

               $("#reset_project").off("click").on("click", () => {
                   charts.reports_data = [];
                   $("#reset_project").css({display:"none"});
                   $("#row-main").css({display:"none"});
                   $("#current_workflow").css({display:"none"});
               });

               /* Request to get the reports for a given project */
               getReportsByProject($("#project_select option:selected").val()).then((results) => {
                   initReports($scope, results);

               }, () => {
                   modalAlert("No reports for that project.", function(){});
               });
           })
       }, () => {
           modalAlert("No projects for that species", function(){});
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
        $("#workflows_content").toggleClass("col-md-12 col-md-10");
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

    $("#body_container").css({display:"block"});

    setTimeout( () => {
        $('#phyloviz_button').off("click").on("click", () => {
            $('#sendToPHYLOViZModal').modal('show');
        });

        $('#sidebar-button').off("click").on("click", () => {
            $("#right-sidebar").toggleClass("collapsed_right_sidebar");
            $("#results_div").toggleClass("col-md-12 col-md-10");
        });
    }, 100);

});
