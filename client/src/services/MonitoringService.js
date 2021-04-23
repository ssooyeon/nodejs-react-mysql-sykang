import http from "../http-common";

class MonitoringService {
  getCPUUsage() {
    return http.get("/monitoring/cpu/usage");
  }

  getCPUSpeed() {
    return http.get("/monitoring/cpu/speed");
  }

  getMemoryUsage() {
    return http.get("/monitoring/memory/usage");
  }

  getMemoryFreeSpace() {
    return http.get("/monitoring/memory/freeSpace");
  }

  getDiskUsage() {
    return http.get("/monitoring/disk/usage");
  }

  getDiskFreeSpace() {
    return http.get("/monitoring/disk/freeSpace");
  }
}

export default new MonitoringService();
