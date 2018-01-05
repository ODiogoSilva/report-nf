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
    console.log(res);


};