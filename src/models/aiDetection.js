const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Import DB connection
const User = require("./user"); // Import User model
const { LogbookEntry } = require("./logbookEntry"); // Import LogbookEntry model

const AiDetection = sequelize.define(
  "AiDetection",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    logbookEntryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: LogbookEntry,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    aiScore: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    // --- ADD THIS NEW FIELD ---
    reasoning: {
      type: DataTypes.TEXT, // Use TEXT for potentially longer explanations
      allowNull: true, // Allow it to be null if no reasoning is provided or caught
    },
  },
  {
    tableName: "ai_detection_results",
    timestamps: true, // Enables createdAt and updatedAt fields automatically
  }
);

AiDetection.belongsTo(LogbookEntry, {
  foreignKey: "logbookEntryId",
  as: "logbookEntry",
});
LogbookEntry.hasOne(AiDetection, {
  foreignKey: "logbookEntryId",
  as: "aiDetection",
});

module.exports = AiDetection;
