import {
  CREATE_FOLDER,
  RETRIEVE_FOLDERS,
  RETRIEVE_PARENT_FOLDERS,
  RETRIEVE_FOLDER_WITH_USERS,
  RETRIEVE_FOLDER,
  UPDATE_FOLDER,
  UPDATE_FOLDER_WITH_USERS,
  DELETE_FOLDER,
  DELETE_ALL_FOLDERS,
} from "./types";

import FolderService from "../services/FolderService";

/**
 * 폴더 생성
 */
export const createFolder = (data) => async (dispatch) => {
  try {
    const res = await FolderService.create(data);

    dispatch({
      type: CREATE_FOLDER,
      payload: res.data,
    });

    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 폴더 전체 조회
 */
export const retrieveFolders = (params) => async (dispatch) => {
  try {
    const res = await FolderService.getAll(params);
    dispatch({
      type: RETRIEVE_FOLDERS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 최상위 폴더 전체 조회
 */
export const retrieveParentFolders = (id) => async (dispatch) => {
  try {
    // const res = await FolderService.getParentAll();
    const res = await FolderService.getParentAllByCurrentUser(id);
    dispatch({
      type: RETRIEVE_PARENT_FOLDERS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 최상위 폴더를 공유 사용자와 함께 조회
 */
export const retrieveAllWithSharedUsers = (id) => async (dispatch) => {
  try {
    const res = await FolderService.getAllWithSharedUsers(id);
    dispatch({
      type: RETRIEVE_FOLDER_WITH_USERS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 폴더 상세보기
 */
export const retrieveFolder = (id) => async (dispatch) => {
  try {
    const res = await FolderService.get(id);
    dispatch({
      type: RETRIEVE_FOLDER,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 폴더 수정
 */
export const updateFolder = (id, data) => async (dispatch) => {
  try {
    const res = await FolderService.update(id, data);
    dispatch({
      type: UPDATE_FOLDER,
      payload: data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 폴더 공유 사용자 수정
 */
export const updateSharedUser = (id, data) => async (dispatch) => {
  try {
    const res = await FolderService.updateSharedUsers(id, data);
    dispatch({
      type: UPDATE_FOLDER_WITH_USERS,
      payload: data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 폴더 삭제
 */
export const deleteFolder = (id) => async (dispatch) => {
  try {
    await FolderService.delete(id);

    dispatch({
      type: DELETE_FOLDER,
      payload: { id },
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * 폴더 전체 삭제
 */
export const deleteAllFolders = () => async (dispatch) => {
  try {
    const res = await FolderService.deleteAll();

    dispatch({
      type: DELETE_ALL_FOLDERS,
      payload: res.data,
    });

    return Promise.resolve(res.data);
  } catch (err) {
    return Promise.reject(err);
  }
};
