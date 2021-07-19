const db = require("../models");
const Group = db.groups;
const User = db.users;
const Log = db.logs;
const Op = db.Sequelize.Op;

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
      // group 생성 후 user(object property)를 포함하여 리턴시키기 위해 재조회 수행
      Group.findByPk(data.id, {
        include: [
          {
            model: User,
            as: "users",
          },
        ],
      })
        .then((result) => {
          Log.create({ status: "SUCCESS", message: `Group create successfully. New Group name is: ${req.body.name}` });
          res.send(result);
        })
        .catch((err) => {
          res.status(500).send({ message: err.message || `Error retrieving Group with id=${id}` });
        });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Group create failed. Group name is: ${req.body.name}` });
      res.status(500).send({ message: err.message || "Some error occurred while creating the Group." });
    });
};

/**
 * 그룹 전체 조회 또는 검색
 */
exports.findAll = (req, res) => {
  const { name } = req.query;
  const condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
  Group.findAll({
    include: [
      {
        model: User,
        as: "users",
      },
    ],
    where: condition,
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
  Group.findByPk(id, {
    include: [
      {
        model: User,
        as: "users",
      },
    ],
  })
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
 * 그룹 name, description 수정
 */
exports.update = (req, res) => {
  const id = req.params.id;
  const group = req.body;

  Group.update(group, { where: { id: id } })
    .then((num) => {
      Log.create({ status: "SUCCESS", message: `Group update successfully. Group name is: ${group.name}` });
      res.send({ message: "Group was updated successfully." });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `Group update failed. Group title is: ${group.name}` });
      res.status(500).send({ message: err.message || `Error updating Group with id=${id}` });
    });
};

/**
 * 그룹 멤버 수정
 */
exports.updateMembers = (req, res) => {
  const id = req.params.id;
  const members = req.body.users; // id array

  User.findAll()
    .then((allUsers) => {
      // 전체 유저 중 req.body에 담긴 id들을 이용하여 user들을 찾음
      const users = allUsers.filter((x) => members.includes(x.id));
      // 찾은 user들을 group에 setUsers
      Group.findByPk(id).then((group) => {
        group
          .setUsers(users)
          .then((num) => {
            Log.create({ status: "SUCCESS", message: `Group member update successfully. Group name is: ${group.name}` });
            res.send({ message: "Group member was updated successfully." });
          })
          .catch((err) => {
            Log.create({ status: "ERROR", message: `Group member update failed. Group name is: ${group.name}` });
            res.status(500).send({ message: err.message || `Error updating Group member with id=${id}` });
          });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving users for update group member." });
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
