/*globals
    modalAlert
*/

/**
 * Function to process Trees results from the platform
 * @param treesReports
 * @returns {*}
 */
const processTrees = (treesReports) => {

    const treesDataArray = [];
    const treesObject = {};

    const titleMapping = {
        "name": "Name",
        "description": "Description",
        "timestamp": "Timestamp",
        "phyloviz_user": "PHYLOViZ User"
    };

    /* Get headers */
    const treesHeaders = [
        "",
        "name",
        "description",
        "timestamp",
        "phyloviz_user",
        "uri"
    ];

    /* Set column mapping from the headers */
    const treesColumnMapping = [
        {
            data: "active",
            render(data, type, row) {
                if (type === "display"){
                    return "<input type='checkbox' class='editor-active'>";
                }
                return data;
            },
            className: "dt-body-center"
        }
    ];

    treesHeaders.map((x) => {
        if (x !== "" && x !== "uri") {
            treesColumnMapping.push({"data": x, "title":titleMapping[x]});
        }
    });

    /* Get data for each strain to add to the table */
    for (const report of treesReports) {

        let dataObject = {
            "active": 0,
        };

        treesHeaders.map( (j, i) => {
            if (j !== ""){
                dataObject[j] = report[j];
            }
        });

        treesDataArray.push(dataObject);
    }

    treesObject.headers = treesHeaders;
    treesObject.columnMapping = treesColumnMapping;
    treesObject.data = treesDataArray;

    return treesObject;
};

/**
 * Function to show PHYLOViZ Online tree
 * @param selTreeData
 */
const showTree = (selTreeData) => {
    if (selTreeData.length > 0){
        window.open(selTreeData[0], "_blank");
    }
    else{
        modalAlert("Select a tree first", () => {});
    }
};