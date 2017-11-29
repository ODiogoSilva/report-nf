
/* Table Class
    - Process table data
    - Load table
 */


class Table {
    constructor(container) {
        this.table_headers = [];
        this.table_data = [];
        this.column_mapping = [];
        this.container = container;
    }

    /*
        Method to add table headers and column mapping
        Needs the scope to modify the html table headers
    */
    addTableHeaders(scope, table_object, headers_v_name) {
        scope.$apply( () => {
            scope[headers_v_name] = table_object.headers;
        });
        this.table_headers = table_object.headers;
        this.column_mapping = table_object.column_mapping;
    }

    /* Method to add data to the table */
    addTableData(table_object) {
        this.table_data = this.table_data.concat(table_object.data);
    }

    /* Method to destroy the DataTable */
    destroyTable() {
        if ( $.fn.DataTable.isDataTable('#'+this.container)) {
            $('#'+this.container).DataTable().clear();
            $('#'+this.container).DataTable().destroy();

        }
    }

    /* Method to clear the DataTable */
    clearTable(){
        if ( $.fn.DataTable.isDataTable('#'+this.container)) {
            $('#'+this.container).DataTable().clear();
        }
    }

    /* Method to add a new DataTable rows */
    updateTable(data) {
        const table = $('#' + this.container).DataTable();
        table.rows.add(data);
    }

    /* Method to build DataTable */
    buildDataTable() {
        if ( $.fn.DataTable.isDataTable('#'+this.container)) {
            this.destroyTable(this.container);
        }

        $('#'+this.container).DataTable( {
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
            columnDefs: [ {
                orderable: false,
                className: 'select-checkbox',
                targets:   0
            } ],
            select: {
                style:    'os',
                selector: 'td:first-child'
            },
            "initComplete": () => {
                /* Trigger selected class on row when click on checkbox */
                $(".editor-active").off("click").on("click", (e) => {
                    $(e.target).closest("tr").toggleClass("selected");
                });
            }
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