import http from "../http-common";

class MonitoringService {
  // CPU 사용량(%) 조회
  getCPUUsage() {
    return http.get("/monitoring/cpu/usage");
  }

  // CPU 속도(Hz) 조회
  getCPUSpeed() {
    return http.get("/monitoring/cpu/speed");
  }

  // 메모리 사용량(%) 조회
  getMemoryUsage() {
    return http.get("/monitoring/memory/usage");
  }

  // 메모리 남은 용량(B) 조회
  getMemoryFreeSpace() {
    return http.get("/monitoring/memory/freeSpace");
  }

  // 디스크 사용량(%) 조회
  getDiskUsage() {
    return http.get("/monitoring/disk/usage");
  }

  // 디스크 남은 용량(B) 조회
  getDiskFreeSpace() {
    return http.get("/monitoring/disk/freeSpace");
  }
}

export default new MonitoringService();
