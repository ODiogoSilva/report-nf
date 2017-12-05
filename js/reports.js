const app = angular.module("reportsApp", []);

// Array of JSON files with the report data
let data = null;

// Object with the project filters. Each value can be dynamically changed
// during the app session
let data_filters = {
    "sample": [],
    "projectId": [],
    "qc": [],
    "bp": {"range": [null, null], "max": null},
    "reads": {"range": [null, null], "max": null},
    "coverage (2nd)": {"range": [null, null], "max": null},
    "contigs": {"range": [null, null], "max": null},
    "assembled bp": {"range": [null, null], "max": null},
};

// Object that will store the mapping between the project_id key in the JSON
// reports and the corresponding project name
let projectIdMap = new Map();

// Init charts
const charts = new Charts();

// Init tables
const innuca_table = new Table("master_table_innuca");
const chewbbaca_table = new Table("master_table_chewbbaca");
const prokka_table = new Table("master_table_prokka");

/**
 * Function to build tables and graphs based on the reports
 * @param scope
 * @param results
 * @param {boolean} setMax - If true, the processInnuca method will update the
 * maximum values for the data_filters
 */
const initReports = (scope, results, setMax = true) => {

    $("#waiting_gif").css({display:"block"});
    $("#row-main").css({display:"none"});

    // Apply any existing filters to the JSON array results from the request
    const p1 = new Promise( (resolve) => {
            resolve(filterJson(results, data_filters));
        }
    );

    // Update the data array with the new filtered results
    data = results;

    /* Launch Tables */
    p1.then( async (r) => {
        const results_ch = await innuca_table.processInnuca(r, setMax);
        await innuca_table.addTableHeaders(scope, results_ch,
            "table_headers_innuca");
        await innuca_table.addTableData(results_ch);
        await innuca_table.buildDataTable(scope);
    });

    p1.then( async (r) => {
        const results_ch = await chewbbaca_table.processChewbbaca(r);
        await chewbbaca_table.addTableHeaders(scope, results_ch,
            "table_headers_chewbbaca");
        await chewbbaca_table.addTableData(results_ch);
        await chewbbaca_table.buildDataTable();
    });

    p1.then( async (r) => {
        const results_ch = await prokka_table.processProkka(r);
        await prokka_table.addTableHeaders(scope, results_ch,
            "table_headers_prokka");
        await prokka_table.addTableData(results_ch);
        await prokka_table.buildDataTable();
    });


    p1.then( async (r) => {
        await charts.addReportData(r);
        await charts.buildSpadesGraphs();
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
        projectIdMap.set(entry.id, entry.name)
    });

    $("#"+container).empty().append(options).selectpicker('refresh').selectpicker('setStyle', 'btn-default');

};

/* Angular controller to control the DOM elements from the index.html file */
app.controller("reportsController", function($scope){

    $scope.graph1_name = "Graph 1";
    $scope.graph2_name = "Graph 2";
    $scope.table_name = "Main table";

    $scope.workflows = [
        ["Assembly", 14],
        ["Annotation", 2],
        ["chewBBACA", 2],
        ["Pathotyping", 1]
    ];

    $scope.workflow_charts = {
        "Assembly": [
            ["Main table", "table1_div"],
            ["Graph 1", "spades_graph_container"],
            ["Graph 2", "container2"]

        ],
        "Annotation": [
            ["Table 3", "table3_div"]
        ],
        "ChewBBACA": [],
        "Pathotyping": []
    };

    $scope.qc_levels = ["A", "B", "C", "D", "F"];

    /* Request to get all the available species */
    getSpecies().then((results) => {
       /* Request to get all the available projects */
       getProjects().then((p_results) => {
           populateSelect("project_select", results, p_results);

           $("#submit_project").off("click").on("click", () => {

               $("#reset_project").css({display:"inline-block"});

               $("#reset_project").off("click").on("click", () => {
                   charts.reportsData = [];
                   chewbbaca_table.tableData = [];
                   innuca_table.tableData = [];
                   prokka_table.tableData = [];

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


    $("#body_container").css({display:"block"});

    setTimeout( () => {
        $('#phyloviz_button').off("click").on("click", () => {
            $('#sendToPHYLOViZModal').modal('show');
        });

        // when opening the sidebar
        $('#sidebar-button').on('click', function () {
            // open sidebar
            $('#sidebar').addClass('active');
            // fade in the overlay
            $('.overlay').fadeIn();
            $('a[aria-expanded=true]').attr('aria-expanded', 'false');
        });

        /* Show/hide tabs of spades and its divs */
        $("#spades_ul li").click(function () {
            $("#spades_ul li").removeClass("active");
            $(this).addClass("active");
            $('.box').hide().eq($(this).index()).show();  // hide all divs and show the current div
        });

        /* Trigger style of dropdowns */
        $('.selectpicker').selectpicker({
            style: 'btn-default',
            size: 4
        });


        // if dismiss or overlay was clicked
        $('#dismiss, .overlay').on('click', function () {
            // hide the sidebar
            $('#sidebar').removeClass('active');
            // fade out the overlay
            $('.overlay').fadeOut();
            $('.popover').removeClass("in");
        });

        // Get html to popover of filters
        $('.active_filters').popover({
            html : true,
            content: function() {
                return $('#popover_filters_content').html();
            }
        });

        $("#sliderbp").slider({ id: "sliderbpc", min: 0, max: 10, range: true, value: [3, 7] });
        $("#sliderrn").slider({ id: "sliderrnc", min: 0, max: 10, range: true, value: [3, 7] });
        $("#sliderc").slider({ id: "slidercc", min: 0, max: 10, range: true, value: [3, 7] });
        $("#slidercn").slider({ id: "slidercnc", min: 0, max: 10, range: true, value: [3, 7] });
        $("#sliderabp").slider({ id: "sliderabpc", min: 0, max: 10, range: true, value: [3, 7] });

        /* Trigger check for regex and filter by project id */
        $(".add_filter").off("click").on("click", () => {
            // Add check here
        });

        /* Trigger filter functions on filter button click */
        $("#filter_button").off("click").on("click", () => {
            const filterInstance = {
                "bp": $("#sliderbp").data("slider").getValue(),
                "reads": $("#sliderrn").data("slider").getValue(),
                "coverage (2nd)": $("#sliderc").data("slider").getValue(),
                "contigs": $("#slidercn").data("slider").getValue(),
                "assembled bp": $("#sliderabp").data("slider").getValue(),
                "sample": $("#filter_by_name").val(),
                "projectId": $("#filter_by_projectid").val(),
                "qc": $( "#qc_select option:selected" ).text()

            };

            data_filters = updateFilterObject(filterInstance, data_filters);
            console.log(data_filters);

            console.log(filterInstance);
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