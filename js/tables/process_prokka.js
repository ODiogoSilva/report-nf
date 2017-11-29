
/*
    Function to process prokka data to load into the DataTable
 */

const processProkka = (reports_data) => {

    const prokka_data = {};

    prokka_data.headers = ["", "ID", "GENE", "FUNCTION", "NAME"];

    prokka_data.column_mapping = [
        {
            data:   "active",
            render: function ( data, type, row ) {
                if ( type === 'display' ) {
                    return '<input type="checkbox" class="editor-active">';
                }
                return data;
            },
            className: "dt-body-center"
        },
        {"data": "ID"},
        {"data": "GENE"},
        {"data": "FUNCTION"},
        {"data": "NAME"}
    ];

    prokka_data.data = [
        {
            "active": "0",
            "ID": 1,
            "GENE": "A",
            "FUNCTION": "Transfer",
            "NAME": "A1"
        },
        {
            "active": "0",
            "ID": 2,
            "GENE": "B",
            "FUNCTION": "Transfer1",
            "NAME": "B1"
        },
        {
            "active": "0",
            "ID": 3,
            "GENE": "C",
            "FUNCTION": "Transfer2",
            "NAME": "C1"
        }
    ];

    return prokka_data;

};
