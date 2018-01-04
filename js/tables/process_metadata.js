/*globals chewbbacaToReportId, chewbbacaTable, data, sendFile */
/*
    Function to process Metadata to load into the DataTable
 */

const processMetadata = (reportsData) => {

    console.log(reportsData);

    const titleMapping = {
        "id": "id",
        "species_id": "SpeciesID",
        "SampleReceivedDate": "Sample Received Date",
        "SamplingDate": "Sampling Date",
        "source_Source": "Source",
        "AdditionalInformation": "Additional Information",
        "File_1": "File 1",
        "File_2": "File 2",
        "Primary": "Sample Name",
        "Owner": "Owner",
        "Food-Bug": "Food-Bug",
        "Submitter": "Submitter",
        "Location": "Location",
    }

    const Metadata = {};
    let metadataHeaders = ["", "id"];
    const metadataDataArray = [];

    /* Get headers */
    let firstTime = true;
    for (const report of reportsData) {
        if (firstTime) {
            metadataHeaders = metadataHeaders.concat(JSON.parse(report.fields).metadata_fields);
            firstTime = false;
            break;
        }
    }

    /* Set column mapping from the headers */
    const metadataColumnMapping = [
        {
            data: "active",
            render(data, type, row) {
                if (type === 'display') {
                    return '<input type="checkbox" class="editor-active">';
                }
                return data;
            },
            className: "dt-body-center"
        }
    ];

    metadataHeaders.map((x) => {
        if (x !== "" && x !== "species_id") metadataColumnMapping.push({"data": x, "title":titleMapping[x]});
    });

    /* Get data for each strain to add to the table */

    for (const report of reportsData) {

        let dataObject = {
            "active": 0,
            "id": report.id
        };

        metadataHeaders.map( (j, i) => {
            if (j !== "" && j !== "id" && j !== "species_id"){
                const strain_metadata = JSON.parse(report.strain_metadata);
                dataObject[j] = strain_metadata[j];
            }
        });

        metadataDataArray.push(dataObject);
    }

    Metadata.headers = metadataHeaders;
    Metadata.columnMapping = metadataColumnMapping;
    Metadata.data = metadataDataArray;

    console.log(Metadata);

    return Metadata;

};