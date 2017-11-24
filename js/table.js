const init_table = (scope) => {

    scope.workflow_name = "INNUca";
    scope.table_headers_up = [
        ["Sample name", "2", "1"],
        ["reads", "2", "1"],
        ["bp", "2", "1"],
        ["coverage 1", "2", "1"],
        ["trimmed", "2", "1"],
        ["coverage 2", "2", "1"],
        ["spades", "1", "2"],
        ["pilon", "1", "2"]
    ];
    scope.table_headers_down = [
        "contigs", "assembled bp",
        "contigs 2", "assembled bp 2"
    ];
    scope.table_footer = [
        "Sample name",
        "reads",
        "bp",
        "coverage 1",
        "trimmed",
        "coverage 2",
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
            { "data" : "Sample name" },
            { "data" : "reads" },
            { "data" : "bp" },
            { "data" : "coverage 1" },
            { "data" : "trimmed" },
            { "data" : "coverage 2" },
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


const json_table_data = [
    {
        "Sample name":"LanTest101",
        "reads":"x1",
        "bp":"yLanTest101",
        "coverage 1":"M",
        "trimmed":"10/16/1941",
        "coverage 2":"Caucasian/White",
        "contigs":"Caucasian/White",
        "assembled bp":"waaa",
        "contigs 2":"lslsls",
        "assembled bp 2": "sdas"
    },

    {
        "Sample name":"LanTest101",
        "reads":"x1",
        "bp":"yLanTest101",
        "coverage 1":"M",
        "trimmed":"10/16/1941",
        "coverage 2":"Caucasian/White",
        "contigs":"Caucasian/White",
        "assembled bp":"waaa",
        "contigs 2":"lslsls",
        "assembled bp 2": "sdas"
    },

    {
        "Sample name":"LanTest101",
        "reads":"x1",
        "bp":"yLanTest101",
        "coverage 1":"M",
        "trimmed":"10/16/1941",
        "coverage 2":"Caucasian/White",
        "contigs":"Caucasian/White",
        "assembled bp":"waaa",
        "contigs 2":"lslsls",
        "assembled bp 2": "sdas"
    }];

const build_table = (results) => {

    let storage = {};

    for ( const r of results ) {

        // Get information from integrity coverage process
        if (r.process_id === "1") {
            storage[`${r.sample_name}_${r.pipeline_id}`] =
                {"Sample name": r.sample_name};
            storage[`${r.sample_name}_${r.pipeline_id}`]["reads"] =
                r.report_json.reads || "NA";
            storage[`${r.sample_name}_${r.pipeline_id}`]["bp"] =
                r.report_json.bp || "NA";
            storage[`${r.sample_name}_${r.pipeline_id}`]["coverage 1"] =
                r.report_json.coverage || "NA";
        }

        if (r.process_id === "2") {
            storage[`${r.sample_name}_${r.pipeline_id}`]["trimmed"] =
                r.report_json.trim_perc || "NA";
        }

        if (r.process_id === "3") {
            storage[`${r.sample_name}_${r.pipeline_id}`]["coverage 2"] =
                r.report_json.coverage || "NA";
        }

        if (r.process_id === "6") {
            storage[`${r.sample_name}_${r.pipeline_id}`]["contigs"] =
                r.report_json.contigs || "NA";
            storage[`${r.sample_name}_${r.pipeline_id}`]["assembled bp"] =
                r.report_json.bp || "NA";
        }

        if (r.process_id === "8") {
            storage[`${r.sample_name}_${r.pipeline_id}`]["contigs 2"] =
                r.report_json.contigs || "NA";
            s = r.report_json.bp || "NA";
            storage[`${r.sample_name}_${r.pipeline_id}`]["assembled bp 2"] = s;

        }
    }

    fields = [
        "Sample name",
        "reads",
        "bp",
        "coverage 1",
        "trimmed",
        "coverage 2",
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

    console.log(table_data)
};