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

import { retrieveUsers, deleteUser } from "actions/users";
import EditUserForm from "./EditUserForm";

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

  const columns = [
    { field: "id", headerName: "ID", type: "number", flex: 0.1 },
    { field: "account", headerName: "Account", flex: 0.2 },
    { field: "email", headerName: "Email", flex: 0.3 },
    { field: "createdAt", headerName: "Date", flex: 0.3 },
    {
      field: "",
      headerName: "Action",
      sortable: false,
      flex: 0.1,
      renderCell: (params) => {
        const onEditClick = () => {
          handleEditModalClick(true);
          setEditUser(params.row);
        };
        const onRemoveClick = () => {
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
            <Button justIcon color="warning" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onEditClick}>
              <Edit />
            </Button>
            <Button justIcon color="danger" style={{ minWidth: "30px", width: "30px", height: "30px" }} onClick={onRemoveClick}>
              <Delete />
            </Button>
          </>
        );
      },
    },
  ];

  const users = useSelector((state) => state.users || []);
  const dispatch = useDispatch();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState([]);

  useEffect(() => {
    dispatch(retrieveUsers());
  }, [dispatch]);

  // 사용자 등록 버튼 클릭 및 child modal 컴포넌트에서 닫기 버튼 클릭
  const handleAddModalClick = (value) => {
    setAddModalOpen(value);
  };

  // 사용자 수정 버튼 클릭 및 child modal 컴포넌트에서 닫기 버튼 클릭
  const handleEditModalClick = (value) => {
    setEditModalOpen(value);
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

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Button color="primary" onClick={() => handleAddModalClick(true)}>
            <Add />
            Add
          </Button>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <div className={classes.tableWrapper}>
            <DataGrid rows={users} columns={columns} pageSize={10} checkboxSelection />
          </div>
        </GridItem>
      </GridContainer>

      <AddUserForm open={addModalOpen} handleCloseClick={handleAddModalClick} />
      <EditUserForm open={editModalOpen} handleCloseClick={handleEditModalClick} user={editUser} />
    </>
  );
}
