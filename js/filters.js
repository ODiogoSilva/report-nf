/**
 * Tests for the presence of a regular expression in any element of an array
 * @param array
 * @param testString
 */
const testArray = (array, testString) => {

    let re = null;
    let found = false;

    array.forEach((r) => {
        re = new RegExp(r);
        if ( re.test(testString) === true ) {found = true}
    });

    return found
};

/**
 * Tests if the information on a tableRow array for a given header
 * is within the specified range
 * {array} @param rg
 * {array} @tableRow
 */
const testRowValue = (rg, tableRow, header) => {

    // Get header value from reportJson
    let val = null;
    for (const x of tableRow)  {
        if ( x.header === header ) {
            val = x.value
        }
    }

    // Test if value is within range
    if ( rg[0] !== null && val < rg[0] ) {return false}
    if ( rg[1] !== null && val > rg[1] ) {return false}

    return true;
};

const addToFilters = (po, array) => {

    // Define id and push to array if it's not there
    const pid = `${po.project_id}${po.pipeline_id}`;
    if (!array.includes(pid)) {
        array.push(pid)
    }

    return array
};


/**
 * Assigns new values to the data_filters object according to the filters
 * submitted by the user
 * @param filterInstance
 * @param data_filters
 */
const updateFilterObject = (filterInstance) => {


    // Set the active sample filters and reset the temporary filters
    data_filters.sample.active = data_filters.sample.active.concat(filterInstance.sample);
    data_filters.sample.temp = [];
    // Set the active project filters and reset the temporary filters
    data_filters.projectId.active = data_filters.projectId.active.concat(filterInstance.projectId);
    data_filters.projectId.temp = [];

    if (filterInstance.qc !== "" && !data_filters.qc.includes(filterInstance.qc)){
        data_filters.qc.push(filterInstance.qc);
    }
    data_filters.bp.range = filterInstance.bp;
    data_filters.reads.range = filterInstance.reads;
    data_filters["coverage (2nd)"].range = filterInstance["coverage (2nd)"];
    data_filters.contigs.range = filterInstance.contigs;
    data_filters["assembled bp"].range = filterInstance["assembled bp"];

    const scope = angular.element($("#outer")).scope();
    scope.$apply(() => {
        initReports(scope, data, false)
    });


};

/**
 *
 * @param jsonResult
 * @param filterObject
 */
const filterJson = (jsonResult, filterObject) => {

    // Will store the filtered array
    let filteredJson = [];
    // Stores the sample combination of projectid and sampleid that will be
    // filtered
    let filteredIds = [];

    // Populate list of filteredIds
    for ( const po of jsonResult ) {

        // Filter for sample name
        if ( testArray(filterObject.sample.active, po.sample_name) === true ) {
            filteredIds = addToFilters(po, filteredIds);
        }

        // Filter for project id
        const projectName = projectIdMap.get(parseInt(po.project_id));
        if ( testArray(filterObject.projectId.active, projectName) === true ) {
            filteredIds = addToFilters(po, filteredIds);
        }

        if ( po.report_json.task === "integrity_coverage" ) {
            // Filter for base pairs
            if ( !testRowValue(filterObject.bp.range,
                    po.report_json.tableRow, "bp") === true ) {
                filteredIds = addToFilters(po, filteredIds)
            }
            // Filter for number of reads
            if ( !testRowValue(filterObject.reads.range,
                    po.report_json.tableRow, "reads") === true ) {
                filteredIds = addToFilters(po, filteredIds)
            }
        }

        if ( po.report_json.task === "check_coverage" ) {
            // Filter for coverage
            if ( !testRowValue(filterObject["coverage (2nd)"].range,
                    po.report_json.tableRow, "coverage_(2nd)") ) {
                filteredIds = addToFilters(po, filteredIds)
            }
        }

        if (po.report_json.task === "pilon" ) {
            // Filter for number of contigs
            if ( !testRowValue(filterObject.contigs.range,
                    po.report_json.tableRow, "contigs")) {
                filteredIds = addToFilters(po, filteredIds)
            }
            // Filter for assembled base pairs
            if ( !testRowValue(filterObject["assembled bp"].range,
                    po.report_json.tableRow, "contigs") ) {
                filteredIds = addToFilters(po, filteredIds)
            }
        }
    }

    console.log(filterObject)

    // Filter JSON array
    let pid;
    for ( const po of jsonResult ) {
        // Get combination id of current sample
        pid = `${po.project_id}${po.pipeline_id}`;
        if ( !filteredIds.includes(pid) ) {
            filteredJson.push(po)
        }
    }

    return filteredJson
};

