import { CREATE_GROUP, RETRIEVE_GROUPS, RETRIEVE_GROUP, UPDATE_GROUP, UPDATE_GROUP_MEMBERS, DELETE_GROUP, DELETE_ALL_GROUPS } from "./types";

import GroupService from "../services/GroupService";

/**
 * 그룹 생성
 */
export const createGroup = (data) => async (dispatch) => {
  try {
    const res = await GroupService.create(data);

    dispatch({
      type: CREATE_GROUP,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 그룹 전체 조회
 */
export const retrieveGroups = (params) => async (dispatch) => {
  try {
    const res = await GroupService.getAll(params);
    dispatch({
      type: RETRIEVE_GROUPS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 그룹 상세보기
 */
export const retrieveGroup = (id) => async (dispatch) => {
  try {
    const res = await GroupService.get(id);
    dispatch({
      type: RETRIEVE_GROUP,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 그룹 수정
 */
export const updateGroup = (id, data) => async (dispatch) => {
  try {
    const res = await GroupService.update(id, data);
    dispatch({
      type: UPDATE_GROUP,
      payload: data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 그룹 멤버 수정
 */
export const updateGroupMember = (id, data) => async (dispatch) => {
  try {
    const res = await GroupService.updateMembers(id, data);
    dispatch({
      type: UPDATE_GROUP_MEMBERS,
      payload: data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 그룹 삭제
 */
export const deleteGroup = (id) => async (dispatch) => {
  try {
    await GroupService.delete(id);

    dispatch({
      type: DELETE_GROUP,
      payload: { id },
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * 그룹 전체 삭제
 */
export const deleteAllGroups = () => async (dispatch) => {
  try {
    const res = await GroupService.deleteAll();

    dispatch({
      type: DELETE_ALL_GROUPS,
      payload: res.data,
    });

    return Promise.resolve(res.data);
  } catch (err) {
    return Promise.reject(err);
  }
};
