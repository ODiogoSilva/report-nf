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


const updateHighlightOptions = (res) => {

    let selection = [];

    for (const el of res.filteredJson) {
        selection.push(el.sample_name);
    }

    populateSelectize(selection, "highlightSampleVal")

};


const populateSelectize = (selection, containerId) => {

    const selectizeSel = $("#" + containerId)[0].selectize;

    for (const el of selection) {
        selectizeSel.addOption({
            "value": el,
            "text": el
        })
    }

};


const highlightsModal = (type) => {

    let title,
        dataArray;

    if (type === "highlightSampleVal") {
        title = "Sample highlights";
        dataArray = dataHighlights.samples
    } else {
        title = "Project highlights";
        dataArray = dataHighlights.projects
    }

    for (const el of dataArray) {
        addGroupButton("groupContainer", el.groupName, el.color);
    }

    console.log(dataArray)

    // Set modal title
    $("#highlightModalTitle").html(title);

    $("#highlightsModal").modal().show()

};


const removeHighlightGroup = (containerDiv, targetDiv) => {

    $("#" + containerDiv).find("#" + targetDiv).remove();

};


const addGroupButton = (containerId, val, color) => {

    const containerSel = $("#" + containerId);

    // Create template
    const highlightTemplate = '<div class="highlight-btn-group btn-group btn-group-justified" id="{{ val }}">' +
        '<button style="width: 80%; border-left: 10px solid {{ col }}; overflow: hidden" class="btn btn-default" data-toggle="button">{{ val }}</button>' +
        '<button onclick="removeHighlightGroup(\'{{ containerId }}\', \'{{ val }}\')" style="width: 15%" class="btn btn-danger"><i class="fa fa-times" aria-hidden="true"></i></button>' +
        '</div>';

    const highlightDiv = Mustache.to_html(highlightTemplate, {
        containerId: containerId,
        val,
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
    }, 5000)

};


const addHighlight = (sourceId) => {

    let textId,
        groupId,
        popoverContentId,
        dataArray,
        colorInputId,
        helpId;

    if (sourceId === "highlightSampleVal") {
        textId = "highlightSampleVal";
        groupId = "highlightSampleGroup";
        colorInputId = "highlightSampleCol";
        dataArray = dataHighlights.samples;
        helpId = $("#highlightedSamples_help");
    } else {
        textId = "highlightProjectVal";
        groupId = "highlightProjectGroup";
        colorInputId = "highlightProjectCol";
        dataArray = dataHighlights.projects;
        helpId = $("#highlightedProjects_help");
    }

    // Get value of input text
    const val = $("#" + textId).val();

    // Exit if no selection is provided
    if (val === ""){
        return showLabel(helpId, "Empty selection", "error");
    }

    const groupName = $("#" + groupId).val();
    console.log(groupName)
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

    // Add array to global object
    dataArray.push({
        groupName: groupName,
        samples: highlightArray,
        color: highlightColor,
    });

    return showLabel(helpId, "Group successfully added", "success")

};
