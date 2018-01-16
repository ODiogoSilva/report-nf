/**
 *
 * @returns {boolean}
 */
const runFromParent = () => {
    try {
        window.parent.setUpFrame();
    }
    catch(e){
        return false;
    }
    return true;
};

const addUserData = (username, userID) => {
    console.log("InFrame", username, userID);
};