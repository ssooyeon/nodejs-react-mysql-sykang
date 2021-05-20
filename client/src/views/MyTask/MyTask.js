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

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const customStyles = {
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

const itemsFromBackEnd = [
  { id: uuidv4(), content: "First task" },
  { id: uuidv4(), content: "Second task" },
];

const columnsFromBackend = {
  [uuidv4()]: {
    name: "Requested",
    items: itemsFromBackEnd,
  },
  [uuidv4()]: {
    name: "To do",
    items: [],
  },
  [uuidv4()]: {
    name: "In Progress",
    items: [],
  },
  [uuidv4()]: {
    name: "Done",
    items: [],
  },
};

const onDragEnd = (result, columns, setColumns) => {
  if (!result.destination) {
    return;
  }
  const { source, destination } = result;
  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    });
  }
};

export default function MyTask() {
  const classes = defaultStyles();
  const customClasses = useStyles();
  const alert = useAlert();

  const { user: currentUser } = useSelector((state) => state.auth);
  const [columns, setColumns] = useState(columnsFromBackend);
  const dispatch = useDispatch();

  useEffect(() => {}, []);

  const addColumn = () => {
    setColumns({
      ...columns,
      [uuidv4()]: {
        name: "nonamed",
        items: [],
      },
    });
  };

  const editColumn = (id) => {};

  const deleteColumn = (id) => {};

  const addTask = (column) => {
    console.log(column);
  };

  const editTask = (id) => {};

  const deleteTask = (id) => {};

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Button className={customClasses.addButton} color="primary" onClick={addColumn}>
            <Add />
            Add
          </Button>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <div className={customClasses.wrapper}>
            <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
              {Object.entries(columns).map(([columnId, column], index) => {
                return (
                  <div className={customClasses.columns} key={columnId}>
                    <Card>
                      <CardHeader color="warning" stats icon>
                        <p className={classes.cardCategory}>
                          <Button className={customClasses.plusIconButton} justIcon size="sm" onClick={() => addTask(column)}>
                            <Add className={customClasses.plusIcon} />
                          </Button>
                          {column.name}
                          <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => editColumn(columnId)}>
                            <Edit className={customClasses.icon} />
                          </Button>
                          <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => deleteColumn(columnId)}>
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
                                {column.items.map((item, index) => {
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
                                            {item.content}
                                            <div className={customClasses.right}>
                                              <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => editTask(item.id)}>
                                                <Edit className={customClasses.icon} />
                                              </Button>
                                              <Button className={customClasses.iconButton} justIcon size="sm" onClick={() => deleteTask(item.id)}>
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
      </GridContainer>
    </>
  );
}
