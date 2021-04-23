import { CREATE_BOARD, RETRIEVE_BOARDS, RETRIEVE_BOARD, UPDATE_BOARD, DELETE_BOARD, DELETE_ALL_BOARDS } from "actions/types";

const initialState = [];

function boardReducer(boards = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case CREATE_BOARD:
      return [...boards, payload];

    case RETRIEVE_BOARDS:
      return payload;

    case RETRIEVE_BOARD:
      return payload;

    case UPDATE_BOARD:
      return boards.map((board) => {
        if (board.id === payload.id) {
          return {
            ...board,
            ...payload,
          };
        } else {
          return board;
        }
      });

    case DELETE_BOARD:
      return boards.filter(({ id }) => id !== payload.id);

    case DELETE_ALL_BOARDS:
      return [];

    default:
      return boards;
  }
}

export default boardReducer;
