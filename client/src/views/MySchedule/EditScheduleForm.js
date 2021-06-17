import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { CirclePicker } from "react-color";
import DateTimePicker from "react-datetime-picker";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { makeStyles } from "@material-ui/core/styles";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "components/CustomButtons/Button";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import { TextField } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import { Delete } from "@material-ui/icons";

import "./style/TextField.css";

import styles from "./style/ScheduleFormStyle";

import { retrieveSchedule, updateSchedule, deleteSchedule } from "actions/schedules";

const useStyles = makeStyles(styles);

export default function EditScheduleForm({ open, handleCloseClick, schedule }) {
  const classes = useStyles();

  const initialSchedulestate = {
    title: schedule.title,
    description: "",
    start: "",
    end: "",
    backgroundColor: "",
    textColor: "",
    isAllDay: false,
    createrId: "",
  };

  const [scheduleForm, setScheduleForm] = useState(initialSchedulestate);
  const dispatch = useDispatch();

  useEffect(() => {
    setScheduleForm(schedule);
    // dispatch(retrieveSchedule(scheduleId))
    //   .then((res) => {
    //     setScheduleForm(res);
    //   })
    //   .catch((e) => {
    //     console.log(e);
    //   });
  }, [schedule]);

  // 부모에게 완료사항 전달
  const handleClose = () => {
    handleCloseClick(false);
    setScheduleForm(initialSchedulestate);
  };

  // input 값 변경 시 scheduleForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm({ ...scheduleForm, [name]: value });
  };
  // all day 체크박스 클릭
  const handleCheckbox = (e) => {
    setScheduleForm({ ...scheduleForm, isAllDay: e.target.checked });
  };
  // 시작 시간 변경
  const onStartDateChange = (date) => {
    setScheduleForm({ ...scheduleForm, start: date });
  };
  // 종료 시간 변경
  const onEndDateChange = (date) => {
    setScheduleForm({ ...scheduleForm, end: date });
  };
  // 배경 색 변경
  const onBackgroundColorStateChange = (colorState) => {
    setScheduleForm({ ...scheduleForm, backgroundColor: colorState });
  };

  // 스케줄 삭제 버튼 클릭
  const removeSchedule = (e) => {
    e.preventDefault();
  };

  // 스케줄 수정 버튼 클릭
  const editSchedule = (e) => {
    e.preventDefault();
    console.log(scheduleForm);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md" disableBackdropClick>
        <form autoComplete="off" onSubmit={editSchedule}>
          <DialogTitle id="form-dialog-title">Add new schedule</DialogTitle>
          <DialogContent className={classes.modalContentWrapper}>
            To add a new schedule, enter title and description and click the Submit button.
            <CardBody>
              <GridContainer>
                <div className={classes.inputWrapper}>
                  <span className={classes.labelText}>Title</span>
                  <TextField
                    name="title"
                    variant="outlined"
                    className={classes.inputText}
                    defaultValue={scheduleForm.title}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
              </GridContainer>
              <GridContainer>
                <div className={classes.inputWrapper}>
                  <br />
                  <span className={classes.labelText}>Description</span>
                  <TextField
                    name="description"
                    variant="outlined"
                    multiline
                    className={classes.inputText}
                    rows={2}
                    defaultValue={scheduleForm.description}
                    onChange={handleInputChange}
                  />
                </div>
              </GridContainer>
              <GridContainer>
                <FormControlLabel
                  style={{ marginRight: "-5px", color: "#000" }}
                  label="All day"
                  control={
                    <Checkbox
                      checked={scheduleForm.isAllDay}
                      onChange={(e) => handleCheckbox(e)}
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                    />
                  }
                />
              </GridContainer>
              {!scheduleForm.isAllDay ? (
                <>
                  <GridContainer>
                    <div className={classes.inputWrapper}>
                      <br />
                      <span className={classes.labelText}>Start date</span>
                      <DateTimePicker
                        locale="en"
                        format="yyyy-MM-dd h:mm a"
                        minutePlaceholder="mm"
                        hourPlaceholder="hh"
                        dayPlaceholder="dd"
                        monthPlaceholder="MM"
                        yearPlaceholder="yyyy"
                        className={classes.dueDatePicker}
                        onChange={onStartDateChange}
                        value={scheduleForm.start}
                      />
                    </div>
                  </GridContainer>
                  <GridContainer>
                    <div className={classes.inputWrapper}>
                      <br />
                      <span className={classes.labelText}>End date</span>
                      <DateTimePicker
                        locale="en"
                        format="yyyy-MM-dd h:mm a"
                        minutePlaceholder="mm"
                        hourPlaceholder="hh"
                        dayPlaceholder="dd"
                        monthPlaceholder="MM"
                        yearPlaceholder="yyyy"
                        className={classes.dueDatePicker}
                        onChange={onEndDateChange}
                        value={scheduleForm.end}
                      />
                    </div>
                  </GridContainer>
                </>
              ) : null}

              <GridContainer>
                <div className={classes.inputWrapper}>
                  <span className={classes.labelText}>
                    Background color: &nbsp;
                    <div className={classes.labelDiv} style={{ background: scheduleForm.backgroundColor ? scheduleForm.backgroundColor : "" }}></div>
                  </span>
                  <CirclePicker
                    className={classes.colorPicker}
                    colors={["red", "orange", "yellow", "green", "blue", "navy", "purple", "grey"]}
                    circleSize={25}
                    onChangeComplete={(colore) => onBackgroundColorStateChange(colore.hex)}
                  />
                </div>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions>
            <Button color="danger" justIcon className={classes.deleteIconButton} onClick={removeSchedule}>
              <Delete />
            </Button>
            <Button onClick={editSchedule} color="primary">
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
