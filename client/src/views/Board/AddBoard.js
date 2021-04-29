import React, { useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
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

import { createBoard } from "actions/boards";

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

export default function AddBoard(props) {
  const classes = useStyles();
  const alert = useAlert();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));

  const initialBoardstate = {
    title: "",
    content: "",
    userId: 1, // TODO: binding current user (with store)
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [board, setBoard] = useState(initialBoardstate);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBoard({ ...board, [name]: value });
  };

  const saveBoard = () => {
    const valid = validator.current.allValid();
    if (valid) {
      dispatch(createBoard(board))
        .then(() => {
          alert.show("The Board was created successfully.", {
            title: "",
            type: "success",
            onClose: () => {
              props.history.push("/admin/board");
            },
          });
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
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <form autoComplete="off">
              <CardHeader>
                <h4 className={classes.cardTitleWhite}>Add New Board</h4>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Title"
                      id="title"
                      name="title"
                      value={board.title}
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        name: "title",
                        onChange: (e) => handleInputChange(e),
                        onBlur: () => validator.current.showMessageFor("title"),
                      }}
                    />
                    <p className={classes.errorText}>{validator.current.message("title", board.title, "required")}</p>
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Content"
                      id="content"
                      name="content"
                      value={board.content}
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        name: "content",
                        onChange: (e) => handleInputChange(e),
                        onBlur: () => validator.current.showMessageFor("content"),
                      }}
                    />
                    <p className={classes.errorText}>{validator.current.message("content", board.content, "required")}</p>
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter className={classes.cardFooter}>
                <Button color="primary" onClick={saveBoard}>
                  Submit
                </Button>
              </CardFooter>
            </form>
          </Card>
        </GridItem>
      </GridContainer>
      <Link className={classes.cardLink} to={"/admin/board/"}>
        <Button>
          <ArrowBack />
          Back
        </Button>
      </Link>
    </>
  );
}
