/**
 *
 * @returns {boolean}
 */
const runFromParent = () => {
    try {
        window.parent.setUpFrame(() => {
            window.parent.check_to_load_reports();
        });
    }
    catch(e){
        promptPassword();
    }
    return true;
};

/**
 * Add user information in case of running in the platform
 * Function type NEEDS to have the var declaration to work
 * @param username
 * @param userID
 */
var addUserData = async (username, userID, callback) => {
    USERNAME = username;
    USERID = userID;

    //Get user Trees
    trees =  await getPHYLOViZTrees();

    callback();

};

/**
 * Function to load project directly from the parent single project page
 * @param selectedNames
 * @param project_id
 * @returns {Promise.<void>}
 */
var loadReport = async (selectedNames, project_id) => {

    $("#btProjectSelect").trigger("click");
    $("#project_select").find('option[value="' + String(project_id) + '"]').prop("selected",true);
    $('.selectpicker').trigger('change');
    $("#project_select").trigger("hide.bs.select");

    $("#project_select").off("endLoad").on("endLoad", () => {
        $("#f_by_name option:selected").prop("selected", false);

        $.each(selectedNames, (i,e) => {
            $("#f_by_name option[value='" + e + "']").prop("selected", true);
        });

        $("#submitProject").trigger("click");
    });

};

/**
 * Function to prompt for username and password in case of running reports locally
 */
const promptPassword = () => {
    $("#signInDiv").css({display:"block"});
    $("#mainBanner").css({display:"none"});
};

/**
 * Function to process authentication
 */
const processAuth = async () => {
    const loginData = {"username":$("#inputUsername").val(), "password":$("#inputPassword").val()};
    const res = await loginPlatform(loginData);

    if (res !== undefined && res.access === true) {
        $("#signInDiv").css({display:"none"});
        $("#mainBanner").css({display:"block"});

        //Get user Trees
        trees = await getPHYLOViZTrees();

    }
    else{
        modalAlert("Incorrect credentials! Please try again...");
    }
};