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

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";
import Button from "components/CustomButtons/Button";

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
  const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false); // 스케줄 생성 모달 오픈
  const [editScheduleModalOpen, setEditScheduleModalOpen] = useState(false); // 스케줄 수정 모달 오픈
  const [editSchedule, setEditSchedule] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(groupInitState);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    dispatch(retrieveGroups());
  }, [dispatch]);

  useEffect(() => {
    if (groups.length > 0) {
      const currentGroupId = currentUser.groupId;
      const currentGroup = groups.find((x) => x.id === currentGroupId);
      setSelectedGroup(currentGroup);
      const selectUserIds = currentGroup.users.map((obj) => obj.id);
      setSelectedUserIds(selectUserIds);

      searchSchedule(selectUserIds, currentGroup);
    }
  }, [groups]);

  // 날짜 클릭 시 신규 스케줄 추가 팝업 오픈
  const handleDateSelect = (e) => {
    setClickedDate(e.start);
    setAddScheduleModalOpen(true);
  };

  // 스케줄 클릭 시 스케줄 수정 팝업 오픈
  const handleEventClick = (e) => {
    ScheduleService.get(e.event.id)
      .then((res) => {
        setEditSchedule(res.data);
        setEditScheduleModalOpen(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 스케줄 신규 추가 후 콜백 함수
  const handleEventAdd = (e) => {
    console.log("add");
  };

  // 스케줄 drag 및 resize 후 콜백 함수
  const handleEventChange = (e) => {
    let data = {};
    let rrule = null;
    let duration = null;

    const id = e.event.id;
    const allDay = e.event.allDay;
    let eStart = e.event.start;
    let eEnd = e.event.end;
    // 1개의 칸에서 최초로 다른 칸으로 움직이면 end가 null이 되므로 end를 start와 똑같이 설정
    if (eEnd === null) {
      eEnd = eStart;
    }
    let dtStart = eStart; // rrule에 삽입할 dtStart

    if (allDay) {
      data.start = moment(eStart).format("YYYY-MM-DD");
      data.end = moment(eEnd).format("YYYY-MM-DD");
      dtStart = moment(eStart).format("YYYYMMDD");
    } else {
      data.start = moment(eStart).format("YYYY-MM-DD HH:mm:ss");
      data.end = moment(eEnd).format("YYYY-MM-DD HH:mm:ss");
      dtStart = moment(eStart).format("YYYYMMDDTHHmmss");
    }

    // recurring event이면
    if (e.event._def.recurringDef !== null) {
      const eRrule = e.event._def.recurringDef.typeData.rruleSet.toString(); // 기존 rrule

      if (eRrule !== null) {
        const day = eStart.getDate();
        const week = eStart.getDay(); // MO, TU, WE, ...
        let weekNum = Math.ceil((day + 6 - week) / 7); // -1(last), 1, 2, ...

        // 마지막 주이면 weekNum을 -1로 설정
        let diffDay = new Date(eStart);
        diffDay.setDate(day + 7);
        if (new Date(diffDay).getMonth() !== eStart.getMonth()) {
          weekNum = -1;
        }

        // duration 설정
        const diffMillisec = Math.abs(eEnd - eStart);
        const diffHours = diffMillisec / 36e5;
        // 24시간 이상일 경우만 설정 (days:1이 default)
        if (diffHours > 24) {
          duration = diffHours + ":00";
        }

        const eRruleArr = eRrule.split("\n");
        const freq = eRruleArr[1];

        // 매달 O번째 O요일
        if (freq.includes("MONTHLY") && freq.includes("BYDAY")) {
          let byday = "+" + weekNum;
          if (weekNum === -1) {
            byday = weekNum;
          }
          rrule = `DTSTART:${dtStart}\nRRULE:FREQ=MONTHLY;BYDAY=${byday}${weekAbbr[week]}`;
        }
        // 매주 O요일
        else if (freq.includes("WEEKLY")) {
          rrule = `DTSTART:${dtStart}\nRRULE:FREQ=WEEKLY;BYDAY=${weekAbbr[week]}`;
        }
        // 매달 O일
        else {
          rrule = `DTSTART:${dtStart}\nRRULE:FREQ=MONTHLY`;
        }
      }
    }

    data = { ...data, id: id, allDay: allDay, rrule: rrule, duration: duration };
    dispatch(updateSchedule(data.id, data))
      .then(() => {
        dispatch(retrieveSchedules());
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 스케줄 삭제 후 콜백 함수
  const handleEventRemove = (e) => {
    console.log("remove");
  };

  // 스케줄 랜더링 전 호출 함수
  const handleEventContent = (e) => {
    const viewMode = e.view.type;
    if (viewMode === "dayGridMonth") {
      const creater = e.event.extendedProps.creater;
      let account = "";
      // 신규 event 추가 시 creater 항목이 없으므로 currentUser로 대체
      if (creater !== undefined) {
        account = creater.account;
      } else {
        account = currentUser.account;
      }
      const timeText = e.timeText;

      const recurringDef = e.event._def.recurringDef;
      let repeatHtml = "";
      if (recurringDef !== null) {
        const rrule = recurringDef.typeData.rruleSet.toString();
        if (rrule !== null) {
          repeatHtml = "<i class='fa fa-repeat'></i>&nbsp;";
        }
      }

      let html = "";
      // all day 일정이면
      if (timeText === "") {
        html =
          "<div class='fc-event-time'>" +
          timeText +
          "</div>" +
          "<div class='fc-event-title'>" +
          repeatHtml +
          e.event.title +
          "</div>" +
          "<div style='font-size:11px;font-style:italic;float:right;margin-right:3px;'>" +
          account +
          "</div>";
      }
      // 시간 범위가 있는 일정이면
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
          "<div style='font-size:11px;font-style:italic;float:right;margin-right:3px;'>" +
          account +
          "</div>";
      }
      return {
        html: html,
      };
    }
  };

  // 스케줄 등록 버튼 클릭 및 AddScheduleForm.js 에서 닫기 버튼 클릭
  const handleAddScheduleModalClick = (value) => {
    setAddScheduleModalOpen(value);
  };

  // 스케줄 수정 버튼 클릭 및 EditScheduleForm.js 에서 닫기 버튼 클릭
  const handleEditScheduleModalClick = (value) => {
    setEditScheduleModalOpen(value);
  };

  // 그룹 select option 변경
  const handleGroupSelectChange = (e) => {
    const selectId = e.target.value;
    // if All group
    if (selectId === "") {
      setSelectedGroup(groupInitState);
      setSelectedUserIds([]);
    } else {
      const selectGroup = groups.find((x) => x.id === selectId);
      setSelectedGroup(selectGroup);
      // 그룹 변경 시 기본적으로 해당 그룹 멤버 전체 선택
      const selectUserIds = selectGroup.users && selectGroup.users.map((obj) => obj.id);
      setSelectedUserIds(selectUserIds);
    }
  };

  // 사용자 전체 체크박스 클릭
  const handleUserAllCheckbox = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const selectUserIds = selectedGroup.users && selectedGroup.users.map((obj) => obj.id);
      setSelectedUserIds(selectUserIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  // 사용자 체크박스 클릭
  const handleUserCheckbox = (e) => {
    const checkedId = parseInt(e.target.value);
    const checked = e.target.checked;
    if (checked) {
      // checkbox가 체크되었으면 userIds에 추가
      setSelectedUserIds([...selectedUserIds, checkedId]);
    } else {
      // checkbox가 해제되었으면 userIds에서 삭제
      setSelectedUserIds(selectedUserIds.filter((id) => id !== checkedId));
    }
  };

  // 선택한 사용자에 따른 스케줄 목록 재조회
  const searchSchedule = (users, groups) => {
    let idParam = users.join(",");
    // All group이 선택되어 있는 경우 모든 스케줄을 표출
    if (groups.id === "") {
      dispatch(retrieveSchedules());
    } else {
      // 선택된 사용자가 없는 경우
      if (idParam === "") {
        idParam = "[]";
      }
      const params = {
        userIdsStr: idParam,
      };
      dispatch(retrieveSchedules(params));
    }
  };

  return (
    <>
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
          />
        </GridItem>
      </GridContainer>
      <br />
      <GridContainer>
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
        <GridItem xs={12} sm={12} md={10}>
          {selectedGroup.users.length > 0 ? (
            <FormControlLabel
              value=""
              style={{ marginRight: "10px", color: "#000" }}
              label="All"
              control={
                <Checkbox
                  defaultChecked={true}
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
          <Button color="primary" size="sm" onClick={() => searchSchedule(selectedUserIds, selectedGroup)}>
            Load
          </Button>
        </GridItem>
      </GridContainer>

      <AddScheduleForm open={addScheduleModalOpen} handleCloseClick={handleAddScheduleModalClick} date={clickedDate} />
      <EditScheduleForm open={editScheduleModalOpen} handleCloseClick={handleEditScheduleModalClick} schedule={editSchedule} />
    </>
  );
}
