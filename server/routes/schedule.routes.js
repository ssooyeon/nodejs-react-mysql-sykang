module.exports = (app) => {
  const schedules = require("../controllers/schedule.controller");
  var router = require("express").Router();

  router.post("/", schedules.create);
  router.get("/", schedules.findAll);
  router.get("/:id", schedules.findOne);
  router.put("/:id", schedules.update);
  router.delete("/:id", schedules.delete);
  router.delete("/", schedules.deleteAll);

  app.use("/api/schedules", router);
};
