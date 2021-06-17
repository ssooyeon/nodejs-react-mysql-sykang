import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert-17";

import { makeStyles } from "@material-ui/core/styles";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
// import koLocale from "@fullcalendar/core/locales/ko";

import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";

import "./style/CustomCalendar.css";

import AddScheduleForm from "./AddScheduleForm";
import EditScheduleForm from "./EditScheduleForm";

import { retrieveSchedules } from "actions/schedules";
import ScheduleService from "services/ScheduleService";

const styles = {};

const useStyles = makeStyles(styles);

export default function MySchedule() {
  const classes = useStyles();
  const alert = useAlert();

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
    console.log("change");
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
            // locale={koLocale}
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
