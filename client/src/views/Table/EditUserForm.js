import React, { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert-17";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "components/CustomButtons/Button";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";

import { retrieveUsers, updateUser } from "actions/users";

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

  const [userForm, setUserForm] = useState([]);
  const [isPasswordChange, setIsPasswordChange] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setUserForm({ ...user, passwordCheck: "" });
  }, [user]);

  const handleClose = () => {
    handleCloseClick(false);
  };

  // input 값 변경 시 userForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  // 비밀번호 변경 화면을 펼칠때마다 form validation field를 초기화
  // :비밀번호 변경 화면을 펼쳤다가 다시 닫아도 validation field에 password가 남아있기 떄문
  const handlePasswordChange = (e) => {
    validator.current.fields = {};
    setIsPasswordChange(!isPasswordChange);
  };

  // 사용자 수정 버튼 클릭
  const editUser = () => {
    const valid = validator.current.allValid();
    if (valid) {
      if (isPasswordChange) {
        edit(userForm);
      } else {
        // 비밀번호 변경 화면이 열려있지 않으면 email 정보만 업데이트
        const paramsWithOutPassword = {
          id: userForm.id,
          account: userForm.account,
          email: userForm.email,
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
            handleClose();
            dispatch(retrieveUsers());
          },
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md">
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
                    <a className={classes.underlineLink} onClick={handlePasswordChange}>
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
            </CardBody>
          </DialogContent>
          <DialogActions>
            <Button onClick={editUser} color="primary">
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
