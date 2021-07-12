import { CREATE_TASK, RETRIEVE_TASKS, RETRIEVE_TASK, UPDATE_TASK, DELETE_TASK, DELETE_ALL_TASKS } from "./types";

import TaskService from "../services/TaskService";

/**
 * 테스크 생성
 */
export const createTask = (data) => async (dispatch) => {
  try {
    const res = await TaskService.create(data);

    dispatch({
      type: CREATE_TASK,
      payload: res.data,
    });

    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 테스크 전체 조회
 */
export const retrieveTasks = (params) => async (dispatch) => {
  try {
    const res = await TaskService.getAll(params);
    dispatch({
      type: RETRIEVE_TASKS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 테스크 상세보기
 */
export const retrieveTask = (id) => async (dispatch) => {
  try {
    const res = await TaskService.get(id);
    dispatch({
      type: RETRIEVE_TASK,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 테스크 수정
 */
export const updateTask = (id, data) => async (dispatch) => {
  try {
    const res = await TaskService.update(id, data);
    dispatch({
      type: UPDATE_TASK,
      payload: data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 테스크 삭제
 */
export const deleteTask = (id) => async (dispatch) => {
  try {
    await TaskService.delete(id);

    dispatch({
      type: DELETE_TASK,
      payload: { id },
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * 테스크 전체 삭제
 */
export const deleteAllTasks = () => async (dispatch) => {
  try {
    const res = await TaskService.deleteAll();

    dispatch({
      type: DELETE_ALL_TASKS,
      payload: res.data,
    });

    return Promise.resolve(res.data);
  } catch (err) {
    return Promise.reject(err);
  }
};
