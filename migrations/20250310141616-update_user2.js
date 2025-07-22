"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface
      .addColumn("Users", "totalWeeks", {
        type: Sequelize.INTEGER,
        allowNull: true, // Change to false if required
        defaultValue: 24, // Set a default value (if applicable)
      })
      .addColumn("Users", "organisation", {
        type: Sequelize.STRING,
        allowNull: true, // Change to false if required
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface
      .removeColumn("Users", "totalWeeks")
      .removeColumn("Users", "organisation");
  },
};
