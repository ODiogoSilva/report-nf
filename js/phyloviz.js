/*globals
    fetchJob,
    treesTable,
    intervalCheckTree,
    treesTable,
    modalAlert,
    USERID,
    sendToPHYLOViZ,
    modalAlert,
    intervalCheckTree
*/

/**
 * Function to fetch job status of INNUENDO Platform
 * @param redis_job_id
 */
const fetchTreeJob = async (redisJobId) => {

    const response = await fetchJob(redisJobId);
    let message = "";

    if (response.status === true && response.result.message === undefined) {
        clearInterval(intervalCheckTree[redisJobId]);

        if(response.result === 404){
            message = "PHYLOViZ Online: Bad credentials.";
            modalAlert(message, () => {

            });
        }
        else{
            const phylovizJob = response.result[0].jobid.replace(/\s/g,'');

            intervalCheckPHYLOViZTrees[phylovizJob] = setInterval(() => {
                fetchPHYLOViZJob(phylovizJob);
            }, 5000);
        }
    }
    else if (response.status === true && response.result.message !== undefined){
        clearInterval(intervalCheckTree[redisJobId]);
        modalAlert(response.result.message, () => {

        });
    }
    else if (response.status === false) {
        clearInterval(intervalCheckTree[redisJobId]);
        modalAlert("There was an error when sending the request to PHYLOViZ Online.", () => {

        });
    }
};

/**
 * Get PHYLOVIZ Online queue job status
 * @param jobID
 * @returns {Promise.<void>}
 */
const fetchPHYLOViZJob = async (jobID) => {
    const response = await fetchPHYLOViZ(jobID);

    if (response.status === "complete") {
        let message = "Your tree is ready to be visualized! Go to the PHYLOViZ Table at the Reports menu.";

        clearInterval(intervalCheckPHYLOViZTrees[jobID]);

        ( async () => {
            const trees = await getPHYLOViZTrees();
            const resultsCh = await treesTable.processTrees(trees, true);
            await treesTable.remakeTable(resultsCh.data);
        } )();

        modalAlert(message, function () {

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

    const selectedSampleNames = $.map(chewbbacaTable.tableObj.rows(".selected").data(), (d) => {
        return d.Sample;
    });

    let globalAdditionalData = {};

    for (const task of Object.keys(activeAdditionalSel)){

        if (activeAdditionalSel[task][0] === true){

            for(const sample of selectedSampleNames){
                const procedure = activeAdditionalSel[task][1];
                if(!globalAdditionalData.hasOwnProperty(sample)){
                    globalAdditionalData[sample] = {};
                }

                if(strainTableValDict[sample].hasOwnProperty(procedure)){

                    let abricateResults = [];
                    const selectedGenes = activeAdditionalSel[task][2];

                    for (const el of strainTableValDict[sample][procedure]){
                        if(el.table === "abricate"){
                            for (const gene of selectedGenes){
                                if (el.geneList.includes(gene)){
                                    globalAdditionalData[sample][gene.replace(/\(|\)/g, "-")] = true;
                                    abricateResults.push(gene.replace(/\(|\)/g, "-"));
                                }
                                else {
                                    if(!globalAdditionalData[sample].hasOwnProperty(gene.replace(/\(|\)/g, "-"))){
                                        globalAdditionalData[sample][gene.replace(/\(|\)/g, "-")] = false;
                                    }
                                }
                            }
                        }
                        else {
                            if(el.pathotyping !== undefined){
                                globalAdditionalData[sample]["Pathotype"] = el.pathotyping;
                            }
                            else if(el.seqtyping !== undefined){
                                globalAdditionalData[sample]["Serotype"] = el.seqtyping;
                            }
                            else if(el["chewBBACAStatus"] !== undefined){
                                globalAdditionalData[sample]["chewBBACAStatus"] = el["chewBBACAStatus"];
                            }
                            else if(el["st"] !== undefined){
                                globalAdditionalData[sample]["st"] = el["species"] + "(" + el["st"] + ")";
                            }
                            else {
                                globalAdditionalData[sample][el.header] = el.value;
                            }
                        }
                    }

                    if (procedure === "abricate") {
                        abricateResults = Array.from(new Set(abricateResults));
                        globalAdditionalData[sample]["Resistance Profile"] = abricateResults.join();
                    }
                }
            }
        }
    }

    //Case no profiles are selected
    if (selectedSampleNames.length === 0){

        modalAlert("Please select some Profiles from the Table before sending the request to PHYLOViZ Online", () => {

        });

        return;
    }

    const data = {
        job_ids: selectedJobIds.join(","),
        dataset_name: $("#modal_phyloviz_dataset_name").val(),
        dataset_description: $("#modal_phyloviz_dataset_description").val(),
        additional_data: JSON.stringify(globalAdditionalData), //JSON.stringify(global_additional_data)
        max_closest: $("#closest_number_of_strains").val(),
        database_to_include: $("#species_database option:selected").text(),
        species_id: 3,
        missing_data: $("#missing_data_checkbox").is(":checked"),
        missing_char: $("#missing_data_character").val(),
        phyloviz_user: $("#phyloviz_user").val(),
        phyloviz_pass: $("#phyloviz_pass").val(),
        makePublic: $("#makePublic_checkbox").is(":checked"),
        user_id: USERID
    };

    const res = await sendToPHYLOViZ(data);

    console.log(res);

    modalAlert("Your request was sent to PHYLOViZ Online server. You will be notified when the tree is ready to be visualized. All available trees can be found on the PHYLOViZ Table at the Reports menu.", function(){

    });

    intervalCheckTree[res] = setInterval(() => {
        fetchTreeJob(res);
    }, 5000);

};
