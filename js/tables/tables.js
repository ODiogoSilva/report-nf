
/* Table Class
    - Process table data
    - Load table
 */


class Table {
    constructor() {
        this.table_headers = [];
        this.table_data = [];
        this.column_mapping = [];
    }

    /* Method to add table headers and column mapping */
    addTableHeaders(scope, table_headers, column_mapping) {
        scope.table_headers = table_headers;
        this.table_headers = table_headers;
        this.column_mapping = column_mapping;
        return true;
    }

    /* Method to add data to the table */
    async addTableData(table_data) {
        this.table_data = await this.table_data.concat(table_data);
        return true;

    }

    /* Method to destroy the DataTable */
    destroyTable(container) {
        if ( $.fn.DataTable.isDataTable('#'+container)) {
            $('#'+container).DataTable().clear();
            $('#'+container).DataTable().destroy();

        }
    }

    /* Method to clear the DataTable */
    clearTable(container){
        if ( $.fn.DataTable.isDataTable('#'+container)) {
            $('#'+container).DataTable().clear();
        }
    }

    /* Method to add a new DataTable rows */
    updateTable(container, data) {
        const table = $('#' + table_id).DataTable();
        table.rows.add(data);
    }

    /* Method to build DataTable */
    buildDataTable(container) {

        if ( $.fn.DataTable.isDataTable('#'+container)) {
            this.destroyTable(container);
        }

        $('#'+container).DataTable( {
            "data": this.table_data,
            "columns" : this.column_mapping,
            autoFill: {
                enable: false
            },
            dom: 'Bfrtip',
            buttons: [
                'copy',
                'csv',
                'excel',
                'pdf',
                'print',
                {
                    extend: 'collection',
                    text: 'Table control',
                    buttons: [
                        {
                            text: "Enable AutoFill",
                            action: function (e, dt) {
                                if (dt.autoFill().enabled()) {
                                    this.autoFill().disable();
                                    this.text('Enable AutoFill');
                                }
                                else {
                                    this.autoFill().enable();
                                    this.text('Disable AutoFill');
                                }
                            }
                        }
                    ]
                }
            ],
            // initComplete: function(){$(".table-cell").parent().css({"height": "30px"});}
        } );
    }

    /* Process chewBBACA data to load into the DataTable */
    async processChewbbaca(reports) {
        return await processChewbbaca(reports);
    }

    /* Process INNUca data to load into the DataTable */
    async processInnuca(reports) {
        return await processInnuca(reports);
    }

    /* Process Pathotyping data to load into the DataTable */
    async processPathotyping(reports) {
        return await processPathotyping(reports);
    }

    /* Process Prokka data to load into the DataTable */
    async processProkka(reports) {
        return await processProkka(reports);
    }
}