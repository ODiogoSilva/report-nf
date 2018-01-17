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

    const info = await $.get(
        reportsRoute+"app/api/v1.0/reports/project/info",
        { project_id: projectIdsString }
    );
    res = res.concat(info);

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
    return await $.get(
        reportsRoute+"app/api/v1.0/reports/project/filter",
        filter,
    );
};

const getStrainsMetadata = async (filter) => {
    return await $.get(
        reportsRoute+"app/api/v1.0/strains/name",
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

//Request to get PHYLOViZ Online job status
const fetchJob = async (redisJobId) => {

    return await $.get(
        reportsRoute+"app/api/v1.0/phyloviz/",
        {job_id: redisJobId},
    );

};

//Login function
const loginPlatform = async (data) => {
    return await $.post(
        reportsRoute+"app/api/v1.0/user/external/login/",
        data,
    );
};

