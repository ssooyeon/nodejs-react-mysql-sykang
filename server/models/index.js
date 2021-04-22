const dbConfig = require("../config/db.config");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = require("./user.model")(sequelize, Sequelize);
db.boards = require("./board.model")(sequelize, Sequelize);
db.logs = require("./log.model")(sequelize, Sequelize);

db.users.hasMany(db.boards, { as: "boards" });
db.boards.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

db.tutorials = require("./tutorial.model")(sequelize, Sequelize);

module.exports = db;
