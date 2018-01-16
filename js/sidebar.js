/*globals dataHighlights */

/**
 * Creates a popover object associated with a targetId and using a templateId
 * The templateId must be a defined div with the provided id
 * @param {String} targetId - Id of the div that will be used to trigger the
 * popover
 * @param {String} templateId - Id of the div that will be used as template
 * to the popover
 */
const createPopover = (targetId, templateId) => {

    const targetSelector = $("#" + targetId);

    targetSelector.popover({
        html: true,
        trigger: "click",
        container: "body",
        content() {
            return $("#" + templateId).html()
        }
    })
};

/**
 * Wrapper for the creation and initialization of the sidepanel filter popover
 * labels.
 *
 * NOTE: For the popovers to be automatically dismissed, the data-filters class
 * needs to be added to the triggering element.
 */
const filterPopovers = () => {

    createPopover("active_filters_name", "popover_filters_sample");
    createPopover("active_filters_projectid", "popover_filters_project");

    // This automatically disables the popovers when a click is triggered
    // outside the popover element and the triggering element.
    // TODO: There is a bug where the popover triggering element needs to be
    // clicked twice after the popover has been dismissed this way.
    $("body").mouseup( (e) => {
        if (!$(".popover").has(e.target).length && !$(e.target).hasClass("active-filters")) {
            $(".popover").hide()
        }
    });

};

/**
 * Function that adds a filter div (with the filter name and remove button)
 * with an arbitrary value into an arbitrary container. The requires opts are:
 *
 *      - {String} val: Value/Name of the filter;
 *      - {String} targetId: Id of the popover content div;
 *      - {String} popoverId: Id of the popover element;
 *
 * @param {Object} opts - Object with the required properties
 */
const addFilterButton = (opts) => {

    // Create random id for filter
    const filterId = Math.random().toString(36).substring(7);
    const popoverDataSel = $("#" + opts.targetId);
    const popover = $("#" + opts.popoverId).data("bs.popover");

    if (opts.reset) {
        popoverDataSel.empty();
    }

    // Create the filter template div to be populated using mustache
    const filterTemplate = '<div class="input-group" id="{{ fId }}">' +
        '<input class="form-control {{ tId }}" readonly value="{{ val }}">' +
        '<span onclick="removeFilterButton(\'{{ tId }}\',\'{{ fId }}\', \'{{ pop }}\', \'{{ val }}\')" class="input-group-addon btn btn-default remove_filter"><i class="fa fa-minus" aria-hidden="true"></i></span>' +
        '</div>';

    // Render template with the specified options. filterDiv is now an
    // html div element.
    const filterDiv = Mustache.to_html(filterTemplate, {
        fId: filterId,
        tId: opts.targetId,
        val: opts.val,
        pop: opts.popoverId
    });

    popoverDataSel.append(filterDiv);
    popover.options.content = popoverDataSel.html();

};


const updateHighlightOptions = (res, clear) => {

    let sampleSelection = [];
    let projectSelection = [];

    for (const el of res.filteredJson) {
        sampleSelection.push(el.sample_name);
        projectSelection.push(projectIdMap.get(parseInt(el.project_id)));
    }

    populateSelectize(sampleSelection, "highlightSampleVal");
    populateSelectize(projectSelection, "highlightProjectVal");

};


const populateSelectize = (selection, containerId, addItems) => {

    const selectizeSel = $("#" + containerId)[0].selectize;

    // Clear selections
    selectizeSel.clearOptions();
    selectizeSel.clear();

    for (const el of selection) {
        selectizeSel.addOption({
            "value": el,
            "text": el
        });

        if (addItems) {
            selectizeSel.addItem(el)
        }
    }

};


const toggleGroupSelection = (groupName, type) => {

    let dataArray;

    if (type === "highlightSampleVal") {
        dataArray = dataHighlights.samples
    } else {
        dataArray = dataHighlights.projects
    }

    // Make sure all toggles are off before
    for (const bt of $("#groupContainer").find(".main-toggle")) {
        if ($(bt).html() !== groupName) {
            $(bt).button("reset");
            $(bt).removeClass("active");
        }
    }

    // Clear selectize
    const selectizeSel = $("#highlightModalSelection")[0].selectize;
    selectizeSel.clearOptions();
    selectizeSel.clear();

    let selection = [];
    for (const el of dataArray) {
        if (el.groupName === groupName) {
            selection = el.samples;
        }
    }

    populateSelectize(selection, "highlightModalSelection", true);

};


