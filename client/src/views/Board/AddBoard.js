import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

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
};

const useStyles = makeStyles(styles);

export default function AddBoard() {
  const classes = useStyles();

  const initialBoardstate = {
    id: null,
    title: "",
    content: "",
  };

  const [board, setBoard] = useState(initialBoardstate);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    // const { name, value } = e.target;
    console.log(e.target);
    // setBoard({ ...board, [name]: value });
  };

  const saveBoard = () => {
    console.log(board);
    dispatch(createBoard(board))
      .then((data) => {
        console.log("success");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
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
                    // onChange={(e) => handleInputChange(e)}
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Content"
                    id="content"
                    name="content"
                    value={board.content}
                    // onChange={handleInputChange}
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter className={classes.cardFooter}>
              <Button color="primary" onClick={saveBoard}>
                Submit
              </Button>
            </CardFooter>
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
