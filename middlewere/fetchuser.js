const jwt = require('jsonwebtoken');

const fetchuser = (req, res, next) => {
    // Get the user from the jvt token and add to req object
    const authtoken = req.header("auth-token");
    // key can be expire
    try {
        const data = jwt.verify(authtoken, 'yourSecretKey');
        req.user = data.user;
        next();
    } catch (error) {
        if(!authtoken){
            res.status(401).send("please enter the valid token");
        }
    }
}
module.exports = fetchuser;