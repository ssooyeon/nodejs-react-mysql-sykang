import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Pagination from "@material-ui/lab/Pagination";
import { Add } from "@material-ui/icons";

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";
import Button from "components/CustomButtons/Button";
import Card from "components/Card/Card";
import CardFooter from "components/Card/CardFooter";
import CardBody from "components/Card/CardBody";
import { grayColor } from "assets/jss/material-dashboard-react.js";

import { retrieveBoards } from "actions/boards";

const styles = {
  cardTitle: {
    color: grayColor[2],
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1",
    },
  },
  cardContent: {
    color: grayColor[0],
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    paddingTop: "10px",
    marginBottom: "0",
  },
  stats: {
    color: grayColor[0],
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
  cardLink: {
    "&:hover": {
      color: grayColor[2], //TODO: not working
    },
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
  },
};

const useStyles = makeStyles(styles);

export default function BoardList() {
  const classes = useStyles();

  const [currentPage, setCurrentPage] = useState(1);
  // const [totalpages, setTotalpages] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [search, setSearch] = useState("");

  const boards = useSelector((state) => state.boards);
  const dispatch = useDispatch();

  useEffect(() => {
    const params = getReqParams(search, currentPage, pageSize);
    dispatch(retrieveBoards(params));
    // setTotalpages(Math.ceil(res.data.count / this.pageSize));
  }, [currentPage]);

  const getReqParams = (searchTitle, page, pageSize) => {
    let params = {};
    if (searchTitle) {
      params["title"] = searchTitle;
    }
    if (page) {
      params["page"] = page - 1;
    }
    if (pageSize) {
      params["size"] = pageSize;
    }
    return params;
  };

  const handleChangePage = (e, value) => {
    setCurrentPage(value);
  };

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Link to={"/admin/board/add"}>
            <Button color="primary">
              <Add />
              Add
            </Button>
          </Link>
        </GridItem>
        {boards.rows &&
          boards.rows.map((board, index) => (
            <GridItem xs={12} sm={12} md={4} key={index}>
              <Card>
                <CardBody>
                  <Link className={classes.cardLink} to={"/admin/board/detail/" + board.id}>
                    <h3 className={classes.cardTitle}>{board.title}</h3>
                  </Link>
                  <p className={classes.cardContent}>{board.content.length > 200 ? board.content.substr(0, 200) + "..." : board.content}</p>
                </CardBody>
                <CardFooter stats>
                  {/* TODO: using moment for date */}
                  {/* <div className={classes.stats}>{this.$moment(board.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div> */}
                  <div className={classes.stats}>{board.createdAt}</div>
                  <div className={classes.stats}>
                    by &nbsp; <strong>{board.user.account}</strong>
                  </div>
                </CardFooter>
              </Card>
            </GridItem>
          ))}
      </GridContainer>
      <Pagination className={classes.pagination} count={Math.ceil(boards.count / pageSize)} page={currentPage} onChange={handleChangePage} />
    </>
  );
}
