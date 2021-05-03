import {
  CREATE_USER,
  RETRIEVE_USERS,
  RETRIEVE_USER,
  RETRIEVE_BY_ACCOUNT,
  COMPARE_CURRENT_PASSWORD,
  UPDATE_USER,
  DELETE_USER,
  DELETE_ALL_USERS,
} from "actions/types";

const initialState = [];

function userReducer(users = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case CREATE_USER:
      return [...users, payload];

    case RETRIEVE_USERS:
      return payload;

    case RETRIEVE_USER:
      return payload;

    case RETRIEVE_BY_ACCOUNT:
      return payload;

    case COMPARE_CURRENT_PASSWORD:
      return payload;

    case UPDATE_USER:
      let results = [];
      if (users.length === undefined) {
        results.push(users);
      } else {
        results = users;
      }
      return results.map((user) => {
        if (user.id === payload.id) {
          return {
            ...user,
            ...payload,
          };
        } else {
          return user;
        }
      });

    case DELETE_USER:
      return users.filter(({ id }) => id !== payload.id);

    case DELETE_ALL_USERS:
      return [];

    default:
      return users;
  }
}

export default userReducer;
