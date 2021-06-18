import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";

import "./style/CustomCalendar.css";

import AddScheduleForm from "./AddScheduleForm";
import EditScheduleForm from "./EditScheduleForm";

import { retrieveSchedules, updateSchedule } from "actions/schedules";
import ScheduleService from "services/ScheduleService";

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
    const id = e.event.id;
    const allDay = e.event.allDay;
    let start = e.event.start;
    let end = e.event.end;
    // 1개의 칸에서 최초로 다른 칸으로 움직이면 end가 null이 됨
    if (end === null) {
      end = start;
    }
    if (allDay) {
      start = moment(start).format("YYYY-MM-DD");
      end = moment(end).format("YYYY-MM-DD");
    } else {
      start = moment(start).format("YYYY-MM-DD HH:mm:ss");
      end = moment(end).format("YYYY-MM-DD HH:mm:ss");
    }

    let data = { id: id, start: start, end: end, allDay: allDay };
    console.log(data);
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

  // 스케줄 등록 버튼 클릭 및 AddScheduleForm.js 에서 닫기 버튼 클릭
  const handleAddScheduleModalClick = (value) => {
    setAddScheduleModalOpen(value);
    dispatch(retrieveSchedules());
  };

  // 스케줄 수정 버튼 클릭 및 EditScheduleForm.js 에서 닫기 버튼 클릭
  const handleEditScheduleModalClick = (value) => {
    setEditScheduleModalOpen(value);
    dispatch(retrieveSchedules());
  };

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
          />
        </GridItem>
      </GridContainer>

      <AddScheduleForm open={addScheduleModalOpen} handleCloseClick={handleAddScheduleModalClick} date={clickedDate} />
      <EditScheduleForm open={editScheduleModalOpen} handleCloseClick={handleEditScheduleModalClick} schedule={editSchedule} />
    </>
  );
}
