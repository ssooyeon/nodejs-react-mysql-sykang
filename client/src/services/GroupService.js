import http from "../http-common";

class GroupService {
  // 그룹 전체 조회
  getAll() {
    return http.get("/groups");
  }

  // 그룹 조회
  get(id) {
    return http.get(`/groups/${id}`);
  }

  // 그룹 생성
  create(data) {
    return http.post("/groups", data);
  }

  // 그룹 수정
  update(id, data) {
    return http.put(`/groups/${id}`, data);
  }

  // 그룹 삭제
  delete(id) {
    return http.delete(`/groups/${id}`);
  }

  // 그룹 전체 삭제
  deleteAll() {
    return http.delete("/groups");
  }
}

export default new GroupService();
