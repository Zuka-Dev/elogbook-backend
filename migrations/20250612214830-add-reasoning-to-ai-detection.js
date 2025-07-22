"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      "ai_detection_results", // name of your table
      "reasoning", // name of the new column
      {
        type: Sequelize.TEXT, // Data type for the column
        allowNull: true, // Set to false if it must always have a value
        // You can add more options like defaultValue, etc.
      }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      "ai_detection_results", // name of your table
      "reasoning" // name of the column to remove
    );
  },
};
