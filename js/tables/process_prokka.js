/*globals data */
/*
    Function to process prokka data to load into the DataTable
 */

const processProkka = (reportsData) => {

    const prokkaData = {};

    prokkaData.headers = ["", "id", "GENE", "FUNCTION", "NAME"];

    prokkaData.columnMapping = [
        {
            data:   "active",
            render: function ( data, type, row ) {
                if ( type === "display" ) {
                    return "<input type='checkbox' class='editor-active'>";
                }
                return data;
            },
            className: "dt-body-center"
        },
        {"data": "id", "title":"ID"},
        {"data": "GENE", "title":"GENE"},
        {"data": "FUNCTION", "title":"FUNCTION"},
        {"data": "NAME", "title":"NAME"}
    ];

    prokkaData.data = [
        {
            "active": "0",
            "id": "1",
            "GENE": "A",
            "FUNCTION": "Transfer",
            "NAME": "A1"
        },
        {
            "active": "0",
            "id": "2",
            "GENE": "B",
            "FUNCTION": "Transfer1",
            "NAME": "B1"
        },
        {
            "active": "0",
            "id": "3",
            "GENE": "C",
            "FUNCTION": "Transfer2",
            "NAME": "C1"
        }
    ];

    return prokkaData;

};
