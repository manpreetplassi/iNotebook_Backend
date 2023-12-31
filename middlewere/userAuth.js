const jwt = require("jsonwebtoken");
const passport = require("passport");


exports.isAuth = (req, res, done) => {
    return passport.authenticate('jwt');
}

exports.sanitizeUser = (user) => {
    return {id: user.id, name: user.name}
}
exports.cookiesExtracter = function(req){
    let token = null;
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    
    // token = "";
    return token;
  
}