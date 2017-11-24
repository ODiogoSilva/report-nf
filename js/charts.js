
const app = angular.module("reportsApp", []);

app.controller("reportsController", function($scope, $http){

    $scope.workflow_name = "INNUca";
    $scope.table_headers_up = [
        ["ID", "2", "1"],
        ["Sample name", "2", "1"],
        ["reads", "2", "1"],
        ["bp", "2", "1"],
        ["coverage 1", "2", "1"],
        ["trimmed", "2", "1"],
        ["coverage 2", "2", "1"],
        ["spades", "1", "2"],
        ["pilon", "1", "2"]
    ];
    $scope.table_headers_down = [
        "contigs", "assembled bp",
        "contigs 2", "assembled bp 2"
    ];
    $scope.table_footer = [
        "ID",
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
    
    $scope.graph1_name = "Graph 1";
    $scope.graph2_name = "Graph 2";
    $scope.table_name = "Table 1";

    $scope.workflows = [
        ["INNUca", 14],
        ["Prokka", 2],
        ["chewBBACA", 2],
        ["Pathotyping", 1]
    ];
    

    $('.selectpicker').selectpicker({
      style: 'btn-info',
      size: 4
    });

    reports_requests = Requests($http);

    reports_requests.get_reports_by_project(1, function(response){
        console.log(response);
    });


    $('.toggle_sidebar').on("click", () => {
        /* to toggle the sidebar, just switch the CSS classes */
        $("#workflows_sidebar").toggleClass("collapsed_sidebar");
        $("#workflows_content").toggleClass("col-md-12 col-md-8");
        $(".toggle_sidebar").toggleClass("hide_button");
        return false;
    });

    $scope.switch_workflow = (workflow_name) => {
        console.log("Workflow change");
        $scope.workflow_name = workflow_name;
    };


    const json_table_data = [
        {
            "ID":1,
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
            "ID":2,
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
            "ID":2,
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
        }

        // {
        //     "ID":2,
        //     "Coverage":'<div' +
        //     ' style="width:61%;height:100%;background-color:' +
        //     ' #bbd9ea;"><span >61%</span></div>',
        //     "reads":'<img' +
        //     ' src="https://img.shields.io/badge/INNUca-A-green.svg">',
        //     "bp":"yLanTest102",
        //     "coverage 1":"M",
        //     "trimmed":"08/10/2005",
        //     "coverage 2":"Caucasian/White"
        // },
        //
        // {
        //     "ID":3,
        //     "Coverage":"Test1111",
        //     "Badge":"x3",
        //     "lastName":"yTest1111",
        //     "gender":"M",
        //     "dob":"08/13/2015",
        //     "race":"Native Hawaian/Pacific Islander"
        // }
    ];

    setTimeout(() => {
        $('#table1').DataTable( {
            "data": json_table_data,
            "columns" : [
                { "data" : "ID" },
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
    }, );


    const c1 = Highcharts.chart("container", {

        title: {
            text: 'Chart.update'
        },

        subtitle: {
            text: 'Plain'
        },

        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },

        series: [{
            type: 'column',
            colorByPoint: true,
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
            showInLegend: false
        }]
    });

    const c2 = Highcharts.chart("container2", {

        title: {
            text: 'Chart.update'
        },

        subtitle: {
            text: 'Plain'
        },

        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },

        series: [{
            type: 'column',
            colorByPoint: true,
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
            showInLegend: false
        }]
    });

    charts_ar = [c1, c2];

    $("#test").click(function () {

        for (const c of charts_ar) {
            c.update({
                xAxis: {
                    categories: ["1", "2", "3", "4", "M", "J", "J", "A", "S", "O", "N", "D"]
                },
                series: [{
                    data: [10, 10, 10, 10, 10, 10, 10, 1, 1, 1, 1, 1]
                }]
            })
        }
    });

    $("#waiting_gif").css({display:"none"});
    $("#body_container").css({display:"block"});

});

