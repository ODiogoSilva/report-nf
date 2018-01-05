const runFromParent = () => {
    console.log("AQUI");
    console.log(window.parent);
    window.parent.setUpFrame();
    return true;
};

const setUpFrame = (username, userID) => {
    console.log("InFrame", username, userID);
};