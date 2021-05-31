import React, { useState, useEffect, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Update } from "@material-ui/icons";
import Moment from "react-moment";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import { Check } from "@material-ui/icons";
import { Error } from "@material-ui/icons";
import LineChart from "components/Chart/LineChart";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

import useInterval from "utils/useInterval";
import MonitoringService from "services/MonitoringService";
import LogService from "services/LogService";

const customStyles = {
  redColor: {
    color: "rgb(234, 73, 73)",
  },
  purpleColor: {
    color: "rgb(138, 92, 126)",
  },
  greenColor: {
    color: "rgb(102, 179, 117)",
  },
  font14: {
    fontSize: "14px",
  },
  fontItalic: {
    fontStyle: "italic",
  },
  basic: {
    color: "green",
  },
  success: {},
  error: {
    color: "red",
  },
};

const defaultStyles = makeStyles(styles);
const useStyles = makeStyles(customStyles);

const initSystemInfo = {
  value: "",
  unit: "",
};

// 차트 옵션
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  events: ["click"],
  tooltips: {
    enabled: false,
  },
  scales: {
    xAxes: [
      {
        display: true,
        scaleLabel: {
          display: true,
        },
        ticks: {
          // maxTicksLimit: 10, //x축에 표시할 최대 눈금 수
        },
        type: "time",
        time: {
          unit: "second",
          displayFormats: {
            second: "HH:mm:ss",
          },
        },
        realtime: {
          onRefresh: function (chart) {},
          delay: 2000,
        },
      },
    ],
    yAxes: [
      {
        display: true,
        scaleLabel: {
          display: false,
        },
        ticks: {
          beginAtZero: true,
          stepSize: 10,
          min: 0,
          max: 100,
          //y축 scale 값에 % 붙이기 위해 사용
          callback: function (value) {
            return value + "%";
          },
        },
      },
    ],
  },
};

// 차트 레전드 옵션
const legend = {
  display: false,
};

// CPU 차트 데이터
const cpuData = {
  datasets: [
    {
      label: "",
      data: [],
      lineTension: 0,
      borderColor: "rgb(234, 73, 73)",
      backgroundColor: "rgba(234, 73, 73, 0.4)",
      borderWidth: 1,
      fill: true,
    },
  ],
};

// 메모리 차트 데이터
const memData = {
  datasets: [
    {
      label: "",
      data: [],
      lineTension: 0,
      borderColor: "rgb(138, 92, 126)",
      backgroundColor: "rgba(138, 92, 126, 0.4)",
      borderWidth: 1,
      fill: true,
    },
  ],
};

// 디스크 차트 데이터
const diskData = {
  datasets: [
    {
      label: "",
      data: [],
      lineTension: 0,
      borderColor: "rgb(102, 179, 117)",
      backgroundColor: "rgba(102, 179, 117, 0.4)",
      borderWidth: 1,
      fill: true,
    },
  ],
};

