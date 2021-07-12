import { CREATE_BOARD, RETRIEVE_BOARDS, RETRIEVE_BOARD, UPDATE_BOARD, DELETE_BOARD, DELETE_ALL_BOARDS } from "./types";

import BoardService from "../services/BoardService";

/**
 * 게시판 생성
 */
export const createBoard = (data) => async (dispatch) => {
  try {
    const res = await BoardService.create(data);

    dispatch({
      type: CREATE_BOARD,
      payload: res.data,
    });

    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 게시판 전체 조회 (+페이징)
 */
export const retrieveBoards = (params) => async (dispatch) => {
  try {
    const res = await BoardService.getAll(params);
    dispatch({
      type: RETRIEVE_BOARDS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 게시판 상세보기
 */
export const retrieveBoard = (id) => async (dispatch) => {
  try {
    const res = await BoardService.get(id);
    dispatch({
      type: RETRIEVE_BOARD,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 게시판 수정
 */
export const updateBoard = (id, data) => async (dispatch) => {
  try {
    const res = await BoardService.update(id, data);
    dispatch({
      type: UPDATE_BOARD,
      payload: data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * 게시판 삭제
 */
export const deleteBoard = (id) => async (dispatch) => {
  try {
    await BoardService.delete(id);

    dispatch({
      type: DELETE_BOARD,
      payload: { id },
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * 게시판 전체 삭제
 */
export const deleteAllBoards = () => async (dispatch) => {
  try {
    const res = await BoardService.deleteAll();

    dispatch({
      type: DELETE_ALL_BOARDS,
      payload: res.data,
    });

    return Promise.resolve(res.data);
  } catch (err) {
    return Promise.reject(err);
  }
};
