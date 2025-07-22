"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "organisation", {
      type: Sequelize.STRING,
      allowNull: true, // Change to false if required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "organisation");
  },
};
