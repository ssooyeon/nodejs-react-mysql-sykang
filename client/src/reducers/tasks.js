import { CREATE_TASK, RETRIEVE_TASKS, RETRIEVE_TASK, UPDATE_TASK, DELETE_TASK, DELETE_ALL_TASKS } from "actions/types";

const initialState = [];

function taskReducer(tasks = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    // 테스크 생성
    case CREATE_TASK:
      return [...tasks, payload];

    // 테스크 전체 조회
    case RETRIEVE_TASKS:
      return payload;
    // 테스크 조회
    case RETRIEVE_TASK:
      return payload;

    // 테스크 수정
    case UPDATE_TASK:
      // edit 페이지에서 새로고침하고 업데이트하면 tasks가 list인데 한 번 더 업데이트하면 그냥 object가 됨
      let results = [];
      if (tasks.length === undefined) {
        results.push(tasks);
      } else {
        results = tasks;
      }
      return results.map((task) => {
        if (task.id === payload.id) {
          return {
            ...task,
            ...payload,
          };
        } else {
          return task;
        }
      });

    // 테스크 삭제
    case DELETE_TASK:
      return tasks.filter(({ id }) => id !== payload.id);

    // 테스크 전체 삭제
    case DELETE_ALL_TASKS:
      return [];

    default:
      return tasks;
  }
}

export default taskReducer;
