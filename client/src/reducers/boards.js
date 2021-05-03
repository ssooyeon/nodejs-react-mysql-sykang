import { CREATE_BOARD, RETRIEVE_BOARDS, RETRIEVE_BOARD, UPDATE_BOARD, DELETE_BOARD, DELETE_ALL_BOARDS } from "actions/types";

const initialState = [];

function boardReducer(boards = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    // 게시판 생성
    case CREATE_BOARD:
      // create 페이지에서 새로고침하고 업데이트하면 생성 OK, 다시 하면 boards 를 불러오지 못함: 페이징 때문(findAll)
      if (boards.rows !== undefined) {
        return [...boards.rows, payload];
      } else {
        return [...boards, payload];
      }

    // 게시판 전체 조회
    case RETRIEVE_BOARDS:
      return payload;

    // 게시판 조회
    case RETRIEVE_BOARD:
      return payload;

    // 게시판 수정
    case UPDATE_BOARD:
      // edit 페이지에서 새로고침하고 업데이트하면 boards가 list인데 한 번 더 업데이트하면 그냥 object가 됨
      let results = [];
      if (boards.length === undefined) {
        results.push(boards);
      } else {
        results = boards;
      }
      return results.map((board) => {
        if (board.id === payload.id) {
          return {
            ...board,
            ...payload,
          };
        } else {
          return board;
        }
      });

    // 게시판 삭제
    case DELETE_BOARD:
      return payload;
    // return boards.filter(({ id }) => id !== payload.id);

    // 게시판 전체 삭제
    case DELETE_ALL_BOARDS:
      return [];

    default:
      return boards;
  }
}

export default boardReducer;
