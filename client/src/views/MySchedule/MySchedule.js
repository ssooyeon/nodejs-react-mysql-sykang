import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import { makeStyles } from "@material-ui/core/styles";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import rrulePlugin from "@fullcalendar/rrule";
import { FormControlLabel, MenuItem } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Button from "@material-ui/core/Button";

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";

import "./style/CustomCalendar.css";

import AddScheduleForm from "./AddScheduleForm";
import EditScheduleForm from "./EditScheduleForm";

import { retrieveSchedules, updateSchedule } from "actions/schedules";
import { retrieveGroups } from "actions/groups";
import ScheduleService from "services/ScheduleService";

const styles = {
  formControl: {
    width: "100%",
    paddingRight: "10px",
  },
  repeat: {
    background: "#fff",
  },
};
const useStyles = makeStyles(styles);

const weekAbbr = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const groupInitState = {
  id: "",
  name: "",
  description: "",
  users: [],
};

export default function MySchedule() {
  const classes = useStyles();

  const { user: currentUser } = useSelector((state) => state.auth);
  const schedules = useSelector((state) => state.schedules || []);
  const groups = useSelector((state) => state.groups || []);
  const dispatch = useDispatch();

  const [clickedDate, setClickedDate] = useState(new Date());
  const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false); // ????????? ?????? ?????? ??????
  const [editScheduleModalOpen, setEditScheduleModalOpen] = useState(false); // ????????? ?????? ?????? ??????
  const [editSchedule, setEditSchedule] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(groupInitState); // ????????? ?????? ??????
  const [selectedUserIds, setSelectedUserIds] = useState([]); // ????????? ???????????? ????????? ????????? ????????? ????????? (viewMode: users)
  const [selectedGroupIds, setSelectedGroupIds] = useState([]); // ????????? ?????? ????????? ????????? (viewModel: groups)

  const [viewMode, setViewMode] = useState("users"); // ?????? ??? ???????????? ????????? ??? ??????????????? ??????

  useEffect(() => {
    dispatch(retrieveGroups());
  }, [dispatch]);

  useEffect(() => {
    if (groups.length > 0) {
      loadCurrentUserSchedule(viewMode);
    }
  }, [groups]);

  // viewMode==users??? ??? current user??? group??? ???????????? ???????????? ??????
  const loadCurrentUserSchedule = (mode) => {
    const currentGroupId = currentUser.groupId;
    if (mode === "groups") {
      setSelectedGroupIds([currentUser.groupId]);
    }
    const currentGroup = groups.find((x) => x.id === currentGroupId);
    setSelectedGroup(currentGroup);
    const selectUserIds = currentGroup.users.map((obj) => obj.id);
    setSelectedUserIds(selectUserIds);
    searchSchedule(selectUserIds, currentGroup);
  };

  /**************************************************** */
  /**********************?????? ??????********************** */
  /**************************************************** */
  // toggle button ??????
  const handleToggle = (e, newMode) => {
    setViewMode(newMode);
    setSelectedGroupIds([]);
    setSelectedUserIds([]);
    loadCurrentUserSchedule(newMode);
  };

  // viewMode=users?????? ?????? select option ??????
  const handleGroupSelectChange = (e) => {
    const selectId = e.target.value;
    // if All group
    if (selectId === "") {
      setSelectedGroup(groupInitState); // groupInitState??? id??? ""????????? searchSchedule?????? ?????? ????????? ??????
      setSelectedUserIds([]);
    } else {
      // ????????? ?????? setSeletedGroup??? ??????
      const selectGroup = groups.find((x) => x.id === selectId);
      setSelectedGroup(selectGroup);
      // ?????? ?????? ??? ??????????????? ?????? ?????? ?????? ?????? ??????
      const selectUserIds = selectGroup.users && selectGroup.users.map((obj) => obj.id);
      setSelectedUserIds(selectUserIds);
    }
  };

  // viewMode=users?????? ????????? ?????? ???????????? ??????
  const handleUserAllCheckbox = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const selectUserIds = selectedGroup.users && selectedGroup.users.map((obj) => obj.id);
      setSelectedUserIds(selectUserIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  // viewMode=groups?????? ?????? ?????? ???????????? ??????
  const handleGroupAllCheckbox = (e) => {
    const checked = e.target.checked;
    if (checked) {
      // group all??? ???????????? ????????? ?????? ????????? ?????? ???????????? setSelectedUserIds??? ??????
      const selectedGroupIds = groups.map((obj) => obj.id);
      setSelectedGroupIds(selectedGroupIds);
      let userIdArr = [];
      for (let idx in groups) {
        const users = groups[idx].users;
        const userIds = users.map((obj) => obj.id);
        userIdArr = [...userIdArr, ...userIds];
      }
      setSelectedUserIds(userIdArr);
    } else {
      setSelectedGroupIds([]);
      setSelectedUserIds([]);
    }
  };

  // viewMode=users?????? ????????? ???????????? ??????
  const handleUserCheckbox = (e) => {
    const checkedId = parseInt(e.target.value);
    const checked = e.target.checked;
    if (checked) {
      // checkbox??? ?????????????????? userIds??? ??????
      setSelectedUserIds([...selectedUserIds, checkedId]);
    } else {
      // checkbox??? ?????????????????? userIds?????? ??????
      setSelectedUserIds(selectedUserIds.filter((id) => id !== checkedId));
    }
  };

  // viewMode=groups?????? ?????? ???????????? ??????
  const handleGroupCheckbox = (e) => {
    const checkedId = parseInt(e.target.value);
    const checked = e.target.checked;

    const checkedGroup = groups.find((x) => x.id === checkedId);
    const users = checkedGroup.users;
    const userIds = users.map((obj) => obj.id);
    if (checked) {
      setSelectedGroupIds([...selectedGroupIds, checkedId]);
      // checkbox??? ?????????????????? ????????? ????????? user?????? selectedUserIds??? ??????
      setSelectedUserIds([...selectedUserIds, ...userIds]);
    } else {
      setSelectedGroupIds(selectedGroupIds.filter((id) => id !== checkedId));
      // checkbox??? ?????????????????? ????????? ????????? user?????? selectedUserIds?????? ????????? ??????
      setSelectedUserIds(selectedUserIds.filter((x) => userIds.indexOf(x) < 0));
    }
  };

  // viewMode=users?????? ????????? ???????????? ?????? ????????? ?????? ?????????
  const searchSchedule = (users, groups) => {
    let idParam = users.join(",");
    // All group??? ???????????? ?????? ?????? ?????? ???????????? ??????
    if (viewMode === "users" && groups.id === "") {
      dispatch(retrieveSchedules());
    } else {
      // ????????? ???????????? ?????? ??????
      if (idParam === "") {
        idParam = "[]";
      }
      const params = {
        userIdsStr: idParam,
      };
      dispatch(retrieveSchedules(params));
    }
  };

  /**************************************************** */
  /*******************????????? ?????? ??????****************** */
  /**************************************************** */
  // ?????? ?????? ??? ?????? ????????? ?????? ?????? ??????
  const handleDateSelect = (e) => {
    setClickedDate(e.start);
    setAddScheduleModalOpen(true);
  };

  // ????????? ?????? ??? ????????? ?????? ?????? ??????
  const handleEventClick = (e) => {
    // ????????? ???????????? creater??? current user??? ?????? ?????? ?????? ?????? ??????
    const createrId = e.event.extendedProps.createrId;
    if (createrId === currentUser.id) {
      ScheduleService.get(e.event.id)
        .then((res) => {
          setEditSchedule(res.data);
          setEditScheduleModalOpen(true);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  // ????????? ?????? ?????? ??? ?????? ??????
  const handleEventAdd = (e) => {
    console.log("add");
  };

  // ????????? drag ??? resize ??? ?????? ??????
  const handleEventChange = (e) => {
    let data = {};
    let rrule = null;
    let duration = null;

    const id = e.event.id;
    const allDay = e.event.allDay;
    let eStart = e.event.start;
    let eEnd = e.event.end;
    // 1?????? ????????? ????????? ?????? ????????? ???????????? end??? null??? ????????? end??? start??? ????????? ??????
    if (eEnd === null) {
      eEnd = eStart;
    }
    let dtStart = eStart; // rrule??? ????????? dtStart

    if (allDay) {
      data.start = moment(eStart).format("YYYY-MM-DD");
      data.end = moment(eEnd).format("YYYY-MM-DD");
      dtStart = moment(eStart).format("YYYYMMDD");
    } else {
      data.start = moment(eStart).format("YYYY-MM-DD HH:mm:ss");
      data.end = moment(eEnd).format("YYYY-MM-DD HH:mm:ss");
      dtStart = moment(eStart).format("YYYYMMDDTHHmmss");
    }

    // recurring event??????
    if (e.event._def.recurringDef !== null) {
      const eRrule = e.event._def.recurringDef.typeData.rruleSet.toString(); // ?????? rrule

      if (eRrule !== null) {
        const day = eStart.getDate();
        const week = eStart.getDay(); // MO, TU, WE, ...
        let weekNum = Math.ceil((day + 6 - week) / 7); // -1(last), 1, 2, ...

        // ????????? ????????? weekNum??? -1??? ??????
        let diffDay = new Date(eStart);
        diffDay.setDate(day + 7);
        if (new Date(diffDay).getMonth() !== eStart.getMonth()) {
          weekNum = -1;
        }

        // duration ??????
        const diffMillisec = Math.abs(eEnd - eStart);
        const diffHours = diffMillisec / 36e5;
        // 24?????? ????????? ????????? ?????? (days:1??? default)
        if (diffHours > 24) {
          duration = diffHours + ":00";
        }

        const eRruleArr = eRrule.split("\n");
        const freq = eRruleArr[1];

        // ?????? O?????? O??????
        if (freq.includes("MONTHLY") && freq.includes("BYDAY")) {
          let byday = "+" + weekNum;
          if (weekNum === -1) {
            byday = weekNum;
          }
          rrule = `DTSTART:${dtStart}\nRRULE:FREQ=MONTHLY;BYDAY=${byday}${weekAbbr[week]}`;
        }
        // ?????? O??????
        else if (freq.includes("WEEKLY")) {
          rrule = `DTSTART:${dtStart}\nRRULE:FREQ=WEEKLY;BYDAY=${weekAbbr[week]}`;
        }
        // ?????? O???
        else {
          rrule = `DTSTART:${dtStart}\nRRULE:FREQ=MONTHLY`;
        }
      }
    }

    data = { ...data, id: id, allDay: allDay, rrule: rrule, duration: duration };
    dispatch(updateSchedule(data.id, data))
      .then(() => {
        searchSchedule(selectedUserIds, selectedGroup);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ????????? ?????? ??? ?????? ??????
  const handleEventRemove = (e) => {
    console.log("remove");
  };

  // ????????? ????????? ??? ?????? ??????
  const handleEventContent = (e) => {
    const calMode = e.view.type;

    if (calMode === "dayGridMonth") {
      const timeText = e.timeText;
      const creater = e.event.extendedProps.creater;
      // viewMode??? ?????? ????????? ?????? ????????? ????????? ??????
      let text = "";
      if (viewMode === "users") {
        if (creater !== undefined) {
          text = creater.account;
        } else {
          text = currentUser.account;
        }
      } else if (viewMode === "groups") {
        const currentGroup = groups.find((x) => x.id === creater.groupId);
        text = currentGroup.name;
      }

      // ?????? ????????? ?????? ????????? ??????
      const recurringDef = e.event._def.recurringDef;
      let repeatHtml = "";
      if (recurringDef !== null) {
        const rrule = recurringDef.typeData.rruleSet.toString();
        if (rrule !== null) {
          repeatHtml = "<i class='fa fa-repeat'></i>&nbsp;";
        }
      }

      let html = "";
      // all day ???????????? ?????? ????????? + ?????????(account or group name)
      if (timeText === "") {
        html =
          "<div class='fc-event-time'>" +
          timeText +
          "</div>" +
          "<div class='fc-event-title'>" +
          repeatHtml +
          e.event.title +
          "</div>" +
          "<div style='font-size:11px;float:right;margin-right:3px;font-style:italic;'>" +
          text +
          "</div>";
      }
      // ?????? ????????? ?????? ???????????? ?????? ?????? + ?????? ????????? + ?????? + ?????????(account or group name)
      else {
        html =
          "<div class='fc-daygrid-event-dot' style='border-color: " +
          e.event.backgroundColor +
          ";'></div>" +
          repeatHtml +
          "<div class='fc-event-time'>" +
          timeText +
          "</div>" +
          "<div class='fc-event-title'>" +
          e.event.title +
          "</div>" +
          "<div style='font-size:11px;float:right;margin-right:3px;font-style:italic;'>" +
          text +
          "</div>";
      }
      return {
        html: html,
      };
    }
  };

  // drop ??? resize ?????? ??????
  const handleEventAllow = (dropInfo, draggedEvent) => {
    // ????????? ???????????? creater??? current user??? ?????? ?????? drag ??? resize ?????? ?????????
    const createrId = draggedEvent.extendedProps.createrId;
    if (createrId !== currentUser.id) {
      return false;
    } else {
      return true;
    }
  };

  // ????????? ?????? ?????? ?????? ??? AddScheduleForm.js ?????? ?????? ?????? ??????
  const handleAddScheduleModalClick = (value, isDone) => {
    setAddScheduleModalOpen(value);
    // ????????? ?????? ????????? ???????????????, ????????? ???????????? current user??? ????????? ????????? current user??? group??? ???????????? ??????
    if (isDone && selectedUserIds.find((x) => x !== currentUser.id)) {
      loadCurrentUserSchedule(viewMode);
    }
  };

  // ????????? ?????? ?????? ?????? ??? EditScheduleForm.js ?????? ?????? ?????? ??????
  const handleEditScheduleModalClick = (value) => {
    setEditScheduleModalOpen(value);
  };

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={1}>
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={handleToggle} aria-label="text alignment" style={{ height: "34px" }}>
            <ToggleButton value="users" aria-label="left aligned">
              <p>Users</p>
            </ToggleButton>
            <ToggleButton value="groups" aria-label="centered">
              <p>Groups</p>
            </ToggleButton>
          </ToggleButtonGroup>
        </GridItem>
        {viewMode === "users" ? (
          <>
            <GridItem xs={12} sm={12} md={2}>
              <FormControl variant="outlined" className={classes.formControl}>
                <Select id="group-select-helper" value={selectedGroup.id || ""} onChange={handleGroupSelectChange} displayEmpty>
                  <MenuItem value="">All</MenuItem>
                  {groups &&
                    groups.map((item, index) => {
                      return (
                        <MenuItem value={item.id} key={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </GridItem>
            <GridItem xs={12} sm={12} md={9}>
              {selectedGroup.users.length > 0 ? (
                <FormControlLabel
                  value=""
                  style={{ marginRight: "10px", color: "#000" }}
                  label="All"
                  control={
                    <Checkbox
                      checked={selectedUserIds.length === selectedGroup.users.length} // ????????? user?????? check??? user?????? ????????? check
                      onChange={(e) => handleUserAllCheckbox(e)}
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                    />
                  }
                />
              ) : null}

              {selectedGroup.users &&
                selectedGroup.users.map((item, index) => {
                  return (
                    <FormControlLabel
                      key={item.id}
                      value={item.id}
                      style={{ marginRight: "10px", color: "#000" }}
                      label={item.account}
                      control={
                        <Checkbox
                          checked={selectedUserIds.includes(item.id)}
                          onChange={(e) => handleUserCheckbox(e)}
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                        />
                      }
                    />
                  );
                })}
              <Button variant="outlined" onClick={() => searchSchedule(selectedUserIds, selectedGroup)}>
                Load
              </Button>
            </GridItem>
          </>
        ) : (
          <>
            <GridItem xs={12} sm={12} md={8}>
              <FormControlLabel
                value=""
                style={{ marginRight: "10px", color: "#000" }}
                label="All"
                control={
                  <Checkbox
                    checked={selectedGroupIds.length === groups.length} // ????????? group?????? check??? group ????????? check
                    onChange={(e) => handleGroupAllCheckbox(e)}
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                  />
                }
              />
              {groups &&
                groups.map((item, index) => {
                  return (
                    <FormControlLabel
                      key={item.id}
                      value={item.id}
                      style={{ marginRight: "10px", color: "#000" }}
                      label={item.name}
                      control={
                        <Checkbox
                          checked={selectedGroupIds.includes(item.id)}
                          onChange={(e) => handleGroupCheckbox(e)}
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                        />
                      }
                    />
                  );
                })}
              <Button variant="outlined" onClick={() => searchSchedule(selectedUserIds, selectedGroup)}>
                Load
              </Button>
            </GridItem>
          </>
        )}
      </GridContainer>
      <hr />
      <br />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <FullCalendar
            plugins={[dayGridPlugin, rrulePlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            fixedWeekCount={false}
            select={handleDateSelect}
            events={schedules}
            eventClick={handleEventClick}
            eventAdd={handleEventAdd}
            eventChange={handleEventChange} // called for drag-n-drop/resize
            eventRemove={handleEventRemove}
            eventContent={handleEventContent}
            eventAllow={handleEventAllow}
          />
        </GridItem>
      </GridContainer>

      <AddScheduleForm open={addScheduleModalOpen} handleCloseClick={handleAddScheduleModalClick} date={clickedDate} />
      <EditScheduleForm open={editScheduleModalOpen} handleCloseClick={handleEditScheduleModalClick} schedule={editSchedule} />
    </>
  );
}
