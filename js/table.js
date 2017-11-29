const init_table = (scope) => {

    scope.workflow_name = "INNUca";
    scope.table_headers_up = [
        ["", "2", "1"],
        ["ID", "2", "1"],
        ["Sample", "2", "1"],
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
        "",
        "ID",
        "Sample",
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


const insert_table_data = (data, columns) => {
    $('#master_table').DataTable( {
        "data": data,
        "columns": columns,
        // "columns" : [
        //     { "data" : "qc" },
        //     { "data" : "Sample_id" },
        //     { "data" : "sample" },
        //     { "data" : "reads" },
        //     { "data" : "bp" },
        //     { "data" : "coverage_1" },
        //     { "data" : "trimmed" },
        //     { "data" : "coverage_2" },
        //     { "data" : "contigs" },
        //     { "data" : "assembled bp" },
        //     { "data" : "contigs 2" },
        //     { "data" : "assembled bp 2" }
        // ],
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
};

const shorten_number = (num) => {
    const suffix = ["", "K", "M", "G"];
    for (const i of suffix) {
        if (num < 1000) {
            return `${num}${i}`
        } else {
            num /= 1000;
            num = num.toFixed(2);
        }
    }
};

/**
 *
 * @param fastqc_report
 * @returns {Array}
 */
const get_fastqc_warnings = (fastqc_report) => {

    let warnings = [];

    for ( const i of Object.keys(fastqc_report)) {
        if (fastqc_report[i].status !== "pass") {
            warnings.push(i)
        }
    }

    return warnings

};

// const comp = (a, b) => {
//     if (a[1] < b[1]) return -1;
//     if (a[1] > b[1]) return 1;
//     return 0;
// };

/**
 * Function that populates the main data table from a JSON report
 * @param {Object} results - JSON report containing the relevant
 *      information to populate the table
 */
// const build_table = (results) => {
//
//     console.log(results);
//
//     let columns = [];
//     let storage = {};
//     let warnings = {};
//
//     for (const report of results) {
//
//         // Get sample name and pipeline id
//         const project_id = report.project_id;
//         const sample_name = report.sample_name;
//         const pipeline_id = report.pipeline_id;
//         const process_id = report.process_id;
//         const id = `${sample_name}_${pipeline_id}`;
//
//         jr = report.report_json;
//
//         // If the current combination of pipeline_id and sample_name
//         // has not been added to the storage object, create a new
//         // entry with the sample name key. This ensures that,
//         // regardless of the order of the processes in the JSON,
//         // there is always a storage entry for any given sample.
//         if (!storage[id]) {
//             storage[id] =
//                 {"Sample": sample_name,
//                  "ID": `${project_id}.${pipeline_id}`,
//                  "qc": "<div class='badge-qc tooltip-qc'><span class='tooltip-qc-text'>Waaaa</span>A</div>"};
//             warnings[id] = {}
//         }
//
//         // If the current json report has a table-row property, parse it
//         // to the data table
//         if (jr.hasOwnProperty("table-row")) {
//
//             // Add each individual cell from the current process id
//             for (const cell of jr["table-row"]) {
//                 header = cell.header;
//                 storage[id][cell.header] = cell.value
//             }
//
//             // Add the column header to the columns array, if it doesn't
//             // exist yet
//             const col = [cell.header, process_id]
//             if ()
//
//         }
//     }

    // console.log(storage)

    // let vals = {
    //     "reads": [],
    //     "bp": [],
    //     "coverage_1": [],
    //     "trimmed": [],
    //     "coverage_2": [],
    //     "contigs": [],
    //     "assembled bp": [],
    //     "contigs 2": [],
    //     "assembled bp 2": []
    // };
    //
    // for ( const r of results ) {
    //
    //     // Get sample name and pipeline id
    //     const project_id = r.project_id;
    //     const sample_name = r.sample_name;
    //     const pipeline_id = r.pipeline_id;
    //     const id = `${sample_name}_${pipeline_id}`;
    //
    //     // If the current combination of pipeline_id and sample_name
    //     // has not been added to the storage object, create a new
    //     // entry with the sample name key. This ensures that,
    //     // regardless of the order of the processes in the JSON,
    //     // there is always a storage entry for any given sample.
    //     if (!storage[id]) {
    //         storage[id] =
    //             {"sample": sample_name,
    //              "Sample_id": `${project_id}.${r.pipeline_id}`,
    //              "qc": "<div class='badge-qc tooltip-qc'><span class='tooltip-qc-text'>Waaaa</span>A</div>"};
    //         warnings[id] = {}
    //     }
    //
    //     // Get information from integrity coverage process
    //     if (r.process_id === "1") {
    //         storage[id]["reads"] = r.report_json.reads || "NA";
    //         vals["reads"].push(parseFloat(r.report_json.reads));
    //
    //         storage[id]["bp"] = r.report_json.bp || "NA";
    //         vals["bp"].push(parseFloat(r.report_json.bp));
    //
    //         storage[id]["coverage_1"] = r.report_json.coverage || "NA";
    //         vals["coverage_1"].push(parseFloat(r.report_json.coverage));
    //     }
    //
    //     // Get information from trimmomatic report
    //     if (r.process_id === "2") {
    //         storage[id]["trimmed"] = r.report_json.trim_perc;
    //         vals["trimmed"].push(parseFloat(r.report_json.trim_perc));
    //     }
    //
    //     // Get information from the second coverage assessment
    //     if (r.process_id === "3") {
    //         storage[id]["coverage_2"] = r.report_json.coverage || "NA";
    //         vals["coverage_2"].push(parseFloat(r.report_json.coverage));
    //     }
    //
    //     // Get information from the FastQC report
    //     if (r.process_id === "4") {
    //         warns = get_fastqc_warnings(r.report_json);
    //         warnings[id]["fastqc"] = warns
    //     }
    //
    //     // Get information from the first assembly report from spades
    //     if (r.process_id === "6") {
    //         storage[id]["contigs"] = r.report_json.contigs || "NA";
    //         vals["contigs"].push(parseFloat(r.report_json.contigs));
    //
    //         storage[id]["assembled bp"] = r.report_json.bp || "NA";
    //         vals["assembled bp"].push(parseFloat(r.report_json.bp));
    //
    //         if (r.report_json.hasOwnProperty("warnings")) {
    //             warnings[id]["spades"] = r.report_json.warnings
    //         }
    //
    //         // Get information from the assembly mapping report
    //         if (r.report_json.hasOwnProperty("warnings")) {
    //             warnings[id]["am"] = r.report_json.warnings
    //         }
    //     }
    //
    //     // Get information from the second assembly report from pilon
    //     if (r.process_id === "8") {
    //         storage[id]["contigs 2"] = r.report_json.contigs || "NA";
    //         vals["contigs 2"].push(parseFloat(r.report_json.contigs));
    //
    //         storage[id]["assembled bp 2"] = r.report_json.bp || "NA";
    //         vals["assembled bp 2"].push(parseFloat(r.report_json.bp));
    //     }
    // }
    //
    // // The following code checks if all entries in the storage object
    // // are populated for each element in the ``fields`` array. If not,
    // // presumably because the sample could not finish the pipeline
    // // successfully, fill the missing fields with 'NA'
    // fields = [
    //     "Sample",
    //     "reads",
    //     "bp",
    //     "coverage_1",
    //     "trimmed",
    //     "coverage_2",
    //     "contigs",
    //     "assembled bp",
    //     "contigs 2",
    //     "assembled bp 2"
    // ];
    //
    // bar_columns = [
    //     "reads",
    //     "bp",
    //     "coverage_1",
    //     "trimmed",
    //     "coverage_2",
    //     "contigs",
    //     "assembled bp",
    //     "contigs 2",
    //     "assembled bp 2"
    // ];
    //
    // let table_data = Object.keys(storage).map((key) => {
    //
    //     get_qc_badge(warnings[key]);
    //
    //     fields.map((f) => {
    //         // If a give field is not available, fill with NA
    //         if (!(f in storage[key])) {
    //             storage[key][f] = "NA"
    //         // The field exists, do some pre-processing
    //         } else {
    //             // If the f ID is present in the bar_columns array,
    //             // populate the table bar for that cell
    //             if (bar_columns.indexOf(f) > -1) {
    //                 // Get proportion
    //                 let prop;
    //                 if (f === "trimmed") {
    //                     prop = parseFloat(storage[key][f])
    //                 } else {
    //                     prop = (parseFloat(storage[key][f]) / Math.max(...vals[f])) * 100;
    //                 }
    //                 const out_div = `<div class='table-cell'><div class='table-bar' style='width:${prop}%'>${storage[key][f]}</div></div>`;
    //                 storage[key][f] = out_div
    //             }
    //
    //         }
    //     });
    //     return storage[key];
    // });

    // insert_table_data(table_data)
// };