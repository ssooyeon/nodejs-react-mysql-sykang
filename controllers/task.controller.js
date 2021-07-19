const db = require("../models");
const Task = db.tasks;
const User = db.users;
const Log = db.logs;
const Op = db.Sequelize.Op;

/**
 * 테스크 생성
 */
exports.create = (req, res) => {
  if (!req.body.title) {
    res.status(400).send({ message: "Content cannot be empty." });
    return;
  }
  const task = req.body;
  Task.create(task)
    .then((data) => {
      Log.create({ status: "SUCCESS", message: `Task create successfully. New task title is: ${req.body.title}` });
      res.send(data);
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Task create failed. Task title is: ${req.body.title}` });
      res.status(500).send({ message: err.message || "Some error occurred while creating the Task." });
    });
};

/**
 * 테스크 전체 조회
 */
exports.findAll = (req, res) => {
  Task.findAll({
    include: [
      {
        model: User,
        as: "creater",
      },
    ],
    order: [["ordering", "ASC"]],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving tasks." });
    });
};

/**
 * 테스크 조회
 */
exports.findOne = (req, res) => {
  const id = req.params.id;
  Task.findByPk(id, {
    include: [
      {
        model: User,
        as: "creater",
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || `Error retrieving Task with id=${id}` });
    });
};

/**
 * 테스크 수정
 */
exports.update = (req, res) => {
  const id = req.params.id;
  Task.update(req.body, { where: { id: id } })
    .then((num) => {
      Log.create({ status: "SUCCESS", message: `Task update successfully. Task title is: ${req.body.title}` });
      res.send({ message: "Task was updated successfully." });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Task update failed. Task title is: ${req.body.title}` });
      res.status(500).send({ message: err.message || `Error updating Task with id=${id}` });
    });
};

/**
 * 테스크 삭제
 */
exports.delete = (req, res) => {
  const id = req.params.id;
  Task.destroy({ where: { id: id } })
    .then((num) => {
      if (num === 1) {
        Log.create({ status: "SUCCESS", message: `Task delete successfully. New task id is: ${id}` });
        res.send({ message: "Task was deleted successfully." });
      } else {
        res.send({ message: `Cannot delete Task with id=${id}. maybe Task was not found.` });
      }
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Task delete failed. Task id is: ${id}` });
      res.status(500).send({ message: err.message || `Could not delete Task with id=${id}` });
    });
};

/**
 * 테스크 전체 삭제
 */
exports.deleteAll = (req, res) => {
  Task.destroy({ where: {}, truncate: false })
    .then((nums) => {
      Log.create({ status: "SUCCESS", message: "All tasks delete successfully." });
      res.send({ message: `${nums} Tasks were deleted successfully.` });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: "All tasks delete failed" });
      res.status(500).send({ message: err.message || "Some error occurred while deleting all tasks." });
    });
};
