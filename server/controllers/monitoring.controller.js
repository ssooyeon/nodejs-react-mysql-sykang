const os = require("os");
const nodeOsUtils = require("node-os-utils");
const diskUsage = require("diskusage");

//////////////////////////////////
// find cpu
//////////////////////////////////
exports.findCPUUsage = (req, res) => {
  const cpu = nodeOsUtils.cpu;
  cpu
    .usage()
    .then((percent) => {
      res.send(percent.toString());
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving cpu usage." });
    });
};

exports.findCPUSpeed = (req, res) => {
  const cpuData = os.cpus();
  if (cpuData) {
    let totalSpeed = 0;
    const length = cpuData.length;
    cpuData.forEach((data) => {
      const item = data.speed * 1000000;
      totalSpeed += item;
    });
    const speed = totalSpeed / length;
    const speedArr = convertSize(speed);
    res.send(speedArr);
  } else {
    res.status(500).send({ message: err.message || "Some error occurred while retrieving cpu speed." });
  }
};

//////////////////////////////////
// find memory
//////////////////////////////////
exports.findMemoryUsage = (req, res) => {
  const mem = nodeOsUtils.mem;
  mem
    .info()
    .then((info) => {
      const usage = 100 - info.freeMemPercentage;
      res.send(usage.toString());
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving memory usage." });
    });
};

exports.findMemoryFreeSpace = (req, res) => {
  const mem = nodeOsUtils.mem;
  mem
    .info()
    .then((info) => {
      const free = info.freeMemMb * 1000000;
      const freeArr = convertSize(free);
      res.send(freeArr);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving memory free space." });
    });
};

//////////////////////////////////
// find disk
//////////////////////////////////
exports.findDiskUsage = (req, res) => {
  diskUsage
    .check("/")
    .then((info) => {
      const disk = 100 - (info.free / info.total) * 100;
      res.send(disk.toString());
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving disk usage." });
    });
};

exports.findDiskFreeSpace = (req, res) => {
  diskUsage
    .check("/")
    .then((info) => {
      const free = info.free;
      const freeArr = convertSize(free);
      res.send(freeArr);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieing disk free space." });
    });
};

//////////////////////////////////
// util for find
//////////////////////////////////
function convertSize(bytes, decimals = 2) {
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["", "K", "M", "G", "T"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const result = {
    value: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)),
    unit: sizes[i],
  };
  return result;
}
