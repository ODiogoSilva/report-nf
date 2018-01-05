const runFromParent = () => {
    window.parent.setUpFrame();
    return true;
};

const setUpFrame = (username, userID) => {
    console.log("InFrame", username, userID);
};