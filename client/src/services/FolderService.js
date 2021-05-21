import http from "../http-common";

class FolderService {
  // 테스크 폴더 전체 조회
  getAll(params) {
    return http.get("/folders", { params });
  }

  // 테스트 폴더에서 가장 상위 폴더 리스트 조회
  getParentAll() {
    return http.get("/folders/parents");
  }

  // 테스크 폴더 조회
  get(id) {
    return http.get(`/folders/${id}`);
  }

  // 테스크 폴더 생성
  create(data) {
    return http.post("/folders", data);
  }

  // 테스크 폴더 수정
  update(id, data) {
    return http.put(`/folders/${id}`, data);
  }

  // 테스크 폴더 삭제
  delete(id) {
    return http.delete(`/folders/${id}`);
  }

  // 테스크 폴더 전체 삭제
  deleteAll() {
    return http.delete("/folders");
  }
}

export default new FolderService();
