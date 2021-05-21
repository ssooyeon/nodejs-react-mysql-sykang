const db = require(".");

module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define("task", {
    title: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.TEXT,
    },
    ordering: {
      type: Sequelize.INTEGER,
    },
    dueDate: {
      type: Sequelize.DATE,
    },
  });

  return Task;
};
