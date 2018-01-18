
const goHome = () => {

    // Close sidebar, if active
    const sidebarSel = $("#sidebar");
    const sidebarBtn = $("#sidebar-button");

    if (sidebarSel.hasClass("active")) {
        sidebarBtn.css({color: "#ffffff"});
        $(".popover").removeClass("in");
        sidebarSel.toggleClass("active");
    }

    $("#row-main").css({display: "none"});
    $("#current_workflow").css({display: "none"});
    $("#homeInnuendo").css({display: "block"});

};

/**
 * Initialize the toggle behaviour for the sidebar, bound to the menu button
 * in the navbar
 */
const initToggleSidebar = () => {

    // when opening the sidebar
    $("#sidebar-button").on("click", () => {

        const sidebarSel = $("#sidebar");
        const sidebarBtn = $("#sidebar-button");

        if (sidebarSel.hasClass("active")) {
            sidebarBtn.css({color: "#ffffff"});
            // WARNING: ADDING THE OVERLAY WILL PREVENT DRAG AND DROP OF
            // REPORTS WHEN THE SIDEBAR IS TOGGLED
            // $(".overlay").fadeOut();
            $(".popover").removeClass("in");
        } else {
            sidebarBtn.css({color: "#28a745"});
            // fade in the overlay
            // $(".overlay").fadeIn();
            $("a[aria-expanded=true]").attr("aria-expanded", "false");
        }

        // open sidebar
        sidebarSel.toggleClass("active");

    });

};