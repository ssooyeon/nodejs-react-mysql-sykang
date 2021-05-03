const db = require("../models");
const User = db.users;
const Log = db.logs;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//////////////////////////////////
// create
//////////////////////////////////
exports.create = (req, res) => {
  if (!req.body.account) {
    res.status(400).send({ message: "Account cannot be empty." });
    return;
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  const user = {
    account: req.body.account,
    email: req.body.email,
    password: hash,
  };
  User.create(user)
    .then((data) => {
      Log.create({ status: "SUCCESS", message: `User create successfully. New user account is: ${req.body.account}` });
      res.send(data);
    })
    .catch((err) => {
      Log.create({ status: "ERROR", message: `User create failed. User is: ${req.body.account}` });
      res.status(500).send({ message: err.message || "Some error occurred while creating the User." });
    });
};

//////////////////////////////////
// find
//////////////////////////////////
exports.findAll = (req, res) => {
  User.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving users." });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;
  User.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || `Error retrieving User with id=${id}` });
    });
};

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

//////////////////////////////////
// update
//////////////////////////////////
exports.compareCurrentPassword = (req, res) => {
  const id = req.body.id;
  const password = req.body.password;
  if (password) {
    User.findByPk(id)
      .then((data) => {
        const compare = bcrypt.compareSync(password, data.password);
        res.send(compare);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message || "Incorrect current password." });
      });
  }
};

exports.update = (req, res) => {
  const id = req.params.id;
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

//////////////////////////////////
// delete
//////////////////////////////////
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

//////////////////////////////////
// login
//////////////////////////////////
exports.authLogin = (req, res) => {
  const account = req.body.account;
  const password = req.body.password;
  if (account && password) {
    User.findOne({ where: { account: account } })
      .then((data) => {
        const compare = bcrypt.compareSync(password, data.password);
        if (compare) {
          const userInfo = {
            id: data.id,
            account: account,
            email: data.email,
          };
          const token = jwt.sign({ userInfo }, "the_secret_key");
          const user = {
            token,
            id: userInfo.id,
            account: userInfo.account,
            email: userInfo.email,
          };
          Log.create({ status: "SUCCESS", message: `User login successfully. User account is: ${account}` });
          res.send({ user: user });
        } else {
          Log.create({ status: "ERROR", message: `User login failed. User account is: ${account}` });
          res.send(null);
        }
      })
      .catch((e) => {
        res.status(500).send({ message: err.message || "Incorrect account and/or password." });
      });
  }
};
