const db = require("../models");
const Board = db.boards;
const User = db.users;
const Log = db.logs;
const Op = db.Sequelize.Op;

/**
 * 몇 행부터 몇 행까지 가져올지 설정
 */
const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

/**
 * 게시판 생성
 */
exports.create = (req, res) => {
  if (!req.body.title) {
    res.status(400).send({ message: "Content cannot be empty." });
    return;
  }
  const board = req.body;
  Board.create(board)
    .then((data) => {
      Log.create({ status: "SUCCESS", message: `Board create successfully. New board title is: ${req.body.title}` });
      res.send(data);
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Board create failed. Board title is: ${req.body.title}` });
      res.status(500).send({ message: err.message || "Some error occurred while creating the Board." });
    });
};

/**
 * 게시판 전체 조회 (+페이징)
 */
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  const { limit, offset } = getPagination(page, size);
  const condition = title ? { title: { [Op.like]: `%${title}%` } } : null;
  Board.findAndCountAll({
    include: [
      {
        model: User,
        as: "user",
      },
    ],
    where: condition,
    order: [["createdAt", "DESC"]],
    offset: offset, // offset 행 부터 (변동)
    limit: limit, // limit 개수 만큼 조회 (고정)
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving boards." });
    });
};

/**
 * 게시판 조회
 */
exports.findOne = (req, res) => {
  const id = req.params.id;
  Board.findByPk(id, {
    include: [
      {
        model: User,
        as: "user",
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || `Error retrieving Board with id=${id}` });
    });
};

/**
 * 게시판 수정
 */
exports.update = (req, res) => {
  const id = req.params.id;
  Board.update(req.body, { where: { id: id } })
    .then((num) => {
      Log.create({ status: "SUCCESS", message: `Board update successfully. board title is: ${req.body.title}` });
      res.send({ message: "Board was updated successfully." });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Board update failed. Board title is: ${req.body.title}` });
      res.status(500).send({ message: err.message || `Error updating Board with id=${id}` });
    });
};

/**
 * 게시판 삭제
 */
exports.delete = (req, res) => {
  const id = req.params.id;
  Board.destroy({ where: { id: id } })
    .then((num) => {
      if (num === 1) {
        Log.create({ status: "SUCCESS", message: `Board delete successfully. board id is: ${id}` });
        res.send({ message: "Board was deleted successfully." });
      } else {
        res.send({ message: `Cannot delete Board with id=${id}. maybe Board was not found.` });
      }
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Board delete failed. Board id is: ${id}` });
      res.status(500).send({ message: err.message || `Could not delete Board with id=${id}` });
    });
};

/**
 * 게시판 전체 삭제
 */
exports.deleteAll = (req, res) => {
  Board.destroy({ where: {}, truncate: false })
    .then((nums) => {
      Log.create({ status: "SUCCESS", message: "All boards delete successfully." });
      res.send({ message: `${nums} Boards were deleted successfully.` });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: "All boards delete failed" });
      res.status(500).send({ message: err.message || "Some error occurred while deleting all boards." });
    });
};
