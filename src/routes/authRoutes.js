const express = require("express");
const {
  loginUser,
  getUsers,
  getUser,
  registerUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers");
const { verifyToken } = require("../middleware/authMiddleware");

const Router = express.Router();

Router.post("/register", registerUser);
Router.post("/login", loginUser);
Router.get("/getUsers", getUsers);
Router.post("/forgot-password", forgotPassword);
Router.post("/reset-password", resetPassword);
Router.get("/getUser", verifyToken, getUser);

module.exports = Router;
