import http from "../http-common";

class UserService {
  getAll() {
    return http.get("/users");
  }

  get(id) {
    return http.get(`/users/${id}`);
  }

  create(data) {
    return http.post("/users", data);
  }

  compareCurrentPassword(data) {
    return http.post("/users/compare/password", data);
  }

  update(id, data) {
    return http.put(`/users/${id}`, data);
  }

  delete(id) {
    return http.delete(`/users/${id}`);
  }

  deleteAll() {
    return http.delete("/users");
  }

  findByAccount(account) {
    return http.get(`/users/account/${account}`);
  }

  getAuthLogin(data) {
    return http.post("/users/auth/login", data);
  }
}

export default new UserService();
