
/*
    Function to process chewBBACA data to load into the DataTable
 */

const processChewbbaca = (reports_data) => {

    const chewbbaca_data = {};

    chewbbaca_data.headers = ["", "ID", "LNF", "LOT", "INF", "PLOT"]

    chewbbaca_data.column_mapping = [
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
        {"data": "LNF"},
        {"data": "LOT"},
        {"data": "INF"},
        {"data": "PLOT"}
    ]

    chewbbaca_data.data = [
        {
            "active": "0",
            "ID": 1,
            "LNF": 2300,
            "LOT": 30,
            "INF": 1000,
            "PLOT": 2
        },
        {
            "active": "0",
            "ID": 2,
            "LNF": 2400,
            "LOT": 30,
            "INF": 1000,
            "PLOT": 2
        },
        {
            "active": "0",
            "ID": 3,
            "LNF": 300,
            "LOT": 30,
            "INF": 3000,
            "PLOT": 2
        }
    ];

    return chewbbaca_data;

};