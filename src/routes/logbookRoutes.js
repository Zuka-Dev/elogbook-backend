const express = require("express");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const {
  submitEntry,
  updateEntry,
  getPendingEntries,
  getImage,
  getAllEntries,
  submitFeedback,
  analyzeReportAI,
  getEntry,
  getDeadline,
  getReviewedEntries,
} = require("../controllers/logbookController");
const isEnrolled = require("../middleware/enrolMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// 📝 Submit Logbook Entry (Students Only)
router.post(
  "/submit",
  verifyToken,
  authorizeRole(["student"]),
  isEnrolled,
  upload.array("images", 5), // Ensure this comes after isEnrolled
  submitEntry
);
router.get(
  "/deadline/:weekNumber",
  verifyToken,
  authorizeRole(["student"]),
  isEnrolled,
  getDeadline
);
// ✏️ Update Logbook Entry (Students Only)
router.patch(
  "/update",
  verifyToken,
  authorizeRole(["student"]),
  isEnrolled,
  updateEntry
);

// 🔍 Get All Pending Entries for Supervisor
router.get(
  "/supervisor/pending",
  verifyToken,
  authorizeRole(["supervisor"]),
  getPendingEntries
);
// 🔍 Get All Reviewed Entries for Supervisor
router.get(
  "/supervisor/reviewed",
  verifyToken,
  authorizeRole(["supervisor"]),
  getReviewedEntries
);

// 🖼️ Get Image by ID (Students, Supervisors, Admin)
router.get(
  "/image/:id",
  // verifyToken,
  // authorizeRole(["supervisor", "student", "admin"]),
  getImage
);

// 📝 Supervisor Submits Feedback on Entry
router.post(
  "/:entryId/feedback",
  verifyToken,
  authorizeRole(["supervisor"]),
  submitFeedback
);

// 🤖 AI Analysis on Report
router.post(
  "/:entryId/analyze-ai",
  verifyToken,
  authorizeRole(["supervisor"]),
  analyzeReportAI
);

// 📜 Get All Entries for Logged-in Student
router.get("/student", verifyToken, authorizeRole(["student"]), getAllEntries);
router.get(
  "/student/:entryId",
  verifyToken,
  authorizeRole(["student", "supervisor"]),
  getEntry
);

module.exports = router;
