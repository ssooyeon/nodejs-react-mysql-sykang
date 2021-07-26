let path;
switch (process.env.NODE_ENV) {
  case "production":
    path = `${__dirname}/../.env.prod`;
    break;
  case "dev":
    path = `${__dirname}/../.env.dev`;
    break;
  default:
    path = `${__dirname}/../.env.dev`;
}
require("dotenv").config({ path: path });

const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

/** logs */
db.logs = require("./log.model")(sequelize, Sequelize);

/** users */
db.users = require("./user.model")(sequelize, Sequelize);

/** groups  with users */
db.groups = require("./group.model")(sequelize, Sequelize);
db.groups.hasMany(db.users, { as: "users" });
db.users.belongsTo(db.groups, {
  foreignKey: "groupId",
  as: "group",
});

/** boards with users */
db.boards = require("./board.model")(sequelize, Sequelize);
db.users.hasMany(db.boards, { as: "boards" });
db.boards.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

/** folders with users */
db.folders = require("./folder.model")(sequelize, Sequelize);
db.folders.belongsTo(db.users, {
  foreignKey: "managerId",
  as: "manager",
});
db.folders.belongsTo(db.folders, {
  foreignKey: "parentId",
  as: "parent",
  onDelete: "CASCADE",
});

/** tasks with folders, users */
db.tasks = require("./task.model")(sequelize, Sequelize);
db.folders.hasMany(db.tasks, { as: "tasks" });
db.tasks.belongsTo(db.folders, {
  foreignKey: "folderId",
  as: "folder",
  onDelete: "CASCADE",
});
db.tasks.belongsTo(db.users, {
  foreignKey: "createrId",
  as: "creater",
  onDelete: "CASCADE",
});
db.users.belongsToMany(db.folders, { through: "userFolder", as: "folders", foreignKey: "userId" });
db.folders.belongsToMany(db.users, { through: "userFolder", as: "users", foreignKey: "folderId" });

/** schedules with users */
db.schedules = require("./schedule.model")(sequelize, Sequelize);
db.schedules.belongsTo(db.users, {
  foreignKey: "createrId",
  as: "creater",
  onDelete: "CASCADE",
});

module.exports = db;
