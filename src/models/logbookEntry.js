const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Import DB connection
const User = require("./user"); // Import User model

// Define Logbook Entry Model
const LogbookEntry = sequelize.define(
  "LogbookEntry",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    weekNumber: { type: DataTypes.INTEGER, allowNull: false },
    reportContent: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("Pending", "Late", "Reviewed"),
      allowNull: false,
      defaultValue: "Pending",
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    reviewedAt: { type: DataTypes.DATE, allowNull: true }, // Will be null until reviewed
  },
  {
    tableName: "logbook_entries",
    timestamps: true, // Enables createdAt and updatedAt fields
  }
);

// Define Logbook Image Model
const LogbookImage = sequelize.define(
  "LogbookImage",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    logbookEntryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "logbook_entries", // Fix the reference name
        key: "id",
      },
      onDelete: "CASCADE",
    },
    image: { type: DataTypes.BLOB("long"), allowNull: false }, // Store image as BLOB
    caption: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "logbook_images",
    timestamps: true,
  }
);

// Define relationships (One LogbookEntry -> Many Images)
LogbookEntry.hasMany(LogbookImage, {
  foreignKey: "logbookEntryId",
  as: "images",
});
LogbookImage.belongsTo(LogbookEntry, { foreignKey: "logbookEntryId" });

// Associate LogbookEntry with User Model (Student)
User.hasMany(LogbookEntry, { foreignKey: "studentId", as: "logbookEntries" });
LogbookEntry.belongsTo(User, { foreignKey: "studentId", as: "student" });

// Export models
module.exports = { LogbookEntry, LogbookImage };
