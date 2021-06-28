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
    labelColor: {
      type: Sequelize.STRING,
    },
    dueDate: {
      type: Sequelize.DATE,
    },
    isDone: {
      type: Sequelize.BOOLEAN,
    },
  });

  return Task;
};
