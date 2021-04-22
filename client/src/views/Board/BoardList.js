import React from "react";
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";

const styles = {};

const useStyles = makeStyles(styles);

export default function BoardList({ match }) {
  const classes = useStyles();
  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}></GridItem>
      </GridContainer>
    </>
  );
}
