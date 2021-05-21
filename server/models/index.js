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

db.folders = require("./folder.model")(sequelize, Sequelize);
db.folders.belongsTo(db.users, {
  foreignKey: "managerId",
  as: "manager",
});
db.folders.belongsTo(db.folders, {
  foreignKey: "parentId",
  as: "parent",
});

db.tasks = require("./task.model")(sequelize, Sequelize);
db.folders.hasMany(db.tasks, { as: "tasks" });
db.tasks.belongsTo(db.folders, {
  foreignKey: "folderId",
  as: "folder",
});
db.tasks.belongsTo(db.users, {
  foreignKey: "createrId",
  as: "creater",
});

module.exports = db;
