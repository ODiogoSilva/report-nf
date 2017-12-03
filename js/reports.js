const app = angular.module("reportsApp", []);

let data = "";

const charts = new Charts();

/* Init tables */
const innuca_table = new Table("master_table_innuca");
const chewbbaca_table = new Table("master_table_chewbbaca");
const prokka_table = new Table("master_table_prokka");

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


    charts.addReportData(results).then(() => {
        charts.buildSpadesGraphs();
    });

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

    $scope.graph1_name = "Graph 1";
    $scope.graph2_name = "Graph 2";
    $scope.table_name = "Table 1";

    $scope.workflows = [
        ["INNUca", 14],
        ["Prokka", 2],
        ["chewBBACA", 2],
        ["Pathotyping", 1]
    ];

    $scope.workflow_charts = {
        "INNUca": [
            ["Table 1", "table1_div"],
            ["Graph 1", "spades_graph_container"],
            ["Graph 2", "container2"]

        ],
        "Prokka": [
            ["Table 3", "table3_div"]
        ],
        "ChewBBACA": [],
        "Pathotyping": []
    };

    /* Request to get all the available species */
    getSpecies().then((results) => {
       /* Request to get all the available projects */
       getProjects().then((p_results) => {
           populateSelect("project_select", results, p_results);

           $("#submit_project").off("click").on("click", () => {

               $("#reset_project").css({display:"inline-block"});

               $("#reset_project").off("click").on("click", () => {
                   charts.reportsData = [];
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

app.directive('scrollSpy', function ($window) {
    return {
        restrict: 'A',
        controller: function ($scope) {
            $scope.spies = [];
            this.addSpy = function (spyObj) {
                $scope.spies.push(spyObj);
            };
        },
        link: function (scope, elem, attrs) {
            var spyElems;
            spyElems = [];

            $($window).on('scroll', function () {
                var highlightSpy, pos, spy, _i, _len, _ref;
                highlightSpy = null;
                _ref = scope.spies;
                let offset = 200;

                for (s of scope.spies) {
                    spyElems[s.id] = elem.find("#" + s.id)
                }

                // cycle through `spy` elements to find which to highlight
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    spy = _ref[_i];
                    spy.out();

                    // catch case where a `spy` does not have an associated `id` anchor
                    if (spyElems[spy.id].offset() === undefined) {
                        continue;
                    }

                    if ((pos = spyElems[spy.id].offset().top) - $window.scrollY - offset <= 0) {
                        // the window has been scrolled past the top of a spy element
                        spy.pos = pos;

                        if (highlightSpy == null) {
                            highlightSpy = spy;
                        }
                        if (highlightSpy.pos < spy.pos) {
                            highlightSpy = spy;
                        }
                    }
                }

                return highlightSpy != null ? highlightSpy["in"]() : void 0;
            });
        }
    };
});

app.directive('spy', function ($location, $anchorScroll) {
    return {
        restrict: "A",
        require: "^scrollSpy",
        link: function(scope, elem, attrs, affix) {
            // elem.click(function () {
                // $location.hash(attrs.spy);
                // $anchorScroll();
            // });

            affix.addSpy({
                id: attrs.spy,
                in: function() {
                    elem.addClass('active');
                    elem.parent().parent().addClass("active")
                },
                out: function() {
                    elem.removeClass('active');
                }
            });
        }
    };
});