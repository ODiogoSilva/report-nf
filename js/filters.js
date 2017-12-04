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
 * Assigns new values to the data_filters object according to the filters submitted by the user
 * @param filterInstance
 * @param filterObject
 */
const updateFilterObject = (filterInstance, filterObject) => {
    if (filterInstance.sample !== "" && !filterObject.sample.includes(filterInstance.sample)){
        filterObject.sample.push(filterInstance.sample);
    }
    if (filterInstance.projectId !== "" && !filterObject.projectId.includes(filterInstance.projectId)){
        filterObject.projectId.push(filterInstance.projectId);
    }
    if (filterInstance.qc !== "" && !filterObject.qc.includes(filterInstance.qc)){
        filterObject.qc.push(filterInstance.qc);
    }
    filterObject.bp.range = filterInstance.bp;
    filterObject.reads.range = filterInstance.reads;
    filterObject["coverage (2nd)"].range = filterInstance["coverage (2nd)"];
    filterObject.contigs.range = filterInstance.contigs;
    filterObject["assembled bp"].range = filterInstance["assembled bp"];

    return filterObject;

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
        if ( testArray(filterObject.sample, po.sample_name) === true ) {
            filteredIds = addToFilters(po, filteredIds);
        }

        // Filter for project id
        const projectName = projectIdMap.get(parseInt(po.project_id));
        if ( testArray(filterObject.projectId, projectName) === true ) {
            filteredIds = addToFilters(po, filteredIds);
        }

        if ( po.report_json.task === "integrity_coverage" ) {
            // Filter for base pairs
            if ( !testRowValue(data_filters.bp.range,
                    po.report_json["table-row"], "bp") === true ) {
                filteredIds = addToFilters(po, filteredIds)
            }
            // Filter for number of reads
            if ( !testRowValue(data_filters.reads.range,
                    po.report_json["table-row"], "reads") === true ) {
                filteredIds = addToFilters(po, filteredIds)
            }
        }

        if ( po.report_json.task === "check_coverage" ) {
            // Filter for coverage
            if ( !testRowValue(data_filters["coverage (2nd)"].range,
                    po.report_json["table-row"], "coverage_(2nd)") ) {
                filteredIds = addToFilters(po, filteredIds)
            }
        }

        if (po.report_json.task === "pilon" ) {
            // Filter for number of contigs
            if ( !testRowValue(data_filters.contigs.range,
                    po.report_json["table-row"], "contigs")) {
                filteredIds = addToFilters(po, filteredIds)
            }
            // Filter for assembled base pairs
            if ( !testRowValue(data_filters["assembled bp"].range,
                    po.report_json["table-row"], "contigs") ) {
                filteredIds = addToFilters(po, filteredIds)
            }
        }
    }

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