import { CREATE_SCHEDULE, RETRIEVE_SCHEDULES, RETRIEVE_SCHEDULE, UPDATE_SCHEDULE, DELETE_SCHEDULE, DELETE_ALL_SCHEDULES } from "./types";

import ScheduleService from "../services/ScheduleService";

/**
 * 스케줄 생성
 */
export const createSchedule = (data) => async (dispatch) => {
  try {
    const res = await ScheduleService.create(data);

    dispatch({
      type: CREATE_SCHEDULE,
      payload: res.data,
    });

    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 스케줄 전체 조회
 */
export const retrieveSchedules = (params) => async (dispatch) => {
  try {
    const res = await ScheduleService.getAll(params);
    dispatch({
      type: RETRIEVE_SCHEDULES,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 스케줄 상세보기
 */
export const retrieveSchedule = (id) => async (dispatch) => {
  try {
    const res = await ScheduleService.get(id);
    dispatch({
      type: RETRIEVE_SCHEDULE,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 스케줄 수정
 */
export const updateSchedule = (id, data) => async (dispatch) => {
  try {
    const res = await ScheduleService.update(id, data);
    dispatch({
      type: UPDATE_SCHEDULE,
      payload: data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 스케줄 삭제
 */
export const deleteSchedule = (id) => async (dispatch) => {
  try {
    await ScheduleService.delete(id);

    dispatch({
      type: DELETE_SCHEDULE,
      payload: { id },
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * 스케줄 전체 삭제
 */
export const deleteAllSchedules = () => async (dispatch) => {
  try {
    const res = await ScheduleService.deleteAll();

    dispatch({
      type: DELETE_ALL_SCHEDULES,
      payload: res.data,
    });

    return Promise.resolve(res.data);
  } catch (err) {
    return Promise.reject(err);
  }
};
