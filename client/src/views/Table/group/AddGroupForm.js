import React, { useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";

import { createGroup } from "actions/groups";
import GroupService from "services/GroupService";

const styles = {
  errorText: {
    color: "red",
    margin: "auto",
    fontSize: "14px",
  },
  checkButton: {
    marginTop: "20px",
  },
  checkDoneIcon: {
    marginTop: "25px",
  },
};

const useStyles = makeStyles(styles);

export default function AddGroupForm({ open, handleCloseClick, handleResetInput }) {
  const classes = useStyles();
  const alert = useAlert();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));

  const initialGroupstate = {
    name: "",
    description: "",
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [groupForm, setGroupForm] = useState(initialGroupstate);
  const dispatch = useDispatch();

  // 닫기 버튼 클릭
  const handleClose = () => {
    handleCloseClick(false);
  };

  // 그룹 추가를 수행하면 검색란을 초기화
  const sendSearchReset = () => {
    handleResetInput(true);
  };

  // input 값 변경 시 groupForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupForm({ ...groupForm, [name]: value });
  };

  // 그룹 생성 버튼 클릭
  const addGroup = () => {
    const valid = validator.current.allValid();
    if (valid) {
      const name = groupForm.name;
      if (name !== "") {
        GroupService.findByName(name)
          .then((res) => {
            // 이미 존재하는 이름일 때
            if (res.data !== "" && res.data !== undefined) {
              alert.show("This name already exist.", {
                title: "",
                type: "error",
              });
            } else {
              sendSearchReset();
              dispatch(createGroup(groupForm))
                .then(() => {
                  alert.show("Group create successfully.", {
                    title: "",
                    type: "success",
                    onClose: () => {
                      handleClose();
                    },
                  });
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }
    } else {
      validator.current.showMessages();
      forceUpdate();
    }
  };

  return (
    <>
      {/* <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md" disableBackdropClick> */}
      <Dialog
        open={open}
        onClose={(e, reason) => {
          if (reason !== "backdropClick") {
            handleClose(e, reason);
          }
        }}
        aria-labelledby="form-dialog-title"
        maxWidth="md"
      >
        <form autoComplete="off">
          <DialogTitle id="form-dialog-title">Add new group</DialogTitle>
          <DialogContent>
            <DialogContentText>To create a new group, enter group name and description and click the Submit button.</DialogContentText>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Name"
                    id="name"
                    name="name"
                    value={groupForm.name}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "name",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("name"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("name", groupForm.name, "required")}</div>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Description"
                    id="description"
                    name="description"
                    value={groupForm.description}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "description",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("description"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("description", groupForm.description, "required")}</div>
                </GridItem>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions style={{ padding: "8px 40px" }}>
            <Button variant="outlined" onClick={addGroup}>
              Submit
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </DialogActions>
          <br />
        </form>
      </Dialog>
    </>
  );
}
