import http from "../http-common";

class LogService {
  // 로그 전체 조회
  getAll() {
    return http.get("/logs");
  }

  // 로그 조회
  get(id) {
    return http.get(`/logs/${id}`);
  }

  // 로그 생성
  create(data) {
    return http.post("/logs", data);
  }
}

export default new LogService();
