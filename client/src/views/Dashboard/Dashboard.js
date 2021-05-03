import React, { useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardFooter from "components/Card/CardFooter.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const classes = useStyles();

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          Chart
        </GridItem>
        <GridItem xs={12} sm={12} md={4}></GridItem>
        <GridItem xs={12} sm={12} md={4}></GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={6} md={2}>
          <Card>
            <CardHeader color="warning" stats icon>
              <p className={classes.cardCategory}>Used Space</p>
              <h3 className={classes.cardTitle}>
                49/50 <small>GB</small>
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <a href="#pablo" onClick={(e) => e.preventDefault()}>
                  Get more space
                </a>
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
