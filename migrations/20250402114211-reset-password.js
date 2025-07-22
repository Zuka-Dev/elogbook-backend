module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "passwordOTP", {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "expiryOTP", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "passwordOTP");
    await queryInterface.removeColumn("Users", "expiryOTP");
  },
};
