module.exports = (app) => {
  const groups = require("../controllers/group.controller");
  var router = require("express").Router();

  router.post("/", groups.create);
  router.get("/", groups.findAll);
  router.get("/:id", groups.findOne);
  router.put("/:id", groups.update);
  router.delete("/:id", groups.delete);
  router.delete("/", groups.deleteAll);

  app.use("/api/groups", router);
};
