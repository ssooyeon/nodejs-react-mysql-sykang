import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";

import styles from "assets/jss/material-dashboard-react/components/footerStyle.js";

const useStyles = makeStyles(styles);

export default function Footer(props) {
  const classes = useStyles();
  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.left}>
          <List className={classes.list}>
            <ListItem className={classes.inlineBlock}>
              <a href="#home" className={classes.block}>
                Home
              </a>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <a href="https://www.creative-tim.com/license" target="_blank" rel="noreferrer" className={classes.block}>
                Licenses
              </a>
            </ListItem>
          </List>
        </div>
        <p className={classes.right}>
          <span>
            &copy; {1900 + new Date().getYear()}{" "}
            <a href="https://github.com/ssooyeon/nodejs-react-mysql-sykang" target="_blank" rel="noreferrer" className={classes.a}>
              Sykang
            </a>
            , <i className="fa fa-heart heart"></i> 🙌🙌
          </span>
        </p>
      </div>
    </footer>
  );
}
