/*globals dataFilters, projectIdMap, initReports */

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
        if ( re.test(testString) === true ) {
            found = true;
        }
    });

    return found;
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
            val = x.value;
        }
    }

    // Test if value is within range
    if ( rg[0] !== null && val < rg[0] ) {
        return false;
    }
    return !(rg[1] !== null && val > rg[1]);


};

const addToFilters = (po, array) => {

    // Define id and push to array if it's not there
    const pid = `${po.project_id}${po.sample_name}`;
    if (!array.includes(pid)) {
        array.push(pid);
    }

    return array;
};


/**
 * Assigns new values to the dataFilters object according to the filters
 * submitted by the user
 * @param filterInstance
 * @param dataFilters
 */
const updateFilterObject = (filterInstance) => {


    // Set the active sample filters and reset the temporary filters
    dataFilters.sample.active = dataFilters.sample.active.concat(filterInstance.sample);
    dataFilters.sample.temp = [];
    // Set the active project filters and reset the temporary filters
    dataFilters.projectId.active = dataFilters.projectId.active.concat(filterInstance.projectId);
    dataFilters.projectId.temp = [];

    if (filterInstance.qc !== "" && !dataFilters.qc.includes(filterInstance.qc)){
        dataFilters.qc.push(filterInstance.qc);
    }
    dataFilters.bp.range = filterInstance.bp;
    dataFilters.reads.range = filterInstance.reads;
    dataFilters["coverage (2nd)"].range = filterInstance["coverage (2nd)"];
    dataFilters.contigs.range = filterInstance.contigs;
    dataFilters["assembled bp"].range = filterInstance["assembled bp"];

    const scope = angular.element($("#outer")).scope();
    scope.$apply(() => {
        initReports(scope, data, false);
    });


};

/**
 *
 * @param jsonResult
 * @param filterObject
 * @param metadataJson
 * @return {Object}
 */
const filterJson = (jsonResult, metadataJson, filterObject) => {

    // Will store the filtered array
    let filteredJson = [];
    let filteredMetadata = [];
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
                filteredIds = addToFilters(po, filteredIds);
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

    // Filter JSON array
    let pid;
    for ( const po of jsonResult ) {
        // Get combination id of current sample
        pid = `${po.project_id}${po.sample_name}`;
        if ( !filteredIds.includes(pid) ) {
            filteredJson.push(po);
        }
    }

    for (const po of metadataJson) {
        const strainMeta = JSON.parse(po.strain_metadata);
        pid = `${po.project_id}${strainMeta.Primary}`;
        if (!filteredIds.includes(pid)) {
            filteredMetadata.push(po);
        }
    }

    return {
        filteredJson,
        filteredMetadata
    };
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
    selector.removeClass("has-error has-success");

    // Depending on the provided type, show the message as an error or success
    if ( type === "error" ) {
        selector.addClass("has-error has-feedback");
        helpSelector.addClass("text-danger");
        spanSelector.addClass("glyphicon-remove");
    } else {
        selector.addClass("has-success has-feedback");
        helpSelector.addClass("text-success");
        spanSelector.addClass("glyphicon-ok");

    }

    spanSelector.css({"opacity": "1"});
    spanSelector.css({"display": "block"});

    helpSelector.html(msg);
    helpSelector.css({"display": "block"});
};


const removeDataFilters = (popoverId, val) => {

    // Determines from which property is the val going to be removed
    let objId;
    if (popoverId === "active_filters_name") {
        objId = "sample"
    } else if (popoverId === "active_filters_projectid") {
        objId = "projectId"
    }

    // Removes val from both active and temp arrays
    let toRemove = dataFilters[objId].active.indexOf(val);
    dataFilters[objId].active.splice(toRemove, 1);
    toRemove = dataFilters[objId].temp.indexOf(val);
    dataFilters[objId].temp.splice(toRemove, 1);

};

