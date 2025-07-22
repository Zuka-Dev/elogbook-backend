"use strict";

const { hashPassword } = require('../src/utils/passwordUtils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Users", [
      {
        firstName: "John",
        lastName: "Doe",
        email: "student@example.com",
        password: await hashPassword("test"), // Use bcrypt to hash passwords before inserting
        role: "student",
        matricNumber: "STU12345",
        supervisorId: null, // No supervisor assigned yet
        totalWeeks: 24,
        organisation: "Globus Bank Ltd.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Dr.",
        lastName: "Smith",
        email: "supervisor@example.com",
        password: await hashPassword("test"), // Use bcrypt to hash passwords before inserting
        role: "supervisor",
        enrollmentKey: "xTJmLyAisDi5", // Sample enrollment key
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
