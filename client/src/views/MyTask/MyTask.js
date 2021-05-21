import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert-17";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";

import { makeStyles } from "@material-ui/core/styles";
import { Add, Person, Edit, Delete } from "@material-ui/icons";

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

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import AddTaskForm from "./AddTaskForm";
import EditTaskForm from "./EditTaskForm";
import EditColumnForm from "./EditColumnForm";

import { retrieveFolders, retrieveParentFolders, createFolder, deleteFolder } from "actions/folders";
import { updateTask, deleteTask } from "actions/tasks";

const customStyles = {
  selectBox: {
    width: "100px",
  },
  addButton: {
    marginLeft: "10px",
  },
  wrapper: {
    display: "flex",
    height: "100%",
  },
  columns: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "8px",
  },
  droppableZone: {
    padding: 4,
    width: 250,
    minHeight: 300,
  },
  droppableItem: {
    userSelect: "none",
    padding: 16,
    margin: "0 0 8px 0",
    minHeight: "50px",
    color: "white",
  },
  plusIconButton: {
    background: "none !important",
    boxShadow: "none !important",
    width: "20px !important",
    minWidth: "20px !important",
    height: "20px !important",
    float: "left",
  },
  plusIcon: {
    width: "20px !important",
    height: "20px !important",
    marginBottom: "10px !important",
    color: "#263B4A",
  },
  iconButton: {
    background: "none !important",
    boxShadow: "none !important",
    width: "20px !important",
    minWidth: "20px !important",
    height: "20px !important",
  },
  icon: {
    width: "20px !important",
    height: "20px !important",
    marginBottom: "10px !important",
    color: "lightgray",
  },
  droppableWrapper: {
    margin: 8,
    minHeight: "320px",
    maxHeight: "700px",
    overflowY: "auto",
  },
  right: {
    float: "right",
  },
};

const defaultStyles = makeStyles(styles);
const useStyles = makeStyles(customStyles);

