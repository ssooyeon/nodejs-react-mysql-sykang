import React, { useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { useAlert } from "react-alert";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import { ExpandMore } from "@material-ui/icons";
import { ExpandLess } from "@material-ui/icons";
import Button from "@material-ui/core/Button";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";
import CardFooter from "components/Card/CardFooter";

import { updateLoggedUser } from "actions/auth";
import { compareCurrentPassword, updateUser } from "actions/users";

const styles = {
  cardFooter: {
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    margin: "auto",
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
};

const useStyles = makeStyles(styles);

export default function MyProfile(props) {
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
  const { user: currentUser } = useSelector((state) => state.auth);

  const initialUserstate = {
    id: currentUser.id,
    account: currentUser.account,
    email: currentUser.email,
    currentPassword: "",
    password: "",
    passwordCheck: "",
  };

  const [user, setUser] = useState(initialUserstate);
  const [isPasswordChange, setIsPasswordChange] = useState(false);
  const dispatch = useDispatch();

  // input 값 변경시 user state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // 비밀번호 변경 화면을 펼칠때마다 form validation field를 초기화
  // :비밀번호 변경 화면을 펼쳤다가 다시 닫아도 validation field에 password가 남아있기 떄문
  const handlePasswordChange = (e) => {
    e.preventDefault();
    validator.current.fields = {};
    setIsPasswordChange(!isPasswordChange);
  };

  // 내 정보 변경 전 확인
  const comparePassword = () => {
    const valid = validator.current.allValid();
    if (valid) {
      // 비밀번호 변경 화면이 열려있으면
      if (isPasswordChange) {
        const comparePassword = {
          id: user.id,
          password: user.currentPassword,
        };
        // 새 비밀번호와 재입력 비밀번호가 일치하는지 확인
        dispatch(compareCurrentPassword(comparePassword)).then((compare) => {
          if (compare) {
            // 정보 수정
            edit(user);
          } else {
            alert.show("The current password does not match.", {
              title: "",
              type: "error",
            });
          }
        });
      } else {
        // 비밀번호 변경 화면이 열려있지 않으면 email 정보만 업데이트
        const paramsWithOutPassword = {
          id: user.id,
          account: user.account,
          email: user.email,
        };
        edit(paramsWithOutPassword);
      }
    } else {
      validator.current.showMessages();
      forceUpdate();
    }
  };

  // 내 정보 변경
  const edit = (user) => {
    dispatch(updateUser(user.id, user))
      .then(() => {
        // 비밀번호가 변경되었으면
        if (currentUser.email !== user.email) {
          // redux store currentUser 정보 업데이트
          dispatch(updateLoggedUser(currentUser.id))
            .then((res) => {
              axios.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;
            })
            .catch((err) => {
              console.log(err);
            });
        }
        alert.show("Update successfully. Go to the main page.", {
          title: "",
          type: "success",
          onClose: () => {
            props.history.push("/");
          },
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <form autoComplete="off">
            <CardHeader>
              <h4 className={classes.cardTitleWhite}>Edit my profile</h4>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Account"
                    id="account"
                    name="account"
                    value={user.account}
                    defaultValue={user.account}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "account",
                      disabled: true,
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("account"),
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
                    value={user.email}
                    defaultValue={user.email}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "email",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("email"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("email", user.email, "required|email")}</div>
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
                        labelText="Current Password"
                        id="currentPassword"
                        name="currentPassword"
                        value={user.currentPassword}
                        formControlProps={{
                          fullWidth: true,
                        }}
                        inputProps={{
                          type: "password",
                          name: "currentPassword",
                          autoComplete: "off",
                          onChange: (e) => handleInputChange(e),
                          onBlur: () => validator.current.showMessageFor("currentPassword"),
                        }}
                      />
                      <div className={classes.errorText}>{validator.current.message("currentPassword", user.currentPassword, "required")}</div>
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <CustomInput
                        labelText="New Password"
                        id="password"
                        name="password"
                        value={user.password}
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
                      <div className={classes.errorText}>{validator.current.message("password", user.password, "required")}</div>
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <CustomInput
                        labelText="Password Check"
                        id="passwordCheck"
                        name="passwordCheck"
                        value={user.passwordCheck}
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
                        {validator.current.message("passwordCheck", user.passwordCheck, `required|in:${user.password}`)}
                      </div>
                    </GridItem>
                  </GridContainer>
                </>
              ) : null}
            </CardBody>
            <CardFooter className={classes.cardFooter}>
              <Button variant="outlined" onClick={comparePassword}>
                Submit
              </Button>
            </CardFooter>
            <br />
          </form>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
