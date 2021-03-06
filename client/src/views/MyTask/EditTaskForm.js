import React, { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import SimpleReactValidator from "simple-react-validator";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
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
import { updateTask } from "actions/tasks";

const customStyles = {
  createrLabel: {
    paddingLeft: "10px",
    paddingRight: "10px",
    background: "#b774c3",
    float: "right",
    textAlign: "center",
    borderRadius: "50px",
    color: "#fff",
    fontSize: "15px",
  },
};

const defaultStyles = makeStyles(styles);
const useStyles = makeStyles(customStyles);

export default function EditTaskForm({ open, handleCloseClick, task }) {
  const classes = defaultStyles();
  const customClasses = useStyles();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const [taskForm, setTaskForm] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    setTaskForm({ ...task });
    if (task.description !== undefined) {
      // ???????????? html ?????????
      const blocksFromHtml = htmlToDraft(task.description);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      const data = EditorState.createWithContent(contentState);
      setEditorState(data);
    }
  }, [task]);

  // ???????????? ???????????? ??????
  const handleClose = () => {
    handleCloseClick(false);
    setTaskForm({ ...taskForm, labelColor: null });
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
  const editTask = (e) => {
    e.preventDefault();
    const valid = validator.current.allValid();
    if (valid) {
      const id = task.id.replace("task", "");
      const rawContentState = convertToRaw(editorState.getCurrentContent());
      const markup = draftToHtml(rawContentState);
      const data = { ...taskForm, description: markup, id: id };
      dispatch(updateTask(data.id, data))
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
        <form autoComplete="off" onSubmit={editTask}>
          <DialogTitle id="form-dialog-title">
            Edit Task
            <div className={customClasses.createrLabel}>by @{taskForm.creater ? taskForm.creater.account : "N/A"}</div>
            <div className={classes.labelText}>
              label: &nbsp; <div className={classes.labelDiv} style={{ background: taskForm.labelColor ? taskForm.labelColor : "" }}></div>
              <IconButton aria-label="close" className={`${classes.iconButton} ${classes.labelDeleteIcon}`} onClick={() => onColorStateChange(null)}>
                <Close className={classes.icon} />
              </IconButton>
            </div>
          </DialogTitle>
          <DialogContent className={classes.modalContentWrapper}>
            To Edit a task, enter title and description and click the Submit button.
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
                    defaultValue={taskForm.title}
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
                    margin: "0px",
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
                    value={taskForm.dueDate ? new Date(taskForm.dueDate) : null}
                  />
                </div>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions style={{ padding: "8px 30px" }}>
            <Button variant="outlined" onClick={editTask}>
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
