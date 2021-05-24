const db = require("../models");
const Folder = db.folders;
const Task = db.tasks;
const User = db.users;
const Log = db.logs;
const Op = db.Sequelize.Op;

/**
 * 테스크 폴더 생성
 */
exports.create = (req, res) => {
  if (!req.body.name) {
    res.status(400).send({ message: "Content cannot be empty." });
    return;
  }
  const folder = req.body;
  Folder.create(folder)
    .then((data) => {
      Log.create({ status: "SUCCESS", message: `Folder create successfully. New folder name is: ${req.body.name}` });
      res.send(data);
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Folder create failed. Folder name is: ${req.body.name}` });
      res.status(500).send({ message: err.message || "Some error occurred while creating the Folder." });
    });
};

/**
 * 테스크 폴더 전체 조회
 */
exports.findAll = (req, res) => {
  const { parentId } = req.query;
  const condition = parentId ? { parentId: parentId } : null;
  Folder.findAll({
    include: [
      {
        model: Task,
        as: "tasks",
        include: [
          {
            model: User,
            as: "creater",
          },
        ],
      },
    ],
    where: condition,
    order: [
      ["ordering", "ASC"],
      [{ model: Task, as: "tasks" }, "ordering", "ASC"],
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving folders." });
    });
};

/**
 * 테스크 폴더에서 가장 상위 폴더 리스트 전체 조회
 */
exports.findParentAll = (req, res) => {
  Folder.findAll({
    include: [
      {
        model: Task,
        as: "tasks",
        include: [
          {
            model: User,
            as: "creater",
          },
        ],
      },
    ],
    where: { parentId: { [Op.eq]: null } },
    order: [
      ["ordering", "ASC"],
      [{ model: Task, as: "tasks" }, "ordering", "ASC"],
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving folders." });
    });
};

/**
 * 테스크 폴더 조회
 */
exports.findOne = (req, res) => {
  const id = req.params.id;
  Folder.findByPk(id, {
    include: [
      {
        model: Task,
        as: "tasks",
        include: [
          {
            model: User,
            as: "creater",
          },
        ],
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || `Error retrieving Folder with id=${id}` });
    });
};

/**
 * 테스크 폴더 수정
 */
exports.update = (req, res) => {
  const id = req.params.id;
  Folder.update(req.body, { where: { id: id } })
    .then((num) => {
      Log.create({ status: "SUCCESS", message: `Folder update successfully. New folder name is: ${req.body.name}` });
      res.send({ message: "Folder was updated successfully." });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Folder update failed. Folder name is: ${req.body.name}` });
      res.status(500).send({ message: err.message || `Error updating Folder with id=${id}` });
    });
};

/**
 * 테스크 폴더 삭제
 */
exports.delete = (req, res) => {
  const id = req.params.id;
  Folder.destroy({
    where: { parentId: id },
  }).then(() => {});

  Task.destroy({ where: { folderId: id } }).then(() => {
    Folder.destroy({ where: { id: id } })
      .then((num) => {
        if (num === 1) {
          Log.create({ status: "SUCCESS", message: `Folder delete successfully. New folder id is: ${id}` });
          res.send({ message: "Folder was deleted successfully." });
        } else {
          res.send({ message: `Cannot delete Folder with id=${id}. maybe Folder was not found.` });
        }
      })
      .catch((err) => {
        Log.create({ status: "ERROR", message: `Folder delete failed. Folder id is: ${id}` });
        res.status(500).send({ message: err.message || `Could not delete Folder with id=${id}` });
      });
  });
};

/**
 * 테스크 폴더 전체 삭제
 */
exports.deleteAll = (req, res) => {
  Folder.destroy({ where: {}, truncate: false })
    .then((nums) => {
      Log.create({ status: "SUCCESS", message: "All folders delete successfully." });
      res.send({ message: `${nums} Folders were deleted successfully.` });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: "All folders delete failed" });
      res.status(500).send({ message: err.message || "Some error occurred while deleting all folders." });
    });
};
