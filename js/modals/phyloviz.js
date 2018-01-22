/**
 * Function to show modal of additional data to be sent to PHYLOViZ Online
 */
const showAdditionalDataModal = () => {
    populateAdditionalDataList();
    $("#additionalDataModal").modal("show");
};


/**
 * Function to populate the list of possible values to be sent.
 * Based on the global variable taskArray
 */
const populateAdditionalDataList = () => {
    // Populate modal
    const dbSel = $("#modalanalysis");
    dbSel.empty();
    for (const task of taskArray) {
        const itemDiv = `<li class="list-group-item">${task}<button type="button" class="btn btn-default abricate-btn"><i class="fa fa-bullseye vTrigger" name="${task}"></i></button></li>`;
        dbSel.append(itemDiv);
    }

    triggerV();


};

/**
 * Trigger of the first level of possible parameters to be sent.
 * All besides abricate end on this level.
 */
const triggerV = () => {

    $(".vTrigger").off("click").on("click", (e) => {
        const target = $(e.target).attr("name");
        const modalParameters = $("#modalparameters");
        modalParameters.empty();
        const correspondenceObj = {};

        $("#phylovizParametersDiv").css({"display": "none"});
        $("#valuesAbricateDiv").css({"display": "none"});


        chewbbacaTable.tableObj.rows(".selected").data().map((d) => {
            let itemDiv = "";
            if(strainTableValDict[d.sample_name][target] !== undefined) {
                for (const el of strainTableValDict[d.sample_name][target]){

                    let active = "";

                    if(correspondenceObj[el.header] !== true && el.header !== undefined){
                        if(activeAdditionalSel[el.header] !== undefined && activeAdditionalSel[el.header][0] != false){
                            active = "active-btn";
                        }
                        itemDiv += `<li class="list-group-item">${el.header}<button type="button" class="btn btn-default abricate-btn ${active}"><i class="fa fa-bullseye paramTrigger" name="${el.header}" procedure="${target}"></i></button></li>`;

                        correspondenceObj[el.header] = true;
                    }
                    else if(correspondenceObj["pathotyping"] !== true && el["pathotyping"] !== undefined){
                        if(activeAdditionalSel["pathotyping"] !== undefined && activeAdditionalSel["pathotyping"][0] != false){
                            active = "active-btn";
                        }
                        itemDiv += `<li class="list-group-item">${"pathotyping"}<button type="button" class="btn btn-default abricate-btn ${active}"><i class="fa fa-bullseye paramTrigger" name="${"pathotyping"}" procedure="${target}"></i></button></li>`;

                        correspondenceObj["pathotyping"] = true;

                    }
                    else if(correspondenceObj["seqtyping"] !== true && el["seqtyping"] !== undefined){
                        if(activeAdditionalSel["seqtyping"] !== undefined && activeAdditionalSel["seqtyping"][0] != false){
                            active = "active-btn";
                        }
                        itemDiv += `<li class="list-group-item">${"seqtyping"}<button type="button" class="btn btn-default abricate-btn ${active}"><i class="fa fa-bullseye paramTrigger" name="${"seqtyping"}" procedure="${target}"></i></button></li>`;

                        correspondenceObj["seqtyping"] = true;

                    }
                    else if(correspondenceObj["chewBBACAStatus"] !== true && el["chewBBACAStatus"] !== undefined){
                        if(activeAdditionalSel["chewBBACAStatus"] !== undefined && activeAdditionalSel["chewBBACAStatus"][0] != false){
                            active = "active-btn";
                        }
                        itemDiv += `<li class="list-group-item">${"chewBBACAStatus"}<button type="button" class="btn btn-default abricate-btn ${active}"><i class="fa fa-bullseye paramTrigger" name="${"chewBBACAStatus"}" procedure="${target}"></i></button></li>`;

                        correspondenceObj["chewBBACAStatus"] = true;

                    }

                }
                modalParameters.append(itemDiv);
                $("#phylovizParametersDiv").css({"display": "block"});
            }
        });

        triggerParams();

        //console.log(strainTableValDict[target]);
    });
};

/**
 * Triggers the second level of parameters in case of abricate or adds the parameters to the global variable
 * activeAdditionalSel to be parsed afterwards when sending data to PHYLOViZ Online
 */
const triggerParams = () => {

    $(".paramTrigger").off("click").on("click", (e) => {
        const target = $(e.target);
        const task = target.attr("name");
        const procedure = target.attr("procedure");
        const modalValues = $("#modalvalues");


        modalValues.empty();

        $("#valuesAbricateDiv").css({"display": "none"});

        if(procedure === "abricate"){
            let abricateResults = [];

            const selectedStrains = $.map(chewbbacaTable.tableObj.rows(".selected").data(), (d) => {
                return d.sample_name;
            });

            for (const strain of selectedStrains){
                if(strainTableValDict[strain].hasOwnProperty(procedure)){
                    for (const el of strainTableValDict[strain][procedure]){
                        if(el.header === task) {
                            abricateResults = abricateResults.concat(el.geneList);
                            abricateResults = Array.from(new Set(abricateResults));
                        }
                    }
                }
            }

            for (const gene of abricateResults){
                let active = "";
                if(activeAdditionalSel[task] !== undefined && activeAdditionalSel[task][2].includes(gene)){
                    active = "active-btn";
                }
                const itemDiv = `<li class="list-group-item">${gene}<button type="button" class="btn btn-default abricate-btn ${active}"><i class="fa fa-bullseye valueTrigger" name="${task}" procedure="${procedure}" gene="${gene}"></i></button></li>`;
                modalValues.append(itemDiv);
            }
            $("#valuesAbricateDiv").css({"display": "block"});

            triggerValues();
        }
        else{
            if (!activeAdditionalSel.hasOwnProperty(task)){
                activeAdditionalSel[task] = [false, procedure, []];
            }

            if(target.hasClass("active-btn")){
                activeAdditionalSel[task][0] = false;
                activeAdditionalSel[task][1] = procedure;
            }
            else{
                activeAdditionalSel[task][0] = true;
                activeAdditionalSel[task][1] = procedure;
            }
            target.parent().toggleClass("active-btn");
            target.parent().removeClass("active");
        }

    });
};

/**
 * Triggers the adding of parameters in the last level, which currently is only abricate.
 * Populates the global variable activeAdditionalSel
 */
const triggerValues = () => {

    $(".valueTrigger").off("click").on("click", (e) => {
        const target = $(e.target);
        const strain = target.attr("strain");
        const task = target.attr("name");
        const procedure = target.attr("procedure");
        const gene = target.attr("gene");

        if (!activeAdditionalSel.hasOwnProperty(task)){
            activeAdditionalSel[task] = [false, procedure, []];
        }


        if(target.parent().hasClass("active-btn")){
            activeAdditionalSel[task][0] = true;
            activeAdditionalSel[task][1] = procedure;

            const indexOfGene = activeAdditionalSel[task][2].indexOf(gene);

            if(indexOfGene > -1){
                activeAdditionalSel[task][2].splice(indexOfGene, 1);
                if(activeAdditionalSel[task][2].length === 0){
                    activeAdditionalSel[task][0] = false;
                }
            }
        }
        else{
            activeAdditionalSel[task][0] = true;
            activeAdditionalSel[task][1] = procedure;
            if(!activeAdditionalSel[task][2].includes(gene)){
                activeAdditionalSel[task][2].push(gene);
            }

        }
        target.parent().toggleClass("active-btn");
        target.parent().removeClass("active");

    });

};
