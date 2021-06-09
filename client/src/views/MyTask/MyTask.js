import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert-17";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import Moment from "react-moment";
import { CirclePicker } from "react-color";

import { makeStyles } from "@material-ui/core/styles";
import { Add, Person, Edit, Delete, Menu as MenuIcon } from "@material-ui/icons";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";
import Button from "components/CustomButtons/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Menu } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

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
   * 셀렉트 박스에서 선택하는 폴더: (최상위)폴더
   * 하나의 폴더 안의 여러 폴더들: 컬럼
   * 컬럼 안의 draggabled: 테스크
   */
  const classes = defaultStyles();
  const customClasses = useStyles();
  const alert = useAlert();

  const [themeColor, setThemeColor] = useLocalStorage("themeColor", themeColorList[0]);
  const [spanColor, setSpanColor] = useLocalStorage("spanColor", spanColorList[0]);

  const [folders, setFolders] = useState([]); // 최상위 폴더 리스트
  const [columnLastOrderNum, setColumnLastOrderNum] = useState(0); // 현재 선택된 폴더의 컬럼 리스트의 마지막 정렬 넘버

  const [currentFolder, setCurrentFolder] = useLocalStorage("currentFolder", "0"); // 현재 선택된 최상위 폴더
  const [columns, setColumns] = useState([]); // 현재 선택된 폴더의 컬럼 리스트

  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false); // 테스크 생성 모달 오픈
  const [addColumnForm, setAddColumnForm] = useState([]); // 새로운 테스크를 추가할 컬럼 정보

  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false); // 테스크 수정 모달 오픈
  const [editTaskForm, setEditTaskForm] = useState([]); // 수정할 테스크 정보

  const [editColumnModalOpen, setEditColumnModalOpen] = useState(false); // 컬럼 수정 모달 오픈
  const [editColumnForm, setEditColumnForm] = useState([]); // 수정할 컬럼 정보

  const [editSharedUserModalOpen, setEditSharedUserModalOpen] = useState(false); // 최상위 폴더의 공유 사용자 설정 모달 오픈
  const [editUserFolder, setEditUserFolder] = useState([]); // 수정할 최상위 폴더와 공유 사용자 목록 정보

  const [anchorEl, setAnchorEl] = React.useState(null);

  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // 테스크 테마 색상 변경
  const onColorStateChange = (colorState) => {
    const index = themeColorList.findIndex((x) => x.toLowerCase() === colorState.toLowerCase());
    setThemeColor(colorState);
    setSpanColor(spanColorList[index]);
  };

  // 컬럼 추가 시 기본 컬럼
  const defaultCreatedColumn = {
    name: "nonamed",
    parentId: currentFolder,
    managerId: currentUser.id,
  };

  // 드래그 이벤트
  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) {
      return;
    }
    const { source, destination } = result;
    // 컬럼이 변경되는 경우: folderId 및 ordering 변경
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

      // 다른 column의 첫 번째에 옮기면
      if (destItems[0] === removed) {
        const task = destItems[0];
        const id = task.id.replace("task", "");
        let data = {};
        // 옮긴 column에 다른 task가 이미 존재하면 맨 마지막 task의 ordering+1을 삽입
        if (destItems[1] !== undefined) {
          data = { ...task, id: id, folderId: destColumnId, ordering: destItems[1].ordering + 1 };
        } else {
          data = { ...task, id: id, folderId: destColumnId, ordering: 0 };
        }
        dispatch(updateTask(data.id, data))
          .then(() => {
            // ordering 업데이트가 모두 끝나면 전체 task를 다시 불러오기
            getFolder(currentFolder);
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        // 다른 column의 첫 번째가 아닌 다른 위치로 옮기면 해당 column의 tasks들의 ordering을 전부 업데이트
        destItems.forEach((task, i) => {
          const id = task.id.replace("task", "");
          const order = destLength - (i + 1);
          const data = { ...task, id: id, folderId: destColumnId, ordering: order };
          dispatch(updateTask(data.id, data))
            .then(() => {
              mapLength++;
              // ordering 업데이트가 모두 끝나면 전체 task를 다시 불러오기
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
      // 같은 컬럼에서 움직이는 경우: ordering 변경
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

      // 컬럼의 모든 task들의 ordering을 역순으로 업데이트
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

  // parent가 null인 폴더 조회 (셀렉트박스에 표출)
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

  // 선택된 셀렉트 박스의 폴더에 대한 컬럼 목록(테스크 포함) 조회
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
            // 테스크 아이디 앞에 string 삽입
            task.id = "task" + task.id;
          });
          // 컬럼을 string uuid로 감싸기
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

  // 테스크 등록 버튼 클릭 및 AddTaskForm.js 에서 닫기 버튼 클릭
  const handleAddTaskModalClick = (value) => {
    setAddTaskModalOpen(value);
    getFolder(currentFolder);
  };

  // 테스크 액션(수정/삭제) 버튼 클릭
  const handleTaskMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    const taskStr = event.currentTarget.dataset.task;
    const task = JSON.parse(taskStr);
    setEditTaskForm(task);
  };

  // 테스크 액션(수정/삭제) 버튼 닫기
  const handleTaskMenuClose = () => {
    setAnchorEl(null);
  };

  // 테스크 수정 버튼 클릭 및 EditTaskForm.js 에서 닫기 버튼 클릭
  const handleEditTaskModalClick = (value) => {
    setEditTaskModalOpen(value);
    getFolder(currentFolder);
  };

  // 폴더/컬럼 이름 수정 버튼 클릭 및 EditFolderForm.js 에서 닫기 버튼 클릭
  const handleEditFolderModalClick = (value) => {
    setEditColumnModalOpen(value);
    getParentFolders();
  };

  // 최상위 폴더 공유 사용자 설정 버튼 클릭 및 SharedusersForm.js 에서 닫기 버튼 클릭
  const handleEditSharedUserModalClick = (value) => {
    setEditSharedUserModalOpen(value);
    getParentFolders();
  };

  // 셀렉트 박스 변경 이벤트
  const handleSelectChange = (id) => {
    setCurrentFolder(id);
    getFolder(id);
  };

  // 최상위 폴더 추가
  const addParentFolder = () => {
    const folder = { ...defaultCreatedColumn, ordering: 0, parentId: null };
    const user = currentUser;
    const data = { folder, user };
    dispatch(createFolder(data))
      .then((createdFolder) => {
        console.log(createdFolder);
        // 생성한 folder 보여주기
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

  // 최상위 폴더의 공유 유저 설정
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

  // 최상위 폴더 수정
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

  // 최상위 폴더 삭제 버튼 클릭
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

  // 최상위 폴더 삭제
  const removeFolder = (id) => {
    dispatch(deleteFolder(id))
      .then(() => {
        // 처음 folder 보여주기
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

  // 컬럼 추가
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

  // 컬럼 이름 수정 버튼 클릭
  const editColumn = (column) => {
    setEditColumnForm(column);
    handleEditFolderModalClick(true);
  };

  // 컬럼 삭제 버튼 클릭
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

  // 테스크 포함 컬럼 삭제
  const removeColumn = (id) => {
    dispatch(deleteFolder(id))
      .then(() => {
        getFolder(currentFolder);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 컬럼 ordering 변경 (back)
  const columnOrderingBack = (column) => {
    let data = {};
    // 첫 번째 컬럼이 아니면
    if (column.ordering > 0) {
      // 클릭한 컬럼의 ordering에 1을 뺌
      data = { ...column, ordering: column.ordering - 1 };
      dispatch(updateFolder(data.id, data))
        .then(() => {
          // 수정된 클릭한 컬럼의 ordering이 같은 컬럼을 조회
          const updateAwaitColumn = Object.values(columns).find((x) => x.ordering === data.ordering && x.id !== data.id);
          // 조회한 컬럼의 ordering에 1을 더함 (위치 변경)
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

  // 컬럼 ordering 변경 (forward))
  const columnOrderingForward = (column) => {
    let data = {};
    // 마지막 컬럼이 아니면
    // if (column.ordering > 0) {
    // 클릭한 컬럼의 ordering에 1을 더함
    data = { ...column, ordering: column.ordering + 1 };
    dispatch(updateFolder(data.id, data))
      .then(() => {
        // 수정된 클릭한 컬럼의 ordering이 같은 컬럼을 조회
        const updateAwaitColumn = Object.values(columns).find((x) => x.ordering === data.ordering && x.id !== data.id);
        // 조회한 컬럼의 ordering에 1을 뺌 (위치 변경)
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

  // 테스크 추가 버튼 클릭
  const addTask = (column) => {
    setAddColumnForm(column);
    handleAddTaskModalClick(true);
  };

  // 테스크 제목 클릭 시 editTaskForm 설정 및 상세보기 모달 표출
  const taskTitleClick = (task) => {
    setEditTaskForm(task);
    handleEditTaskModalClick(true);
  };

  // 테스크 수정 버튼 클릭
  const editTask = () => {
    handleTaskMenuClose();
    handleEditTaskModalClick(true);
  };

  // 테스크 삭제 버튼 클릭
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

  // 테스크 삭제
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

  // 테스크 체크박스 클릭
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
            <Select labelId="demo-simple-select-label" value={currentFolder} onChange={(e) => handleSelectChange(e.target.value)}>
              {folders &&
                folders.map((folder, index) => (
                  <MenuItem value={folder.id} key={folder.id}>
                    {folder.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button className={`${customClasses.iconButton} ${customClasses.mt20}`} justIcon size="sm" onClick={() => editSharedUser(currentFolder)}>
            <Person className={`${customClasses.titleSpan} ${customClasses.icon}`} />
          </Button>
          <Button className={`${customClasses.iconButton} ${customClasses.mt20}`} justIcon size="sm" onClick={() => editParentFolder(currentFolder)}>
            <Edit className={`${customClasses.titleSpan} ${customClasses.icon}`} />
          </Button>
          <Button
            className={`${customClasses.iconButton} ${customClasses.mt20}`}
            justIcon
            size="sm"
            onClick={() => {
              confirmRemoveFolder(currentFolder);
            }}
          >
            <Delete className={`${customClasses.titleSpan} ${customClasses.icon}`} />
          </Button>
          <Button className={customClasses.iconButtonLarge} justIcon onClick={addParentFolder}>
            <Add className={customClasses.colorIcon} />
            Folder
          </Button>
          <Button className={customClasses.iconButtonLarge} justIcon onClick={addColumn}>
            <Add className={customClasses.colorIcon} />
            Column
          </Button>
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
                            <Button className={customClasses.plusIconButton} justIcon size="sm" onClick={() => addTask(column)}>
                              <Add className={customClasses.plusIcon} />
                            </Button>
                            {index > 0 ? ( // 첫 번째 컬럼이면
                              <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => columnOrderingBack(column)}>
                                <ArrowBackIosIcon className={customClasses.arrowIcon} />
                              </Button>
                            ) : null}
                            {column.name}
                            <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => editColumn(column)}>
                              <Edit className={customClasses.icon} />
                            </Button>
                            <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => confirmRemoveColumn(column.id)}>
                              <Delete className={customClasses.icon} />
                            </Button>
                            {index + 1 < length ? ( // 마지막 컬럼이면
                              <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => columnOrderingForward(column)}>
                                <ArrowForwardIosIcon className={customClasses.arrowIcon} />
                              </Button>
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
                                                  <Button
                                                    className={customClasses.iconButton}
                                                    justIcon
                                                    size="sm"
                                                    aria-controls="simple-menu"
                                                    aria-haspopup="true"
                                                    data-task={JSON.stringify(item)}
                                                    onClick={handleTaskMenuClick}
                                                  >
                                                    <MenuIcon className={customClasses.icon} />
                                                  </Button>
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
