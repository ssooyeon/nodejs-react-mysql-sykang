import React, { useRef, useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import SimpleReactValidator from "simple-react-validator";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { convertToHTML } from "draft-convert";
import { CirclePicker } from "react-color";
import DateTimePicker from "react-datetime-picker";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { makeStyles } from "@material-ui/core/styles";
import { Close } from "@material-ui/icons";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
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
  modalContentWrapper: {
    height: "650px",
  },
  labelText: {
    display: "flex",
    fontSize: "14px",
  },
  labelDiv: {
    width: "30px",
    height: "15px",
    marginTop: "2px",
  },
  textField: {
    width: "100%",
    marginTop: "10px",
  },
  dueDatePickerWrapper: {
    width: "100%",
  },
  dueDatePicker: {
    width: "100%",
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
    color: "#000",
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
    labelColor: null,
    ordering: 0,
    createrId: currentUser.id,
    dueDate: null,
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [editorState, setEditorState] = useState(EditorState.createEmpty()); // description editor

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
    setTaskForm({ ...taskForm, labelColor: null });
    setEditorState(EditorState.createEmpty());
  };

  // input 값 변경 시 taskForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm({ ...taskForm, [name]: value });
  };
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
  };
  const onColorStateChange = (colorState) => {
    setTaskForm({ ...taskForm, labelColor: colorState });
  };
  const onDateChange = (date) => {
    setTaskForm({ ...taskForm, dueDate: date });
  };

  // 테스크 등록 버튼 클릭
  const addTask = (e) => {
    e.preventDefault();
    const valid = validator.current.allValid();
    if (valid) {
      const data = { ...taskForm, description: convertToHTML(editorState.getCurrentContent()) };
      dispatch(createTask(data))
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
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="md">
        <form autoComplete="off" onSubmit={addTask}>
          <DialogTitle id="form-dialog-title">
            Add new task
            <div className={classes.labelText}>
              label: &nbsp; <div className={classes.labelDiv} style={{ background: taskForm.labelColor ? taskForm.labelColor : "" }}></div>
              <Button className={classes.iconButton} justIcon size="sm" onClick={() => onColorStateChange(null)}>
                <Close className={classes.icon} />
              </Button>
            </div>
          </DialogTitle>
          <DialogContent className={classes.modalContentWrapper}>
            To add a new task, enter title and description and click the Submit button.
            <div className={classes.labelText}>
              Change label color: &nbsp;
              <CirclePicker
                colors={["red", "orange", "yellow", "green", "blue", "navy", "purple"]}
                circleSize={20}
                onChangeComplete={(colore) => onColorStateChange(colore.hex)}
              />
            </div>
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
                <Editor
                  editorStyle={{
                    border: "1px solid #C0C0C0",
                    height: "330px",
                    padding: "5px",
                    fontSize: "14px",
                    lineHeight: "5px",
                    minWidth: "890px",
                  }}
                  id="description"
                  name="description"
                  value={taskForm.description}
                  wrapperClassName="wrapper-class"
                  editorClassName="editor"
                  toolbarClassName="toolbar-class"
                  toolbar={{
                    options: ["inline", "fontSize", "list", "colorPicker", "image", "remove", "history"],
                    // inDropdown: 해당 항목과 관련된 항목을 드롭다운으로 나타낼 것인지
                    list: { inDropdown: true },
                    textAlign: { inDropdown: true },
                    history: { inDropdown: false },
                  }}
                  placeholder="Description"
                  // 한국어 설정
                  localization={{
                    locale: "ko",
                  }}
                  // 초기값 설정
                  editorState={editorState}
                  // 에디터의 값이 변경될 때마다 onEditorStateChange 호출
                  onEditorStateChange={onEditorStateChange}
                />
              </GridContainer>
              <GridContainer>
                <div className={classes.dueDatePickerWrapper}>
                  <br />
                  <span className={classes.labelText}>Due date</span>
                  <DateTimePicker
                    locale="en"
                    format="yyyy-MM-dd h:mm a"
                    minutePlaceholder="mm"
                    hourPlaceholder="hh"
                    dayPlaceholder="dd"
                    monthPlaceholder="MM"
                    yearPlaceholder="yyyy"
                    className={classes.dueDatePicker}
                    onChange={onDateChange}
                    value={taskForm.dueDate}
                  />
                </div>
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
