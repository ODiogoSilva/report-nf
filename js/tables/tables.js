
/* Table Class
    - Process table data
    - Load table
 */


class Table {
    constructor(container) {
        this.tableHeaders = [];
        this.tableData = [];
        this.columnMapping = [];
        this.container = container;
        this.tableObj = null;

        // Stores the 'projectId.pipelineId' associated with each entry
        // in the table. Is used to prevent duplications in the table
        this.tableIds = [];
    }

    /*
        Method to add table headers and column mapping
        Needs the scope to modify the html table headers
    */
    addTableHeaders(scope, table_object, headers_v_name) {
        scope.$apply( () => {
            scope[headers_v_name] = table_object.headers;
        });
        this.tableHeaders = table_object.headers;
        this.columnMapping = table_object.columnMapping;
    }

    /**
     * Method that updates the tableData and tableIds properties.
     * The update argument determines whether :
     *   - (true) The elements in the provided tableObject are added
     *   to the existing tableData property, without inserting
     *   duplicate entries based on the sample unique IDs.
     *   This is used when adding more data from other projects.
     *   - (false) The provided tableObject will overwrite the
     *   existing tableData property.
     *   This is used when filtering the current data set.
     * @param {array} tableObject - Array of JSON objects with the
     * table information.
     * @param {boolean} update - Determines whether the tableData
     * property will be updated (true) or overwritten (false)
     */
    addTableData(tableObject, update) {

        if ( update === true ) {
            // Check for duplicate entries
            for ( const el of tableObject.data ) {
                // Only add unique IDs
                if ( !this.tableIds.includes(el.id) ) {
                    this.tableData.push(el);
                    this.tableIds.push(el.id);
                }
            }
        } else {
            this.tableData = tableObject.data;
            this.tableIds = tableObject.ids;
            this.clearTable();
        }
    }

    emptyTable() {
        if ( $.fn.DataTable.isDataTable('#'+this.container)) {
            this.tableObj.empty();

        }
    }

    /* Method to destroy the DataTable */
    destroyTable() {
        if ( this.tableObj ) {
            // this.tableObj.clear();
            this.tableObj.destroy();

        }
    }

    /* Method to clear the DataTable */
    clearTable(){
        if ( $.fn.DataTable.isDataTable('#'+this.container)) {
            this.tableObj.clear().draw();
        }
    }

    /* Method to add a new DataTable rows */
    updateTable(data) {
        this.tableObj.rows.add(data);
    }

    highlightRow(id) {
        $("#" + id).toggleClass("selected", "")
    }

    getValue(id, target) {
        return $(this.tableData.filter( el => el.Sample === id)[0][target]);
    }

    /* Method to build DataTable */
    buildDataTable() {
        if ( this.tableObj) {
            this.clearTable();
            this.tableObj.rows.add(this.tableData).draw();
        }
        else{
            this.tableObj = $('#'+this.container).DataTable( {
                "data": this.tableData,
                "columns" : this.columnMapping,
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
                    },
                    {
                        extend: 'collection',
                        text: 'Selection',
                        autoClose: true,
                        buttons: [
                            {
                                text: 'Show graphs',
                                action: function ( e, dt, node, config ) {
                                    const sample = dt.rows('.selected').data()[0].Sample;
                                    showModelGraphs(sample)
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
                },
                "fnCreatedRow": (nRow, aData) => {
                    $(nRow).attr("id", aData.Sample);
                }
            } );
        }
    }

    /* Process chewBBACA data to load into the DataTable */
    async processChewbbaca(reports) {
        return await processChewbbaca(reports);
    }

    /* Process INNUca data to load into the DataTable */
    async processInnuca(reports, setMax) {
        return await processInnuca(reports, setMax);
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