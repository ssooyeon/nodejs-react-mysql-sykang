import http from "../http-common";

class TaskService {
  // 테스크 전체 조회
  getAll(params) {
    return http.get("/tasks", { params });
  }

  // 테스크 조회
  get(id) {
    return http.get(`/tasks/${id}`);
  }

  // 테스크 생성
  create(data) {
    return http.post("/tasks", data);
  }

  // 테스크 수정
  update(id, data) {
    return http.put(`/tasks/${id}`, data);
  }

  // 테스크 삭제
  delete(id) {
    return http.delete(`/tasks/${id}`);
  }

  // 테스크 전체 삭제
  deleteAll() {
    return http.delete("/tasks");
  }
}

export default new TaskService();
