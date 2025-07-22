const express = require("express");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const {
  enrollStudent,
  enrolledStudents,
  enrollmentKey,
  enrolledStudent,
} = require("../controllers/enrollmentController");

const Router = express.Router();

Router.post(
  "/enrollment",
  verifyToken,
  authorizeRole(["student"]),
  enrollStudent
);
Router.get(
  "/supervisor/students",
  verifyToken,
  authorizeRole(["supervisor"]),
  enrolledStudents
);
Router.get(
  "/supervisor/students/:studentId",
  verifyToken,
  authorizeRole(["supervisor"]),
  enrolledStudent
);
Router.put(
  "/supervisor/enrollment-key",
  verifyToken,
  authorizeRole(["supervisor"]),
  enrollmentKey
);

module.exports = Router;
