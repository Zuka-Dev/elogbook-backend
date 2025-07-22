const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const { getAdminDashboardStats, getAllSupervisors, getAllEnrollments, getAllStudents } = require("../controllers/adminController");

router.get(
  "/dashboard-stats",
  verifyToken,
  authorizeRole("admin"),
  getAdminDashboardStats
);
router.get("/students", verifyToken, authorizeRole("admin"), getAllStudents);
router.get(
  "/supervisors",
  verifyToken,
  authorizeRole("admin"),
  getAllSupervisors
);
router.get(
  "/enrollments",
  verifyToken,
  authorizeRole("admin"),
  getAllEnrollments
);

module.exports = router;
