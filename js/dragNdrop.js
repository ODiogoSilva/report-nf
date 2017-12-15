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
        const reportsData = JSON.parse(e.target.result);
        $("#body_container").trigger("dropFile",[reportsData]);
    };

    reader.readAsText(data[0]);

};