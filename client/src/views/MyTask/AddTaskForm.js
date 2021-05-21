import React, { useRef, useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "components/CustomButtons/Button";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";

import { retrieveFolder } from "actions/folders";
import { createTask } from "actions/tasks";

const styles = {
  errorText: {
    color: "red",
    margin: "auto",
    fontSize: "14px",
  },
};

const useStyles = makeStyles(styles);

export default function AddTaskForm({ open, handleCloseClick, column }) {
  const classes = useStyles();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));

  const { user: currentUser } = useSelector((state) => state.auth);

  const initialTaskstate = {
    title: "",
    description: "",
    folderId: "",
    ordering: 0,
    createrId: currentUser.id,
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [taskForm, setTaskForm] = useState(initialTaskstate);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(retrieveFolder(column.id))
      .then((res) => {
        const tasks = res.tasks;
        let lastTaskNum = 0;
        if (tasks != undefined && tasks.length > 0) {
          lastTaskNum = tasks[tasks.length - 1].ordering + 1;
        }
        setTaskForm({ ...taskForm, ordering: lastTaskNum, folderId: column.id });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [column]);

  // 부모에게 완료사항 전달
  const handleClose = () => {
    handleCloseClick(false);
  };

  // input 값 변경 시 taskForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm({ ...taskForm, [name]: value });
  };

  // 테스크 등록 버튼 클릭
  const addTask = () => {
    const valid = validator.current.allValid();
    if (valid) {
      dispatch(createTask(taskForm))
        .then(() => {
          handleClose();
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      validator.current.showMessages();
      forceUpdate();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md">
        <form autoComplete="off">
          <DialogTitle id="form-dialog-title">Add new task</DialogTitle>
          <DialogContent>
            <DialogContentText>To register a new task, enter title and description and click the Submit button.</DialogContentText>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Title"
                    id="title"
                    name="title"
                    value={taskForm.title}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "title",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("title"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("title", taskForm.title, "required")}</div>
                </GridItem>
              </GridContainer>

              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Description"
                    id="description"
                    name="description"
                    value={taskForm.description}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "description",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("description"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("description", taskForm.description, "required")}</div>
                </GridItem>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions>
            <Button onClick={addTask} color="primary">
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
