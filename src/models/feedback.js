const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Import DB connection
const User = require("./user"); // Import User model
const { LogbookEntry } = require("./logbookEntry"); // Import LogbookEntry model

const Feedback = sequelize.define(
  "Feedback",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    supervisorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    logbookEntryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: LogbookEntry,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    remark: {
      type: DataTypes.ENUM("Excellent", "Satisfactory", "Poor"),
      allowNull: false, // No need for a default value since supervisor must select one
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "feedback",
    timestamps: true, // Enables createdAt and updatedAt fields automatically
  }
);

// ✅ Define Associations
Feedback.belongsTo(LogbookEntry, {
  foreignKey: "logbookEntryId",
  as: "logbookEntry",
});

LogbookEntry.hasOne(Feedback, {
  foreignKey: "logbookEntryId",
  as: "feedback",
});

// ✅ Associate Supervisor with Feedback
Feedback.belongsTo(User, {
  foreignKey: "supervisorId",
  as: "supervisor",
});

module.exports = Feedback;
