// TEMPORARY auth middleware.
// Replace this with the real JWT verification once the Auth teammate's
// login/signup module is merged. For now it reads a user id from a header
// so every other module can be built and tested independently.
//
// Real version will usually look like:
//   const token = req.headers.authorization?.split(" ")[1];
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   req.user = { id: decoded.id };

const protect = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Missing x-user-id header (temporary auth stub).",
    });
  }

  req.user = { id: userId };
  next();
};

module.exports = { protect };
