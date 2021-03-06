/*globals chewbbacaToReportId, chewbbacaTable, data, sendFile */
/*
    Function to process Metadata to load into the DataTable
 */

const processMetadata = (reportsData) => {

    const titleMapping = {
        "species_id": "SpeciesID",
        "SampleReceivedDate": "Sample Received Date",
        "SamplingDate": "Sampling Date",
        "source_Source": "Source",
        "AdditionalInformation": "Additional Information",
        "File_1": "File 1",
        "File_2": "File 2",
        "Primary": "Sample",
        "Owner": "Owner",
        "Case ID": "Case ID",
        "Submitter": "Submitter",
        "Location": "Location",
    };

    const Metadata = {};
    const metadataDataArray = [];

    /* Get headers */
    const metadataHeaders = [
        "",
        "Primary",
        "source_Source",
        "Location",
        "SamplingDate",
        "SampleReceivedDate",
        "species_id",
        "Owner",
        "Case ID",
        "Submitter",
        "File_1",
        "File_2",
        "AdditionalInformation"
    ];
    /*let firstTime = true;

    for (const report of reportsData) {
        if (firstTime) {
            metadataHeaders = metadataHeaders.concat(JSON.parse(report.fields).metadata_fields);
            firstTime = false;
            break;
        }
    }*/

    /* Set column mapping from the headers */
    const metadataColumnMapping = [
        {
            data: "active",
            render(data, type, row) {
                if (type === "display") {
                    return "<input type='checkbox' class='editor-active'>";
                }
                return data;
            },
            className: "dt-body-center"
        }
    ];

    metadataHeaders.map((x) => {
        if (x !== "" && x !== "species_id" && x !== "id") {
            metadataColumnMapping.push({"data": x, "title":titleMapping[x]});
        }
    });

    /* Get data for each strain to add to the table */

    for (const report of reportsData) {

        let dataObject = {
            "active": 0,
        };

        metadataHeaders.map( (j, i) => {
            if (j !== "" && j !== "id" && j !== "species_id"){
                const strainMetadata = JSON.parse(report.strain_metadata);
                if (j === "Case ID"){
                    dataObject[j] = strainMetadata["Food-Bug"]
                } else {
                    dataObject[j] = strainMetadata[j];
                }
            }
        });

        metadataDataArray.push(dataObject);
    }

    Metadata.headers = metadataHeaders;
    Metadata.columnMapping = metadataColumnMapping;
    Metadata.data = metadataDataArray;

    return Metadata;

};