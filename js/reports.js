const app = angular.module("reportsApp", []);

/* Angular controller to control the DOM elements from the index.html file */
app.controller("reportsController", function($scope){

    init_table($scope);

    const charts = new Charts();

    /* Request to get the reports for a given project */
    get_reports_by_project(1).then((results) => {
        build_table(results);

        charts.addReportData(results).then(() => {
            charts.buildSpadesGraphs();
        });

        $("#waiting_gif").css({display:"none"});
        $("#body_container").css({display:"block"});
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

});
