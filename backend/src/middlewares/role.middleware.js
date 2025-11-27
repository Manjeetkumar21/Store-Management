const { ApiError } = require("../utils/apiError.js");

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log("user role : ", req.user.role)
      throw new ApiError(403, "You are not authorized for this action");
    }
    next();
  };
};

module.exports = { authorizeRoles };
