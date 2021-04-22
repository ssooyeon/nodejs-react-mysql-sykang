module.exports = (app) => {
  const monitorings = require("../controllers/monitoring.controller");
  var router = require("express").Router();

  router.get("/cpu/usage", monitorings.findCPUUsage);
  router.get("/cpu/speed", monitorings.findCPUSpeed);
  router.get("/memory/usage", monitorings.findMemoryUsage);
  router.get("/memory/freeSpace", monitorings.findMemoryFreeSpace);
  router.get("/disk/usage", monitorings.findDiskUsage);
  router.get("/disk/freeSpace", monitorings.findDiskFreeSpace);

  app.use("/api/monitoring", router);
};
