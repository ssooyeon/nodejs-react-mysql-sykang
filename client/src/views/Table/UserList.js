import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";

import { makeStyles } from "@material-ui/core/styles";
import { DataGrid } from "@material-ui/data-grid";
import { Add, Edit, Delete, Search } from "@material-ui/icons";
import { TextField } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";

import AddUserForm from "./user/AddUserForm";
import EditUserForm from "./user/EditUserForm";

import AddGroupForm from "./group/AddGroupForm";
import EditGroupForm from "./group/EditGroupForm";

import { retrieveUsers, deleteUser } from "actions/users";
import { retrieveGroups, deleteGroup } from "actions/groups";

const styles = {
  tableWrapper: {
    marginTop: "20px",
    height: "650px",
    width: "100%",
  },
  searchUserAccount: {
    width: "94%",
    "& .MuiInput-underline:after": {
      borderBottom: "2px solid purple !important",
    },
    "& .MuiFormLabel-root.Mui-focused": {
      color: "darkgray",
    },
  },
  searchGroupName: {
    width: "92%",
    "& .MuiInput-underline:after": {
      borderBottom: "2px solid purple !important",
    },
    "& .MuiFormLabel-root.Mui-focused": {
      color: "darkgray",
    },
  },
  searchButton: {
    "&:hover": {
      color: "purple",
    },
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
      renderCell: (params) => {
        const group = params.row.group;
        if (group === null || group === undefined) {
          return "-";
        } else {
          return group.name;
        }
      },
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
            <IconButton aria-label="edit" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onUserEditClick}>
              <Edit />
            </IconButton>
            <IconButton aria-label="delete" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onUserRemoveClick}>
              <Delete />
            </IconButton>
          </>
        );
      },
    },
  ];

  // 그룹 테이블 컬럼
  const groupColumns = [
    { field: "id", headerName: "ID", type: "number", flex: 0.1 },
    { field: "name", headerName: "Name", flex: 0.1 },
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
            <IconButton aria-label="edit" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onGroupEditClick}>
              <Edit />
            </IconButton>
            <IconButton aria-label="delete" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onGroupRemoveClick}>
              <Delete />
            </IconButton>
          </>
        );
      },
    },
  ];

  const users = useSelector((state) => state.users || []);
  const groups = useSelector((state) => state.groups || []);
  const dispatch = useDispatch();

  const [searchUserInput, setSearchUserInput] = useState(null); // 사용자 검색
  const [searchGroupInput, setSearchGroupInput] = useState(null); // 그룹 검색

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

  // 사용자 검색어, 그룹 검색어 초기화 및 재조회
  const resetInputAndRetrieve = () => {
    setSearchUserInput(null);
    setSearchGroupInput(null);
    dispatch(retrieveUsers());
    dispatch(retrieveGroups());
  };

  // 사용자 등록 버튼 클릭 및 AddUserForm.js에서 닫기 버튼 클릭
  const handleUserAddModalClick = (value, isDone) => {
    setUserAddModalOpen(value);
  };
  // 사용자 등록이 실제로 이루어지면 search input 초기화
  const handleUserResetInput = (isReset) => {
    if (isReset) {
      resetInputAndRetrieve();
    }
  };

  // 사용자 수정 버튼 클릭 및 EditUserForm.js 닫기 버튼 클릭
  const handleUserEditModalClick = (value, isDone) => {
    setUserEditModalOpen(value);
    // 사용자 수정이 완료되었으면 검색어 기반으로 사용자 목록 재조회
    if (isDone) {
      searchUser();
      searchGroup(); // 수정한 user의 group이 변경되었을 경우에는 group 목록도 재조회해야 함
    }
  };

  // 사용자 삭제
  const removeUser = (id) => {
    dispatch(deleteUser(id))
      .then(() => {
        alert.show("The user was created successfully.", {
          title: "",
          type: "success",
          onClose: () => {
            resetInputAndRetrieve();
          },
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 그룹 등록 버튼 클릭 및 AddGroupForm.js에서 닫기 버튼 클릭
  const handleGroupAddModalClick = (value, isDone) => {
    setGroupAddModalOpen(value);
  };
  // 그룹 등록이 실제로 이루어지면 search input 초기화
  const handleGroupResetInput = (isReset) => {
    if (isReset) {
      resetInputAndRetrieve();
    }
  };

  // 그룹 수정 버튼 클릭 및 EditGroupForm.js에서 닫기 버튼 클릭
  const handleGroupEditModalClick = (value, isDone) => {
    setGroupEditModalOpen(value);
    // 그룹 수정이 완료되었으면 검색어 기반으로 사용자 목록 재조회
    if (isDone) {
      searchUser();
      searchGroup();
    }
  };

  // 그룹 삭제
  const removeGroup = (id) => {
    dispatch(deleteGroup(id))
      .then(() => {
        alert.show("The group was created successfully.", {
          title: "",
          type: "SUCCESS",
          onClose: () => {
            resetInputAndRetrieve();
          },
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 사용자 검색 input에서 enter 클릭 시 검색 수행
  const handleUserSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      searchUser();
    }
  };

  // 사용자 검색
  const searchUser = () => {
    const params = { account: searchUserInput };
    dispatch(retrieveUsers(params));
  };

  // 그룹 검색 input에서 enter 클릭 시 검색 수행
  const handleGroupSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      searchGroup();
    }
  };

  // 그룹 검색
  const searchGroup = () => {
    const params = { name: searchGroupInput };
    dispatch(retrieveGroups(params));
  };

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={7}>
          <Button variant="outlined" onClick={() => handleUserAddModalClick(true)}>
            <Add />
            Add
          </Button>
        </GridItem>
        <GridItem xs={12} sm={12} md={5}>
          <Button variant="outlined" onClick={() => handleGroupAddModalClick(true)}>
            <Add />
            Add
          </Button>
        </GridItem>
        <GridItem xs={12} sm={12} md={7}>
          <TextField
            className={classes.searchUserAccount}
            label="Search user account"
            name="searchUserInput"
            value={searchUserInput || ""}
            onChange={(e) => setSearchUserInput(e.target.value)}
            onKeyPress={(e) => handleUserSearchKeyPress(e)}
          />
          <IconButton aria-label="search" className={classes.searchButton} onClick={searchUser}>
            <Search />
          </IconButton>
        </GridItem>
        <GridItem xs={12} sm={12} md={5}>
          <TextField
            className={classes.searchGroupName}
            label="Search group name"
            name="searchGroupInput"
            value={searchGroupInput || ""}
            onChange={(e) => setSearchGroupInput(e.target.value)}
            onKeyPress={(e) => handleGroupSearchKeyPress(e)}
          />
          <IconButton aria-label="search" className={classes.searchButton} onClick={searchGroup}>
            <Search />
          </IconButton>
        </GridItem>
        <GridItem xs={12} sm={12} md={7}>
          <div className={classes.tableWrapper}>
            <DataGrid rows={users} columns={userColumns} pageSize={10} checkboxSelection disableSelectionOnClick />
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={5}>
          <div className={classes.tableWrapper}>
            <DataGrid rows={groups} columns={groupColumns} pageSize={10} checkboxSelection disableSelectionOnClick />
          </div>
        </GridItem>
      </GridContainer>

      <AddUserForm open={userAddModalOpen} handleCloseClick={handleUserAddModalClick} handleResetInput={handleUserResetInput} />
      <EditUserForm open={userEditModalOpen} handleCloseClick={handleUserEditModalClick} user={editUser} />

      <AddGroupForm open={groupAddModalOpen} handleCloseClick={handleGroupAddModalClick} handleResetInput={handleGroupResetInput} />
      <EditGroupForm open={groupEditModalOpen} handleCloseClick={handleGroupEditModalClick} group={editGroup} />
    </>
  );
}
