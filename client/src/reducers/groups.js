import { CREATE_GROUP, RETRIEVE_GROUPS, RETRIEVE_GROUP, UPDATE_GROUP, UPDATE_GROUP_MEMBERS, DELETE_GROUP, DELETE_ALL_GROUPS } from "actions/types";

const initialState = [];

function groupReducer(groups = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    // 그룹 생성
    case CREATE_GROUP:
      return [...groups, payload];

    // 그룹 전체 조회
    case RETRIEVE_GROUPS:
      return payload;

    // 그룹 조회
    case RETRIEVE_GROUP:
      return payload;

    // 그룹 수정
    case UPDATE_GROUP:
      let results = [];
      if (groups.length === undefined) {
        results.push(groups);
      } else {
        results = groups;
      }
      return results.map((group) => {
        if (group.id === payload.id) {
          return {
            ...group,
            ...payload,
          };
        } else {
          return group;
        }
      });

    // 그룹 멤버 수정
    case UPDATE_GROUP_MEMBERS:
      let rsts = [];
      if (groups.length === undefined) {
        rsts.push(groups);
      } else {
        rsts = groups;
      }
      return rsts.map((group) => {
        if (group.id === payload.id) {
          return {
            ...group,
            ...payload,
          };
        } else {
          return group;
        }
      });

    // 그룹 삭제
    case DELETE_GROUP:
      return groups.filter(({ id }) => id !== payload.id);

    // 그룹 전체 삭제
    case DELETE_ALL_GROUPS:
      return [];

    default:
      return groups;
  }
}

export default groupReducer;
