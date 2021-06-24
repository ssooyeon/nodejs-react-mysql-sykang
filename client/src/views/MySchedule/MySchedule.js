import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import rrulePlugin from "@fullcalendar/rrule";

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";

import "./style/CustomCalendar.css";

import AddScheduleForm from "./AddScheduleForm";
import EditScheduleForm from "./EditScheduleForm";

import { retrieveSchedules, updateSchedule } from "actions/schedules";
import ScheduleService from "services/ScheduleService";

const weekAbbr = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export default function MySchedule() {
  const schedules = useSelector((state) => state.schedules || []);
  const dispatch = useDispatch();

  const [clickedDate, setClickedDate] = useState(new Date());
  const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false); // 스케줄 생성 모달 오픈
  const [editScheduleModalOpen, setEditScheduleModalOpen] = useState(false); // 스케줄 수정 모달 오픈
  const [editSchedule, setEditSchedule] = useState([]);

  useEffect(() => {
    dispatch(retrieveSchedules());
  }, [dispatch]);

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

    data = { ...data, id: id, allDay: allDay, rrule: rrule };
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

  const handleEventContent = (e) => {
    console.log(e);
    if (e.event._def.recurringDef !== null) {
      const eRrule = e.event._def.recurringDef.typeData.rruleSet.toString(); // 기존 rrule
      if (eRrule !== null) {
        return {
          html: "&nbsp;<i class='fa fa-repeat' aria-hidden='true'></i>&nbsp;" + e.event.title,
        };
      }
    }
  };

  // 스케줄 등록 버튼 클릭 및 AddScheduleForm.js 에서 닫기 버튼 클릭
  const handleAddScheduleModalClick = (value) => {
    setAddScheduleModalOpen(value);
    // dispatch(retrieveSchedules());
  };

  // 스케줄 수정 버튼 클릭 및 EditScheduleForm.js 에서 닫기 버튼 클릭
  const handleEditScheduleModalClick = (value) => {
    setEditScheduleModalOpen(value);
    // dispatch(retrieveSchedules());
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

      <AddScheduleForm open={addScheduleModalOpen} handleCloseClick={handleAddScheduleModalClick} date={clickedDate} />
      <EditScheduleForm open={editScheduleModalOpen} handleCloseClick={handleEditScheduleModalClick} schedule={editSchedule} />
    </>
  );
}
