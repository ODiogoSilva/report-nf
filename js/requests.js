
// const Requests = ($http) => {
//     return {
//         get_reports_by_project: async function get_reports_by_project(project_id){
//             console.log(project_id);
//             req = {
// 		        url:'https://192.92.149.157/app/api/v1.0/reports/project/',
// 		        method:'GET',
// 		        params: { project_id: project_id }
// 		    };
//
// 		    return await $http(req).then(function(response){
// 		    	return response;
// 		    }, function(response){
// 		    	return response;
// 		    });
//         }
//     }
// };

const get_reports_by_project = async (project_id) => {
    return await $.get(
		'https://192.92.149.157/app/api/v1.0/reports/project/',
        { project_id: project_id },
	);
};