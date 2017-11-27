const init_table = (scope) => {

    scope.workflow_name = "INNUca";
    scope.table_headers_up = [
        ["ID", "2", "1"],
        ["Sample", "2", "1"],
        ["QC", "2", "1"],
        ["reads", "2", "1"],
        ["bp", "2", "1"],
        ["coverage (1st)", "2", "1"],
        ["trimmed", "2", "1"],
        ["coverage (2nd)", "2", "1"],
        ["spades", "1", "2"],
        ["pilon", "1", "2"]
    ];
    scope.table_headers_down = [
        "contigs", "assembled bp",
        "contigs 2", "assembled bp 2"
    ];
    scope.table_footer = [
        "ID",
        "Sample",
        "QC",
        "reads",
        "bp",
        "coverage (1st)",
        "trimmed",
        "coverage (2nd)",
        "contigs",
        "assembled bp",
        "contigs 2",
        "assembled bp 2"
    ];

    scope.graph1_name = "Graph 1";
    scope.graph2_name = "Graph 2";
    scope.table_name = "Table 1";

    scope.workflows = [
        ["INNUca", 14],
        ["Prokka", 2],
        ["chewBBACA", 2],
        ["Pathotyping", 1]
    ];

};


const insert_table_data = (data) => {
    $('#master_table').DataTable( {
        "data": data,
        "columns" : [
            { "data" : "Sample_id" },
            { "data" : "sample" },
            { "data" : "qc" },
            { "data" : "reads" },
            { "data" : "bp" },
            { "data" : "coverage_1" },
            { "data" : "trimmed" },
            { "data" : "coverage_2" },
            { "data" : "contigs" },
            { "data" : "assembled bp" },
            { "data" : "contigs 2" },
            { "data" : "assembled bp 2" }
        ],
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
        ]
    } );
};

/**
 * Function that populates the main data table from a JSON report
 * @param {Object} results - JSON report containing the relevant
 *      information to populate the table
 */
const build_table = (results) => {

    let storage = {};

    for ( const r of results ) {

        // If the current combination of pipeline_id and sample_name
        // has not been added to the storage object, create a new
        // entry with the sample name key. This ensures that,
        // regardless of the order of the processes in the JSON,
        // there is always a storage entry for any given sample.
        if (!storage[`${r.sample_name}_${r.pipeline_id}`]) {
            storage[`${r.sample_name}_${r.pipeline_id}`] =
                {"sample": r.sample_name,
                 "Sample_id": `${r.project_id}.${r.pipeline_id}`,
                 "qc": "A"};
        }

        // Get information from integrity coverage process
        if (r.process_id === "1") {
            storage[`${r.sample_name}_${r.pipeline_id}`]["reads"] =
                r.report_json.reads || "NA";
            storage[`${r.sample_name}_${r.pipeline_id}`]["bp"] =
                r.report_json.bp || "NA";
            storage[`${r.sample_name}_${r.pipeline_id}`]["coverage_1"] =
                r.report_json.coverage || "NA";
        }

        // Get information from trimmomatic report
        if (r.process_id === "2") {
            storage[`${r.sample_name}_${r.pipeline_id}`]["trimmed"] =
                r.report_json.trim_perc || "NA";
        }

        // Get information from the second coverage assessment
        if (r.process_id === "3") {
            storage[`${r.sample_name}_${r.pipeline_id}`]["coverage_2"] =
                r.report_json.coverage || "NA";
        }

        // Get information from the first assembly report from spades
        if (r.process_id === "6") {
            storage[`${r.sample_name}_${r.pipeline_id}`]["contigs"] =
                r.report_json.contigs || "NA";
            storage[`${r.sample_name}_${r.pipeline_id}`]["assembled bp"] =
                r.report_json.bp || "NA";
        }

        // Get information from the second assembly report from pilon
        if (r.process_id === "8") {
            storage[`${r.sample_name}_${r.pipeline_id}`]["contigs 2"] =
                r.report_json.contigs || "NA";
            s = r.report_json.bp || "NA";
            storage[`${r.sample_name}_${r.pipeline_id}`]["assembled bp 2"] = s;

        }
    }

    // The following code checks if all entries in the storage object
    // are populated for each element in the ``fields`` array. If not,
    // presumably because the sample could not finish the pipeline
    // successfully, fill the missing fields with 'NA'
    fields = [
        "Sample",
        "reads",
        "bp",
        "coverage_1",
        "trimmed",
        "coverage_2",
        "contigs",
        "assembled bp",
        "contigs 2",
        "assembled bp 2"
    ];
    let table_data = Object.keys(storage).map((key) => {
        fields.map((f) => {
            if (!(f in storage[key])) {
                storage[key][f] = "NA"
            }
        });
        return storage[key]
    });


    insert_table_data(table_data)
};