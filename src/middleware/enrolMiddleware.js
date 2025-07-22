const User = require("../models/user");

const isEnrolled = async (req, res, next) => {
  const id = req.user.id;
  const student = await User.findOne({
    where: { id, role: "student" },
  });
  if (student.supervisorId == null) {
    res
      .status(403)
      .json({ message: "Student is not currently assigned to any supervisor" });
  }
  next();
};

module.exports = isEnrolled
