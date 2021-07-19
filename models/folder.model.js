module.exports = (sequelize, Sequelize) => {
  const Folder = sequelize.define("folder", {
    name: {
      type: Sequelize.STRING,
    },
    ordering: {
      type: Sequelize.INTEGER,
    },
  });

  return Folder;
};
