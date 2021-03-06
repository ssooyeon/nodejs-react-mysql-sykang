import React, { useRef, useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import SimpleReactValidator from "simple-react-validator";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { CirclePicker } from "react-color";
import DateTimePicker from "react-datetime-picker";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./style/Editor.css";

import { makeStyles } from "@material-ui/core/styles";
import { Close } from "@material-ui/icons";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";

import styles from "./style/TaskFormStyle";
import { retrieveFolder } from "actions/folders";
import { createTask } from "actions/tasks";

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
        if (tasks !== undefined && tasks.length > 0) {
          lastTaskNum = tasks[tasks.length - 1].ordering + 1;
        }
        setTaskForm({ ...taskForm, ordering: lastTaskNum, folderId: column.id });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [column]);

  // ???????????? ???????????? ??????
  const handleClose = () => {
    handleCloseClick(false);
    setTaskForm(initialTaskstate);
    setEditorState(EditorState.createEmpty());
  };

  // input ??? ?????? ??? taskForm state ????????????
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

  // ????????? source to base64
  const getFileBase64 = (file, callback) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => {};
  };

  // ????????? ?????????
  const uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => getFileBase64(file, (data) => resolve({ data: { link: data } })));
  };

  // ????????? ?????? ?????? ??????
  const addTask = (e) => {
    e.preventDefault();
    const valid = validator.current.allValid();
    if (valid) {
      const rawContentState = convertToRaw(editorState.getCurrentContent());
      const markup = draftToHtml(rawContentState);
      const data = { ...taskForm, description: markup };
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
      {/* <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="md" disableBackdropClick> */}
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
        <form autoComplete="off" onSubmit={addTask}>
          <DialogTitle id="form-dialog-title">
            Add new task
            <div className={classes.labelText}>
              label: &nbsp; <div className={classes.labelDiv} style={{ background: taskForm.labelColor ? taskForm.labelColor : "" }}></div>
              <IconButton aria-label="close" className={`${classes.iconButton} ${classes.labelDeleteIcon}`} onClick={() => onColorStateChange(null)}>
                <Close className={classes.icon} />
              </IconButton>
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
                    minWidth: "890px",
                  }}
                  id="description"
                  name="description"
                  value={taskForm.description}
                  wrapperClassName="wrapper-class"
                  editorClassName="editor"
                  toolbarClassName="toolbar-class"
                  toolbar={{
                    options: ["inline", "fontSize", "list", "textAlign", "colorPicker", "image", "history"],
                    inline: { options: ["bold", "italic", "underline"] },
                    // inDropdown: ?????? ????????? ????????? ????????? ?????????????????? ????????? ?????????
                    list: { inDropdown: true },
                    textAlign: { inDropdown: true },
                    image: { uploadCallback: uploadImageCallBack, previewImage: true },
                    history: { inDropdown: false },
                  }}
                  placeholder="Description"
                  // ????????? ??????
                  localization={{
                    locale: "ko",
                  }}
                  // ????????? ??????
                  editorState={editorState}
                  // ???????????? ?????? ????????? ????????? onEditorStateChange ??????
                  onEditorStateChange={onEditorStateChange}
                />
              </GridContainer>
              <GridContainer>
                <div className={classes.dueDatePickerWrapper}>
                  <br />
                  <span className={classes.labelText}>Due date</span>
                  <DateTimePicker
                    locale="en"
                    format="yyyy-MM-dd HH:mm"
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
          <DialogActions style={{ padding: "8px 30px" }}>
            <Button variant="outlined" onClick={addTask}>
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
