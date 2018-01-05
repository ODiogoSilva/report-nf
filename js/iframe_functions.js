const runFromParent = () => {
    window.parent.setUpFrame();
    return true;
};

const addUserData = (username, userID) => {
    console.log("InFrame", username, userID);
};