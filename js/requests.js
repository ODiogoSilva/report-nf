

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

const getReportsByProject = async (project_id) => {
    return await $.get(
		reportsRoute+"app/api/v1.0/reports/project/",
        { project_id: project_id },
	);
};

const getReportInfo = async (project_id) => {
    return await $.get(
        reportsRoute+"app/api/v1.0/reports/project/info",
        { project_id: project_id },
    );
};

const getReportByFilter = async (filter) => {
    console.log(filter);
    return await $.get(
        reportsRoute+"app/api/v1.0/reports/project/filter",
        filter,
    );
};
