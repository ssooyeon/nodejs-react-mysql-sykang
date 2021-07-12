const db = require("../models");
const User = db.users;
const Group = db.groups;
const Log = db.logs;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * 사용자 생성
 */
exports.create = (req, res) => {
  if (!req.body.account) {
    res.status(400).send({ message: "Account cannot be empty." });
    return;
  }
  // 비밀번호 암호화
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  const user = {
    account: req.body.account,
    email: req.body.email,
    password: hash,
    groupId: req.body.groupId,
  };
  User.create(user)
    .then((data) => {
      // user 생성 후 group(object property)를 포함하여 리턴시키기 위해 재조회 수행
      User.findByPk(data.id, {
        include: [
          {
            model: Group,
            as: "group",
          },
        ],
      })
        .then((result) => {
          Log.create({ status: "SUCCESS", message: `User create successfully. New user account is: ${req.body.account}` });
          res.send(result);
        })
        .catch((err) => {
          res.status(500).send({ message: err.message || `Error retrieving User with id=${id}` });
        });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `User create failed. User is: ${req.body.account}` });
      res.status(500).send({ message: err.message || "Some error occurred while creating the User." });
    });
};

/**
 * 사용자 전체 조회 또는 검색
 */
exports.findAll = (req, res) => {
  const { account } = req.query;
  const condition = account ? { account: { [Op.like]: `%${account}%` } } : null;
  User.findAll({
    include: [
      {
        model: Group,
        as: "group",
      },
    ],
    where: condition,
    order: [["createdAt", "DESC"]],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving users." });
    });
};

/**
 * 사용자 조회
 */
exports.findOne = (req, res) => {
  const id = req.params.id;
  User.findByPk(id, {
    include: [
      {
        model: Group,
        as: "group",
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || `Error retrieving User with id=${id}` });
    });
};

/**
 * 사용자 계정으로 조회
 */
exports.findByAccount = (req, res) => {
  const account = req.params.account;
  User.findOne({ where: { account: account } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred retrieving users." });
    });
};

/**
 * 사용자 현재 비밀번호 일치여부 확인
 */
exports.compareCurrentPassword = (req, res) => {
  const id = req.body.id;
  const password = req.body.password;
  if (password) {
    User.findByPk(id)
      .then((data) => {
        // 저장되어있는 사용자의 비밀번호와 request.body의 비밀번호가 일치하면 true를 리턴
        const compare = bcrypt.compareSync(password, data.password);
        res.send(compare);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message || "Incorrect current password." });
      });
  }
};

/**
 * 사용자 수정
 */
exports.update = (req, res) => {
  const id = req.params.id;
  // request.body의 비밀번호가 모두 존재하면 비밀번호 해시를 생성: 공백도 해시로 생성될 수 있기 때문
  if (req.body.password !== undefined && req.body.password !== "") {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;
  }

  User.update(req.body, { where: { id: id } })
    .then((num) => {
      Log.create({ status: "SUCCESS", message: `User update successfully. User account is: ${req.body.account}` });
      res.send({ message: "User was updated successfully." });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `User update failed. User account is: ${req.body.account}` });
      res.status(500).send({ message: err.message || `Error updating User with id=${id}` });
    });
};

/**
 * 사용자 삭제
 */
exports.delete = (req, res) => {
  const id = req.params.id;
  User.destroy({ where: { id: id } })
    .then((num) => {
      if (num === 1) {
        Log.create({ status: "SUCCESS", message: `User delete successfully. User id is: ${id}` });
        res.send({ message: "User was deleted successfully." });
      } else {
        Log.create({ status: "ERROR", message: `User delete failed. User id is: ${id}` });
        res.send({ message: `Cannot delete User with id=${id}. maybe User was not found.` });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || `Could not delete User with id=${id}` });
    });
};

/**
 * 사용자 전체 삭제
 */
exports.deleteAll = (req, res) => {
  User.destroy({ where: {}, truncate: false })
    .then((nums) => {
      Log.create({ status: "SUCCESS", message: "All users delete successfully." });
      res.send({ message: `${nums} Users were deleted successfully.` });
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: "All users delete failed." });
      res.status(500).send({ message: err.message || "Some error occurred while deleting all users." });
    });
};

/**
 * 사용자 로그인
 */
exports.authLogin = (req, res) => {
  const account = req.body.account;
  const password = req.body.password;
  if (account && password) {
    // request.body의 account를 가지는 사용자가 존재하면
    User.findOne({ where: { account: account } })
      .then((data) => {
        // 존재하는 account이면
        if (data != null) {
          // request.body의 password와 조회한 사용자의 비밀번호가 일치하면
          const compare = bcrypt.compareSync(password, data.password);
          if (compare) {
            const userInfo = {
              id: data.id,
              account: account,
              email: data.email,
              groupId: data.groupId,
            };
            // jwt 토큰을 생성
            const token = jwt.sign({ userInfo }, "the_secret_key");
            const user = {
              token,
              id: userInfo.id,
              account: userInfo.account,
              email: userInfo.email,
              groupId: data.groupId,
            };
            Log.create({ status: "SUCCESS", message: `User login successfully. User account is: ${account}` });
            res.send({ user: user });
          } else {
            // 비밀번호가 일치하지 않으면
            const message = "User login failed. Incorrect password.";
            Log.create({ status: "ERROR", message: `${message} User account is: ${account}` });
            res.send({ message: message });
          }
        } else {
          // 존재하지 않는 account이면
          const message = "Not existed user.";
          Log.create({ status: "ERROR", message: `${message} User account is: ${account}` });
          res.send({ message: message });
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send({ message: err.message || "Incorrect account and/or password." });
      });
  }
};
