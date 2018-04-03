/*global
    abricateTable,
    angular,
    charts,
    ChartManager,
    chewbbacaTable,
    data,
    dataFilters,
    dataHighlights,
    downloadProfiles,
    filterJson,
    filterPopovers,
    getPHYLOViZTrees,
    getProjects,
    getReportsByProject,
    getSpecies,
    initDetails,
    initDropFile,
    initHighlights,
    initHomeButtonsToggle,
    initNavSelection,
    initProjectSelection,
    initProjectSubmission,
    initSampleSpecificModal,
    initResubmit,
    initToggleSidebar,
    innucaTable,
    metadataTable,
    populateSelect,
    populateSelectPHYLOViZ,
    processPHYLOViZRequest,
    prokkaTable,
    readReportFile,
    runFromParent,
    showTree,
    Table,
    treesTable,
    triggerHighlights,
    updateFilterObject,
    updateHighlightOptions,
    WebuiPopovers,
*/
const app = angular.module("reportsApp", []);

/**
 * Function to build tables and graphs based on the reports
 * @param scope
 * @param {boolean} append - If true, the processInnuca method will update the
 * maximum values for the dataFilters
 * @param globalResults
 */
const initReports = (scope, globalResults, append = true) => {

    //globalResults has reports and metadata
    //NOTE: Filters only working on reports, not on metadata
    const results = globalResults.results;
    const metadataResults = (globalResults.metadataResults ? globalResults.metadataResults : {});

    // Apply any existing filters to the JSON array results from the request
    const p1 = new Promise( (resolve, reject) => {
        const r = filterJson(results, metadataResults, dataFilters);
        taskArray = [];

        //Add tasks list to array
        r.filteredJson.map((report) => {
            if(report.report_json.task !== undefined){

                task_to_use = report.report_json.task.split("_");
                task_to_use.splice(-1,1);
                task_to_use = task_to_use.join("_");

                if (!strainTableValDict.hasOwnProperty(report.sample_name)){
                    strainTableValDict[report.sample_name] = {};
                }

                if (report.report_json.hasOwnProperty("tableRow")){
                    if(!taskArray.includes(task_to_use)){
                        taskArray.push(task_to_use);
                    }
                    strainTableValDict[report.sample_name][task_to_use] = report.report_json.tableRow;
                }
                else if (report.report_json.hasOwnProperty("typing")){
                    if(!taskArray.includes(task_to_use)){
                        taskArray.push(task_to_use);
                    }
                    strainTableValDict[report.sample_name][task_to_use] = [report.report_json.typing];
                }
                else if (report.report_json.hasOwnProperty("status")) {
                    if(!taskArray.includes(task_to_use)){
                        taskArray.push(task_to_use);
                    }
                    strainTableValDict[report.sample_name][task_to_use] = [{"chewBBACAStatus":report.report_json.status}];
                }
                else if (task_to_use === "mlst") {
                    if(!taskArray.includes(task_to_use)){
                        taskArray.push(task_to_use);
                    }
                    strainTableValDict[report.sample_name][task_to_use] = [{"species":report.report_json.species, "st": report.report_json.st}];
                }

            }
        });

        // Only resolve the promise when the results array is not empty
        if (r.length !== 0) {
            // Get pipeline info stats. This is performed between the filtering
            // and subsequent data processing because some functions may
            // depend on this information
            getPipelineInfo(r);
            resolve(r);
        } else {
            alert("Warning: Empty report object");
        }

    });


    // Update the data array with the new filtered results
    data = {
        results,
        metadataResults
    };

    /* Launch Tables */

    ( async () => {
        const resultsCh = await treesTable.processTrees(trees, false);
        await treesTable.addTableHeaders(resultsCh,
            "table_headers_trees");
        await treesTable.addTableData(resultsCh, false);
        await treesTable.buildDataTable(true);
    } )();

    p1.then( async (r) => {
        const resultsCh = await metadataTable.processMetadata(r.filteredMetadata, append);
        await metadataTable.addTableHeaders(resultsCh,
            "table_headers_metadata");
        await metadataTable.addTableData(resultsCh, append);
        await metadataTable.buildDataTable(true);
    });

    p1.then( async (r) => {
        const resultsCh = await typingTable.processTyping(r.filteredJson, append);
        await typingTable.addTableHeaders(resultsCh, "table_headers_typing");
        await typingTable.addTableData(resultsCh, append);
        await typingTable.buildDataTable();
    });

    p1.then( async (r) => {
        const resultsCh = await innucaTable.processInnuca(r.filteredJson, append);
        await innucaTable.addTableHeaders(resultsCh,
            "table_headers_innuca");
        await innucaTable.addTableData(resultsCh, append);
        await innucaTable.buildDataTable(true);
    });

    p1.then( async (r) => {
        const resultsCh = await chewbbacaTable.processChewbbaca(r.filteredJson);
        chewbbacaTable.initCompleteFunc = chewbbacaHeaderTooltip;
        await chewbbacaTable.addTableHeaders(resultsCh,
            "table_headers_chewbbaca");
        await chewbbacaTable.addTableData(resultsCh, append);
        await chewbbacaTable.buildDataTable(true);
    });

    p1.then( async (r) => {
        const resultsCh = await prokkaTable.processProkka(r.filteredJson);
        await prokkaTable.addTableHeaders(resultsCh,
            "table_headers_prokka");
        await prokkaTable.addTableData(resultsCh, append);
        await prokkaTable.buildDataTable(true);
    });

    p1.then( async (r) => {
        const resultsCh = await abricateTable.processAbricate(r.filteredJson);
        await abricateTable.addTableHeaders(resultsCh,
            "table_headers_abricate");
        await abricateTable.addTableData(resultsCh, append);
        await abricateTable.buildDataTable(true);
    });

    /* Launch charts */
    p1.then( async (r) => {
        await charts.addReportData(r.filteredJson, append);
        await charts.buildAllCharts();
        if (dataHighlights.samples.concat(dataHighlights.projects).length > 0){
            await triggerHighlights();
        }
    });

    // Update sidebar selector options for auto complete
    p1.then( (r) => {
        updateHighlightOptions(r);
        initDetails();
    });

    console.log(data)

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


const modalMessage = (text, title) => {

    const modalBody = $("#modalMessageBody");
    modalBody.empty();
    modalBody.html(`<p>${text}</p>`);

    $("#ModalAlertTitle").html(title);

    $("#modalMessage").modal("show");

};


/* Angular controller to control the DOM elements from the index.html file */
app.controller("reportsController", async ($scope) => {


    $scope.graph1Name = "Assembly charts";
    $scope.graph2Name = "Graph 2";
    $scope.fastqcName = "FastQC";

    $scope.workflows = [
        ["Metadata", 14],
        ["Typing", 1],
        ["Assembly", 14],
        ["Annotation", 2],
        ["chewBBACA", 2],
    ];

    $scope.trees = [
        ["PHYLOVIZ", 14],
    ];

    $scope.workflowCharts = {
        "Metadata": [
            ["Strains metadata", "table_metadata_div"]
        ],
        "Typing": [
            ["Main table", "master_table_typing"],
        ],
        "Assembly": [
            ["Main table", "innucaTableDiv"],
            ["FastQC", "fastqcContainer"],
            ["Assembly charts", "assemblyCharts"],
            // ["Graph 2", "container2"]

        ],
        "Annotation": [
            ["Antimicrobial resistance", "master_table_abricate"]
        ],
        "ChewBBACA": [],
        "PHYLOVIZ": [
            ["PHYLOViZ Table", "table_trees_div"]
        ]
    };

    $scope.qcLevels = ["A", "B", "C", "D", "F"];

    // Initialize homepage species/project dropdown
    $(".selectpicker").selectpicker();

    $scope.sendToPHYLOViZ = () => {
        processPHYLOViZRequest(chewbbacaTable);
    };

    // Query information about available species and projects
    const spResults = await getSpecies();
    let pResults = await getProjects();

    pResults = await filterProjects(pResults);

    console.log(pResults);

    //Get info in case of app on iframe
    runFromParent();

    //
    // GENERAL INITS
    //

    // Initialize drop file behaviour for loading reports
    initDropFile($scope);

    //
    // HOMEPAGE INITS //
    //

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

    //
    // NAVBAR INITS //
    //

    // Initialize the project resubmission in the navbar
    initResubmit($scope);
    // Initialize sidebar toggle behaviour
    initToggleSidebar();

    //
    // SIDEBAR INITS //
    //

    // Behaviour for filter popovers
    filterPopovers();
    initHighlights();

    //
    // PHYLOVIZ INITS //
    //

    // Populate dropdown with species database from the platform.
    populateSelectPHYLOViZ("species_database", speciesDatabase);

    //
    // MODALs INITS //
    //

    initSampleSpecificModal();

    /* Event to toggle workflows sidebar */
    $(".toggle_sidebar").on("click", (e) => {
        /* to toggle the sidebar, just switch the CSS classes */
        $("#workflows_sidebar").toggleClass("collapsed_sidebar");
        $("#workflows_content").toggleClass("col-md-12 col-md-10");
        $(".toggle_sidebar").toggleClass("hide_button");
        return false;
    });


    $("#body_container").css({display:"block"});

    setTimeout( () => {

        //Show PHYLOViZ form to perform the request to the platform
        $("#phyloviz_button").off("click").on("click", () => {
            $("#sendToPHYLOViZModal").modal("show");

            //Set max submission value
            const selectedRows = chewbbacaTable.tableObj.rows(".selected").data().length;
            const maxClosestValue = phylovizMaxSubSize / selectedRows;

            $("#closest_number_of_strains").attr("max", String(maxClosestValue));
        });

        //Event to trigger click Sign In
        $("#formSignIn").on("submit", () => {
            processAuth();
        });

        //Event to show phyloviz tree
        $("#phyloviz_button_show").off("click").on("click", () => {
            const selTree = $.map(treesTable.tableObj.rows(".selected").data(), (d) => {
                return d.uri;
            });
            showTree(selTree);
        });

        $("#download_profiles_button").off("click").on("click", () => {
            const sent = downloadProfiles();
            if (!sent){
                modalAlert("Please select a sample for the table first.", () => {});
            }
        });

        // if dismiss or overlay was clicked
        $("#dismiss, .overlay").on("click", function () {
            // hide the sidebar
            $("#sidebar-button").trigger("click");
        });

        // Render FastQC plots for the first time on demand by pressing the tabs
        $("#fastqcTabs, #assemblyTabs").on("shown.bs.tab", (e) => {
            let container = $(e.target).attr("data-target");
            charts.buildChart(container.replace("#", ""), false);
            // Change the atInit property of the charts, so that the correct
            // one is drawn when resubmitting data to the reports
            charts.charts.get(container.replace("#", "")).atInit = true;
            const prevContainer = $(e.relatedTarget).attr("data-target");
            charts.charts.get(prevContainer.replace("#", "")).atInit = false;
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

        $("#modalGraphs").on("hidden.bs.modal scroll", () => {WebuiPopovers.hideAll();});

        /**
         *  This function set the trigger for changes in the input loaded from a file in the Home page
         */
        $(document).on("change", ":file", function() {
            const input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, "/").replace(/.*\//, "");
            input.trigger("fileselect", [numFiles, label]);

            readReportFile(input.get(0).files);
        });

        $(document).ready( function() {
            $(":file").on("fileselect", function(event, numFiles, label) {
                const input = $(this).parents(".input-group").find(":text");
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