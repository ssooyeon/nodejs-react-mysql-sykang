import React from "react";
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

const styles = {
  cardFooter: {
    justifyContent: "center",
  },
};

const useStyles = makeStyles(styles);

export default function EditBoard() {
  const classes = useStyles();
  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
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
                  />
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
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter className={classes.cardFooter}>
              <Button color="primary">Submit</Button>
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
