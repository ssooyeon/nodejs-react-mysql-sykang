import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import { CirclePicker } from "react-color";
import DatePicker from "react-date-picker";
import DateTimePicker from "react-datetime-picker";
import moment from "moment";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { makeStyles } from "@material-ui/core/styles";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import { MenuItem, TextField } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import { Delete } from "@material-ui/icons";

import "./style/TextField.css";
import styles from "./style/ScheduleFormStyle";

import { updateSchedule, deleteSchedule } from "actions/schedules";

const useStyles = makeStyles(styles);

const colorList = [
  "#456C86",
  "#B8A8A2",
  "#546B68",
  "#A2B8A8",
  "#D19C4F",
  "#B89B8F",
  "#7DA0B8",
  "#ea4949",
  "#c3c31f",
  "#1fc31f",
  "#0101c3",
  "#c301c3",
];
const weekList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekAbbr = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const weekOrder = ["1st", "2nd", "3rd", "4th", "5th"];

export default function EditScheduleForm({ open, handleCloseClick, schedule }) {
  const classes = useStyles();
  const alert = useAlert();

  const initialSchedulestate = {
    id: "",
    title: "",
    description: "",
    start: "",
    end: "",
    backgroundColor: "",
    textColor: "",
    isAllDay: false,
    rrule: "",
    duration: null,
    createrId: "",
  };

  const [scheduleForm, setScheduleForm] = useState(initialSchedulestate);
  const [isRepeat, setIsRepeat] = useState(false); // ????????? ???????????? ?????? ???????????? ???????????? ?????? (????????????)
  const [repeatDate, setRepeatDate] = useState(""); // ????????? ????????? string ???????????? ??????, select opion ?????? ???????????? binding?????? ??????
  const [day, setDay] = useState(""); // ????????? ????????? day??? ??????
  const [week, setWeek] = useState(""); // ????????? ????????? ????????? ??????
  const [weekNum, setWeekNum] = useState(""); // ????????? ????????? ??? ?????? ????????? ??????
  const dispatch = useDispatch();

  useEffect(() => {
    // schedule ????????? ????????? ??????????????????
    if (Object.keys(schedule).length > 0) {
      setExistSchedule(schedule);
    }
    setScheduleForm(schedule);
  }, [schedule]);

  // ????????? ????????? ???????????? ????????????, ????????? ?????? ??? ??????
  const setExistSchedule = (schedule) => {
    // select option ??? ??????
    const sdt = new Date(schedule.start);
    updateRepeatOption(sdt);
    // select option ??? ?????? string date (INPUT_DATE_STR) ??????
    if (schedule.isAllDay) {
      setRepeatDate(moment(schedule.start).format("YYYYMMDD"));
    } else {
      setRepeatDate(moment(schedule.start).format("YYYYMMDDTHHmmss"));
    }
    // isRepeat ???????????? ??????
    if (schedule.rrule !== null) {
      setIsRepeat(true);
    } else {
      setIsRepeat(false);
    }
  };

  // ?????? ?????? ??? ?????? ?????? select option ????????????
  const updateRepeatOption = (date) => {
    const day = date.getDate();
    const week = date.getDay();
    let weekNum = Math.ceil((day + 6 - week) / 7);

    // ????????? ????????? weekNum??? -1??? ??????
    let diffDay = new Date(date);
    diffDay.setDate(day + 7);
    if (new Date(diffDay).getMonth() !== date.getMonth()) {
      weekNum = -1;
    }

    setDay(day);
    setWeek(week); // 0: ?????????
    setWeekNum(weekNum);
  };

  // ???????????? ???????????? ??????
  const handleClose = () => {
    handleCloseClick(false);
    setScheduleForm(initialSchedulestate);
  };

  // input ??? ?????? ??? scheduleForm state ????????????
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm({ ...scheduleForm, [name]: value });
  };
  // all day ???????????? ??????
  const handleCheckbox = (e) => {
    setScheduleForm({ ...scheduleForm, isAllDay: e.target.checked });
  };
  // repeat ???????????? ??????
  const handleRepeatCheckbox = (e) => {
    const checked = e.target.checked;
    setIsRepeat(checked);
  };
  // ?????? ?????? ??????
  const onStartDateChange = (date) => {
    setScheduleForm({ ...scheduleForm, start: date });
  };
  // ?????? ?????? ??????
  const onEndDateChange = (date) => {
    setScheduleForm({ ...scheduleForm, end: date });
  };
  // repeat rrule ?????? ??????
  const handleRepeatOption = (e) => {
    setScheduleForm({ ...scheduleForm, rrule: e.target.value });
  };
  // ?????? ??? ??????
  const onBackgroundColorStateChange = (colorState) => {
    setScheduleForm({ ...scheduleForm, backgroundColor: colorState });
  };

  // ????????? ?????? ?????? ??????
  const editScheduleClick = (e) => {
    e.preventDefault();
    if (scheduleForm.title === "") {
      alert.show("There is no title. Do you want to edit 'nonamed' schedule?", {
        title: "",
        closeCopy: "Cancel",
        type: "success",
        actions: [
          {
            copy: "YES",
            onClick: () => editSchedule(),
          },
        ],
      });
    } else {
      editSchedule();
    }
  };

  // ????????? ??????
  const editSchedule = () => {
    let data = scheduleForm;
    let rrule = null;
    let duration = null;
    // ????????? ??????????????? nonamed??? ??????
    if (scheduleForm.title === "") {
      data.title = "nonamed";
    }
    // Repeat ??????????????? ???????????? ????????? NONE??? ???????????? ????????? rrule = null??? ??????
    if (!isRepeat || data.rrule === "") {
      data.rrule = null;
    }

    const start = moment(data.start);
    const end = moment(data.end);
    let dtStart = start; // rrule??? ????????? dtStart option

    // ?????? ?????? ????????? ??????
    if (start > end) {
      alert.show("The end time must be later than the start time.", {
        title: "",
        type: "error",
      });
    } else {
      // all day?????? yyyy-mm-dd??? ??????
      if (scheduleForm.isAllDay) {
        data.start = start.format("YYYY-MM-DD");
        data.end = end.format("YYYY-MM-DD");
        dtStart = start.format("YYYYMMDD");
      } else {
        // all day??? ????????? hh:mm:ss?????? ??????
        data.start = start.format("YYYY-MM-DD HH:mm:ss");
        data.end = end.format("YYYY-MM-DD HH:mm:ss");
        dtStart = start.format("YYYYMMDDTHHmmss");
      }

      // ?????? ????????? ???????????? ??????, ?????? ?????? ??? ?????? O??? ?????? ??? ??????, ????????? O??? ??????
      if (isRepeat && data.rrule !== null && data.rrule !== "") {
        // if (isRepeat && data.rrule !== null) {
        let rruleArr = data.rrule.split("\n");
        rrule = "DTSTART:" + dtStart + "\n" + rruleArr[1];
        // duration ??????
        const diffMillisec = Math.abs(end - start);
        const diffHours = diffMillisec / 36e5;
        // 24?????? ????????? ????????? ?????? (days:1??? default)
        if (diffHours > 24) {
          duration = diffHours + ":00";
        }
      }
      data = { ...data, rrule: rrule, duration: duration };

      dispatch(updateSchedule(data.id, data))
        .then(() => {
          handleClose();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  // ????????? ?????? ?????? ??????
  const removeScheduleClick = (e) => {
    e.preventDefault();
    alert.show("Are you sure delete this schedule?", {
      title: "",
      closeCopy: "Cancel",
      type: "success",
      actions: [
        {
          copy: "YES",
          onClick: () => removeSchedule(),
        },
      ],
    });
  };

  // ????????? ??????
  const removeSchedule = () => {
    dispatch(deleteSchedule(scheduleForm.id))
      .then(() => {
        handleClose();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      {/* <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md" disableBackdropClick> */}
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
        <form autoComplete="off" onSubmit={editScheduleClick}>
          <DialogTitle id="form-dialog-title">Edit schedule</DialogTitle>
          <DialogContent className={classes.modalContentWrapper}>
            To edit schedule, enter title and description and click the Submit button.
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
              {/* <GridContainer>
                <br />
                <FormControl variant="outlined" className={classes.formControl}>
                  <Select
                    native
                    value={submitOption}
                    onChange={handleSubmitOption}
                    label=""
                    inputProps={{
                      name: "update-repeat",
                      id: "outlined-update-repeat-select",
                    }}
                  >
                    <option value="single">Update this schedule only</option>
                    <option value="multi">Update all recurring schedules</option>
                  </Select>
                </FormControl>
              </GridContainer> */}
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
              {scheduleForm.isAllDay ? (
                <>
                  <GridContainer>
                    <div className={classes.dateWrapper}>
                      <span className={classes.labelText}>Start date</span>
                      <DatePicker
                        locale="en"
                        format="yyyy-MM-dd"
                        dayPlaceholder="dd"
                        monthPlaceholder="MM"
                        yearPlaceholder="yyyy"
                        className={classes.scheduleDatePicker}
                        clearIcon={null}
                        onChange={onStartDateChange}
                        value={scheduleForm.start ? new Date(scheduleForm.start) : null}
                      />
                    </div>
                    &nbsp;&nbsp; &nbsp;&nbsp;
                    <div className={classes.dateWrapper}>
                      <span className={classes.labelText}>End date</span>
                      <DatePicker
                        locale="en"
                        format="yyyy-MM-dd"
                        dayPlaceholder="dd"
                        monthPlaceholder="MM"
                        yearPlaceholder="yyyy"
                        className={classes.scheduleDatePicker}
                        clearIcon={null}
                        onChange={onEndDateChange}
                        value={scheduleForm.end ? new Date(scheduleForm.end) : null}
                      />
                    </div>
                  </GridContainer>
                </>
              ) : (
                <>
                  <GridContainer>
                    <div className={classes.dateWrapper}>
                      <span className={classes.labelText}>Start date</span>
                      <DateTimePicker
                        locale="en"
                        format="yyyy-MM-dd HH:mm"
                        minutePlaceholder="mm"
                        hourPlaceholder="hh"
                        dayPlaceholder="dd"
                        monthPlaceholder="MM"
                        yearPlaceholder="yyyy"
                        className={classes.scheduleDatePicker}
                        clearIcon={null}
                        onChange={onStartDateChange}
                        value={scheduleForm.start ? new Date(scheduleForm.start) : null}
                      />
                    </div>
                    &nbsp;&nbsp; &nbsp;&nbsp;
                    <div className={classes.dateWrapper}>
                      <span className={classes.labelText}>End date</span>
                      <DateTimePicker
                        locale="en"
                        format="yyyy-MM-dd HH:mm"
                        minutePlaceholder="mm"
                        hourPlaceholder="hh"
                        dayPlaceholder="dd"
                        monthPlaceholder="MM"
                        yearPlaceholder="yyyy"
                        className={classes.scheduleDatePicker}
                        clearIcon={null}
                        onChange={onEndDateChange}
                        value={scheduleForm.end ? new Date(scheduleForm.end) : null}
                      />
                    </div>
                  </GridContainer>
                </>
              )}
              <GridContainer>
                <FormControlLabel
                  style={{ marginRight: "-5px", color: "#000" }}
                  label="Repeat"
                  control={
                    <Checkbox
                      checked={isRepeat}
                      onChange={(e) => handleRepeatCheckbox(e)}
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                    />
                  }
                />
              </GridContainer>
              {isRepeat ? (
                <GridContainer>
                  <FormControl variant="outlined" className={classes.formControl}>
                    <Select value={scheduleForm.rrule || ""} onChange={handleRepeatOption} displayEmpty>
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={`DTSTART:${repeatDate}\nRRULE:FREQ=MONTHLY`}>{`${day} of month`}</MenuItem>
                      <MenuItem value={`DTSTART:${repeatDate}\nRRULE:FREQ=WEEKLY;BYDAY=${weekAbbr[week]}`}>{`Every ${weekList[week]}`}</MenuItem>
                      {weekNum === -1 ? (
                        <MenuItem value={`DTSTART:${repeatDate}\nRRULE:FREQ=MONTHLY;BYDAY=-1${weekAbbr[week]}`}>
                          {`last ${weekList[week]} of every week`}
                        </MenuItem>
                      ) : (
                        <MenuItem value={`DTSTART:${repeatDate}\nRRULE:FREQ=MONTHLY;BYDAY=+${weekNum}${weekAbbr[week]}`}>
                          {`${weekOrder[weekNum - 1]} ${weekList[week]} of every week`}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </GridContainer>
              ) : null}
              <GridContainer>
                <div className={classes.inputWrapper}>
                  <br />
                  <span className={classes.labelText}>
                    Background color: &nbsp;
                    <div className={classes.labelDiv} style={{ background: scheduleForm.backgroundColor ? scheduleForm.backgroundColor : "" }}></div>
                  </span>
                  <CirclePicker
                    className={classes.colorPicker}
                    colors={colorList}
                    circleSize={25}
                    onChangeComplete={(colore) => onBackgroundColorStateChange(colore.hex)}
                  />
                </div>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions style={{ padding: "8px 40px" }}>
            <Button variant="outlined" onClick={removeScheduleClick}>
              <Delete />
              Remove
            </Button>
            <Button variant="outlined" onClick={editScheduleClick}>
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
