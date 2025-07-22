const Feedback = require("../models/feedback");
const { LogbookImage, LogbookEntry } = require("../models/logbookEntry");
const User = require("../models/user");
const moment = require("moment");
const { detectAIContent } = require("../services/aiDetectionService");
const AiDetection = require("../models/aiDetection");
const { canSubmitWeek, getWeekDeadline } = require("../utils/logbookDeadline");

// 📝 Submit Logbook Entry
const submitEntry = async (req, res) => {
  try {
    const { id } = req.user;
    const { weekNumber, reportContent } = req.body;
    const images = req.files;
    const student = await User.findByPk(id);
    if (!student.enrollmentDate)
      return res.status(400).json({ message: "Enrollment date not set." });

    student.submittedWeeks = student.submittedWeeks || [];
    console.log(
      "Check",
      student.submittedWeeks,
      weekNumber,
      canSubmitWeek(student.submittedWeeks, weekNumber)
    );
    // if (!canSubmitWeek(student.submittedWeeks, Number(weekNumber))) {
    //   return res
    //     .status(400)
    //     .json({ message: "You must submit weeks in order." });
    // }

    const deadline = getWeekDeadline(student.enrollmentDate, weekNumber);
    const now = moment();

    const status = now.isAfter(deadline) ? "Late" : "Pending";
    // Prevent duplicate submission
    const existingEntry = await LogbookEntry.findOne({
      where: { studentId: id, weekNumber },
    });
    if (existingEntry)
      return res
        .status(400)
        .json({ message: "This week's report has already been submitted" });

    // Create logbook entry
    const newEntry = await LogbookEntry.create({
      studentId: id,
      weekNumber,
      reportContent,
      status,
      submittedAt: now.toISOString(),
    });

    // Save images if provided
    if (images?.length > 0) {
      if (images.length > 3)
        return res.status(400).json({ message: "Maximum 3 images allowed" });

      const imagePromises = images.map((image) =>
        LogbookImage.create({
          logbookEntryId: newEntry.id,
          image: image.buffer,
          caption: image.originalname,
        })
      );
      await Promise.all(imagePromises);
    }

    if (!student.submittedWeeks.includes(newEntry.weekNumber)) {
      student.submittedWeeks.push(newEntry.weekNumber);
      student.submittedWeeks = [...new Set(student.submittedWeeks)].sort(
        (a, b) => a - b
      );
      await student.save(); // ✅ This must be called
    }

    return res.status(201).json({
      message: "Report submitted successfully",
      entryId: newEntry.id,
      status,
    });
  } catch (error) {
    console.error("Error submitting logbook entry:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const getDeadline = async (req, res) => {
  const { id } = req.user;
  const { weekNumber } = req.params;

  const student = await User.findByPk(id);
  if (!student || !student.enrollmentDate)
    return res.status(400).json({ message: "Enrollment date not found" });

  const deadline = getWeekDeadline(student.enrollmentDate, Number(weekNumber));
  return res.status(200).json({ deadline: deadline.toISOString() });
};

// 📝 Update Logbook Entry
const updateEntry = async (req, res) => {
  const { id } = req.user;
  const { weekNumber, reportContent } = req.body;

  const student = await User.findByPk(id);
  const entry = await LogbookEntry.findOne({
    where: { studentId: id, weekNumber },
  });

  if (!entry) return res.status(404).json({ message: "Entry not found." });

  // ✅ Check if the entry is already reviewed
  if (entry.status === "Reviewed") {
    return res
      .status(400)
      .json({ message: "You cannot edit a reviewed entry." });
  }

  const deadline = getWeekDeadline(student.enrollmentDate, weekNumber);
  const now = moment();

  const nextSubmitted = student.submittedWeeks.some((w) => w > weekNumber);
  if (now.isAfter(deadline) || nextSubmitted) {
    return res
      .status(400)
      .json({ message: "You cannot edit this entry anymore." });
  }

  entry.reportContent = reportContent;
  await entry.save();

  return res.status(200).json({ message: "Entry updated successfully." });
};

// 📝 Supervisor Feedback Submission
const submitFeedback = async (req, res) => {
  try {
    const { id } = req.user;
    const { entryId } = req.params;
    const { remark, comment } = req.body;

    // Ensure entry exists
    const entry = await LogbookEntry.findByPk(entryId);
    if (!entry)
      return res.status(404).json({ message: "Logbook entry not found" });

    // Save feedback
    await Feedback.create({
      supervisorId: id,
      logbookEntryId: entryId,
      remark,
      comment,
    });

    // Update entry status
    entry.status = "Reviewed";
    await entry.save();

    return res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 📝 AI Detection Analysis
const analyzeReportAI = async (req, res) => {
  try {
    const { entryId } = req.params;
    const entry = await LogbookEntry.findByPk(entryId);
    if (!entry) {
      return res.status(404).json({ message: "Logbook entry not found" });
    }

    let aiReport = await AiDetection.findOne({
      where: { logbookEntryId: entryId },
    });

    if (!aiReport) {
      const detectionResult = await detectAIContent(entry.reportContent);

      // Check if detection was successful and returned expected data
      if (
        !detectionResult ||
        typeof detectionResult.ai_likelihood_score !== "number"
      ) {
        return res
          .status(500)
          .json({ message: "AI analysis failed or returned invalid data." });
      }

      aiReport = await AiDetection.create({
        logbookEntryId: entryId,
        aiScore: parseFloat(detectionResult.ai_likelihood_score.toFixed(2)), // Ensure float and 2 decimal places
        reasoning: detectionResult.reasoning, // Store the reasoning
      });
    }

    return res.status(200).json(aiReport);
  } catch (error) {
    console.error("Error analyzing report:", error);
    return res
      .status(500)
      .json({ message: "Server error during AI analysis." });
  }
};

// 📜 Get Pending Logbook Entries (For Supervisors)
const getPendingEntries = async (req, res) => {
  try {
    const { id } = req.user;

    const studentIds = (
      await User.findAll({
        where: { supervisorId: id, role: "student" },
        attributes: ["id"],
      })
    ).map((s) => s.id);
    if (studentIds.length === 0)
      return res
        .status(200)
        .json({ message: "No students enrolled under this supervisor" });

    const pendingEntries = await LogbookEntry.findAll({
      where: { studentId: studentIds, status: "Pending" },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["firstName", "lastName", "email", "matricNumber"],
        },
      ],
    });

    return res
      .status(200)
      .json(
        pendingEntries.length
          ? pendingEntries
          : { message: "No pending logbook entries" }
      );
  } catch (error) {
    console.error("Error fetching pending entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const getReviewedEntries = async (req, res) => {
  try {
    const { id } = req.user;

    // Fetch all students under the supervisor
    const studentIds = (
      await User.findAll({
        where: { supervisorId: id, role: "student" },
        attributes: ["id"],
      })
    ).map((s) => s.id);

    if (studentIds.length === 0)
      return res
        .status(200)
        .json({ message: "No students enrolled under this supervisor" });

    // Fetch reviewed logbook entries
    const reviewedEntries = await LogbookEntry.findAll({
      where: { studentId: studentIds, status: "Reviewed" },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["firstName", "lastName", "email", "matricNumber"],
        },
        {
          model: Feedback,
          as: "feedback",
          attributes: ["remark", "comment", "createdAt"], // Include feedback details
        },
      ],
      order: [["updatedAt", "DESC"]], // Sort by latest reviewed
    });

    return res
      .status(200)
      .json(
        reviewedEntries.length
          ? reviewedEntries
          : { message: "No reviewed logbook entries" }
      );
  } catch (error) {
    console.error("Error fetching reviewed entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const getStudentsEntry = async (req, res) => {
  try {
    const { id } = req.user;

    // Fetch all students under the supervisor
    const studentIds = (
      await User.findOne({
        where: { supervisorId: id, role: "student" },
        attributes: ["id"],
      })
    ).map((s) => s.id);

    if (studentIds.length === 0)
      return res
        .status(200)
        .json({ message: "No students enrolled under this supervisor" });

    // Fetch reviewed logbook entries
    const reviewedEntries = await LogbookEntry.findAll({
      where: { studentId: studentIds, status: "Reviewed" },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["firstName", "lastName", "email", "matricNumber"],
        },
        {
          model: Feedback,
          as: "feedback",
          attributes: ["remark", "comment", "createdAt"], // Include feedback details
        },
      ],
      order: [["updatedAt", "DESC"]], // Sort by latest reviewed
    });

    return res
      .status(200)
      .json(
        reviewedEntries.length
          ? reviewedEntries
          : { message: "No reviewed logbook entries" }
      );
  } catch (error) {
    console.error("Error fetching reviewed entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 📜 Get All Logbook Entries for a Student
const getAllEntries = async (req, res) => {
  try {
    const { id } = req.user;
    const entries = await LogbookEntry.findAll({
      where: { studentId: id },
      include: [
        { model: LogbookImage, as: "images", attributes: ["id", "caption"] },
        {
          model: Feedback,
          as: "feedback",
          attributes: ["remark", "comment", "createdAt"],
        },
        {
          model: AiDetection,
          as: "aiDetection",
          attributes: ["aiScore", "reasoning"],
        }
      ],
      order: [["weekNumber", "ASC"]],
    });
    return res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// 📜 Get All Logbook Entries for a Student
const getEntry = async (req, res) => {
  try {
    const { id } = req.user;
    const { entryId } = req.params;
    const entry = await LogbookEntry.findOne({
      where: { id: entryId },
      include: [
        { model: LogbookImage, as: "images", attributes: ["id", "caption"] },
        {
          model: Feedback,
          as: "feedback",
          attributes: ["remark", "comment", "createdAt"],
        },
        {
          model: User,
          as: "student",
          attributes: ["firstName", "lastName", "email", "matricNumber"],
        },
      ],
    });
    return res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 🖼️ Get Image by ID
const getImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await LogbookImage.findByPk(id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    res.set("Content-Type", "image/png");
    return res.send(image.image);
  } catch (error) {
    console.error("Error fetching image:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  submitEntry,
  updateEntry,
  submitFeedback,
  analyzeReportAI,
  getPendingEntries,
  getReviewedEntries,
  getAllEntries,
  getDeadline,
  getImage,
  getEntry,
};
