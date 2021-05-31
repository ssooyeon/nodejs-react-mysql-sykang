import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Hidden from "@material-ui/core/Hidden";
import Poppers from "@material-ui/core/Popper";

import Person from "@material-ui/icons/Person";
import Notifications from "@material-ui/icons/Notifications";
import Dashboard from "@material-ui/icons/Dashboard";
import Search from "@material-ui/icons/Search";

import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";

import styles from "assets/jss/material-dashboard-react/components/headerLinksStyle.js";
import { logout } from "actions/auth";

const useStyles = makeStyles(styles);

export default function AdminNavbarLinks(props) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [openNotification, setOpenNotification] = React.useState(null);

  const { user: currentUser } = useSelector((state) => state.auth);

  const handleClickNotification = (event) => {
    if (openNotification && openNotification.contains(event.target)) {
      setOpenNotification(null);
    } else {
      setOpenNotification(event.currentTarget);
    }
  };
  const handleCloseNotification = () => {
    setOpenNotification(null);
  };

  const userLogout = () => {
    dispatch(logout());
  };
  return (
    <div>
      <div className={classes.searchWrapper}>
        <CustomInput
          formControlProps={{
            className: classes.margin + " " + classes.search,
          }}
          inputProps={{
            placeholder: "Search",
            inputProps: {
              "aria-label": "Search",
            },
          }}
        />
        <Button color="white" aria-label="edit" justIcon round>
          <Search />
        </Button>
      </div>
      <Button
        color={window.innerWidth > 959 ? "transparent" : "white"}
        justIcon={window.innerWidth > 959}
        simple={!(window.innerWidth > 959)}
        aria-label="Dashboard"
        className={classes.buttonLink}
      >
        <Dashboard className={classes.icons} />
        <Hidden mdUp implementation="css">
          <p className={classes.linkText}>Dashboard</p>
        </Hidden>
      </Button>
      <div className={classes.manager}>
        <Button
          color={window.innerWidth > 959 ? "transparent" : "white"}
          justIcon={window.innerWidth > 959}
          simple={!(window.innerWidth > 959)}
          aria-owns={openNotification ? "notification-menu-list-grow" : null}
          aria-haspopup="true"
          onClick={handleClickNotification}
          className={classes.buttonLink}
        >
          <Notifications className={classes.icons} />
          <span className={classes.notifications}>5</span>
          <Hidden mdUp implementation="css">
            <p onClick={handleCloseNotification} className={classes.linkText}>
              Notification
            </p>
          </Hidden>
        </Button>
        <Poppers
          open={Boolean(openNotification)}
          anchorEl={openNotification}
          transition
          disablePortal
          className={classNames({ [classes.popperClose]: !openNotification }) + " " + classes.popperNav}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              id="notification-menu-list-grow"
              style={{
                transformOrigin: placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleCloseNotification}>
                  <MenuList role="menu">
                    <MenuItem onClick={handleCloseNotification} className={classes.dropdownItem}>
                      Mike John responded to your email
                    </MenuItem>
                    <MenuItem onClick={handleCloseNotification} className={classes.dropdownItem}>
                      You have 5 new tasks
                    </MenuItem>
                    <MenuItem onClick={handleCloseNotification} className={classes.dropdownItem}>
                      You{"'"}re now friend with Andrew
                    </MenuItem>
                    <MenuItem onClick={handleCloseNotification} className={classes.dropdownItem}>
                      Another Notification
                    </MenuItem>
                    <MenuItem onClick={handleCloseNotification} className={classes.dropdownItem}>
                      Another One
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Poppers>
      </div>
      {currentUser ? (
        <>
          <div className={classes.manager}>
            <Link className={classes.linkLink} to="/admin/myprofile">
              <Button
                color={window.innerWidth > 959 ? "transparent" : "white"}
                justIcon={window.innerWidth > 959}
                simple={!(window.innerWidth > 959)}
                aria-haspopup="true"
                className={classes.buttonLink}
              >
                <Person className={classes.icons} />
              </Button>
            </Link>
          </div>
          <div className={classes.manager}>
            <Button
              color={window.innerWidth > 959 ? "transparent" : "white"}
              justIcon={window.innerWidth > 959}
              simple={!(window.innerWidth > 959)}
              className={classes.buttonLink}
              onClick={userLogout}
            >
              <p className={classes.linkText}>LOGOUT</p>
            </Button>
          </div>
        </>
      ) : (
        <div className={classes.manager}>
          <Link to={"/admin/login"}>
            <p className={classes.linkText}>LOGIN</p>
          </Link>
        </div>
      )}
    </div>
  );
}
