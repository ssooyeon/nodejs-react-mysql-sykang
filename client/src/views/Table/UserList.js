import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert-17";

import { makeStyles } from "@material-ui/core/styles";
import { DataGrid } from "@material-ui/data-grid";
import { Add } from "@material-ui/icons";
import { Edit, Delete } from "@material-ui/icons";

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";
import Button from "components/CustomButtons/Button";

import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";

import AddGroupForm from "./AddGroupForm";
import EditGroupForm from "./EditGroupForm";

import { retrieveUsers, deleteUser } from "actions/users";
import { retrieveGroups, deleteGroup } from "actions/groups";

const styles = {
  tableWrapper: {
    marginTop: "20px",
    height: "700px",
    width: "100%",
  },
};

const useStyles = makeStyles(styles);

export default function UserList() {
  const classes = useStyles();
  const alert = useAlert();

  // 사용자 테이블 컬럼
  const userColumns = [
    { field: "id", headerName: "ID", type: "number", flex: 0.1 },
    { field: "account", headerName: "Account", flex: 0.1 },
    { field: "email", headerName: "Email", flex: 0.2 },
    {
      field: "groupId",
      headerName: "Group",
      flex: 0.1,
      //TODO
      // renderCell: (params) => {
      //   return params.row.group.id;
      // },
    },
    { field: "createdAt", headerName: "Date", flex: 0.2 },
    {
      field: "",
      headerName: "Action",
      sortable: false,
      flex: 0.1,
      renderCell: (params) => {
        // row 우측의 수정 버튼 클릭
        const onUserEditClick = () => {
          handleUserEditModalClick(true);
          setEditUser(params.row);
        };

        // row 우측의 삭제 버튼 클릭
        const onUserRemoveClick = () => {
          alert.show("Are you sure delete this user?", {
            title: "",
            closeCopy: "Cancel",
            type: "success",
            actions: [
              {
                copy: "YES",
                onClick: () => removeUser(params.row.id),
              },
            ],
          });
        };

        return (
          <>
            <Button justIcon color="warning" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onUserEditClick}>
              <Edit />
            </Button>
            <Button justIcon color="danger" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onUserRemoveClick}>
              <Delete />
            </Button>
          </>
        );
      },
    },
  ];

  // 그룹 테이블 컬럼
  const groupColumns = [
    { field: "id", headerName: "ID", type: "number", flex: 0.1 },
    { field: "name", headerName: "Name", flex: 0.2 },
    { field: "createdAt", headerName: "Date", flex: 0.2 },
    {
      field: "",
      headerName: "Action",
      flex: 0.1,
      renderCell: (params) => {
        // row 우측의 수정 버튼 클릭
        const onGroupEditClick = () => {
          handleGroupEditModalClick(true);
          setEditGroup(params.row);
        };

        // row 우측의 삭제 버튼 클릭
        const onGroupRemoveClick = () => {
          alert.show("Are you sure delete this group?", {
            title: "",
            closeCopy: "Cancel",
            type: "success",
            actions: [
              {
                copy: "YES",
                onClick: () => removeGroup(params.row.id),
              },
            ],
          });
        };

        return (
          <>
            <Button justIcon color="warning" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onGroupEditClick}>
              <Edit />
            </Button>
            <Button justIcon color="danger" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onGroupRemoveClick}>
              <Delete />
            </Button>
          </>
        );
      },
    },
  ];

  const users = useSelector((state) => state.users || []);
  const groups = useSelector((state) => state.groups || []);
  const dispatch = useDispatch();

  const [userAddModalOpen, setUserAddModalOpen] = useState(false); // 사용자 생성 모달
  const [userEditModalOpen, setUserEditModalOpen] = useState(false); // 사용자 수정 모달
  const [editUser, setEditUser] = useState([]); // 수정할 사용자

  const [groupAddModalOpen, setGroupAddModalOpen] = useState(false); // 그룹 생성 모달
  const [groupEditModalOpen, setGroupEditModalOpen] = useState(false); // 그룹 수정 모달
  const [editGroup, setEditGroup] = useState([]); // 수정할 그룹

  useEffect(() => {
    dispatch(retrieveUsers());
    dispatch(retrieveGroups());
  }, [dispatch]);

  // 사용자 등록 버튼 클릭 및 AddUserForm.js에서 닫기 버튼 클릭
  const handleUserAddModalClick = (value) => {
    setUserAddModalOpen(value);
  };

  // 사용자 수정 버튼 클릭 및 EditUserForm.js 닫기 버튼 클릭
  const handleUserEditModalClick = (value) => {
    setUserEditModalOpen(value);
  };

  // 사용자 삭제
  const removeUser = (id) => {
    dispatch(deleteUser(id))
      .then(() => {
        alert.show("The user was created successfully.", {
          title: "",
          type: "success",
          onClose: () => {},
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 그룹 등록 버튼 클릭 및 AddGroupForm.js에서 닫기 버튼 클릭
  const handleGroupAddModalClick = (value) => {
    setGroupAddModalOpen(value);
  };

  // 그룹 수정 버튼 클릭 및 EditGroupForm.js에서 닫기 버튼 클릭
  const handleGroupEditModalClick = (value) => {
    setGroupEditModalOpen(value);
  };

  // 그룹 삭제
  const removeGroup = (id) => {
    dispatch(deleteGroup(id))
      .then(() => {
        alert.show("The group was created successfully.", {
          title: "",
          type: "SUCCESS",
          onClose: () => {},
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={7}>
          <Button color="primary" onClick={() => handleUserAddModalClick(true)}>
            <Add />
            Add
          </Button>
        </GridItem>
        <GridItem xs={12} sm={12} md={5}>
          <Button color="primary" onClick={() => handleGroupAddModalClick(true)}>
            <Add />
            Add
          </Button>
        </GridItem>
        <GridItem xs={12} sm={12} md={7}>
          <div className={classes.tableWrapper}>
            <DataGrid rows={users} columns={userColumns} pageSize={10} checkboxSelection />
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={5}>
          <div className={classes.tableWrapper}>
            <DataGrid rows={groups} columns={groupColumns} pageSize={10} checkboxSelection />
          </div>
        </GridItem>
      </GridContainer>

      <AddUserForm open={userAddModalOpen} handleCloseClick={handleUserAddModalClick} groups={groups} />
      <EditUserForm open={userEditModalOpen} handleCloseClick={handleUserEditModalClick} groups={groups} user={editUser} />

      <AddGroupForm open={groupAddModalOpen} handleCloseClick={handleGroupAddModalClick} />
      <EditGroupForm open={groupEditModalOpen} handleCloseClick={handleGroupEditModalClick} group={editGroup} />
    </>
  );
}
