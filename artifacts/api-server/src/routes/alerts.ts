import { Router, type IRouter } from "express";
import { getRegisteredTokens, sendPushNotifications } from "./push-tokens";

const router: IRouter = Router();

const alertsData = [
  {
    id: "ALT001",
    equipmentId: "EQ003",
    equipmentName: "荷载测试系统",
    severity: "critical",
    message: "设备离线，荷载传感器信号丢失，请立即检查",
    messageEn: "Equipment offline — load sensor signal lost. Immediate inspection required.",
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    acknowledged: false,
  },
  {
    id: "ALT002",
    equipmentId: "EQ002",
    equipmentName: "振动分析仪",
    severity: "warning",
    message: "振动幅值超过阈值2.5mm/s，预测性维护建议于2026-08-10前执行",
    messageEn: "Vibration amplitude exceeds 2.5 mm/s threshold. Predictive maintenance recommended before 2026-08-10.",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    acknowledged: false,
  },
  {
    id: "ALT003",
    equipmentId: "EQ011",
    equipmentName: "超声波探伤仪",
    severity: "warning",
    message: "校准偏差检测，建议重新校准设备",
    messageEn: "Calibration drift detected. Recalibration recommended.",
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    acknowledged: false,
  },
  {
    id: "ALT004",
    equipmentId: "EQ005",
    equipmentName: "无线传感网络节点",
    severity: "info",
    message: "电池电量低于90%，预计剩余使用时长：45天",
    messageEn: "Battery below 90%. Estimated remaining life: 45 days.",
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    acknowledged: true,
  },
  {
    id: "ALT005",
    equipmentId: "EQ007",
    equipmentName: "疲劳测试机",
    severity: "info",
    message: "循环计数达到125万次，建议安排下次预防性维护",
    messageEn: "Cycle count reached 1.25M. Preventive maintenance scheduling recommended.",
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    acknowledged: false,
  },
  {
    id: "ALT006",
    equipmentId: "EQ008",
    equipmentName: "材料强度检测仪",
    severity: "critical",
    message: "设备离线超过24小时，请检查电源及通信连接",
    messageEn: "Device offline for over 24 hours. Check power and communication connections.",
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    acknowledged: false,
  },
];

let alerts = [...alertsData];

router.get("/alerts", (req, res) => {
  let result = [...alerts];
  const { acknowledged, severity, equipmentId } = req.query;
  if (acknowledged !== undefined) {
    const ack = acknowledged === "true";
    result = result.filter((a) => a.acknowledged === ack);
  }
  if (severity && typeof severity === "string") {
    result = result.filter((a) => a.severity === severity);
  }
  if (equipmentId && typeof equipmentId === "string") {
    result = result.filter((a) => a.equipmentId === equipmentId);
  }
  res.json(result);
});

router.post("/alerts", (req, res) => {
  const { equipmentId, equipmentName, severity, message, messageEn } = req.body as {
    equipmentId?: string;
    equipmentName?: string;
    severity?: string;
    message?: string;
    messageEn?: string;
  };

  if (!equipmentId || !equipmentName || !severity || !messageEn) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newAlert = {
    id: `ALT${String(alerts.length + 1).padStart(3, "0")}`,
    equipmentId,
    equipmentName,
    severity,
    message: message ?? messageEn,
    messageEn,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };

  alerts.unshift(newAlert);

  if (severity === "critical" || severity === "warning") {
    const tokens = Array.from(getRegisteredTokens());
    if (tokens.length > 0) {
      const SEVERITY_TITLES: Record<string, string> = {
        critical: "CRITICAL FAULT",
        warning: "WARNING",
      };
      sendPushNotifications(
        tokens.map((token) => ({
          to: token,
          sound: "default" as const,
          title: SEVERITY_TITLES[severity] ?? severity.toUpperCase(),
          body: `${equipmentName}: ${messageEn}`,
          data: { equipmentId, alertId: newAlert.id },
          priority: severity === "critical" ? ("high" as const) : ("normal" as const),
        }))
      );
    }
  }

  res.status(201).json(newAlert);
});

router.post("/alerts/:id/acknowledge", (req, res) => {
  const alert = alerts.find((a) => a.id === req.params.id);
  if (!alert) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  alert.acknowledged = true;
  res.json(alert);
});

export default router;
