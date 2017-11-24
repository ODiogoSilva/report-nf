const app = angular.module("reportsApp", []);

app.controller("reportsController", function($scope, $http){

    init_table($scope);

    get_reports_by_project(1).then((results) => {
        build_table(results);
        build_charts(results)

        $("#waiting_gif").css({display:"none"});
        $("#body_container").css({display:"block"});
    });

    $('.toggle_sidebar').on("click", () => {
        /* to toggle the sidebar, just switch the CSS classes */
        $("#workflows_sidebar").toggleClass("collapsed_sidebar");
        $("#workflows_content").toggleClass("col-md-12 col-md-8");
        $(".toggle_sidebar").toggleClass("hide_button");
        return false;
    });

    $scope.switch_workflow = (workflow_name) => {
        console.log("Workflow change");
        $scope.workflow_name = workflow_name;
    };

    $('.selectpicker').selectpicker({
      style: 'btn-info',
      size: 4
    });

    $("#spades_ul li").click(function () {
        $("#spades_ul li").removeClass("active");
        $(this).addClass("active");
        $('.box').hide().eq($(this).index()).show();  // hide all divs and show the current div
    });

    $("#waiting_gif").css({display:"none"});
    $("#body_container").css({display:"block"});


});
