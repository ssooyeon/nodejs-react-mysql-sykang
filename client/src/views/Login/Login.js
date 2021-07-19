import React, { useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAlert } from "react-alert";

import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";
import CardFooter from "components/Card/CardFooter";

import { authLogin } from "actions/auth";

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
};

const useStyles = makeStyles(styles);

export default function Login(props) {
  const classes = useStyles();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));
  const alert = useAlert();

  const initialUserstate = {
    id: null,
    account: "",
    password: "",
  };

  // form validation 에러 메세지 자동 표출
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [user, setUser] = useState(initialUserstate);
  const dispatch = useDispatch();

  // input 입력 시 user state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // 패스워드 input에서 enter 누르면 로그인 수행
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  // 로그인
  const login = () => {
    const valid = validator.current.allValid();
    if (valid) {
      dispatch(authLogin(user))
        .then((res) => {
          if (res.message !== undefined) {
            alert.show(res.message, {
              title: "",
              type: "error",
            });
          } else {
            // 로그인에 성공했을 때 local storage 설정
            axios.defaults.headers.common["Authorization"] = `Bearer ${res.user.token}`;
            localStorage.setItem("user", JSON.stringify(res.user));
            props.history.push("/");
          }
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      // validation 실패 시 오류 표출
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
              <h4 className={classes.cardTitleWhite}>Login</h4>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
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
                      onKeyPress: (e) => handleKeyPress(e),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("password", user.password, "required")}</div>
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter className={classes.cardFooter}>
              <Button variant="outlined" onClick={login}>
                Submit
              </Button>
            </CardFooter>
            <br />
          </form>
        </Card>
      </GridItem>
      <GridItem xs={12} sm={12} md={12}>
        <div className={classes.registerSummeryTextWrapper}>
          Don't have an account? &nbsp;
          <Link className={classes.underlineLink} to={"/admin/register"}>
            register
          </Link>
        </div>
      </GridItem>
    </GridContainer>
  );
}
