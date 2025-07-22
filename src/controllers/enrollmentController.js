const { LogbookEntry } = require("../models/logbookEntry");
const User = require("../models/user");
const generateEnrollmentKey = require("../utils/enrolUtils");

const enrollStudent = async (req, res) => {
  const { id } = req.user;
  try {
    const student = await User.findOne({
      where: { id, role: "student" },
    });
    const { enrollmentKey } = req.body;
    const supervisor = await User.findOne({ where: { enrollmentKey } });
    if (!supervisor)
      return res.status(400).json({ message: "Invalid Enrollment Key" });
    //Check how many students
    const studentCount = await User.count({
      where: { supervisorId: supervisor.id },
    });
    if (studentCount >= 5)
      return res
        .status(400)
        .json({ message: "Supervisor has reached max capacity" });

    student.supervisorId = supervisor.id;
    student.enrollmentDate = new Date();
    await student.save();
    return res.status(200).json({
      message: "Enrollment successful",
      supervisorId: supervisor.id,
    });
    //Tentative: Send Mail to Supervisor
  } catch (error) {
    console.error("Error in Login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const enrolledStudents = async (req, res) => {
  const { id } = req.user;
  try {
    const students = await User.findAll({
      where: { supervisorId: id, role: "student" }, // Ensure only students are fetched
      attributes: ["id", "firstName", "lastName", "email", "matricNumber"], // Select only required fields
    });

    if (students.length === 0) {
      return res
        .status(200)
        .json({ message: "Supervisor does not have any enrolled students" });
    }

    // 🔴 You forgot this line! This sends the student list as a response.
    return res.status(200).json(students);
  } catch (error) {
    console.error("Error in fetching enrolled students:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const enrolledStudent = async (req, res) => {
  const { id } = req.user;
  const { studentId } = req.params;
  try {
    const student = await User.findOne({
      where: { supervisorId: id, role: "student", id: studentId }, // Ensure only students are fetched
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "matricNumber",
        "organisation",
        "totalWeeks",
        "submittedWeeks",
      ], // Select only required fields
      include: [
        {
          model: LogbookEntry,
          as: "logbookEntries",
          attributes: ["id", "reportContent", "submittedAt"],
        },
      ],
    });

    if (!student) {
      return res
        .status(200)
        .json({ message: "Supervisor does not have any enrolled students" });
    }

    // 🔴 You forgot this line! This sends the student list as a response.
    return res.status(200).json(student);
  } catch (error) {
    console.error("Error in fetching enrolled studentt", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const enrollmentKey = async (req, res) => {
  try {
    const { id } = req.user;
    const supervisor = await User.findOne({ where: { id } });
    supervisor.enrollmentKey = await generateEnrollmentKey();
    await supervisor.save();
    return res.status(200).json({
      message: "Enrollment Key has been regenerated",
      enrollmentKey: supervisor.enrollmentKey,
    });
  } catch (error) {
    console.error("Error in Login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  enrollStudent,
  enrolledStudents,
  enrollmentKey,
  enrolledStudent,
};
