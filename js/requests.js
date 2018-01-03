

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

    for (const el of projectIds) {
        const info = await $.get(
            reportsRoute+"app/api/v1.0/reports/project/",
            { project_id: el },
        );
        res = res.concat(info)
    }

    return res
};

const getReportInfo = async (projectIds) => {

    let res = [];

    for (const el of projectIds) {
        const info = await $.get(
            reportsRoute+"app/api/v1.0/reports/project/info",
            { project_id: el }
        );
        res = res.concat(info)
    }

    return res
};

const getReportByFilter = async (filter) => {
    console.log(filter);
    return await $.get(
        reportsRoute+"app/api/v1.0/reports/project/filter",
        filter,
    );
};