/**
 * Function that gives functionality to the remove buttons in the filter
 * and highlight popovers
 *
 * @param {String} popoverContentId - ID of the popover content div
 * @param {String} removeId - ID of the remove button element
 * @param {String} popoverId - ID of the div associated with the popover
 * @param {String} val - Value that is going to be removed
 */
const removeFilterButton = (popoverContentId, removeId, popoverId, val) => {

    // Selector for the popover content div
    const filters = $("#" + popoverContentId);
    // Selector for the popover element
    const popover = $("#" + popoverId).data("bs.popover");

    // Remove the input-group from the popover content div based on the
    // ID of the removal button
    filters.find("#" + removeId).remove();

    // Get the html content from the popover content div
    const updatedContent = filters.html();

    // If the content is empty, update the popover selector with a
    // default div
    if (updatedContent) {
        popover.options.content = updatedContent;
    } else {
        popover.options.content = "<div>No filters applied!</div>";
    }

    // Update and redraw the popover
    popover.setContent();
    popover.hide();
    popover.show();

    // Perform changes to data filters, if the popoverId is among the
    // expected Ids for the filter popovers
    const filterIds = ["active_filters_name", "active_filters_projectid"];

    if (filterIds.includes(popoverId)) {
        removeDataFilters(popoverId, val)
    }
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
    let popoverContentId;
    let popoverId;

    if ( targetId === "filter_by_name" ) {
        activeFilters = dataFilters.sample.active.concat(dataFilters.sample.temp);
        filterSelecteor = $("#" + "popover_filters_sample");
        popoverContentId = "popover_filters_sample";
        popoverId = "active_filters_name";
        changePopover = $("#active_filters_name").data("bs.popover");
        tempFilters = dataFilters.sample.temp;
    } else {
        activeFilters = dataFilters.projectId.active.concat(dataFilters.projectId.temp);
        filterSelecteor = $("#" + "popover_filters_project");
        popoverContentId = "popover_filters_project";
        popoverId = "active_filters_projectid";
        changePopover = $("#active_filters_projectid").data("bs.popover");
        tempFilters = dataFilters.projectId.temp;
    }

    /* Begin checks here */

    // Check if filter is not empty
    if ( val === "" ) {
        return showLabel(selector, spanSelector, helpSelector, "Empty filter", "error");
    }

    // Check if val can be a regular expression
    try {
        const re = new RegExp(val);
    } catch(err) {
        return showLabel(selector, spanSelector, helpSelector, "Invalid expression", "error");
    }

    // Check for duplicate filter terms
    if ( activeFilters.includes(val) ) {
        return showLabel(selector, spanSelector, helpSelector, "Filter already applied", "error");
    }

    /* Checks ended here */

    // If the current value passed all checks, add it to the filter selector
    // and to the dataFilters object

    // Random id for filter div
    const filterId = Math.random().toString(36).substring(7);

    const filterTemplate = '<div class="input-group" id="{{ fId }}">' +
                        '<input class="form-control {{ targetId }}" readonly value="{{ val }}">' +
                        '<span onclick="removeFilterButton(\'{{ tId }}\',\'{{ fId }}\', \'{{ pop }}\', \'{{ val }}\')" class="input-group-addon btn btn-default remove_filter"><i class="fa fa-minus" aria-hidden="true"></i></span>' +
                       '</div>';

    const filterDiv = Mustache.to_html(filterTemplate, {
        fId: filterId,
        tId: popoverContentId,
        val,
        pop: popoverId
    });

    console.log(filterDiv)

    // Case first filter
    if(tempFilters.length === 0 && activeFilters.length === 0){
        filterSelecteor.empty();
    }

    filterSelecteor.append(filterDiv);
    tempFilters.push(val);

    // Set value of input to empty
    target.val("");


    // Set content of popover
    if(activeFilters.length === 0 && tempFilters.length === 0){
        changePopover.options.content = "<div>No filters applied!</div>";
    }
    else {
        changePopover.options.content = filterSelecteor.html();
    }


    return showLabel(selector, spanSelector, helpSelector, "Filter successfully added!", "ok");

};
