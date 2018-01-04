/*global angular, ChartManager, Table, filterJson, getSpecies, getProjects, getReportsByProject, downloadProfiles, updateFilterObject*/
const app = angular.module("reportsApp", []);

// Array of JSON files with the report data
let data = null;

// JSON mapping of report id with current chewbbaca procedures
let chewbbacaToReportId = {};

// Object with the project filters. Each value can be dynamically changed
// during the app session
let dataFilters = {
    "sample": {"active": [], "temp": []},
    "projectId": {"active": [], "temp": []},
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
const charts = new ChartManager();

// Init tables
const innucaTable = new Table("master_table_innuca");
const chewbbacaTable = new Table("master_table_chewbbaca");
const prokkaTable = new Table("master_table_prokka");

/**
 * Function to build tables and graphs based on the reports
 * @param scope
 * @param results
 * @param {boolean} append - If true, the processInnuca method will update the
 * maximum values for the dataFilters
 */
const initReports = (scope, results, append = true) => {

    // Apply any existing filters to the JSON array results from the request
    const p1 = new Promise( (resolve, reject) => {
        const r = filterJson(results, dataFilters);
        // Only resolve the promise when the results array is not empty
        if (r.length !== 0) {
            resolve(r);
        } else {
            alert("Warning: Empty report object");
        }

    });

    console.log(results);

    // Update the data array with the new filtered results
    data = results;

    /* Launch Tables */
    p1.then( async (r) => {
        const resultsCh = await innucaTable.processInnuca(r, !append);
        await innucaTable.addTableHeaders(scope, resultsCh,
            "table_headers_innuca");
        await innucaTable.addTableData(resultsCh, append);
        await innucaTable.buildDataTable(scope);
    });

    p1.then( async (r) => {
        const resultsCh = await chewbbacaTable.processChewbbaca(r);
        await chewbbacaTable.addTableHeaders(scope, resultsCh,
            "table_headers_chewbbaca");
        await chewbbacaTable.addTableData(resultsCh);
        await chewbbacaTable.buildDataTable();
    });

    p1.then( async (r) => {
        const resultsCh = await prokkaTable.processProkka(r);
        await prokkaTable.addTableHeaders(scope, resultsCh,
            "table_headers_prokka");
        await prokkaTable.addTableData(resultsCh);
        await prokkaTable.buildDataTable();
    });

    /* Launch charts */
    p1.then( async (r) => {
        await charts.addReportData(r, append);
        await charts.buildAllCharts();
    });
};

const modalAlert = (text, callback) => {

    $("#buttonSub").off("click");
    $("#buttonCancelAlert").off("click");

    $("#modalAlert .modal-body").empty();
    $("#modalAlert .modal-body").append("<p>"+text+"</p>");

    $("#buttonSub").one("click", function(){
        $("#modalAlert").modal("hide");

        setTimeout(function(){return callback();}, 400);
    });

    $("#modalAlert").modal("show");

};

/* Angular controller to control the DOM elements from the index.html file */
app.controller("reportsController", async ($scope) => {

    $scope.graph1Name = "Graph 1";
    $scope.graph2Name = "Graph 2";
    $scope.tableName = "Main table";
    $scope.fastqcName = "FastQC";

    $scope.workflows = [
        ["Assembly", 14],
        ["Annotation", 2],
        ["chewBBACA", 2],
        ["Pathotyping", 1]
    ];

    $scope.workflowCharts = {
        "Assembly": [
            ["Main table", "table1_div"],
            ["FastQC", "fastqcContainer"],
            ["Graph 1", "spades_graph_container"],
            ["Graph 2", "container2"]

        ],
        "Annotation": [
            ["Table 3", "table3_div"]
        ],
        "ChewBBACA": [],
        "Pathotyping": []
    };

    $scope.qcLevels = ["A", "B", "C", "D", "F"];

    // Initialize homepage species/project dropdown
    $(".selectpicker").selectpicker();

    // Query information about available species and projects
    const spResults = await getSpecies();
    const pResults = await getProjects();

    // Populate dropdown with species/project info
    populateSelect("project_select", spResults, pResults);
    // Populate dropdown with species/project info for navbar
    populateSelect("navProjectPicker", spResults, pResults);

    // Initialize the behaviour of the toggle buttons
    // in the home screen for selecting/loading projects
    initHomeButtonsToggle();

    // Initialize the Project selection picker and filter elements
    initProjectSelection();
    initNavSelection();

    // Initialize the project selection submission
    initProjectSubmission($scope);

    // Initialize the project resubmission in the navbar
    initResubmit($scope);

    /* Event to be triggered when a file is dropped into the body of the page */
    $("#body_container").on("dropFile", async (ev, results) => {
        /*
            Rebuild tables and graphs
         */
        $("#waiting_gif").css({display: "block"});
        $("#homeInnuendo").css({display: "none"});

        data = results.data;
        dataFilters = results.dataFilters;

        await initReports($scope, results.data);

        $("#waiting_gif").css({display:"none"});
        $("#row-main").css({display:"block"});
        $("#current_workflow").css({display:"block"});

    });

    /* Event to toggle workflows sidebar */
    $(".toggle_sidebar").on("click", (e) => {
        console.log(e.target);
        /* to toggle the sidebar, just switch the CSS classes */
        $("#workflows_sidebar").toggleClass("collapsed_sidebar");
        $("#workflows_content").toggleClass("col-md-12 col-md-10");
        $(".toggle_sidebar").toggleClass("hide_button");
        return false;
    });


    $("#body_container").css({display:"block"});

    setTimeout( () => {
        $("#phyloviz_button").off("click").on("click", () => {
            $("#sendToPHYLOViZModal").modal("show");
        });

        $("#download_profiles_button").off("click").on("click", () => {
            const sent = downloadProfiles();
            if (!sent){
                modalAlert("Please select a sample for the table first.", () => {});
            }
        });

        // when opening the sidebar
        $("#sidebar-button").on("click", () => {

            const sidebarSel = $("#sidebar");
            const sidebarBtn = $("#sidebar-button");

            if (sidebarSel.hasClass("active")) {
                sidebarBtn.css({color: "#ffffff"});
                $(".overlay").fadeOut();
                $(".popover").removeClass("in");
            } else {
                sidebarBtn.css({color: "#28a745"});
                // fade in the overlay
                $(".overlay").fadeIn();
                $("a[aria-expanded=true]").attr("aria-expanded", "false");
            }

            // open sidebar
            sidebarSel.toggleClass("active");

        });

        // if dismiss or overlay was clicked
        $("#dismiss, .overlay").on("click", function () {
            // hide the sidebar
            $("#sidebar-button").trigger("click");
        });

        // Render FastQC plots for the first time on demand by pressing the tabs
        $("#fastqcTabs").on("shown.bs.tab", (e) => {
            let container = $(e.target).attr("data-target");
            charts.buildChart(container.replace("#", ""));
        });

        /* Show/hide tabs of spades and its divs */
        // $("#spades_ul a").click(function () {
        //     $("#spades_ul li").removeClass("active");
        //     $(this).addClass("active");
        //     $(".box").hide().eq($(this).index()).show();  // hide all divs and show the current div
        // });

        $("#assemblyTabs").find("a").click( (e) => {
            e.preventDefault();
            $(this).tab("show");
        });

        $("#modalGraphs").on("hidden.bs.modal scroll", () => {WebuiPopovers.hideAll()})
        //
        // /* Trigger style of dropdowns */
        // $(".selectpicker").selectpicker({
        //     style: "btn-primary",
        //     size: 4
        // });


        // Get html to popover of sample filters
        $("#active_filters_name").popover({
            html : true,
            trigger: "focus",
            content() {
                return $("#popover_filters_sample").html();
            }
        }).off("show.bs.popover").on("show.bs.popover", () => {
            setTimeout(() => {
                const rFilter = $(".remove_filter");
                rFilter.off("click").on("click", (e) => {

                    const filters = $("#popover_filters_sample");
                    const target = $(e.target);
                    const pDivId = target.closest("div").attr("id");
                    filters.find("#"+pDivId).remove();

                    // Dynamically set content of popover
                    const popover = $("#active_filters_name").data("bs.popover");
                    popover.options.content = filters.html();

                    // Remove filter from temp and active filters
                    const val = target.parent().find("input").val();
                    let toRemove = dataFilters.sample.active.indexOf(val);
                    dataFilters.sample.active.splice(toRemove, 1);
                    toRemove = dataFilters.sample.temp.indexOf(val);
                    dataFilters.sample.temp.splice(toRemove, 1);

                    if(dataFilters.sample.temp.length === 0 && dataFilters.sample.active.length === 0){
                        popover.options.content = "<div>No filters applied!</div>";
                    }
                });
            }, 200);
        });

        // Get html to popover of project filters
        $("#active_filters_projectid").popover({
            html : true,
            trigger: "focus",
            content() {
                return $("#popover_filters_project").html();
            }
        }).off("show.bs.popover").on("show.bs.popover", () => {
            setTimeout(() => {
                const rFilter = $(".remove_filter");
                rFilter.off("click").on("click", (e) => {
                    const filters = $("#popover_filters_project");
                    const target = $(e.target);
                    const pDivId = target.closest("div").attr("id");
                    filters.find("#"+pDivId).remove();

                    // Dynamically set content of popover
                    const popover = $("#active_filters_projectid").data("bs.popover");
                    popover.options.content = filters.html();

                    // Remove filter from temp and active filters
                    const val = target.parent().find("input").val();
                    let toRemove = dataFilters.projectId.active.indexOf(val);
                    dataFilters.projectId.active.splice(toRemove, 1);
                    toRemove = dataFilters.projectId.temp.indexOf(val);
                    dataFilters.projectId.temp.splice(toRemove, 1);

                    if(dataFilters.projectId.temp.length === 0 && dataFilters.projectId.active.length === 0){
                        popover.options.content = "<div>No filters applied!</div>";
                    }

                });
            }, 200);
        });

        /**
         *  This function set the trigger for changes in the input loaded from a file in the Home page
         */
        $(document).on('change', ':file', function() {
            const input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            input.trigger('fileselect', [numFiles, label]);

            readReportFile(input.get(0).files);
        });

        $(document).ready( function() {
            $(':file').on('fileselect', function(event, numFiles, label) {
                const input = $(this).parents('.input-group').find(':text');
                input.val(label);

            });
        });

        $("#sliderbp").slider({ id: "sliderbpc", min: 0, max: 10, range: true});
        $("#sliderrn").slider({ id: "sliderrnc", min: 0, max: 10, range: true});
        $("#sliderc").slider({ id: "slidercc", min: 0, max: 10, range: true});
        $("#slidercn").slider({ id: "slidercnc", min: 0, max: 10, range: true});
        $("#sliderabp").slider({ id: "sliderabpc", min: 0, max: 10, range: true});

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
                "sample": dataFilters.sample.temp,
                "projectId": dataFilters.projectId.temp,
                "qc": $( "#qc_select").find("option:selected" ).text()

            };

            updateFilterObject(filterInstance, dataFilters);

        });

        /* Trigger filters reset */
        $("#reset_filter_button").off("click").on("click", () => {


        });

    }, 100);

});

app.directive("scrollSpy", function ($window) {
    return {
        restrict: "A",
        controller($scope) {
            $scope.spies = [];
            this.addSpy = function (spyObj) {
                $scope.spies.push(spyObj);
            };
        },
        link(scope, elem, attrs) {
            var spyElems;
            spyElems = [];

            $($window).on("scroll", function () {
                var highlightSpy, pos, spy, _i, _len, _ref;
                highlightSpy = null;
                _ref = scope.spies;
                let offset = 250;

                for (const s of scope.spies) {
                    spyElems[s.id] = elem.find("#" + s.id);
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

app.directive("spy", function ($location, $anchorScroll) {
    return {
        restrict: "A",
        require: "^scrollSpy",
        link(scope, elem, attrs, affix) {

            affix.addSpy({
                id: attrs.spy,
                in() {
                    elem.addClass("active");
                    elem.parent().parent().addClass("active");
                },
                out() {
                    elem.removeClass("active");
                }
            });
        }
    };
});