/*global showModelGraphs, processChewbbaca, processInnuca, processPathotyping, processProkka */
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
    addTableHeaders(tableObject, headersName) {
        /*scope.$apply( () => {
            scope[headersName] = tableObject.headers;
        });*/
        this.tableHeaders = tableObject.headers;
        this.columnMapping = tableObject.columnMapping;
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

    /**
     * Method to populate the existing datatable with new data
     * @param newData
     */
    remakeTable(newData){
        this.tableObj.clear();
        this.tableObj.rows.add(newData);
        this.tableObj.draw();
    }

    emptyTable() {
        if ( $.fn.DataTable.isDataTable("#"+this.container)) {
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
        if ( $.fn.DataTable.isDataTable("#"+this.container)) {
            this.tableObj.clear().draw();
        }
    }

    /* Method to add a new DataTable rows */
    updateTable(data) {
        this.tableObj.rows.add(data);
    }

    highlightRow(id) {
        $("#" + id).toggleClass("selected", "");
    }

    getValue(id, target) {
        for (const el of this.tableData) {
            const pid = el.id.split(".")[0] + "." + el.Sample;
            if (pid === id) {
                return $(el[target]);
            }
        }
    }

    /* Method to build DataTable */
    buildDataTable(scrollX) {
        if ( this.tableObj) {
            this.clearTable();
            this.tableObj.rows.add(this.tableData).draw();
        }
        else{
            this.tableObj = $("#"+this.container).DataTable( {
                "data": this.tableData,
                "columns" : this.columnMapping,
                autoFill: {
                    enable: false
                },
                dom: "Bfrtip",
                scrollX:scrollX,
                buttons: [
                    "copy",
                    "csv",
                    "excel",
                    "pdf",
                    "print",
                    {
                        extend: "collection",
                        text: "Table control",
                        buttons: [
                            {
                                text: "Enable AutoFill",
                                action(e, dt) {
                                    if (dt.autoFill().enabled()) {
                                        this.autoFill().disable();
                                        this.text("Enable AutoFill");
                                    }
                                    else {
                                        this.autoFill().enable();
                                        this.text("Disable AutoFill");
                                    }
                                }
                            }
                        ]
                    },
                    {
                        extend: "collection",
                        text: "Selection",
                        autoClose: true,
                        buttons: [
                            {
                                text: "Show graphs",
                                action( e, dt, node, config ) {
                                    const row = dt.rows(".selected").data()[0];
                                    const pid = `${row.id.split(".")[0]}.${row.Sample}`
                                    showModelGraphs(pid);
                                }
                            }
                        ]
                    }
                ],
                columnDefs: [ {
                    orderable: false,
                    className: "select-checkbox",
                    targets:   0,
                    width: "15px"
                } ,
                    {
                        targets: [1,2],
                        width: "30px",
                    }],
                select: {
                    style:    "os",
                    selector: "td:first-child"
                },
                "fnCreatedRow": (nRow, aData) => {
                    // Get ID based on pipeline id and sample name
                    let pid = String(aData.id).split(".")[0] + "." + aData.Sample;
                    // Add ID to each row
                    $(nRow).attr("id", pid);
                    // Add onclick event for sample selection in checkbox
                    $(nRow).find("input").off("click").on("click", (e) => {
                        $(e.target).closest("tr").toggleClass("selected");
                    });

                    // Set QC popover
                    $(nRow).find(".badge-qc").webuiPopover(
                        {
                            title: "Quality control summary",
                            content: aData.qcMsg,
                            placement: "right",
                            animation: "pop",
                            closeable: true
                        }
                    )
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

    /* Process Abricate data to load into the DataTable */
    async processAbricate(reports) {
        return await processAbricate(reports);
    }

    /* Process Metadata to load into the DataTable */
    async processMetadata(reports) {
        return await processMetadata(reports);
    }

    /* Process Trees to load into the DataTable */
    async processTrees(treesReports) {
        return await processTrees(treesReports);
    }
}