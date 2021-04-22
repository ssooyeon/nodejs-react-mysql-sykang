module.exports = (sequelize, Sequelize) => {
  const Log = sequelize.define("log", {
    status: {
      type: Sequelize.ENUM("BASIC", "SUCCESS", "ERROR"),
      defaultValue: "BASIC",
    },
    message: {
      type: Sequelize.TEXT,
    },
  });

  return Log;
};
