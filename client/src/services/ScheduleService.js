import http from "../http-common";

class ScheduleService {
  // 스케줄 전체 조회
  getAll(params) {
    return http.get("/schedules", { params });
  }

  // 스케줄 조회
  get(id) {
    return http.get(`/schedules/${id}`);
  }

  // 스케줄 생성
  create(data) {
    return http.post("/schedules", data);
  }

  // 스케줄 수정
  update(id, data) {
    return http.put(`/schedules/${id}`, data);
  }

  // 스케줄 삭제
  delete(id) {
    return http.delete(`/schedules/${id}`);
  }

  // 스케줄 전체 삭제
  deleteAll() {
    return http.delete("/schedules");
  }
}

export default new ScheduleService();
