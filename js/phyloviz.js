
/**
 * Function to fetch job status of PHYLOViZ Online
 * @param redis_job_id
 */
const fetchTreeJob = async (redisJobId) => {

    const response = await fetchJob(redisJobId);

    if (response.status == true) {
        clearInterval(intervalCheckTree[redisJobId])
        message = "Your tree is ready to be visualized! Go to the PHYLOViZ Table at the Reports menu.";
        if (response.result.message != undefined) {
            message = response.result.message
        }

        ( async () => {
            trees = await getPHYLOViZTrees();
            const resultsCh = await treesTable.processTrees(trees, true);
            await treesTable.remakeTable(resultsCh.data);
        } )();

        modalAlert(message, function () {

        });
    }
    else if (response.status == false) {
        clearInterval(intervalCheckTree[redisJobId])
        modalAlert("There was an error when producing the tree at PHYLOViZ Online.", function () {

        });
    }
};

/*
    File where all functions to process data to send to PHYLOViZ Online will be available.
 */

const processPHYLOViZRequest = async (chewbbacaTable) => {
    /*
        Need projectid, pipelineid and processid of chewBBACA results.
        Need sample name to get metadata
        Need all the information from the PHYLOViZ Online form.
     */

    const selectedJobIds = $.map(chewbbacaTable.tableObj.rows(".selected").data(), (d) => {
        return d.project_id+":"+d.pipeline_id+":"+d.process_id;
    });

    const data = {
        job_ids: selectedJobIds.join(","),
        dataset_name: $('#modal_phyloviz_dataset_name').val(),
        dataset_description: $('#modal_phyloviz_dataset_description').val(),
        additional_data: "", //JSON.stringify(global_additional_data)
        max_closest: $("#closest_number_of_strains").val(),
        database_to_include: $("#species_database option:selected").text(),
        species_id: 3,
        missing_data: $('#missing_data_checkbox').is(":checked"),
        missing_char: $('#missing_data_character').val(),
        phyloviz_user: $('#phyloviz_user').val(),
        phyloviz_pass: $('#phyloviz_pass').val(),
        makePublic: $('#makePublic_checkbox').is(":checked"),
        user_id: USERID
    }

    const res = await sendToPHYLOViZ(data);

    modalAlert("Your request was sent to PHYLOViZ Online server. You will be notified when the tree is ready to be visualized. All available trees can be found on the PHYLOViZ Table at the Reports menu.", function(){

    });

    intervalCheckTree[res] = setInterval(() => {
        fetchTreeJob(res);
    }, 5000);

};
