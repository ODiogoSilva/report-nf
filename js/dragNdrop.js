const allowDrop = (ev) => {
    ev.preventDefault();
    $("#body_container").css({opacity: 0.5});
};

const leaveDrop = (ev) => {
    $("#body_container").css({opacity: 1});
};

const drag = (ev) => {
    ev.dataTransfer.dropEffect = "copy";
};

const drop = async (ev) => {
    $("#body_container").css({opacity: 1});
    ev.preventDefault();
    const data = ev.dataTransfer.files;

    const reader = new FileReader();

    reader.onload = (e) => {
        let reportsData;
        try{
            reportsData = $.parseJSON(e.target.result);
        }
        catch(e){
            const alertText = "<div class='alert alert-danger alert-dismissable fade in' aria-label='close'>" +
                "<a href='#' class='close' data-dismiss='alert' aria-label='close'>×</a>Unsupported file format</div>";

            $("#alertDiv").empty().append(alertText).css({"display":"block"});
            return;
        }
        $("#body_container").trigger("dropFile", [reportsData]);
    };

    reader.readAsText(data[0]);

};