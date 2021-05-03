const db = require("../models");
const Log = db.logs;

/**
 * 로그 생성
 */
exports.create = (req, res) => {
  if (!req.body.message) {
    res.status(400).send({ message: "Message cannot be empty." });
    return;
  }
  const log = req.body;
  Log.create(log)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while creating the Log." });
    });
};

/**
 * 로그 전체 조회
 */
exports.findAll = (req, res) => {
  Log.findAll({
    order: [["createdAt", "DESC"]],
    offset: 0,
    limit: 10,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving logs." });
    });
};

/**
 * 로그 조회
 */
exports.findOne = (req, res) => {
  const id = req.params.id;
  Log.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || `Error retrieving Log with id=${id}` });
    });
};

/**
 * 로그 수정
 */

/**
 * 로그 삭제
 */

/**
 * 로그 전체 삭제
 */
