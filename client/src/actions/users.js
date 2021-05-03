import {
  CREATE_USER,
  RETRIEVE_USERS,
  RETRIEVE_USER,
  RETRIEVE_BY_ACCOUNT,
  COMPARE_CURRENT_PASSWORD,
  UPDATE_USER,
  DELETE_USER,
  DELETE_ALL_USERS,
} from "./types";

import UserService from "../services/UserService";

export const createUser = (data) => async (dispatch) => {
  try {
    const res = await UserService.create(data);

    dispatch({
      type: CREATE_USER,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const retrieveUsers = (params) => async (dispatch) => {
  try {
    const res = await UserService.getAll(params);
    dispatch({
      type: RETRIEVE_USERS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const retrieveUser = (id) => async (dispatch) => {
  try {
    const res = await UserService.get(id);
    dispatch({
      type: RETRIEVE_USER,
      payload: res.data,
    });
    console.log(res.data);
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const retrieveByAccount = (account) => async (dispatch) => {
  try {
    const res = await UserService.findByAccount(account);
    dispatch({
      type: RETRIEVE_BY_ACCOUNT,
      payload: res.data,
    });
    console.log(res.data);
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const compareCurrentPassword = (data) => async (dispatch) => {
  try {
    const res = await UserService.compareCurrentPassword(data);
    dispatch({
      type: COMPARE_CURRENT_PASSWORD,
      payload: res.data,
    });
    console.log(res.data);
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const updateUser = (id, data) => async (dispatch) => {
  try {
    const res = await UserService.update(id, data);
    dispatch({
      type: UPDATE_USER,
      payload: res.data,
    });
    console.log(res.data);
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const deleteUser = (id) => async (dispatch) => {
  try {
    await UserService.delete(id);

    dispatch({
      type: DELETE_USER,
      payload: { id },
    });
  } catch (err) {
    console.log(err);
  }
};

export const deleteAllUsers = () => async (dispatch) => {
  try {
    const res = await UserService.deleteAll();

    dispatch({
      type: DELETE_ALL_USERS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};
