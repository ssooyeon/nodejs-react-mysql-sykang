module.exports = (sequelize, Sequelize) => {
  const Board = sequelize.define("board", {
    title: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT,
    },
  });

  return Board;
};
