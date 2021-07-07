import { CREATE_SCHEDULE, RETRIEVE_SCHEDULES, RETRIEVE_SCHEDULE, UPDATE_SCHEDULE, DELETE_SCHEDULE, DELETE_ALL_SCHEDULES } from "actions/types";

const initialState = [];

function scheduleReducer(schedules = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    // 스케줄 생성
    case CREATE_SCHEDULE:
      console.log(schedules);
      console.log(payload);
      return [...schedules, payload];

    // 스케줄 전체 조회
    case RETRIEVE_SCHEDULES:
      return payload;
    // 스케줄 조회
    case RETRIEVE_SCHEDULE:
      return payload;

    // 스케줄 수정
    case UPDATE_SCHEDULE:
      // edit 페이지에서 새로고침하고 업데이트하면 schedules가 list인데 한 번 더 업데이트하면 그냥 object가 됨
      let results = [];
      if (schedules.length === undefined) {
        results.push(schedules);
      } else {
        results = schedules;
      }
      return results.map((schedule) => {
        if (schedule.id === payload.id) {
          return {
            ...schedule,
            ...payload,
          };
        } else {
          return schedule;
        }
      });

    // 스케줄 삭제
    case DELETE_SCHEDULE:
      return schedules.filter(({ id }) => id !== payload.id);

    // 스케줄 전체 삭제
    case DELETE_ALL_SCHEDULES:
      return [];

    default:
      return schedules;
  }
}

export default scheduleReducer;
