import http from "../http-common";

class BoardService {
  // 게시판 전체 조회
  getAll(params) {
    return http.get("/boards", { params });
  }

  // 게시판 조회
  get(id) {
    return http.get(`/boards/${id}`);
  }

  // 게시판 생성
  create(data) {
    return http.post("/boards", data);
  }

  // 게시판 수정
  update(id, data) {
    return http.put(`/boards/${id}`, data);
  }

  // 게시판 삭제
  delete(id) {
    return http.delete(`/boards/${id}`);
  }

  // 게시판 전체 삭제
  deleteAll() {
    return http.delete("/boards");
  }
}

export default new BoardService();
