import React, { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { MenuItem } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";

import { updateUser } from "actions/users";
import GroupService from "services/GroupService";

const styles = {
  errorText: {
    color: "red",
    margin: "auto",
    fontSize: "14px",
  },
  registerSummeryTextWrapper: {
    margin: "10px",
  },
  underlineLink: {
    fontSize: "18px",
    textDecoration: "underline",
    display: "flex",
    "&:hover": {
      fontSize: "18px",
      textDecoration: "underline",
      cursor: "pointer",
    },
  },
  checkButton: {
    marginTop: "20px",
  },
  checkDoneIcon: {
    marginTop: "25px",
  },
  formControl: {
    width: "100%",
    paddingTop: "10px",
    paddingRight: "10px",
    paddingLeft: "10px",
  },
};

const useStyles = makeStyles(styles);

export default function EditUserForm({ open, handleCloseClick, user }) {
  const classes = useStyles();
  const alert = useAlert();
  const validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: this,
      messages: {
        in: "Passwords mush match.",
      },
    })
  );

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [groups, setGroups] = useState([]); // select option에 표시 될 group list (fix)
  const [userForm, setUserForm] = useState([]);
  const [isPasswordChange, setIsPasswordChange] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setUserForm({ ...user, passwordCheck: "" });
    GroupService.getAll()
      .then((res) => {
        setGroups(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [user]);

  // 닫기 버튼 클릭
  const handleClose = () => {
    handleCloseClick(false);
  };

  // 사용자 수정 완료
  const handleDone = () => {
    const isDone = true;
    handleCloseClick(false, isDone);
  };

  // input 값 변경 시 userForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  // group 옵션 변경
  const handleGroupOption = (e) => {
    setUserForm({ ...userForm, groupId: e.target.value });
  };

  // 비밀번호 변경 화면을 펼칠때마다 form validation field를 초기화
  // :비밀번호 변경 화면을 펼쳤다가 다시 닫아도 validation field에 password가 남아있기 떄문
  const handlePasswordChange = (e) => {
    e.preventDefault();
    validator.current.fields = {};
    setIsPasswordChange(!isPasswordChange);
  };

  // 사용자 수정 버튼 클릭
  const editUser = () => {
    const valid = validator.current.allValid();
    if (valid) {
      let data = userForm;
      if (data.groupId === "") {
        data.groupId = null;
      }
      if (isPasswordChange) {
        edit(data);
      } else {
        // 비밀번호 변경 화면이 열려있지 않으면 email과 group 정보만 업데이트
        const paramsWithOutPassword = {
          id: data.id,
          account: data.account,
          email: data.email,
          groupId: data.groupId,
        };
        edit(paramsWithOutPassword);
      }
    } else {
      validator.current.showMessages();
      forceUpdate();
    }
  };

  // 사용자 수정
  const edit = (user) => {
    dispatch(updateUser(user.id, user))
      .then(() => {
        alert.show("User update successfully.", {
          title: "",
          type: "success",
          onClose: () => {
            handleDone();
          },
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      {/* <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md" disableBackdropClick> */}
      <Dialog
        open={open}
        onClose={(e, reason) => {
          if (reason !== "backdropClick") {
            handleClose(e, reason);
          }
        }}
        aria-labelledby="form-dialog-title"
        maxWidth="md"
      >
        <form autoComplete="off">
          <DialogTitle id="form-dialog-title">Edit user</DialogTitle>
          <DialogContent>
            <DialogContentText>To Edit a user, enter your email, and password and click the Submit button.</DialogContentText>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Account"
                    id="account"
                    name="account"
                    value={userForm.account}
                    defaultValue={userForm.account}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "account",
                      disabled: true,
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Email"
                    id="email"
                    name="email"
                    value={userForm.email}
                    defaultValue={userForm.email}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "email",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("email"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("email", userForm.email, "required|email")}</div>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <div className={classes.registerSummeryTextWrapper}>
                    <a href="#!" className={classes.underlineLink} onClick={handlePasswordChange}>
                      password change
                      {isPasswordChange ? <ExpandLess /> : <ExpandMore />}
                    </a>
                  </div>
                </GridItem>
              </GridContainer>
              {isPasswordChange ? (
                <>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <CustomInput
                        labelText="New Password"
                        id="password"
                        name="password"
                        value={userForm.password}
                        formControlProps={{
                          fullWidth: true,
                        }}
                        inputProps={{
                          type: "password",
                          name: "password",
                          autoComplete: "off",
                          onChange: (e) => handleInputChange(e),
                          onBlur: () => validator.current.showMessageFor("password"),
                        }}
                      />
                      <div className={classes.errorText}>{validator.current.message("password", userForm.password, "required")}</div>
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <CustomInput
                        labelText="Password Check"
                        id="passwordCheck"
                        name="passwordCheck"
                        value={userForm.passwordCheck}
                        formControlProps={{
                          fullWidth: true,
                        }}
                        inputProps={{
                          type: "password",
                          name: "passwordCheck",
                          autoComplete: "off",
                          onChange: (e) => handleInputChange(e),
                          onBlur: () => validator.current.showMessageFor("passwordCheck"),
                        }}
                      />
                      <div className={classes.errorText}>
                        {validator.current.message("passwordCheck", userForm.passwordCheck, `required|in:${userForm.password}`)}
                      </div>
                    </GridItem>
                  </GridContainer>
                </>
              ) : null}

              <GridContainer>
                <FormControl variant="outlined" className={classes.formControl}>
                  <Select id="group-select-helper" value={userForm.groupId || ""} onChange={handleGroupOption} displayEmpty>
                    <MenuItem value="">
                      <em>Select Group</em>
                    </MenuItem>
                    {groups &&
                      groups.map((item, index) => {
                        return (
                          <MenuItem value={item.id} key={item.id}>
                            {item.name}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions style={{ padding: "8px 40px" }}>
            <Button variant="outlined" onClick={editUser}>
              Submit
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </DialogActions>
          <br />
        </form>
      </Dialog>
    </>
  );
}
