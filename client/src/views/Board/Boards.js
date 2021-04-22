import React from "react";
import { makeStyles } from "@material-ui/core/styles";
// core components
import { Route } from "react-router";
import BoardList from "./BoardList";
import BoardDetail from "./BoardDetail";
import AddBoard from "./AddBoard";
import EditBoard from "./EditBoard";

const styles = {};

const useStyles = makeStyles(styles);

export default function Boards({ match }) {
  const classes = useStyles();
  return (
    <>
      <Route exact path={`${match.path}`} component={BoardList} />
      <Route exact path={`${match.path}/:id`} component={BoardDetail} />
      <Route exact path={`${match.path}/add`} component={AddBoard} />
      <Route exact path={`${match.path}/edit/:id`} component={EditBoard} />
    </>
  );
}