const highlightsModal = (type) => {

    // Clear modal
    $("#groupContainer").empty();
    const selectizeSel = $("#highlightModalSelection")[0].selectize;
    selectizeSel.clearOptions();
    selectizeSel.clear();

    let title,
        dataArray;

    if (type === "highlightSampleVal") {
        title = "Sample highlights";
        dataArray = dataHighlights.samples
    } else {
        title = "Project highlights";
        dataArray = dataHighlights.projects
    }

    // If there are groups reveal the selectize element
    const sampleContainer = $("#sampleContainer");
    if (dataArray.length > 0) {
        sampleContainer.css({"display": "block"})
    } else {
        sampleContainer.css({"display": "none"})
    }

    let toggleGroup = true;
    for (const el of dataArray) {
        addGroupButton("groupContainer", el.groupName, type, el.color);
        if (toggleGroup) {
            toggleGroupSelection(el.groupName, type);
            $("#groupContainer").find(".main-toggle").trigger("click");
            toggleGroup = false;
        }
    }

    // Set modal title
    $("#highlightModalTitle").html(title);

    $("#highlightsModal").modal().show();

};


const removeHighlightGroup = (containerDiv, targetDiv, type) => {

    const containerSel = $("#" + containerDiv);

    // Remove group from container
    containerSel.find("#" + targetDiv).remove();

    // Remove group from report object
    let dataArray;
    if (type === "highlightSampleVal") {
        dataArray = dataHighlights.samples
    } else {
        dataArray = dataHighlights.projects
    }
    const filteredArray = dataArray.filter((el) => {
        if (el.groupName !== targetDiv){
            return el
        }
    });

    // Update report data structure and highlight counter
    if (type === "highlightSampleVal") {
        dataHighlights.samples = filteredArray;
        $("#sampleHighlightCounter").html(`(${filteredArray.length})`)
    } else {
        dataHighlights.projects = filteredArray;
        $("#projectHighlightCounter").html(`(${filteredArray.length})`)
    }

    // If no active groups left, hide selectize input
    console.log(filteredArray.length);
    if (filteredArray.length < 1) {
        $("#sampleContainer").css({"display": "none"});
    }

    // If there are no active groups, trigger the toggle for the first group
    if (containerSel.find(".active").length < 1) {
        $(containerSel.find(".main-toggle")[0]).trigger("click");
    }

    // Trigger selections
    triggerHighlights(type)

};


const addGroupButton = (containerId, val, type, color) => {

    const containerSel = $("#" + containerId);

    // Create template
    const highlightTemplate = '<div class="highlight-btn-group btn-group btn-group-justified" id="{{ val }}">' +
        '<button onclick="toggleGroupSelection(\'{{val}}\', \'{{ type }}\')" style="width: 80%; border-left: 10px solid {{ col }}; overflow: hidden" class="btn btn-default main-toggle" data-toggle="button">{{ val }}</button>' +
        '<button onclick="removeHighlightGroup(\'{{ containerId }}\', \'{{ val }}\', \'{{ type }}\')" style="width: 15%" class="btn btn-danger"><i class="fa fa-times" aria-hidden="true"></i></button>' +
        '</div>';

    const highlightDiv = Mustache.to_html(highlightTemplate, {
        containerId: containerId,
        val,
        type,
        col: color
    });

    containerSel.append(highlightDiv);

};

let labelTimer;
const showLabel = (helpSelector, msg, type) => {

    // Reset error and success classes
    helpSelector.removeClass("text-danger text-success");

    let iconSpan;

    if (type === "error") {
        helpSelector.addClass("text-danger");
        iconSpan = "<span><i class='fa fa-lg fa-times'></i></span> ";
    } else {
        helpSelector.addClass("text-success");
        iconSpan = "<span><i class='fa fa-lg fa-check'></i></span> "
    }

    helpSelector.html(iconSpan + msg);
    helpSelector.css({"opacity": 1});

    clearTimeout(labelTimer);
    labelTimer = setTimeout(() => {
        helpSelector.css({"opacity": 0})
    }, 5000);

};


