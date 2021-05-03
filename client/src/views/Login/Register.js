import React, { useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { useAlert } from "react-alert-17";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import { Check } from "@material-ui/icons";

import Button from "components/CustomButtons/Button";
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
    marginTop: "25px",
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
  const [checkDoneAccount, setCheckDoneAccount] = useState("");
  const [isValidAccount, setIsValidAccount] = useState(false);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      register();
    }
  };

  const checkAccount = () => {
    const account = user.account;
    if (account !== "") {
      dispatch(retrieveByAccount(account))
        .then((res) => {
          console.log(res);
          if (res !== "" && res !== undefined) {
            alert.show("This account already exist.", {
              title: "",
              type: "error",
            });
          } else {
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

  const register = () => {
    const valid = validator.current.allValid();
    if (valid) {
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
                      <Button color="info" onClick={checkAccount}>
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
              <Button color="primary" onClick={register}>
                Submit
              </Button>
            </CardFooter>
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
