import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import Moment from "react-moment";
import { CirclePicker } from "react-color";

import { makeStyles } from "@material-ui/core/styles";
import { Add, Person, Edit, Delete, Menu as MenuIcon } from "@material-ui/icons";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Menu } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import AddTaskForm from "./AddTaskForm";
import EditTaskForm from "./EditTaskForm";
import EditColumnForm from "./EditColumnForm";

import customStyles from "./style/MyTaskStyle";
import useLocalStorage from "utils/useLocalStorage";
import {
  retrieveFolders,
  retrieveFolder,
  retrieveParentFolders,
  retrieveAllWithSharedUsers,
  createFolder,
  updateFolder,
  deleteFolder,
} from "actions/folders";
import { updateTask, deleteTask } from "actions/tasks";
import SharedUsersForm from "./SharedUsersForm";

const defaultStyles = makeStyles(styles);
const useStyles = makeStyles(customStyles);

const themeColorList = ["#456C86", "#B8A8A2", "#546B68", "#A2B8A8", "#D19C4F", "#B89B8F", "#7DA0B8"];
const spanColorList = ["#D4B957", "#546B59", "#B8A4A3", "#6B546B", "#40857D", "#495D6B", "#6B623E"];
const today = new Date().toISOString().slice(0, 10);

export default function MyTask() {
  /**
   * ????????? ???????????? ???????????? ??????: (?????????)??????
   * ????????? ?????? ?????? ?????? ?????????: ??????
   * ?????? ?????? draggabled: ?????????
   */
  const classes = defaultStyles();
  const customClasses = useStyles();
  const alert = useAlert();

  const [themeColor, setThemeColor] = useLocalStorage("themeColor", themeColorList[0]);
  const [spanColor, setSpanColor] = useLocalStorage("spanColor", spanColorList[0]);

  const [folders, setFolders] = useState([]); // ????????? ?????? ?????????
  const [columnLastOrderNum, setColumnLastOrderNum] = useState(0); // ?????? ????????? ????????? ?????? ???????????? ????????? ?????? ??????

  const [currentFolder, setCurrentFolder] = useLocalStorage("currentFolder", "0"); // ?????? ????????? ????????? ??????
  const [columns, setColumns] = useState([]); // ?????? ????????? ????????? ?????? ?????????

  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false); // ????????? ?????? ?????? ??????
  const [addColumnForm, setAddColumnForm] = useState([]); // ????????? ???????????? ????????? ?????? ??????

  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false); // ????????? ?????? ?????? ??????
  const [editTaskForm, setEditTaskForm] = useState([]); // ????????? ????????? ??????

  const [editColumnModalOpen, setEditColumnModalOpen] = useState(false); // ?????? ?????? ?????? ??????
  const [editColumnForm, setEditColumnForm] = useState([]); // ????????? ?????? ??????

  const [editSharedUserModalOpen, setEditSharedUserModalOpen] = useState(false); // ????????? ????????? ?????? ????????? ?????? ?????? ??????
  const [editUserFolder, setEditUserFolder] = useState([]); // ????????? ????????? ????????? ?????? ????????? ?????? ??????

  const [anchorEl, setAnchorEl] = React.useState(null);

  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // ????????? ?????? ?????? ??????
  const onColorStateChange = (colorState) => {
    const index = themeColorList.findIndex((x) => x.toLowerCase() === colorState.toLowerCase());
    setThemeColor(colorState);
    setSpanColor(spanColorList[index]);
  };

  // ?????? ?????? ??? ?????? ??????
  const defaultCreatedColumn = {
    name: "nonamed",
    parentId: currentFolder,
    managerId: currentUser.id,
  };

  // ????????? ?????????
  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) {
      return;
    }
    const { source, destination } = result;
    // ????????? ???????????? ??????: folderId ??? ordering ??????
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.tasks];
      const destItems = [...destColumn.tasks];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      const destColumnId = destColumn.id;

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          tasks: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          tasks: destItems,
        },
      });

      const destLength = destItems.length;
      let mapLength = 0;

      // ?????? column??? ??? ????????? ?????????
      if (destItems[0] === removed) {
        const task = destItems[0];
        const id = task.id.replace("task", "");
        let data = {};
        // ?????? column??? ?????? task??? ?????? ???????????? ??? ????????? task??? ordering+1??? ??????
        if (destItems[1] !== undefined) {
          data = { ...task, id: id, folderId: destColumnId, ordering: destItems[1].ordering + 1 };
        } else {
          data = { ...task, id: id, folderId: destColumnId, ordering: 0 };
        }
        dispatch(updateTask(data.id, data))
          .then(() => {
            // ordering ??????????????? ?????? ????????? ?????? task??? ?????? ????????????
            getFolder(currentFolder);
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        // ?????? column??? ??? ????????? ?????? ?????? ????????? ????????? ?????? column??? tasks?????? ordering??? ?????? ????????????
        destItems.forEach((task, i) => {
          const id = task.id.replace("task", "");
          const order = destLength - (i + 1);
          const data = { ...task, id: id, folderId: destColumnId, ordering: order };
          dispatch(updateTask(data.id, data))
            .then(() => {
              mapLength++;
              // ordering ??????????????? ?????? ????????? ?????? task??? ?????? ????????????
              if (mapLength === destLength) {
                getFolder(currentFolder);
              }
            })
            .catch((e) => {
              console.log(e);
            });
        });
      }
    } else {
      // ?????? ???????????? ???????????? ??????: ordering ??????
      const column = columns[source.droppableId];
      const copiedItems = [...column.tasks];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      const copiedLength = copiedItems.length;

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          tasks: copiedItems,
        },
      });

      // ????????? ?????? task?????? ordering??? ???????????? ????????????
      copiedItems.forEach((task, i) => {
        const id = task.id.replace("task", "");
        const order = copiedLength - (i + 1);
        const data = { ...task, id: id, ordering: order };
        dispatch(updateTask(data.id, data));
      });
    }
  };

  useEffect(() => {
    getParentFolders();
  }, []);

  // parent??? null??? ?????? ?????? (?????????????????? ??????)
  const getParentFolders = () => {
    dispatch(retrieveParentFolders(currentUser.id))
      .then((res) => {
        setFolders(res);
        if (currentFolder === undefined || currentFolder === "0") {
          setCurrentFolder(res[0].id);
          getFolder(res[0].id);
        } else {
          getFolder(currentFolder);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ????????? ????????? ????????? ????????? ?????? ?????? ??????(????????? ??????) ??????
  const getFolder = (id) => {
    let params = {
      parentId: id,
    };
    dispatch(retrieveFolders(params))
      .then((res) => {
        const columns = res;
        if (columns.length > 0) {
          setColumnLastOrderNum(columns[columns.length - 1].ordering);
        } else {
          setColumnLastOrderNum(0);
        }
        let resultColumns = [];
        columns.forEach((column, i) => {
          column.tasks.forEach((task, j) => {
            // ????????? ????????? ?????? string ??????
            task.id = "task" + task.id;
          });
          // ????????? string uuid??? ?????????
          resultColumns[uuidv4()] = {
            ...column,
          };
        });
        setColumns(resultColumns);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ????????? ?????? ?????? ?????? ??? AddTaskForm.js ?????? ?????? ?????? ??????
  const handleAddTaskModalClick = (value) => {
    setAddTaskModalOpen(value);
    getFolder(currentFolder);
  };

  // ????????? ??????(??????/??????) ?????? ??????
  const handleTaskMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    const taskStr = event.currentTarget.dataset.task;
    const task = JSON.parse(taskStr);
    setEditTaskForm(task);
  };

  // ????????? ??????(??????/??????) ?????? ??????
  const handleTaskMenuClose = () => {
    setAnchorEl(null);
  };

  // ????????? ?????? ?????? ?????? ??? EditTaskForm.js ?????? ?????? ?????? ??????
  const handleEditTaskModalClick = (value) => {
    setEditTaskModalOpen(value);
    getFolder(currentFolder);
  };

  // ??????/?????? ?????? ?????? ?????? ?????? ??? EditFolderForm.js ?????? ?????? ?????? ??????
  const handleEditFolderModalClick = (value) => {
    setEditColumnModalOpen(value);
    getParentFolders();
  };

  // ????????? ?????? ?????? ????????? ?????? ?????? ?????? ??? SharedusersForm.js ?????? ?????? ?????? ??????
  const handleEditSharedUserModalClick = (value) => {
    setEditSharedUserModalOpen(value);
    getParentFolders();
  };

  // ????????? ?????? ?????? ?????????
  const handleSelectChange = (id) => {
    setCurrentFolder(id);
    getFolder(id);
  };

  // ????????? ?????? ??????
  const addParentFolder = () => {
    const folder = { ...defaultCreatedColumn, ordering: 0, parentId: null };
    const user = currentUser;
    const data = { folder, user };
    dispatch(createFolder(data))
      .then((createdFolder) => {
        // ????????? folder ????????????
        dispatch(retrieveParentFolders(currentUser.id))
          .then((res) => {
            setFolders(res);
            setCurrentFolder(createdFolder.id);
            getFolder(createdFolder.id);
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ????????? ????????? ?????? ?????? ??????
  const editSharedUser = (currentFolderId) => {
    dispatch(retrieveAllWithSharedUsers(currentFolderId))
      .then((res) => {
        setEditUserFolder(res);
        setEditSharedUserModalOpen(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ????????? ?????? ??????
  const editParentFolder = (id) => {
    dispatch(retrieveFolder(id))
      .then((res) => {
        setEditColumnForm(res);
        handleEditFolderModalClick(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ????????? ?????? ?????? ?????? ??????
  const confirmRemoveFolder = (id) => {
    alert.show("Are you sure delete this folder with all column?", {
      title: "",
      closeCopy: "Cancel",
      type: "success",
      actions: [
        {
          copy: "YES",
          onClick: () => removeFolder(id),
        },
      ],
    });
  };

  // ????????? ?????? ??????
  const removeFolder = (id) => {
    dispatch(deleteFolder(id))
      .then(() => {
        // ?????? folder ????????????
        dispatch(retrieveParentFolders(currentUser.id))
          .then((res) => {
            setFolders(res);
            setCurrentFolder(res[0].id);
            getFolder(res[0].id);
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ?????? ??????
  const addColumn = () => {
    const folder = { ...defaultCreatedColumn, ordering: columnLastOrderNum + 1 };
    const data = { folder };
    dispatch(createFolder(data))
      .then(() => {
        getFolder(currentFolder);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ?????? ?????? ?????? ?????? ??????
  const editColumn = (column) => {
    setEditColumnForm(column);
    handleEditFolderModalClick(true);
  };

  // ?????? ?????? ?????? ??????
  const confirmRemoveColumn = (id) => {
    alert.show("Are you sure delete this column with all task?", {
      title: "",
      closeCopy: "Cancel",
      type: "success",
      actions: [
        {
          copy: "YES",
          onClick: () => removeColumn(id),
        },
      ],
    });
  };

  // ????????? ?????? ?????? ??????
  const removeColumn = (id) => {
    dispatch(deleteFolder(id))
      .then(() => {
        getFolder(currentFolder);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ?????? ordering ?????? (back)
  const columnOrderingBack = (column) => {
    let data = {};
    // ??? ?????? ????????? ?????????
    if (column.ordering > 0) {
      // ????????? ????????? ordering??? 1??? ???
      data = { ...column, ordering: column.ordering - 1 };
      dispatch(updateFolder(data.id, data))
        .then(() => {
          // ????????? ????????? ????????? ordering??? ?????? ????????? ??????
          const updateAwaitColumn = Object.values(columns).find((x) => x.ordering === data.ordering && x.id !== data.id);
          // ????????? ????????? ordering??? 1??? ?????? (?????? ??????)
          const d = { ...updateAwaitColumn, ordering: updateAwaitColumn.ordering + 1 };
          dispatch(updateFolder(d.id, d))
            .then(() => {
              getFolder(currentFolder);
            })
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  // ?????? ordering ?????? (forward))
  const columnOrderingForward = (column) => {
    let data = {};
    // ????????? ????????? ?????????
    // if (column.ordering > 0) {
    // ????????? ????????? ordering??? 1??? ??????
    data = { ...column, ordering: column.ordering + 1 };
    dispatch(updateFolder(data.id, data))
      .then(() => {
        // ????????? ????????? ????????? ordering??? ?????? ????????? ??????
        const updateAwaitColumn = Object.values(columns).find((x) => x.ordering === data.ordering && x.id !== data.id);
        // ????????? ????????? ordering??? 1??? ??? (?????? ??????)
        const d = { ...updateAwaitColumn, ordering: updateAwaitColumn.ordering - 1 };
        dispatch(updateFolder(d.id, d))
          .then(() => {
            getFolder(currentFolder);
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ????????? ?????? ?????? ??????
  const addTask = (column) => {
    setAddColumnForm(column);
    handleAddTaskModalClick(true);
  };

  // ????????? ?????? ?????? ??? editTaskForm ?????? ??? ???????????? ?????? ??????
  const taskTitleClick = (task) => {
    setEditTaskForm(task);
    handleEditTaskModalClick(true);
  };

  // ????????? ?????? ?????? ??????
  const editTask = () => {
    handleTaskMenuClose();
    handleEditTaskModalClick(true);
  };

  // ????????? ?????? ?????? ??????
  const confirmRemoveTask = () => {
    handleTaskMenuClose();
    alert.show("Are you sure delete this task?", {
      title: "",
      closeCopy: "Cancel",
      type: "success",
      actions: [
        {
          copy: "YES",
          onClick: () => removeTask(editTaskForm.id),
        },
      ],
    });
  };

  // ????????? ??????
  const removeTask = (id) => {
    id = id.replace("task", "");
    dispatch(deleteTask(id))
      .then(() => {
        getFolder(currentFolder);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ????????? ???????????? ??????
  const handleCheckbox = (e, task) => {
    const id = task.id.replace("task", "");
    const data = { ...task, id: id, isDone: e.target.checked };
    dispatch(updateTask(data.id, data))
      .then(() => {
        getFolder(currentFolder);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      <GridContainer style={{ overflowX: "auto" }}>
        <GridItem xs={12} sm={12} md={12}>
          <FormControl className={`${classes.formControl} ${customClasses.selectBox}`}>
            <InputLabel id="demo-simple-select-label"></InputLabel>
            {folders.length > 0 && folders.find((x) => x.id === parseInt(currentFolder)) ? (
              <Select labelId="demo-simple-select-label" value={currentFolder} onChange={(e) => handleSelectChange(e.target.value)}>
                {folders &&
                  folders.map((folder, index) => (
                    <MenuItem value={folder.id} key={folder.id}>
                      {folder.name}
                    </MenuItem>
                  ))}
              </Select>
            ) : null}
          </FormControl>
          <IconButton
            aria-label="members"
            className={`${customClasses.iconButton} ${customClasses.mt20}`}
            onClick={() => editSharedUser(currentFolder)}
          >
            <Person className={`${customClasses.titleSpan} ${customClasses.icon}`} />
          </IconButton>
          <IconButton
            aria-label="edit"
            className={`${customClasses.iconButton} ${customClasses.mt20}`}
            onClick={() => editParentFolder(currentFolder)}
          >
            <Edit className={`${customClasses.titleSpan} ${customClasses.icon}`} />
          </IconButton>
          <IconButton
            aria-label="delete"
            className={`${customClasses.iconButton} ${customClasses.mt20}`}
            onClick={() => confirmRemoveFolder(currentFolder)}
          >
            <Delete className={`${customClasses.titleSpan} ${customClasses.icon}`} />
          </IconButton>
          <IconButton aria-label="add" className={customClasses.iconButtonLarge} onClick={addParentFolder}>
            <Add className={customClasses.colorIcon} />
            Folder
          </IconButton>
          <IconButton aria-label="add" className={customClasses.iconButtonLarge} onClick={addColumn}>
            <Add className={customClasses.colorIcon} />
            Column
          </IconButton>
          <div className={customClasses.themeColorPicker}>
            <CirclePicker colors={themeColorList} circleSize={20} onChangeComplete={(colore) => onColorStateChange(colore.hex)} />
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <div className={customClasses.wrapper}>
            <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
              {columns &&
                Object.entries(columns).map(([columnId, column], index, { length }) => {
                  return (
                    <div className={customClasses.columns} key={columnId}>
                      <Card className={customClasses.cardNoMargin}>
                        <CardHeader color="warning" stats icon>
                          <p className={classes.cardCategory}>
                            <IconButton aria-label="add" className={customClasses.plusIconButton} onClick={() => addTask(column)}>
                              <Add className={customClasses.plusIcon} />
                            </IconButton>
                            {index > 0 ? ( // ??? ?????? ????????????
                              <IconButton aria-label="move" className={customClasses.iconButton} onClick={() => columnOrderingBack(column)}>
                                <ArrowBackIosIcon className={customClasses.arrowIcon} />
                              </IconButton>
                            ) : null}
                            {column.name}
                            <IconButton aria-label="edit" className={customClasses.iconButton} onClick={() => editColumn(column)}>
                              <Edit className={customClasses.icon} />
                            </IconButton>
                            <IconButton aria-label="delete" className={customClasses.iconButton} onClick={() => confirmRemoveColumn(column.id)}>
                              <Delete className={customClasses.icon} />
                            </IconButton>
                            {index + 1 < length ? ( // ????????? ????????????
                              <IconButton aria-label="move" className={customClasses.iconButton} onClick={() => columnOrderingForward(column)}>
                                <ArrowForwardIosIcon className={customClasses.arrowIcon} />
                              </IconButton>
                            ) : null}
                          </p>
                          <h3 className={classes.cardTitle}></h3>
                        </CardHeader>
                        <div className={customClasses.droppableWrapper}>
                          <Droppable droppableId={columnId} key={columnId}>
                            {(provided, snapshot) => {
                              return (
                                <div
                                  className={customClasses.droppableZone}
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  style={{
                                    background: snapshot.isDraggingOver ? "lightblue" : "lightgray",
                                  }}
                                >
                                  {column.tasks &&
                                    column.tasks.map((item, index) => {
                                      return (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                          {(provided, snapshot) => {
                                            return (
                                              <div
                                                className={customClasses.droppableItem}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                  backgroundColor: snapshot.isDragging ? "#263B4A" : themeColor,
                                                  ...provided.draggableProps.style,
                                                }}
                                              >
                                                {item.labelColor && item.labelColor ? (
                                                  <div className={customClasses.circleLabel} style={{ background: item.labelColor }}></div>
                                                ) : null}
                                                <div className={customClasses.right}>
                                                  <IconButton
                                                    aria-label="action"
                                                    className={customClasses.iconButton}
                                                    aria-controls="simple-menu"
                                                    aria-haspopup="true"
                                                    data-task={JSON.stringify(item)}
                                                    onClick={handleTaskMenuClick}
                                                  >
                                                    <MenuIcon className={customClasses.icon} />
                                                  </IconButton>
                                                  <Menu
                                                    id="simple-menu"
                                                    anchorEl={anchorEl}
                                                    keepMounted
                                                    open={Boolean(anchorEl)}
                                                    onClose={handleTaskMenuClose}
                                                  >
                                                    <MenuItem onClick={editTask}>Edit</MenuItem>
                                                    <MenuItem onClick={confirmRemoveTask}>Delete</MenuItem>
                                                  </Menu>
                                                </div>
                                                <span
                                                  className={customClasses.titleSpan}
                                                  onClick={() => {
                                                    taskTitleClick(item);
                                                  }}
                                                >
                                                  {item.title}
                                                </span>
                                                <br />
                                                <span>
                                                  {item.dueDate ? (
                                                    <>
                                                      <FormControlLabel
                                                        style={{ marginRight: "-5px" }}
                                                        control={
                                                          <Checkbox
                                                            checked={item.isDone}
                                                            onChange={(e) => handleCheckbox(e, item)}
                                                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                                                          />
                                                        }
                                                      />
                                                      <Moment
                                                        format="YYYY-MM-DD HH:mm:ss"
                                                        className={customClasses.dueDateStr}
                                                        style={{
                                                          color:
                                                            item.dueDate && today === new Date(item.dueDate).toISOString().slice(0, 10)
                                                              ? spanColor
                                                              : null,
                                                        }}
                                                      >
                                                        {item.dueDate}
                                                      </Moment>
                                                    </>
                                                  ) : null}
                                                </span>
                                              </div>
                                            );
                                          }}
                                        </Draggable>
                                      );
                                    })}
                                  {provided.placeholder}
                                </div>
                              );
                            }}
                          </Droppable>
                        </div>
                        <CardFooter stats>
                          <div className={classes.stats}>
                            <Person /> created by&nbsp;
                            {column.manager ? column.manager.account : null}
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
                  );
                })}
            </DragDropContext>
          </div>
        </GridItem>
        <AddTaskForm open={addTaskModalOpen} handleCloseClick={handleAddTaskModalClick} column={addColumnForm} />
        <EditTaskForm open={editTaskModalOpen} handleCloseClick={handleEditTaskModalClick} task={editTaskForm} />
        <EditColumnForm open={editColumnModalOpen} handleCloseClick={handleEditFolderModalClick} column={editColumnForm} />
        <SharedUsersForm open={editSharedUserModalOpen} handleCloseClick={handleEditSharedUserModalClick} userFolder={editUserFolder} />
      </GridContainer>
    </>
  );
}
