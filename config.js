/*global Table, ChartManager */

//Route to get the reports from
const reportsRoute = "https://192.92.149.157/";
// const reportsRoute = "http://10.105.7.44/";

//Species available on the reports database
const speciesDatabase = [
    //{species_id:"1", name:"Campylobacter"},
    //{species_id:"2", name:"Yersinia"},
    {species_id:"3", name:"E.coli"},
    //{species_id:"4", name:"Salmonella"}
];

//DEFAULT USER INFO
let USERNAME = "bgoncalves";
let USERID = "2";
// let USERID = "1";

// Array of JSON files with the report data
let data = null;

let reportInfo = null;

// Array with all available tasks
let taskArray = [];

// Object with strain and table row for each task
let strainTableValDict = {};
let activeAdditionalSel = {};

//array with trees inofmration
let trees = null;

// JSON mapping of report id with current chewbbaca procedures
let chewbbacaToReportId = {};

// Object for jobs submitted to PHYLOViZ Online
let intervalCheckTree = {};

// Object with the project filters. Each value can be dynamically changed
// during the app session
let dataFilters = {
    "sample": {"active": [], "temp": []},
    "projectId": {"active": [], "temp": []},
    "qc": [],
    "bp": {"range": [null, null], "max": null},
    "reads": {"range": [null, null], "max": null},
    "coverage (2nd)": {"range": [null, null], "max": null},
    "contigs": {"range": [null, null], "max": null},
    "assembled bp": {"range": [null, null], "max": null},
};

// Object with the report highlight options. Can be changed dynamically
// during the app session
let dataHighlights = {
    "samples": [],
    "projects": []
};

// Object that will store the mapping between the project_id key in the JSON
// reports and the corresponding project name
let projectIdMap = new Map();

// Object that will store the mapping between samples and projectIds.
// This will allow the quick fetching of which project (or projects) a given
// sample name belongs to. An example of this object could be something like:
//      [("sampleA", [1]), ("sampleB", [1,2])]
let projectSampleMap = new Map();

// Object that will store the pipeline run information (time, cpu usage,
// etc.)  for each sample in the report
let pipelineInfo = new Map();

// Init charts
const charts = new ChartManager();

// Init tables
const metadataTable = new Table("master_table_metadata");
const innucaTable = new Table("master_table_innuca");
innucaTable.setLastColumn("assembled bp");
const chewbbacaTable = new Table("master_table_chewbbaca");
const prokkaTable = new Table("master_table_prokka");
const abricateTable = new Table("master_table_abricate");
const treesTable = new Table("master_table_trees");


