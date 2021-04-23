import http from "../http-common";

class LogService {
  getAll() {
    return http.get("/logs");
  }

  get(id) {
    return http.get(`/logs/${id}`);
  }

  create(data) {
    return http.post("/logs", data);
  }
}

export default new LogService();
