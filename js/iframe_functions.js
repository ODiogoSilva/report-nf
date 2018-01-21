/**
 *
 * @returns {boolean}
 */
const runFromParent = () => {
    try {
        window.parent.setUpFrame();
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
var addUserData = (username, userID) => {
    USERNAME = username;
    USERID = userID;

    //Get user Trees
    trees = getPHYLOViZTrees();

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