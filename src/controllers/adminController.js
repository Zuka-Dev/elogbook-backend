const { Op } = require("sequelize");
const moment = require("moment");
const { LogbookEntry } = require("../models/logbookEntry");
const User = require("../models/user");

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: "student" } });
    const totalSupervisors = await User.count({
      where: { role: "supervisor" },
    });

    const logsSubmitted = await LogbookEntry.count();
    const logsReviewed = await LogbookEntry.count({
      where: { status: "Reviewed" },
    });
    const pendingReviews = await LogbookEntry.count({
      where: { status: "Pending" },
    });

    const activeEnrollments = await User.count({
      where: {
        role: "student",
        supervisorId: { [Op.ne]: null },
      },
    });

    const completedInternships = await User.count({
      where: {
        role: "student",
        submittedWeeks: { [Op.contains]: [24] }, // Adjust if not JSONB array
      },
    });

    res.json({
      totalStudents,
      totalSupervisors,
      totalLogsSubmitted: logsSubmitted,
      logsReviewed,
      pendingReviews,
      activeEnrollments,
      completedInternships,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 👩‍🎓 All Students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: "student" },
      include: [
        {
          model: User,
          as: "supervisor",
          attributes: ["firstName", "lastName", "organisation"],
        },
      ],
    });

    const studentData = await Promise.all(
      students.map(async (student) => {
        const logsSubmitted = await LogbookEntry.count({
          where: { studentId: student.id },
        });
        const logsReviewed = await LogbookEntry.count({
          where: { studentId: student.id, status: "Reviewed" },
        });

        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          studentId: student.matricNumber,
          supervisor: student.supervisor
            ? `${student.supervisor.firstName} ${student.supervisor.lastName}`
            : "Unassigned",
          company: student.organisation || "—",
          logsSubmitted,
          logsReviewed,
          status: logsSubmitted >= 24 ? "completed" : "active",
          progress: Math.floor((logsSubmitted / 24) * 100),
        };
      })
    );

    res.json(studentData);
  } catch (err) {
    console.error("Get all students error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧑‍💼 All Supervisors

exports.getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await User.findAll({
      where: { role: "supervisor" },
    });

    const enriched = await Promise.all(
      supervisors.map(async (supervisor) => {
        // Count students under this supervisor
        const studentCount = await User.count({
          where: { supervisorId: supervisor.id },
        });

        // Get all student IDs under this supervisor
        const students = await User.findAll({
          where: { supervisorId: supervisor.id },
          attributes: ["id"],
        });
        const studentIds = students.map((s) => s.id);

        // Count reviewed logs
        const reviewedLogs = await LogbookEntry.count({
          where: {
            studentId: studentIds,
            status: "Reviewed",
          },
        });

        return {
          id: supervisor.id,
          name: `${supervisor.firstName} ${supervisor.lastName}`,
          email: supervisor.email,
          company: supervisor.organisation,
          studentsSupervised: studentCount,
          logsReviewed: reviewedLogs,
          avgResponseTime: "2.5 days", // 🔧 Optional to calculate later
          rating: 4.7, // 🔧 Optional (if you want to implement)
          status: "active", // 🔧 Or derive from last login, etc.
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get all supervisors error:", error);
    res.status(500).json({ message: "Failed to fetch supervisors" });
  }
};

// 🧾 All Enrollments
exports.getAllEnrollments = async (req, res) => {
  try {
    const students = await User.findAll({
      where: {
        role: "student",
        supervisorId: { [Op.ne]: null },
      },
      include: [
        {
          model: User,
          as: "supervisor",
          attributes: ["firstName", "lastName"],
        },
      ],
    });

    const enrollments = students.map((student) => {
      const startDate = new Date(student.enrollmentDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7 * (student.totalWeeks || 24));

      const logsSubmitted = student.submittedWeeks?.length || 0;
      const progress = Math.floor(
        (logsSubmitted / (student.totalWeeks || 24)) * 100
      );

      return {
        id: student.id,
        student: `${student.firstName} ${student.lastName}`,
        studentId: student.matricNumber,
        supervisor: student.supervisor
          ? `${student.supervisor.firstName} ${student.supervisor.lastName}`
          : "Unassigned",
        company: student.organisation || "—",
        startDate,
        endDate,
        status:
          logsSubmitted >= (student.totalWeeks || 24) ? "completed" : "active",
        progress,
      };
    });

    res.json(enrollments);
  } catch (err) {
    console.error("Get enrollments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
