const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("student", "supervisor", "admin"),
      allowNull: false,
    },
    passwordOTP: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    expiryOTP: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Student-specific fields
    matricNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      defaultValue: null,
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    supervisorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" }, // Corrected model name to "Users"
    },
    totalWeeks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    organisation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    submittedWeeks: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      defaultValue: [],
    },
    // Supervisor-specific fields
    enrollmentKey: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      defaultValue: null,
    },
  },
  { timestamps: true }
);

// Define Supervisor → Students Relationship (1:N)
User.hasMany(User, {
  foreignKey: "supervisorId",
  as: "students",
});

// Define Student → Supervisor Relationship (1:1)
User.belongsTo(User, {
  foreignKey: "supervisorId",
  as: "supervisor",
});

module.exports = User;
