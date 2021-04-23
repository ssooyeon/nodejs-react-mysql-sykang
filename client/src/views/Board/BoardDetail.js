import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import { Edit } from "@material-ui/icons";
import { Delete } from "@material-ui/icons";
import { ArrowBack } from "@material-ui/icons";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";
import CardBody from "components/Card/CardBody";

import { retrieveBoard } from "actions/boards";

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

  const boards = useSelector((state) => state.boards);
  const dispatch = useDispatch();

  useEffect(() => {
    const id = props.match.params.id;
    dispatch(retrieveBoard(id));
  }, []);

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} key={boards.id}>
          <Card>
            <CardHeader>
              <h3 className={classes.cardTitle}>{boards.title}</h3>
              <div className={classes.buttonWrapper}>
                <Link to={"/admin/board/edit/" + boards.id}>
                  <Button color="info" justIcon>
                    <Edit />
                  </Button>
                </Link>
                <Link to={"/"}>
                  <Button color="danger" justIcon>
                    <Delete />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <Divider light />
            <CardBody>
              <p className={classes.cardContent}>{boards.content}</p>
            </CardBody>
            <CardFooter stats>
              {/* <div className={classes.stats}>{this.$moment(board.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div> */}
              <div className={classes.stats}>{boards.createdAt}</div>
              <div className={classes.stats}>
                {/* TODO: not working */}
                {/* <strong>{boards.user.account}</strong> */}
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <Link to={"/admin/board/"}>
        <Button>
          <ArrowBack />
          Back
        </Button>
      </Link>
    </>
  );
}
