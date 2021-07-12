import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert-17";

import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DataGrid } from "@material-ui/data-grid";
import Button from "components/CustomButtons/Button";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";

import { updateSharedUser } from "actions/folders";
import UserService from "services/UserService";

const styles = {
  tableWrapper: {
    marginTop: "20px",
    height: "600px",
    width: "100%",
  },
};

const useStyles = makeStyles(styles);

export default function SharedUsersForm({ open, handleCloseClick, userFolder }) {
  const classes = useStyles();
  const alert = useAlert();

  const columns = [
    { field: "id", headerName: "ID", type: "number", flex: 0.1 },
    { field: "account", headerName: "Account", flex: 0.2 },
    { field: "email", headerName: "Email", flex: 0.3 },
    { field: "createdAt", headerName: "Date", flex: 0.3 },
  ];

  const [users, setUsers] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    UserService.getAll()
      .then((res) => {
        setUsers(res.data);
        let currentUserIds = userFolder.users && userFolder.users.map((obj) => obj.id);
        setSelectionModel(currentUserIds);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [userFolder]);

  // 부모에게 완료사항 전달
  const handleClose = () => {
    handleCloseClick(false);
  };

  // 사용자 선택
  const handleUserRowClick = (select) => {
    setSelectionModel(select);
  };

  // userFolder 추가(수정)
  const adduserFolder = () => {
    const users = selectionModel;
    const checkCurrentUser = users.find((x) => x === currentUser.id);
    if (checkCurrentUser === undefined) {
      alert.show("Currently logged in users cannot be excluded.", {
        title: "",
        type: "error",
      });
    } else {
      const data = { users };
      dispatch(updateSharedUser(userFolder.id, data))
        .then((res) => {
          alert.show("Shared users of folders update successfully.", {
            title: "",
            type: "success",
            onClose: () => {
              handleClose();
              setSelectionModel([]);
            },
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md" disableBackdropClick>
        <form autoComplete="off" onSubmit={adduserFolder}>
          <DialogTitle id="form-dialog-title">Edit Shared Users</DialogTitle>
          <DialogContent>
            <DialogContentText>Select the users you want to share that top-level folder with and click the Submit button.</DialogContentText>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <div className={classes.tableWrapper}>
                    <DataGrid
                      rows={users}
                      columns={columns}
                      pageSize={9}
                      checkboxSelection
                      onSelectionModelChange={(newSelection) => handleUserRowClick(newSelection.selectionModel)}
                      selectionModel={selectionModel}
                    />
                  </div>
                </GridItem>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions>
            <Button onClick={adduserFolder} color="primary">
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
