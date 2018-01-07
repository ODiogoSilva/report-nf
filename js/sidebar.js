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
 */
const filterPopovers = () => {

    createPopover("active_filters_name", "popover_filters_sample");
    createPopover("active_filters_projectid", "popover_filters_project");
    createPopover("highlightedSamples", "popover_highlight_sample");
    createPopover("highlightedProjects", "popover_highlight_project");

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
        popoverDataSel.empty()
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

    let option;

    const sampleSelectize = $("#highlightSampleVal")[0].selectize;

    for (const el of res.filteredJson) {
        option = el.sample_name;
        sampleSelectize.addOption({
            "value": option,
            "text": option,
        })
    }

};


const addHighlight = (sourceId) => {

    let textId,
        popoverContentId,
        popoverId,
        dataArray,
        colorInputId;

    if (sourceId === "highlightSampleVal") {
        textId = "highlightSampleVal";
        colorInputId = "highlightSampleCol";
        popoverContentId = "popover_highlight_sample";
        popoverId = "highlightedSamples";
        dataArray = dataHighlights.samples;
    } else {
        textId = "highlightProjectVal";
        colorInputId = highlightSampleCol;
        popoverContentId = "popover_highlight_project";
        popoverid = "highlightedProjects";
        dataArray = dataHighlights.projects;
    }

    // Get value of input text
    const val = $("#" + textId).val();

    if (val === ""){
        console.log("empty string");
        return
    }

    // Split string by whitespace, command and semi colon
    const highlightArray = val.split(/[\s,;\t\n]+/).filter(Boolean);
    // Get selected color
    const highlightColor = $("#" + colorInputId).val();

    // Add array to global object
    dataArray.push({
        samples: highlightArray,
        color: highlightColor,
    });



};
