/*globals
    angular,
    dataFilters,
    projectIdMap,
    initReports,
    showLabel,
    addFilterButton
*/

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

    // Match object for data filters headers in INNUca
    const headersMatch = {
        "Raw_BP": "bp",
        "Contigs": "contigs",
        "Coverage_(2nd)": "coverage_(2nd)",
        "Assembled_BP": "assembled bp",
        "Reads": "reads"
    };

    // Get header value from reportJson
    let val = null;
    for (const x of tableRow)  {
        if ( headersMatch[x.header] === header ) {
            val = x.value;
        }
    }

    // Test if value is within range
    if ( rg[0] !== null && val < rg[0] ) {
        return false;
    }
    return !(rg[1] !== null && val > rg[1]);


};

/**
 * Function to filter projects from the reports that have been removed from the platform
 * @param projects
 * @returns {Promise.<Array>}
 */
const filterProjects = async (projects) => {

    let tempProjects = [];

    for (const project of projects) {
        if (project.is_removed !== "true") {
            tempProjects.push(project);
        }
    }

    return tempProjects;

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

        if (po.report_json.task === "integrity_coverage" && po.report_json.tableRow) {
            // Filter for base pairs
            if ( !testRowValue(filterObject.bp.range,
                    po.report_json.tableRow, "bp") === true ) {
                filteredIds = addToFilters(po, filteredIds);
            }
            // Filter for number of reads
            if ( !testRowValue(filterObject.reads.range,
                    po.report_json.tableRow, "reads") === true ) {
                filteredIds = addToFilters(po, filteredIds);
            }
        }

        if (po.report_json.task === "check_coverage" && po.report_json.tableRow) {
            // Filter for coverage
            if ( !testRowValue(filterObject["coverage (2nd)"].range,
                    po.report_json.tableRow, "coverage_(2nd)") ) {
                filteredIds = addToFilters(po, filteredIds);
            }
        }

        if (po.report_json.task === "pilon" && po.report_json.tableRow) {
            // Filter for number of contigs
            if ( !testRowValue(filterObject.contigs.range,
                    po.report_json.tableRow, "contigs")) {
                filteredIds = addToFilters(po, filteredIds);
            }
            // Filter for assembled base pairs
            if ( !testRowValue(filterObject["assembled bp"].range,
                    po.report_json.tableRow, "assembled bp") ) {
                filteredIds = addToFilters(po, filteredIds);
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

    if (metadataJson.constructor === Array){
        for (const po of metadataJson) {
            const strainMeta = JSON.parse(po.strain_metadata);
            pid = `${po.project_id}${strainMeta.Primary}`;
            if (!filteredIds.includes(pid)) {
                filteredMetadata.push(po);
            }
        }
    }

    return {
        filteredJson,
        filteredMetadata
    };
};


const removeDataFilters = (popoverId, val) => {

    // Determines from which property is the val going to be removed
    let objId;
    if (popoverId === "active_filters_name") {
        objId = "sample";
    } else if (popoverId === "active_filters_projectid") {
        objId = "projectId";
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
    // popover.hide();
    // setTimeout(popover.show(), 700)
    popover.show();


    // Perform changes to data filters, if the popoverId is among the
    // expected Ids for the filter popovers
    const filterIds = ["active_filters_name", "active_filters_projectid"];

    if (filterIds.includes(popoverId)) {
        removeDataFilters(popoverId, val);
    }
};

/**
 * This function checks the input fields of the sample and project filters
 * and triggers the creation of the filter button if the check completes.
 * @param {String} targetId - ID of the button triggered to add the filter
 * (expected to be associated with either sample or project)
 */
const checkFilter = (targetId) => {

    // Set the value
    const target = $("#" + targetId);
    const val = target.val();

    // Get all sample filters and the filter selector where the new filters
    // will be added
    // Array with the concatenation of the active and temporary filters //
    let totalFilters;
    // Selector of the popover content div //
    let filterSelecteor;
    // Array with the temporary filters //
    let tempFilters;
    // String with the ID of the popover data container div//
    let popoverContentId;
    // String with the ID of the popover element //
    let popoverId;
    let helpId;

    // Determine variable values according to the targetID (whether it refers
    // to sample or project filter
    if ( targetId === "filter_by_name" ) {
        totalFilters = dataFilters.sample.active.concat(dataFilters.sample.temp);
        filterSelecteor = $("#" + "popover_filters_sample");
        popoverContentId = "popover_filters_sample";
        popoverId = "active_filters_name";
        tempFilters = dataFilters.sample.temp;
        helpId = $("#filter_by_name_help");
    } else {
        totalFilters = dataFilters.projectId.active.concat(dataFilters.projectId.temp);
        filterSelecteor = $("#" + "popover_filters_project");
        popoverContentId = "popover_filters_project";
        popoverId = "active_filters_projectid";
        tempFilters = dataFilters.projectId.temp;
        helpId = $("#filter_by_projectid_help");
    }

    /* Begin checks here */

    // Check if filter is not empty
    if ( val === "" ) {
        return showLabel(helpId, "Empty filter", "error");
    }

    // Check if val can be a regular expression
    try {
        const re = new RegExp(val);
    } catch(err) {
        return showLabel(helpId, "Invalid expression", "error");
    }

    // Check for duplicate filter terms
    if ( totalFilters.includes(val) ) {
        return showLabel(helpId, "Filter already applied", "error");
    }

    /* Checks ended here */

    // In case the filters were previously empty, remove the default div from
    // the popover content
    if (tempFilters.length === 0 && totalFilters.length === 0){
        filterSelecteor.empty();
    }

    tempFilters.push(val);

    addFilterButton({
        val,
        targetId: popoverContentId,
        popoverId
    });

    return showLabel(helpId, "Filter successfully added!", "success");

};
