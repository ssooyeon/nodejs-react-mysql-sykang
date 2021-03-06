import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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

import "./style/TextField.css";
import styles from "./style/ScheduleFormStyle";

import { createSchedule } from "actions/schedules";

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

export default function AddScheduleForm({ open, handleCloseClick, date }) {
  const classes = useStyles();
  const alert = useAlert();

  const { user: currentUser } = useSelector((state) => state.auth);

  const initialScheduleState = {
    title: "",
    description: "",
    start: date,
    end: date,
    backgroundColor: colorList[0],
    textColor: null,
    isAllDay: true,
    rrule: "",
    duration: null,
    createrId: currentUser.id,
  };

  const [scheduleForm, setScheduleForm] = useState(initialScheduleState); // ?????????
  const [isRepeat, setIsRepeat] = useState(false); // ?????? ????????? ???????????? ?????? (????????????)
  const [day, setDay] = useState(""); // ????????? ????????? day??? ??????
  const [week, setWeek] = useState(""); // ????????? ????????? ????????? ??????
  const [weekNum, setWeekNum] = useState(""); // ????????? ????????? ??? ?????? ????????? ??????
  const dispatch = useDispatch();

  useEffect(() => {
    setScheduleForm({ ...scheduleForm, start: date, end: date });
    updateRepeatOption(date);
  }, [date]);

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
    setScheduleForm(initialScheduleState);
    setIsRepeat(false);
  };
  // ????????? ?????? ??????
  const handleDone = () => {
    const isDone = true;
    handleCloseClick(false, isDone);
    setScheduleForm(initialScheduleState);
    setIsRepeat(false);
  };

  // input ??? ?????? ??? scheduleForm state ????????????
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm({ ...scheduleForm, [name]: value });
  };
  // all day ???????????? ??????
  const handleAllDayCheckbox = (e) => {
    const checked = e.target.checked;
    setScheduleForm({ ...scheduleForm, isAllDay: checked });
  };
  // repeat ???????????? ??????
  const handleRepeatCheckbox = (e) => {
    const checked = e.target.checked;
    setIsRepeat(checked);
  };
  // ?????? ?????? ??????
  const onStartDateChange = (date) => {
    setScheduleForm({ ...scheduleForm, start: date });
    updateRepeatOption(date);
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
  const addScheduleClick = (e) => {
    e.preventDefault();
    if (scheduleForm.title === "") {
      alert.show("There is no title. Do you want to add 'nonamed' schedule?", {
        title: "",
        closeCopy: "Cancel",
        type: "success",
        actions: [
          {
            copy: "YES",
            onClick: () => addSchedule(),
          },
        ],
      });
    } else {
      addSchedule();
    }
  };

  // ????????? ??????
  const addSchedule = () => {
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
    let dtStart = start; // rrule??? ????????? dtStart ??????

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
      // ?????? ????????? ???????????? ????????? rrule ??????
      if (isRepeat && data.rrule !== null && data.rrule.includes("INPUT_DATE_STR")) {
        rrule = data.rrule.replace("INPUT_DATE_STR", dtStart);
        // duration ??????
        const diffMillisec = Math.abs(end - start);
        const diffHours = diffMillisec / 36e5;
        // 24?????? ????????? ????????? ?????? (days:1??? default)
        if (diffHours > 24) {
          duration = diffHours + ":00";
        }
      }

      data = { ...data, rrule: rrule, duration: duration };
      dispatch(createSchedule(data))
        .then(() => {
          handleDone();
        })
        .catch((e) => {
          console.log(e);
        });
    }
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
        <form autoComplete="off" onSubmit={addScheduleClick}>
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
                      onChange={(e) => handleAllDayCheckbox(e)}
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
                    <Select value={scheduleForm.rrule} onChange={handleRepeatOption} displayEmpty>
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={`DTSTART:INPUT_DATE_STR\nRRULE:FREQ=MONTHLY`}>{`${day} of month`}</MenuItem>
                      <MenuItem value={`DTSTART:INPUT_DATE_STR\nRRULE:FREQ=WEEKLY;BYDAY=${weekAbbr[week]}`}>{`Every ${weekList[week]}`}</MenuItem>
                      {weekNum === -1 ? (
                        <MenuItem value={`DTSTART:INPUT_DATE_STR\nRRULE:FREQ=MONTHLY;BYDAY=-1${weekAbbr[week]}`}>
                          {`last ${weekList[week]} of every week`}
                        </MenuItem>
                      ) : (
                        <MenuItem value={`DTSTART:INPUT_DATE_STR\nRRULE:FREQ=MONTHLY;BYDAY=+${weekNum}${weekAbbr[week]}`}>
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
            <Button variant="outlined" onClick={addScheduleClick}>
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
