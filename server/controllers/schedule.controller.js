const db = require("../models");
const Schedule = db.schedules;
const User = db.users;
const Log = db.logs;
const Op = db.Sequelize.Op;

/**
 * 스케줄 생성
 */
exports.create = (req, res) => {
  if (!req.body.title) {
    res.status(400).send({ message: "Content cannot be empty." });
    return;
  }
  const schedule = req.body;
  Schedule.create(schedule)
    .then((data) => {
      Log.create({ status: "SUCCESS", message: `Schedule create successfully. New schedule title is: ${req.body.title}` });
      res.send(data);
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Schedule create failed. Schedule title is: ${req.body.title}` });
      res.status(500).send({ message: err.message || "Some error occurred while creating the Schedule." });
    });
};

/**
 * 스케줄 전체 조회
 */
exports.findAll = (req, res) => {
  // const { title } = req.query;
  // const condition = title ? { title: { [Op.like]: `%${title}%` } } : null;
  Schedule.findAll({
    include: [
      {
        model: User,
        as: "creater",
      },
    ],
    // where: condition,
    // order: [["ordering", "ASC"]],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving schedules." });
    });
};

/**
 * 스케줄 조회
 */
exports.findOne = (req, res) => {
  const id = req.params.id;
  Schedule.findByPk(id, {
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
      res.status(500).send({ message: err.message || `Error retrieving Schedule with id=${id}` });
    });
};

/**
 * 스케줄 수정
 */
exports.update = (req, res) => {
  const id = req.params.id;
  Schedule.update(req.body, { where: { id: id } })
    .then((num) => {
      Log.create({ status: "SUCCESS", message: `Schedule update successfully. Schedule title is: ${req.body.title}` });
      res.send({ message: "Schedule was updated successfully." });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Schedule update failed. Schedule title is: ${req.body.title}` });
      res.status(500).send({ message: err.message || `Error updating Schedule with id=${id}` });
    });
};

/**
 * 스케줄 삭제
 */
exports.delete = (req, res) => {
  const id = req.params.id;
  Schedule.destroy({ where: { id: id } })
    .then((num) => {
      if (num === 1) {
        Log.create({ status: "SUCCESS", message: `Schedule delete successfully. New schedule id is: ${id}` });
        res.send({ message: "Schedule was deleted successfully." });
      } else {
        res.send({ message: `Cannot delete Schedule with id=${id}. maybe Schedule was not found.` });
      }
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Schedule delete failed. Schedule id is: ${id}` });
      res.status(500).send({ message: err.message || `Could not delete Schedule with id=${id}` });
    });
};

/**
 * 스케줄 전체 삭제
 */
exports.deleteAll = (req, res) => {
  Schedule.destroy({ where: {}, truncate: false })
    .then((nums) => {
      Log.create({ status: "SUCCESS", message: "All schedules delete successfully." });
      res.send({ message: `${nums} Schedules were deleted successfully.` });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: "All schedules delete failed" });
      res.status(500).send({ message: err.message || "Some error occurred while deleting all schedules." });
    });
};