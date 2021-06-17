const db = require(".");

module.exports = (sequelize, Sequelize) => {
  const Schedule = sequelize.define("schedule", {
    title: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.TEXT,
    },
    start: {
      type: Sequelize.STRING,
    },
    end: {
      type: Sequelize.STRING,
    },
    backgroundColor: {
      type: Sequelize.STRING,
    },
    textColor: {
      type: Sequelize.STRING,
    },
    isAllDay: {
      type: Sequelize.BOOLEAN,
    },
  });

  return Schedule;
};
