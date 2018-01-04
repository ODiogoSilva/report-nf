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

};

