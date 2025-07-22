const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  hashPassword,
  checkPassword,
  generateOTP,
} = require("../utils/passwordUtils");
const User = require("../models/user");
const generateEnrollmentKey = require("../utils/enrolUtils");
const sendEmail = require("../utils/mailUtils");
//Register
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      matricNumber,
      supervisorId,
      organisation,
      totalWeeks,
    } = req.body;
    // Ensure role is valid
    const validRoles = ["student", "supervisor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }
    //Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    //Create new user with detais
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: await hashPassword(password),
      role,
      matricNumber: role === "student" ? matricNumber : null,
      supervisorId: role === "student" ? supervisorId : null,
      enrollmentKey: role === "supervisor" ? generateEnrollmentKey() : null,
      organisation,
      totalWeeks,
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser.id });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    //Check if user exist
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "User not found." });
    //Check if password matches
    if (!(await checkPassword(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });
    //Create jwtoken
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    return res.status(200).json({ role: user.role, access_token: token });
  } catch (error) {
    console.error("Error in Login:", error);
    return res.status(500).json({ message: "Server error" });
  }

  //Check user name
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "firstName",
        "lastName",
        "email",
        "role",
        "matricNumber",
        "supervisorId",
        "totalWeeks",
        "organisation",
        "enrollmentKey",
      ], // Select only required fields
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in GetUsers:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUser = async (req, res) => {
  try {
    // Get the authenticated user ID from JWT middleware
    const userId = req.user.id;

    // Fetch user details from database
    const user = await User.findOne({
      where: { id: userId },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "role",
        "matricNumber",
        "supervisorId",
        "totalWeeks",
        "organisation",
        "enrollmentKey",
      ], // Return only necessary fields
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUser:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const forgotPassword = async (req, res) => {
  const { email, url } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "This user does not exist" });
    }

    // Generate OTP and set expiry time (30 minutes from now)
    const otp = await generateOTP();
    const expiryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Update user with OTP and expiry time
    user.passwordOTP = otp;
    user.expiryOTP = expiryTime;
    await user.save();

    // Format URL properly
    const resetLink = `${(
      url || "http://localhost:3000"
    ).trim()}/reset-password?email=${encodeURIComponent(email)}`;
    console.log(user.email);
    // Send OTP via email
    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It will expire in 30 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">Hello,</p>
          <p style="font-size: 16px; color: #555;">You requested to reset your password. Use the OTP below to proceed. This OTP will expire in <strong>30 minutes</strong>.</p>
          
          <div style="text-align: center; padding: 15px; font-size: 24px; font-weight: bold; color: #fff; background: #007bff; border-radius: 5px; display: inline-block;">
            ${otp}
          </div>
          
          <p style="font-size: 16px; color: #555;">If you didn't request this, you can safely ignore this email.</p>
          
          <p style="font-size: 16px; text-align: center;">
            <a href="${resetLink}" style="background: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">Reset Password</a>
          </p>

          <p style="font-size: 14px; color: #888; text-align: center;">&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      `,
    });

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, OTP, and new password are required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "This user does not exist" });
    }

    // Ensure OTP is valid (convert to string for strict equality check)
    if (String(user.passwordOTP) !== String(otp)) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // Check if OTP has expired
    if (new Date() > user.expiryOTP) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Hash the new password
    user.password = await hashPassword(newPassword);
    user.passwordOTP = null; // Clear OTP
    user.expiryOTP = null; // Clear OTP expiry
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  getUsers,
  getUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