export default function MyTask() {
  const classes = defaultStyles();
  const customClasses = useStyles();
  const alert = useAlert();

  const [folders, setFolders] = useState([]); // 최상위 폴더 리스트
  const [columnLastOrderNum, setColumnLastOrderNum] = useState(0); // 현재 선택된 폴더의 컬럼 리스트의 마지막 정렬 넘버

  const [currentFolder, setCurrentFolder] = useState(1); // 현재 선택된 최상위 폴더
  const [columns, setColumns] = useState([]); // 현재 선택된 폴더의 컬럼 리스트

  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false); // 테스크 생성 모달 오픈
  const [addColumnForm, setAddColumnForm] = useState([]); // 새로운 테스크를 추가할 컬럼

  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false); // 테스크 수정 모달 오픈
  const [editTaskForm, setEditTaskForm] = useState([]); // 수정할 테스크

  const [editColumnModalOpen, setEditColumnModalOpen] = useState(false); // 컬럼 수정 모달 오픈
  const [editColumnForm, setEditColumnForm] = useState([]); // 수정할 컬럼

  const { user: currentUser } = useSelector((state) => state.auth);
  // const folders = useSelector((state) => state.folders || []);
  const dispatch = useDispatch();

  // 컬럼 추가 시 기본 컬럼
  const defaultCreatedColumn = {
    name: "nonamed",
    parentId: currentFolder,
    managerId: currentUser.id,
  };

  useEffect(() => {
    // parent가 null인 폴더 조회 (셀렉트박스에 표출)
    dispatch(retrieveParentFolders())
      .then((res) => {
        setFolders(res);
      })
      .catch((err) => {
        console.log(err);
      });
    getFolder(currentFolder);
  }, [dispatch]);

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
      const id = removed.id.replace("task", "");

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

      destItems.map((task, i) => {
        const id = task.id.replace("task", "");
        const data = { ...task, id: id, folderId: destColumnId, ordering: i };
        dispatch(updateTask(data.id, data));
      });
    } else {
      // 같은 컬럼에서 움직이는 경우: ordering 변경
      const column = columns[source.droppableId];
      const copiedItems = [...column.tasks];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          tasks: copiedItems,
        },
      });

      copiedItems.map((task, i) => {
        const id = task.id.replace("task", "");
        const data = { ...task, id: id, ordering: i };
        dispatch(updateTask(data.id, data));
      });
    }
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
        }
        let resultColumns = [];
        columns.map((column, i) => {
          column.tasks.map((task, j) => {
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
      .catch((err) => {
        console.log(err);
      });
  };

  // 테스크 등록 버튼 클릭 및 AddTaskForm.js 에서 닫기 버튼 클릭
  const handleAddTaskModalClick = (value) => {
    setAddTaskModalOpen(value);
    getFolder(currentFolder);
  };

  // 테스트 수정 버튼 클릭 및 EditTaskForm.js 에서 닫기 버튼 클릭
  const handleEditTaskModalClick = (value) => {
    setEditTaskModalOpen(value);
    getFolder(currentFolder);
  };

  // 컬럼 이름 수정 버튼 클릭 및 EditFolderForm.js 에서 닫기 버튼 클릭
  const handleEditFolderModalClick = (value) => {
    setEditColumnModalOpen(value);
    getFolder(currentFolder);
  };

  // 셀렉트 박스 변경 이벤트
  const handleSelectChange = (e) => {
    const id = e.target.value;
    setCurrentFolder(id);
    getFolder(id);
  };

  // 컬럼 추가
  const addColumn = () => {
    const data = { ...defaultCreatedColumn, ordering: columnLastOrderNum + 1 };
    dispatch(createFolder(data))
      .then(() => {
        getFolder(currentFolder);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 컬럼 이름 수정 버튼 클릭
  const editColumn = (column) => {
    setEditColumnForm(column);
    handleEditFolderModalClick(true);
  };

  // 테스크 포함 컬럼 삭제
  const deleteColumn = (id) => {
    //TODO: confirm alert
    dispatch(deleteFolder(id))
      .then(() => {
        getFolder(currentFolder);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 테스크 추가 버튼 클릭
  const addTask = (column) => {
    setAddColumnForm(column);
    handleAddTaskModalClick(true);
  };

  // 테스크 수정 버튼 클릭
  const editTask = (task) => {
    setEditTaskForm(task);
    handleEditTaskModalClick(true);
  };

  // 테스크 삭제 버튼 클릭
  const removeTask = (id) => {
    //TODO: confrim alert
    id = id.replace("task", "");
    dispatch(deleteTask(id))
      .then(() => {
        getFolder(currentFolder);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <FormControl className={`${classes.formControl} ${customClasses.selectBox}`}>
            <InputLabel id="demo-simple-select-label"></InputLabel>
            <Select labelId="demo-simple-select-label" value={currentFolder} onChange={handleSelectChange}>
              {folders &&
                folders.map((folder, index) => (
                  <MenuItem value={folder.id} key={folder.id}>
                    {folder.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button className={customClasses.addButton} color="primary" onClick={addColumn}>
            <Add />
            Add
          </Button>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <div className={customClasses.wrapper}>
            <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
              {columns &&
                Object.entries(columns).map(([columnId, column], index) => {
                  return (
                    <div className={customClasses.columns} key={columnId}>
                      <Card>
                        <CardHeader color="warning" stats icon>
                          <p className={classes.cardCategory}>
                            <Button className={customClasses.plusIconButton} justIcon size="sm" onClick={() => addTask(column)}>
                              <Add className={customClasses.plusIcon} />
                            </Button>
                            {column.name}
                            <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => editColumn(column)}>
                              <Edit className={customClasses.icon} />
                            </Button>
                            <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => deleteColumn(column.id)}>
                              <Delete className={customClasses.icon} />
                            </Button>
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
                                                  backgroundColor: snapshot.isDragging ? "#263B4A" : "#456C86",
                                                  ...provided.draggableProps.style,
                                                }}
                                              >
                                                {item.title}
                                                <div className={customClasses.right}>
                                                  <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => editTask(item)}>
                                                    <Edit className={customClasses.icon} />
                                                  </Button>
                                                  <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => removeTask(item.id)}>
                                                    <Delete className={customClasses.icon} />
                                                  </Button>
                                                </div>
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
                            <Person />
                            created by sykang
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
      </GridContainer>
    </>
  );
}
