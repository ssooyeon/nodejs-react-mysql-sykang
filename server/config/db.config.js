module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "1234",
  DB: "my_blog",
  dialect: "mysql",
  dialectOptions: { charset: "utf8mb4", dateStrings: true, typeCast: true },
  timezone: "+09:00",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: false,
  },
};
