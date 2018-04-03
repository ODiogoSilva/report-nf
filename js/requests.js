/*globals
    reportsRoute,
    USERID
*/

const getSpecies = async () => {
    return await $.get(
        reportsRoute+"app/api/v1.0/species/"
    );
};

const getProjects = async () => {
    return await $.get(
        reportsRoute+"app/api/v1.0/projects/all/"
    );
};

const getReportsByProject = async (projectIds) => {

    let res = [];
    const projectIdsString = projectIds.join();

    const info = await $.get(
        reportsRoute+"app/api/v1.0/reports/project/",
        { project_id: projectIdsString },
    );
    res = res.concat(info);

    return res;
};

const getReportInfo = async (projectIds) => {

    let res = [];
    const projectIdsString = projectIds.join();

    try {
        const info = await $.get(
            reportsRoute+"app/api/v1.0/reports/project/info",
            { project_id: projectIdsString }
        );

        res = res.concat(info);
    }
    catch(e){
        modalAlert("No reports available for the selected projects.", () =>{});
    }

    return res;
};

/*
const getReportByFilter = async (filter) => {
    console.log(filter);
    return await $.get(
        reportsRoute+"app/api/v1.0/reports/project/filter",
        filter,
    );
};
*/

const getReportByFilter = async (filter) => {
    return await $.post(
        reportsRoute+"app/api/v1.0/reports/project/filter/",
        filter,
    );
};

const getStrainsMetadata = async (filter) => {

    console.log(filter);
    return await $.post(
        reportsRoute+"app/api/v1.0/strains/name/",
        filter,
    );
};

//Request to send data to PHYLOViZ for tree visualization
const sendToPHYLOViZ = async (data) => {
    return await $.post(
        reportsRoute+"app/api/v1.0/phyloviz/",
        data,
    );
};

//Request to get PHYLOViZ Online job status
const fetchPhylovizJob = async (redisJobOb) => {

    // {job_id:redisJobID}

    return await $.get(
        reportsRoute+"app/api/v1.0/phyloviz/",
        redisJobOb,
    );
};

//Request to get PHYLOViZ Online trees
const getPHYLOViZTrees = async () => {

    return await $.get(
        reportsRoute+"app/api/v1.0/phyloviz/trees/user/",
        {user_id:USERID},
    );
};

//Request to get PHYLOViZ Online Platform job status
const fetchJob = async (redisJobId) => {

    return await $.get(
        reportsRoute+"app/api/v1.0/phyloviz/",
        {job_id: redisJobId},
    );

};

//Request to get PHYLOViZ Online job status
const fetchPHYLOViZ = async (jobID) => {

    return await $.get(
        reportsRoute+"app/api/v1.0/phyloviz/job/",
        {jobid: jobID},
    );

};

//Login function
const loginPlatform = async (data) => {
    return await $.post(
        reportsRoute+"app/api/v1.0/user/external/login/",
        data,
    );
};

const getFile = async (filePath, sampleNames) => {

    const url = reportsRoute + "app/api/v1.0/reports/strain/files/?path=" +
        filePath + "&sampleNames=" + sampleNames ;

    const link = document.createElement("a");
    link.download = filePath.split('/').slice(-1)[0];
    link.href = url;
    link.click();

};

/**
 * Function to build files with core and wg MLST profiles of the selected
 * strains
 * @param sampleNames
 * @param database_name
 * @returns {Promise.<*>}
 */
const buildProfiles = async (sampleNames, database_name) => {

    return await $.get(
        reportsRoute+"app/api/v1.0/phyloviz/profiles/",
        {
            strain_names: sampleNames.join(";"),
            database_name: database_name,
            get_json: "false"

        },
    );

};

/**
 * Function to download a zip file with the selected profiles
 * @param paths
 * @param file_names
 * @returns {Promise.<void>}
 */
/*const downloadProfiles = async (paths, file_names) => {

    const url = reportsRoute + "app/api/v1.0/reports/files/?paths=" +
        paths.join(";") + "&file_names=" + file_names.join(";");

    const link = document.createElement("a");
    link.download = paths[0].split('/').slice(-1)[0];
    link.href = url;
    link.click();

}*/
