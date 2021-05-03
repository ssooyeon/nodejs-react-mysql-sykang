import React, { useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { useAlert } from "react-alert-17";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import { ArrowBack } from "@material-ui/icons";

import Button from "components/CustomButtons/Button";
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
};

const useStyles = makeStyles(styles);

export default function Login(props) {
  const classes = useStyles();
  const alert = useAlert();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));

  const initialUserstate = {
    id: null,
    account: "",
    password: "",
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [user, setUser] = useState(initialUserstate);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const login = () => {
    const valid = validator.current.allValid();
    if (valid) {
      dispatch(authLogin(user))
        .then((res) => {
          console.log(res);
          axios.defaults.headers.common["Authorization"] = `Bearer ${res.user.token}`;
          localStorage.setItem("user", JSON.stringify(res.user));
          props.history.push("/");
        })
        .catch((e) => {
          console.log(e);
        });
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
                  <p className={classes.errorText}>{validator.current.message("account", user.account, "required")}</p>
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
                      name: "password",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("password"),
                    }}
                  />
                  <p className={classes.errorText}>{validator.current.message("password", user.password, "required")}</p>
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter className={classes.cardFooter}>
              <Button color="primary" onClick={login}>
                Submit
              </Button>
            </CardFooter>
          </form>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
