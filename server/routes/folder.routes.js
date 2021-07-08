module.exports = (app) => {
  const folders = require("../controllers/folder.controller");
  var router = require("express").Router();

  router.post("/", folders.create);
  router.get("/", folders.findAll);
  router.get("/parents/:id", folders.findParentAllByCurrentUser);
  router.get("/users/:id", folders.findAllWithSharedUsers);
  router.get("/:id", folders.findOne);
  router.put("/:id", folders.update);
  router.put("/users/:id", folders.updateSharedUsers);
  router.delete("/:id", folders.delete);
  router.delete("/", folders.deleteAll);

  app.use("/api/folders", router);
};
