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

const testIntegrityCoverage = () => {

}

/**
 *
 * @param jsonResult
 * @param filterObject
 */
const filterJson = (jsonResult, filterObject) => {

    let filteredJson = [];

    for ( const po of jsonResult ) {

        // Filter for sample name
        if ( testArray(filterObject.sample, po.sample_name) === true ) {
            continue
        }

        // Filter for project id
        if ( testArray(filterObject.projectId, po.project_id) === true ) {
            continue
        }

        // Filter for basepairs
        if ( po.report_json.task === "integrity_coverage" ) {
            console.log(filterObject.bp);
            console.log(po.report_json["table-row"].value);
            if (filterObject.bp[0] &&
                    po.report_json["table-row"].value < filterObject.bp[0]) {
                continue
            }
            if (filterObject[1] &&
                    po.report_json["table-row"].value > filterObject.bp[1]) {
                continue
            }
        }

        // JSON object passed all filters, add to final array
        filteredJson.push(po);
    }

    return filteredJson
};