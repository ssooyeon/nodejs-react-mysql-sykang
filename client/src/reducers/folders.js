import {
  CREATE_FOLDER,
  RETRIEVE_FOLDERS,
  RETRIEVE_PARENT_FOLDERS,
  RETRIEVE_FOLDER,
  UPDATE_FOLDER,
  DELETE_FOLDER,
  DELETE_ALL_FOLDERS,
} from "actions/types";

const initialState = [];

function folderReducer(folders = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    // 폴더 생성
    case CREATE_FOLDER:
      return [...folders, payload];

    // 폴더 전체 조회
    case RETRIEVE_FOLDERS:
      return payload;

    // 최상위 폴더 전체 조회
    case RETRIEVE_PARENT_FOLDERS:
      return payload;

    // 폴더 조회
    case RETRIEVE_FOLDER:
      return payload;

    // 폴더 수정
    case UPDATE_FOLDER:
      // edit 페이지에서 새로고침하고 업데이트하면 folders가 list인데 한 번 더 업데이트하면 그냥 object가 됨
      let results = [];
      if (folders.length === undefined) {
        results.push(folders);
      } else {
        results = folders;
      }
      return results.map((folder) => {
        if (folder.id === payload.id) {
          return {
            ...folder,
            ...payload,
          };
        } else {
          return folder;
        }
      });

    // 폴더 삭제
    case DELETE_FOLDER:
      return folders.filter(({ id }) => id !== payload.id);

    // 폴더 전체 삭제
    case DELETE_ALL_FOLDERS:
      return [];

    default:
      return folders;
  }
}

export default folderReducer;
