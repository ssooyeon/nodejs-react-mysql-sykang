import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useAlert } from "react-alert";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import { ArrowBack } from "@material-ui/icons";
import Button from "@material-ui/core/Button";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";
import CardFooter from "components/Card/CardFooter";

import { updateBoard } from "actions/boards";
import BoardService from "services/BoardService";

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

export default function EditBoard(props) {
  const classes = useStyles();
  const alert = useAlert();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));

  const initialBoardstate = {
    id: null,
    title: "",
    content: "",
    userId: null,
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [currentBoard, setCurrentBoard] = useState(initialBoardstate);
  const dispatch = useDispatch();

  useEffect(() => {
    getBoard(props.match.params.id);
  }, [props.match.params.id]);

  // 현재 게시판 가져오기
  const getBoard = (id) => {
    BoardService.get(id)
      .then((res) => {
        setCurrentBoard(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 게시판 input 변경 시 board에 설정
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBoard({ ...currentBoard, [name]: value });
  };

  // 게시판 수정
  const saveBoard = () => {
    const valid = validator.current.allValid();
    if (valid) {
      dispatch(updateBoard(currentBoard.id, currentBoard))
        .then(() => {
          alert.show("The Board was updated successfully.", {
            title: "",
            type: "success",
            onClose: () => {
              setCurrentBoard(initialBoardstate);
              props.history.push(`/admin/board/detail/${props.match.params.id}`);
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
                <h4 className={classes.cardTitleWhite}>Edit Board</h4>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Title"
                      id="title"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        name: "title",
                        value: currentBoard.title,
                        onChange: (e) => handleInputChange(e),
                        onBlur: () => validator.current.showMessageFor("title"),
                      }}
                    />
                    <div className={classes.errorText}>{validator.current.message("title", currentBoard.title, "required")}</div>
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Content"
                      id="content"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        name: "content",
                        value: currentBoard.content,
                        onChange: (e) => handleInputChange(e),
                        onBlur: () => validator.current.showMessageFor("content"),
                      }}
                    />
                    <div className={classes.errorText}>{validator.current.message("content", currentBoard.content, "required")}</div>
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter className={classes.cardFooter}>
                <Button variant="outlined" onClick={saveBoard}>
                  Submit
                </Button>
              </CardFooter>
              <br />
            </form>
          </Card>
        </GridItem>
      </GridContainer>
      <Link className={classes.cardLink} to={`/admin/board/detail/${props.match.params.id}`}>
        <Button variant="outlined">
          <ArrowBack />
          Back
        </Button>
      </Link>
    </>
  );
}