/**
 *
 * @param selector
 * @param msg
 */
const showLabel = (selector, spanSelector, helpSelector, msg, type) => {
    // Reset error and Ok classes
    spanSelector.removeClass("glyphicon-remove glyphicon-ok");
    spanSelector.removeClass("text-danger text-success");
    helpSelector.removeClass("text-danger text-success");
    selector.removeClass("has-error has-success")

    // Depending on the provided type, show the message as an error or success
    if ( type === "error" ) {
        selector.addClass("has-error has-feedback");
        helpSelector.addClass("text-danger");
        spanSelector.addClass("glyphicon-remove")
    } else {
        selector.addClass("has-success has-feedback");
        helpSelector.addClass("text-success");
        spanSelector.addClass("glyphicon-ok")

    }

    spanSelector.css({"opacity": "1"});
    spanSelector.css({"display": "block"});

    helpSelector.html(msg);
    helpSelector.css({"display": "block"});
};


/**
 *
 * @param targetId
 */
const checkFilter = (targetId) => {

    // Set selectors and value
    const target = $("#" + targetId);
    const selector = target.parent().parent();
    const spanSelector = $("#" + targetId + "_span");
    const helpSelector = $("#" + targetId + "_help");
    const val = target.val();

    // Adds functionality of removing the error/success class atributes
    // associated with the text-input
    target.off("click").on("click", () => {
        selector.removeClass("has-error has-success has-feedback");
        helpSelector.removeClass("text-danger text-success");
        spanSelector.css({"opacity": "0"});
        helpSelector.css({"display": "none"});
    });

    // Get all sample filters and the filter selector where the new filters
    // will be added
    let activeFilters;
    let filterSelecteor;
    let tempFilters;
    let changePopover;

    if ( targetId === "filter_by_name" ) {
        activeFilters = data_filters.sample.active.concat(data_filters.sample.temp)
        filterSelecteor = $("#" + "popover_filters_sample");
        changePopover = $('#active_filters_name').data('bs.popover');
        tempFilters = data_filters.sample.temp;
    } else {
        activeFilters = data_filters.projectId.active.concat(data_filters.projectId.temp)
        filterSelecteor = $("#" + "popover_filters_project");
        changePopover = $('#active_filters_projectid').data('bs.popover');
        tempFilters = data_filters.projectId.temp
    }

    /* Begin checks here */

    // Check if filter is not empty
    if ( val === "" ) {
        return showLabel(selector, spanSelector, helpSelector, "Empty filter", "error")
    }

    // Check if val can be a regular expression
    try {
        re = new RegExp(val)
    } catch(err) {
        return showLabel(selector, spanSelector, helpSelector, "Invalid expression", "error")
    }

    // Check for duplicate filter terms
    if ( activeFilters.includes(val) ) {
        return showLabel(selector, spanSelector, helpSelector, "Filter already applied", "error")
    }

    /* Checks ended here */

    // If the current value passed all checks, add it to the filter selector
    // and to the data_filters object

    // Random id for filter div
    const filter_id = Math.random().toString(36).substring(7);

    const filterDiv = `<div class="input-group" id="${filter_id}">
                        <input class="form-control ${targetId}" readonly value="${val}">
                        <span class="input-group-addon btn btn-default remove_filter"><i class="fa fa-minus" aria-hidden="true"></i></span>
                       </div>`;

    filterSelecteor.append(filterDiv);
    tempFilters.push(val);

    // Set value of input to empty
    target.val("");

    // Set content of popover
    changePopover.options.content = filterSelecteor.html();

    return showLabel(selector, spanSelector, helpSelector, "Filter successfully added!", "ok")

};
