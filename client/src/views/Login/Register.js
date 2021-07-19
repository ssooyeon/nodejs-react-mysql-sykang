import React, { useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { useAlert } from "react-alert";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import { Check } from "@material-ui/icons";
import Button from "@material-ui/core/Button";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";
import CardFooter from "components/Card/CardFooter";

import { retrieveByAccount, createUser } from "actions/users";

const styles = {
  cardFooter: {
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    margin: "auto",
  },
  registerSummeryTextWrapper: {
    textAlign: "center",
  },
  underlineLink: {
    textDecoration: "underline",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  checkButton: {
    marginTop: "20px",
  },
  checkDoneIcon: {
    marginTop: "40px",
    float: "right",
  },
};

const useStyles = makeStyles(styles);

export default function Register(props) {
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

  const initialUserstate = {
    account: "",
    email: "",
    password: "",
    passwordCheck: "",
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [user, setUser] = useState(initialUserstate);
  const [checkDoneAccount, setCheckDoneAccount] = useState(""); // 중복확인을 완료한 계정 이름
  const [isValidAccount, setIsValidAccount] = useState(false); // 계정을 중복확인 했는지의 여부
  const dispatch = useDispatch();

  // input 값 변경 시 user state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // password check input에서 엔터 클릭 시 회원가입 수행
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      register();
    }
  };

  // 계정 중복확인
  const checkAccount = () => {
    const account = user.account;
    if (account !== "") {
      dispatch(retrieveByAccount(account))
        .then((res) => {
          // 이미 존재하는 계정일 때
          if (res !== "" && res !== undefined) {
            alert.show("This account already exist.", {
              title: "",
              type: "error",
            });
          } else {
            // 계정 중복 여부 확인 완료
            alert.show("This account is available.", {
              title: "",
              type: "success",
            });
            setCheckDoneAccount(account);
            setIsValidAccount(true);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  // 회원가입
  const register = () => {
    const valid = validator.current.allValid();
    if (valid) {
      // 중복확인을 완료한 계정과 현재 input의 계정명이 같을 때
      if (checkDoneAccount === user.account) {
        dispatch(createUser(user))
          .then(() => {
            alert.show("Register successfully. Go to the login page.", {
              title: "",
              type: "success",
              onClose: () => {
                props.history.push("/admin/login");
              },
            });
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        // 중복확인을 완료한 후 다른 계정명을 다시 작성했을 때, 중복확인을 재요청
        alert.show("Please duplicate check an account.", {
          title: "",
          type: "error",
        });
        setIsValidAccount(false);
      }
    } else {
      validator.current.showMessages();
      forceUpdate();
    }
  };

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <form autoComplete="off">
            <CardHeader>
              <h4 className={classes.cardTitleWhite}>Register</h4>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={11}>
                  <CustomInput
                    labelText="Account"
                    id="account"
                    name="account"
                    value={user.account}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "account",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("account"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("account", user.account, "required")}</div>
                </GridItem>
                <GridItem xs={12} sm={12} md={1}>
                  {isValidAccount ? (
                    <div className={classes.checkDoneIcon}>
                      <Check />
                    </div>
                  ) : (
                    <div className={classes.checkButton}>
                      <Button variant="outlined" style={{ marginTop: "15px", float: "right" }} onClick={checkAccount}>
                        Check
                      </Button>
                    </div>
                  )}
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Email"
                    id="email"
                    name="email"
                    value={user.email}
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
                  <CustomInput
                    labelText="Password"
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
                    labelText="PasswordCheck"
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
                      onKeyPress: (e) => handleKeyPress(e),
                    }}
                  />
                  <div className={classes.errorText}>
                    {validator.current.message("passwordCheck", user.passwordCheck, `required|in:${user.password}`)}
                  </div>
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter className={classes.cardFooter}>
              <Button variant="outlined" onClick={register}>
                Submit
              </Button>
            </CardFooter>
            <br />
          </form>
        </Card>
      </GridItem>
      <GridItem xs={12} sm={12} md={12}>
        <div className={classes.registerSummeryTextWrapper}>
          Do already have an account? &nbsp;
          <Link className={classes.underlineLink} to={"/admin/login"}>
            login
          </Link>
        </div>
      </GridItem>
    </GridContainer>
  );
}
