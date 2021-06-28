const db = require("../models");
const Group = db.groups;
const User = db.users;
const Log = db.logs;

/**
 * 그룹 생성
 */
exports.create = (req, res) => {
  if (!req.body.name) {
    res.status(400).send({ message: "Name cannot be empty." });
    return;
  }
  const group = req.body;
  Group.create(group)
    .then((data) => {
      Log.create({ status: "SUCCESS", message: `Group create successfully. New Group name is: ${req.body.name}` });
      res.send(data);
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Group create failed. Group name is: ${req.body.name}` });
      res.status(500).send({ message: err.message || "Some error occurred while creating the Group." });
    });
};

/**
 * 그룹 전체 조회
 */
exports.findAll = (req, res) => {
  Group.findAll({
    order: [["createdAt", "DESC"]],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving groups." });
    });
};

/**
 * 그룹 조회
 */
exports.findOne = (req, res) => {
  const id = req.params.id;
  Group.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || `Error retrieving Group with id=${id}` });
    });
};

/**
 * 그룹 이름으로 조회
 */
exports.findByName = (req, res) => {
  const name = req.params.name;
  Group.findOne({ where: { name: name } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred retrieving groups." });
    });
};

/**
 * 그룹 수정
 */
exports.update = (req, res) => {
  const id = req.params.id;
  Group.update(req.body, { where: { id: id } })
    .then((num) => {
      Log.create({ status: "SUCCESS", message: `Group update successfully. Group name is: ${req.body.name}` });
      res.send({ message: "Group was updated successfully." });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Group update failed. Group title is: ${req.body.name}` });
      res.status(500).send({ message: err.message || `Error updating Group with id=${id}` });
    });
};

/**
 * 그룹 삭제
 */
exports.delete = (req, res) => {
  const id = req.params.id;
  Group.destroy({ where: { id: id } })
    .then((num) => {
      if (num === 1) {
        Log.create({ status: "SUCCESS", message: `Group delete successfully. Group id is: ${id}` });
        res.send({ message: "Group was deleted successfully." });
      } else {
        res.send({ message: `Cannot delete Group with id=${id}. maybe Group was not found.` });
      }
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Group delete failed. Group id is: ${id}` });
      res.status(500).send({ message: err.message || `Could not delete Group with id=${id}` });
    });
};

/**
 * 그룹 전체 삭제
 */
exports.deleteAll = (req, res) => {
  Group.destroy({ where: {}, truncate: false })
    .then((nums) => {
      Log.create({ status: "SUCCESS", message: "All groups delete successfully." });
      res.send({ message: `${nums} groups were deleted successfully.` });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: "All groups delete failed" });
      res.status(500).send({ message: err.message || "Some error occurred while deleting all groups." });
    });
};
