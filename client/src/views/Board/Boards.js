import React from "react";
import { Route } from "react-router";

import BoardList from "./BoardList";
import BoardDetail from "./BoardDetail";
import AddBoard from "./AddBoard";
import EditBoard from "./EditBoard";

export default function Boards({ match }) {
  return (
    <>
      <Route exact path={`${match.path}`} component={BoardList} />
      <Route exact path={`${match.path}/detail/:id`} component={BoardDetail} />
      <Route exact path={`${match.path}/add`} component={AddBoard} />
      <Route exact path={`${match.path}/edit/:id`} component={EditBoard} />
    </>
  );
}
