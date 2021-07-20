import React, { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DataGrid } from "@material-ui/data-grid";
import Button from "@material-ui/core/Button";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";

import { updateGroup, updateGroupMember } from "actions/groups";
import UserService from "services/UserService";
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
    height: "280px",
    width: "100%",
  },
};

const useStyles = makeStyles(styles);

export default function EditGroupForm({ open, handleCloseClick, group }) {
  const classes = useStyles();
  const alert = useAlert();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));

  const initialGroupstate = {
    name: "",
    description: "",
    users: [],
  };

  const userColumns = [
    { field: "account", headerName: "Account", flex: 0.1 },
    { field: "email", headerName: "Email", flex: 0.2 },
    {
      field: "groupId",
      headerName: "Group",
      flex: 0.1,
      renderCell: (params) => {
        const group = params.row.group;
        if (group === null) {
          return "-";
        }
        return group.name;
      },
    },
  ];

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [users, setUsers] = useState([]); // select option에 표시 될 user list (fix)
  const [groupForm, setGroupForm] = useState(initialGroupstate);
  const [selectionModel, setSelectionModel] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    setGroupForm(group);
    // group member bindng
    let userIds = group.users && group.users.map((obj) => obj.id);
    setSelectionModel(userIds);
    // 전체 user list 조회
    UserService.getAll()
      .then((res) => {
        setUsers(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [group]);

  // 닫기 버튼 클릭
  const handleClose = () => {
    handleCloseClick(false);
  };
  // 그룹 수정 완료
  const handleDone = () => {
    const isDone = true;
    handleCloseClick(false, isDone);
  };

  // input 값 변경 시 groupForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupForm({ ...groupForm, [name]: value });
  };

  // 사용자 테이블에서 사용자 선택
  const handleUserRowClick = (select) => {
    setSelectionModel(select);
  };

  // 그룹 수정 버튼 클릭
  const editGroup = () => {
    const valid = validator.current.allValid();
    if (valid) {
      const name = groupForm.name;
      if (name !== "") {
        GroupService.findByName(name).then((res) => {
          // 현재 그룹의 원래 이름이 아니고, 다른 그룹의 이름일 때 (중복일 때)
          if (res.data !== "" && res.data !== undefined && res.data.id !== groupForm.id) {
            alert.show("This name already exist.", {
              title: "",
              type: "error",
            });
          } else {
            edit();
          }
        });
      }
    } else {
      validator.current.showMessages();
      forceUpdate();
    }
  };

  // 그룹 수정
  const edit = () => {
    // 전체 user list에서 선택된 체크박스 userId들(selectionModel: [1,2,3,...])을 가지고 선택된 user list를 구함
    // const members = users.filter((x) => selectionModel.includes(x.id));
    const oldMemberIds = groupForm.users && groupForm.users.map((obj) => obj.id);
    const isSameMember = JSON.stringify(oldMemberIds.sort()) === JSON.stringify(selectionModel.sort());
    dispatch(updateGroup(groupForm.id, groupForm))
      .then(() => {
        // 그룹 멤버가 변경되었다면
        if (!isSameMember) {
          let data = { ...groupForm, users: selectionModel };
          dispatch(updateGroupMember(data.id, data))
            .then(() => {
              alert.show("Group update with members successfully.", {
                title: "",
                type: "success",
                onClose: () => {
                  handleDone();
                },
              });
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
          alert.show("Group update successfully.", {
            title: "",
            type: "success",
            onClose: () => {
              handleDone();
            },
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
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
                    <DataGrid
                      density="compact"
                      rows={users}
                      columns={userColumns}
                      pageSize={5}
                      checkboxSelection
                      disableSelectionOnClick
                      onSelectionModelChange={(newSelection) => handleUserRowClick(newSelection.selectionModel)}
                      selectionModel={selectionModel}
                    />
                  </div>
                </GridItem>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions style={{ padding: "8px 40px" }}>
            <Button variant="outlined" onClick={editGroup}>
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
