/**
 *
 * @returns {boolean}
 */
const runFromParent = () => {
    try {
        window.parent.setUpFrame();
    }
    catch(e){
        console.log("NOT RUNNING FROM IFRAME");

    }
    console.log(USERNAME, USERID);
    return true;
};

const addUserData = (username, userID) => {
    console.log("InFrame", username, userID);
};