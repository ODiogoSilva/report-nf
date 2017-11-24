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


const build_table = (results) => {

    storage = {};

    for ( r of results ) {

        // Get information from integrity coverage process
        if (r.process_id === 1) {
            storage[`${r.sample_name}_${r.pipeline_id}`]["ID"]
        }

        storage[`${r.sample_name}_${r.pipeline_id}`]
    }

    console.log(storage)
};