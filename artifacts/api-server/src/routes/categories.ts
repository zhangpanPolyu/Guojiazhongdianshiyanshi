import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/categories", (_req, res) => {
  res.json([
    {
      id: "sensors",
      name: "传感器",
      nameEn: "Sensors",
      icon: "Cpu",
      count: 3,
      alertCount: 1,
    },
    {
      id: "analyzers",
      name: "分析仪器",
      nameEn: "Analyzers",
      icon: "Activity",
      count: 2,
      alertCount: 1,
    },
    {
      id: "testing",
      name: "测试设备",
      nameEn: "Testing Equipment",
      icon: "FlaskConical",
      count: 4,
      alertCount: 2,
    },
    {
      id: "data",
      name: "数据采集",
      nameEn: "Data Acquisition",
      icon: "Database",
      count: 1,
      alertCount: 0,
    },
    {
      id: "network",
      name: "网络节点",
      nameEn: "Network Nodes",
      icon: "Wifi",
      count: 1,
      alertCount: 0,
    },
    {
      id: "environment",
      name: "环境监测",
      nameEn: "Environment",
      icon: "Thermometer",
      count: 1,
      alertCount: 0,
    },
  ]);
});

export default router;
