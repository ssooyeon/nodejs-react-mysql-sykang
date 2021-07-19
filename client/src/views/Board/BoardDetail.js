import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAlert } from "react-alert";
import Moment from "react-moment";

import { makeStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import { Edit } from "@material-ui/icons";
import { Delete } from "@material-ui/icons";
import { ArrowBack } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";
import CardBody from "components/Card/CardBody";

import { retrieveBoard, deleteBoard } from "actions/boards";

const styles = {
  buttonWrapper: {
    float: "right",
  },
  cardTitle: {
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    float: "left",
    "& small": {
      fontWeight: "400",
      lineHeight: "1",
    },
  },
  cardContent: {
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    paddingTop: "10px",
    marginBottom: "0",
    minHeight: "500px",
  },
  stats: {
    display: "inline-flex",
    fontSize: "12px",
    lineHeight: "22px",
    "& svg": {
      top: "4px",
      width: "16px",
      height: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px",
    },
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      top: "4px",
      fontSize: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px",
    },
  },
};

const useStyles = makeStyles(styles);

export default function BoardDetail(props) {
  const classes = useStyles();
  const alert = useAlert();

  const boards = useSelector((state) => state.boards);
  const dispatch = useDispatch();

  useEffect(() => {
    const id = props.match.params.id;
    dispatch(retrieveBoard(id));
  }, [dispatch, props.match.params.id]);

  // 게시판 삭제 전 확인
  const confirmRemoveBoard = () => {
    alert.show("Are you sure delete this board?", {
      title: "",
      closeCopy: "Cancel",
      type: "success",
      actions: [
        {
          copy: "YES",
          onClick: () => removeBoard(),
        },
      ],
    });
  };

  // 게시판 삭제
  const removeBoard = () => {
    const id = props.match.params.id;
    dispatch(deleteBoard(id))
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
  };

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} key={boards.id}>
          <Card>
            <CardHeader>
              <h3 className={classes.cardTitle}>{boards.title}</h3>
              <div className={classes.buttonWrapper}>
                <Link to={"/admin/board/edit/" + boards.id}>
                  <IconButton aria-label="edit">
                    <Edit />
                  </IconButton>
                </Link>
                <IconButton aria-label="edit" onClick={confirmRemoveBoard}>
                  <Delete />
                </IconButton>
              </div>
            </CardHeader>
            <Divider light />
            <CardBody>
              <p className={classes.cardContent}>{boards.content}</p>
            </CardBody>
            <CardFooter stats>
              <div className={classes.stats}>
                <Moment format="YYYY-MM-DD HH:mm:ss">{boards.createdAt}</Moment>
              </div>
              <div className={classes.stats}>{boards.user && <strong>{boards.user.account}</strong>}</div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <Link to={"/admin/board/"}>
        <Button variant="outlined">
          <ArrowBack />
          Back
        </Button>
      </Link>
    </>
  );
}