export default function Dashboard() {
  const classes = defaultStyles();
  const customClasses = useStyles();
  const isMounted = useRef(true);

  const [cpuPerCentage, setCpuPerCentage] = useState(0);
  const [cpuSpeed, setCpuSpeed] = useState(initSystemInfo);

  const [memPerCentage, setMemPerCentage] = useState(0);
  const [memFree, setMemFree] = useState(initSystemInfo);

  const [diskPerCentage, setDiskPerCentage] = useState(0);
  const [diskFree, setDiskFree] = useState(initSystemInfo);

  const [cpuChartOptions, setCpuChartOptions] = useState(defaultOptions);
  const [memChartOptions, setMemChartOptions] = useState(defaultOptions);
  const [diskChartOptions, setDiskChartOptions] = useState(defaultOptions);

  const [logList, setLogList] = useState([]);

  useEffect(() => {
    if (isMounted) {
      timers();
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  useInterval(() => {
    timers();
  }, 3000);

  // CPU 사용량 조회
  const cpuUsageTimer = () => {
    MonitoringService.getCPUUsage()
      .then((res) => {
        const cpu = res.data;
        setCpuPerCentage(cpu.toFixed(4));

        // CPU 차트 데이터 삽입
        const x = cpuChartOptions.scales.xAxes;
        x[0].realtime.onRefresh = addChartData(cpuData, cpu);
        setCpuChartOptions((pre) => ({
          ...pre,
          scales: {
            ...pre.scales,
            xAxes: x,
          },
        }));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const addChartData = (chart, value) => {
    chart.datasets.forEach(function (dataset) {
      dataset.data.push({
        x: Date.now(),
        y: value,
      });
    });
  };

  // CPU 속도 조회
  const cpuSpeedTimer = () => {
    MonitoringService.getCPUSpeed()
      .then((res) => {
        const speed = res.data;
        setCpuSpeed(speed);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 메모리 사용량 조회
  const memoryUsageTimer = () => {
    MonitoringService.getMemoryUsage()
      .then((res) => {
        const mem = res.data;
        setMemPerCentage(mem.toFixed(4));

        // 메모리 차트 데이터 삽입
        const x = memChartOptions.scales.xAxes;
        x[0].realtime.onRefresh = addChartData(memData, mem);
        setMemChartOptions((pre) => ({
          ...pre,
          scales: {
            ...pre.scales,
            xAxes: x,
          },
        }));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 메모리 남은 용량 조회
  const memoryFreeSpaceTimer = () => {
    MonitoringService.getMemoryFreeSpace()
      .then((res) => {
        const free = res.data;
        setMemFree(free);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 디스크 사용량 조회
  const diskUsageTimer = () => {
    MonitoringService.getDiskUsage()
      .then((res) => {
        const disk = res.data;
        setDiskPerCentage(disk.toFixed(4));

        // 디스크 차트 데이터 삽입
        const x = diskChartOptions.scales.xAxes;
        x[0].realtime.onRefresh = addChartData(diskData, disk);
        setDiskChartOptions((pre) => ({
          ...pre,
          scales: {
            ...pre.scales,
            xAxes: x,
          },
        }));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 디스크 남은 용량 조회
  const diskFreeSpaceTimer = () => {
    MonitoringService.getDiskFreeSpace()
      .then((res) => {
        const free = res.data;
        setDiskFree(free);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 로그 리스트 조회
  const logListTimer = () => {
    LogService.getAll()
      .then((res) => {
        setLogList(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // 로그 리스트에서 오늘 날짜인 항목들 조회
  // :로그 리스트에서 날짜에 "Just today" 표출을 위함
  const isSameDay = (date) => {
    const day = new Date(date).getDay();
    const today = new Date().getDay();
    return day === today;
  };

  const timers = () => {
    cpuUsageTimer();
    cpuSpeedTimer();
    memoryUsageTimer();
    memoryFreeSpaceTimer();
    diskUsageTimer();
    diskFreeSpaceTimer();
    logListTimer();
  };

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <LineChart data={cpuData} legend={legend} options={cpuChartOptions} />
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <LineChart data={memData} legend={legend} options={memChartOptions} />
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <LineChart data={diskData} legend={legend} options={diskChartOptions} />
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={6} md={2}>
          <Card>
            <CardHeader color="warning" stats icon>
              <p className={`${classes.cardCategory} ${customClasses.redColor}`}>CPU Usage</p>
              <h3 className={classes.cardTitle}>
                {cpuPerCentage} <small>%</small>
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Update />
                Just Updated
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={2}>
          <Card>
            <CardHeader color="warning" stats icon>
              <p className={`${classes.cardCategory} ${customClasses.redColor}`}>CPU Speed</p>
              <h3 className={classes.cardTitle}>
                {cpuSpeed.value} <small>{cpuSpeed.unit}Hz</small>
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Update />
                Just Updated
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={2}>
          <Card>
            <CardHeader color="warning" stats icon>
              <p className={`${classes.cardCategory} ${customClasses.purpleColor}`}>Memory Usage</p>
              <h3 className={classes.cardTitle}>
                {memPerCentage} <small>%</small>
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Update />
                Just Updated
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={2}>
          <Card>
            <CardHeader color="warning" stats icon>
              <p className={`${classes.cardCategory} ${customClasses.purpleColor}`}>Memory Free Space</p>
              <h3 className={classes.cardTitle}>
                {memFree.value} <small>{memFree.unit}B</small>
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Update />
                Just Updated
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={2}>
          <Card>
            <CardHeader color="warning" stats icon>
              <p className={`${classes.cardCategory} ${customClasses.greenColor}`}>Disk Usage</p>
              <h3 className={classes.cardTitle}>
                {diskPerCentage} <small>%</small>
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Update />
                Just Updated
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={2}>
          <Card>
            <CardHeader color="warning" stats icon>
              <p className={`${classes.cardCategory} ${customClasses.greenColor}`}>Disk Free Space</p>
              <h3 className={classes.cardTitle}>
                {diskFree.value} <small>{diskFree.unit}B</small>
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Update />
                Just Updated
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <List dense>
            {logList.map((log) => {
              const labelId = `checkbox-list-secondary-label-${log.id}`;
              return (
                <ListItem key={log.id} button>
                  <ListItemAvatar>
                    {log.status === "BASIC" ? (
                      <Check className={customClasses.purpleColor} />
                    ) : log.status === "SUCCESS" ? (
                      <Check className={customClasses.greenColor} />
                    ) : (
                      <Error className={customClasses.redColor} />
                    )}
                  </ListItemAvatar>
                  <ListItemText id={labelId} primary={`${log.message}`} />
                  {isSameDay(log.createdAt) ? (
                    <ListItemSecondaryAction className={`${customClasses.font14} ${customClasses.fontItalic}`}>Just today</ListItemSecondaryAction>
                  ) : (
                    <ListItemSecondaryAction className={customClasses.font14}>
                      <Moment format="YYYY-MM-DD HH:mm:ss">{log.createdAt}</Moment>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })}
          </List>
        </GridItem>
      </GridContainer>
    </div>
  );
}