const getProjectId = (projectName) => {
    for (const [id, name] of projectIdMap.entries()) {
        if (name === projectName) {
            return id.toString();
        }
    }
};


const getSampleMappings = async (highlightArray, type) => {

    let finalArray = [];
    let currentId;

    // For samples
    if (type === "highlightSampleVal") {
        for (const el of highlightArray) {
            for (const projectId of projectSampleMap.get(el)) {
                finalArray.push(`${projectId}.${el}`);
            }
        }
        // For projects
    } else {
        for (const projectName of highlightArray) {
            // Convert project name provide by the user to the corresponding
            // project id
            currentId = await getProjectId(projectName);
            // Collect all samples for that project id
            for (const [sample, projectId] of projectSampleMap.entries()) {
                if (projectId.includes(currentId)) {
                    finalArray.push(`${projectId}.${sample}`)
                }
            }
        }
    }

    return finalArray;

};


const addHighlight = async (sourceId) => {

    let textId,
        groupId,
        dataArray,
        colorInputId,
        helpId,
        counterSel,
        type;

    if (sourceId === "highlightSampleVal") {
        textId = "highlightSampleVal";
        groupId = "highlightSampleGroup";
        colorInputId = "highlightSampleCol";
        dataArray = dataHighlights.samples;
        helpId = $("#highlightedSamples_help");
        counterSel = $("#sampleHighlightCounter");
        type = "sample";
    } else {
        textId = "highlightProjectVal";
        groupId = "highlightProjectGroup";
        colorInputId = "highlightProjectCol";
        dataArray = dataHighlights.projects;
        helpId = $("#highlightedProjects_help");
        counterSel = $("#projectHighlightCounter");
        type = "project";
    }

    const selectizeSel = $("#" + textId);
    const groupSel = $("#" + groupId);

    // Get value of input text
    const val = selectizeSel.val();

    // Exit if no selection is provided
    if (val === ""){
        return showLabel(helpId, "Empty selection", "error");
    }

    const groupName = groupSel.val();
    // Exit if no group is provided
    if (groupName === ""){
        return showLabel(helpId, "Missing group name", "error");
    }

    // Exit if group name already exists
    for (const el of dataArray) {
        if (el.groupName === groupName) {
            return showLabel(helpId, "Duplicate group name", "error");
        }
    }

    // Split string by whitespace, command and semi colon
    const highlightArray = val.split(/[\s,;\t\n]+/).filter(Boolean);
    // Get selected color
    const highlightColor = $("#" + colorInputId).val();
    // Converts the user provided sample array into an array of
    // `projectId.sampleName`, which are the correct sample ids for the
    // majority of the objects in the report.
    // Example: "sampleA" -> "1.sampleA"
    const highlightFinalArray = await getSampleMappings(highlightArray, sourceId);

    // Create selection object
    const selection = {
        groupName: groupName,
        samples: highlightFinalArray,
        userSamples: highlightArray,
        color: highlightColor,
        type
    };

    // Add array to global object
    dataArray.push(selection);

    // Update counter
    counterSel.html(`(${dataArray.length})`);

    // Clear text inputs
    selectizeSel[0].selectize.clear();
    groupSel.val("");

    // Trigger highlights for current selection
    triggerHighlights(sourceId);

    return showLabel(helpId, "Group successfully added", "success")

};


/**
 * Triggers the highlights throughout the reports. First, a selection array
 * is built from the active sample and project highlights. The samples take
 * precedence, which means that they are the last to be added into the array.
 * Then, the re-drawing of the charts is issued only once with the
 * appropriate method of the ChartManager class.
 */
const triggerHighlights = async () => {

    let selection = dataHighlights.projects.concat(dataHighlights.samples);

    // This will filter the selection array to remove duplicate sample names
    // (when they are specified more that one time) and retain only the
    // last highlight.
    const selectionMap = new Map();
    for (const el of selection){
        for (const sample of el.samples) {
            selectionMap.set(sample, {
                color: el.color,
                groupName: el.groupName,
                type: el.type
            })
        }
    }

    charts.highlightCharts(selectionMap);

};
