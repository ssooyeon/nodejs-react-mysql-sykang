module.exports = (app) => {
  const boards = require("../controllers/board.controller");
  var router = require("express").Router();

  router.post("/", boards.create);
  router.get("/", boards.findAll);
  router.get("/:id", boards.findOne);
  router.put("/:id", boards.update);
  router.delete("/:id", boards.delete);
  router.delete("/", boards.deleteAll);

  app.use("/api/boards", router);
};
