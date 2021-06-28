import React, { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert-17";
import SimpleReactValidator from "simple-react-validator";

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
import CustomInput from "components/CustomInput/CustomInput";

import { updateGroup } from "actions/groups";
import GroupService from "services/GroupService";

const styles = {
  errorText: {
    color: "red",
    margin: "auto",
    fontSize: "14px",
  },
  registerSummeryTextWrapper: {
    margin: "10px",
  },
  underlineLink: {
    fontSize: "18px",
    textDecoration: "underline",
    display: "flex",
    "&:hover": {
      fontSize: "18px",
      textDecoration: "underline",
      cursor: "pointer",
    },
  },
  checkButton: {
    marginTop: "20px",
  },
  checkDoneIcon: {
    marginTop: "25px",
  },
  subTableWrapper: {
    marginTop: "20px",
    height: "300px",
    width: "100%",
  },
};

const useStyles = makeStyles(styles);

export default function EditGroupForm({ open, handleCloseClick, group }) {
  const classes = useStyles();
  const alert = useAlert();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [groupForm, setGroupForm] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    setGroupForm(group);
  }, [group]);

  const handleClose = () => {
    handleCloseClick(false);
  };

  // input 값 변경 시 groupForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupForm({ ...groupForm, [name]: value });
  };

  // 그룹 수정 버튼 클릭
  const editGroup = () => {
    const valid = validator.current.allValid();
    if (valid) {
      const name = groupForm.name;
      if (name !== "") {
        GroupService.findByName(name)
          .then((res) => {
            // 선택한 그룹의 기존 이름이 아니고, 다른 그룹의 이름일 때
            if (res.data !== "" && res.data !== undefined && res.data.id !== groupForm.id) {
              alert.show("This name already exist.", {
                title: "",
                type: "error",
              });
            } else {
              edit();
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

  // 그룹 수정
  const edit = () => {
    dispatch(updateGroup(groupForm.id, groupForm))
      .then(() => {
        alert.show("Group update successfully.", {
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
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md" disableBackdropClick>
        <form autoComplete="off">
          <DialogTitle id="form-dialog-title">Edit group</DialogTitle>
          <DialogContent>
            <DialogContentText>To Edit a group, enter group name and description and click the Submit button.</DialogContentText>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Name"
                    id="name"
                    name="name"
                    value={groupForm.name}
                    defaultValue={groupForm.name}
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
                    defaultValue={groupForm.description}
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
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <div className={classes.subTableWrapper}>
                    {group.users &&
                      group.users.map((item, index) => {
                        return (
                          <>
                            <div key={item.id}>
                              <span>
                                {item.id}
                                {item.account}
                              </span>
                            </div>
                          </>
                        );
                      })}
                  </div>
                </GridItem>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions>
            <Button onClick={editGroup} color="primary">
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
