const CustomError = require("../utils/customError");
module.exports = function dataTrimmer(req, res, next) {
  try {
    if (req.body) {
      trimmer(req.body);
    }
    if (req.query) {
      trimmer(req.query);
    }
    if (req.params) {
      trimmer(req.params);
    }
  } catch (err) {
    next(new CustomError({ message: "Invalid data", statusCode: 400, details: err.message }));
  }
};

function trimmer(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      obj[key] = value.trim();
    } else if (typeof value === "object" && value !== null) {
      trimmer(value);
    }
  }
}
