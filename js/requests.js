
const Requests = ($http) => {
    return {
        get_reports_by_project: function get_reports_by_project(project_id, callback){
            console.log(project_id);
            req = {
		        url:'https://192.92.149.157/app/api/v1.0/reports/project/',
		        method:'GET',
		        params: { project_id: project_id }
		    }

		    $http(req).then(function(response){
		    	callback(response, project_id);
		    }, function(response){
		    	callback(response, project_id);
		    });
        }
    }
}
