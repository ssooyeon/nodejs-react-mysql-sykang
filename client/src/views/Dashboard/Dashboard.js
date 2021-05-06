import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Update } from "@material-ui/icons";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";
import LineChart from "components/Chart/LineChart";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

import useInterval from "utils/useInterval";
import MonitoringService from "services/MonitoringService";

const customStyles = {
  cpuTitle: {
    color: "rgb(234, 73, 73)",
  },
  memTitle: {
    color: "rgb(138, 92, 126)",
  },
  diskTitle: {
    color: "rgb(102, 179, 117)",
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
  tooltips: {
    enabled: false,
  },
  scales: {
    xAxes: [
      {
        //   position: "top", //default는 bottom
        display: true,
        scaleLabel: {
          display: true,
        },
        ticks: {
          maxTicksLimit: 10, //x축에 표시할 최대 눈금 수
        },
        type: "realtime",
        realtime: {
          // TODO: 시스템별 실제 값 표출하기
          onRefresh: function (chart) {
            chart.data.datasets.forEach(function (dataset) {
              dataset.data.push({
                x: Date.now(),
                y: parseInt(Math.random() * 100) + 1,
              });
            });
          },
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
const defaultCpuChartData = {
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
const defaultMemoryChartData = {
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
const defaultDiskChartData = {
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

  const [cpuPerCentage, setCpuPerCentage] = useState(0);
  const [cpuSpeed, setCpuSpeed] = useState(initSystemInfo);

  const [memPerCentage, setMemPerCentage] = useState(0);
  const [memFree, setMemFree] = useState(initSystemInfo);

  const [diskPerCentage, setDiskPerCentage] = useState(0);
  const [diskFree, setDiskFree] = useState(initSystemInfo);

  const [cpuData, setCpuData] = useState(defaultCpuChartData);
  const [memData, setMemData] = useState(defaultMemoryChartData);
  const [diskData, setDiskData] = useState(defaultDiskChartData);

  useInterval(() => {
    cpuUsageTimer();
    cpuSpeedTimer();
    memoryUsageTimer();
    memoryFreeSpaceTimer();
    diskUsageTimer();
    diskFreeSpaceTimer();
  }, 3000);

  // CPU 사용량 조회
  const cpuUsageTimer = () => {
    MonitoringService.getCPUUsage()
      .then((res) => {
        const cpu = res.data;
        setCpuPerCentage(cpu.toFixed(4));
      })
      .catch((e) => {
        console.log(e);
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

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <LineChart data={cpuData} legend={legend} options={defaultOptions} />
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <LineChart data={memData} legend={legend} options={defaultOptions} />
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <LineChart data={diskData} legend={legend} options={defaultOptions} />
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={6} md={2}>
          <Card>
            <CardHeader color="warning" stats icon>
              <p className={`${classes.cardCategory} ${customClasses.cpuTitle}`}>CPU Usage</p>
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
              <p className={`${classes.cardCategory} ${customClasses.cpuTitle}`}>CPU Speed</p>
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
              <p className={`${classes.cardCategory} ${customClasses.memTitle}`}>Memory Usage</p>
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
              <p className={`${classes.cardCategory} ${customClasses.memTitle}`}>Memory Free Space</p>
              <h3 className={classes.cardTitle}>
                {memFree.value} <small>{memFree.unit}Hz</small>
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
              <p className={`${classes.cardCategory} ${customClasses.diskTitle}`}>Disk Usage</p>
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
              <p className={`${classes.cardCategory} ${customClasses.diskTitle}`}>Disk Free Space</p>
              <h3 className={classes.cardTitle}>
                {diskFree.value} <small>{diskFree.unit}Hz</small>
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
    </div>
  );
}
