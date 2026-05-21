import { Router, type IRouter } from "express";

const router: IRouter = Router();

const equipmentData = [
  {
    id: "EQ001",
    name: "结构健康监测传感器",
    nameEn: "Structural Health Monitoring Sensor",
    category: "sensors",
    status: "running",
    location: "主楼A区3层",
    locationEn: "Main Building Zone A, Floor 3",
    model: "SHM-X200",
    serialNumber: "SHM-2023-001",
    lastMaintenance: "2026-03-15",
    predictedFailureDate: null,
    metrics: [
      { key: "strain", label: "应变", value: 142.5, unit: "με", timestamp: new Date().toISOString(), trend: "stable" },
      { key: "displacement", label: "位移", value: 0.23, unit: "mm", timestamp: new Date().toISOString(), trend: "up" },
      { key: "temperature", label: "温度", value: 24.1, unit: "°C", timestamp: new Date().toISOString(), trend: "stable" },
    ],
  },
  {
    id: "EQ002",
    name: "振动分析仪",
    nameEn: "Vibration Analyzer",
    category: "analyzers",
    status: "warning",
    location: "实验室B区2层",
    locationEn: "Lab Zone B, Floor 2",
    model: "VA-3500",
    serialNumber: "VA-2022-007",
    lastMaintenance: "2026-01-20",
    predictedFailureDate: "2026-08-10",
    metrics: [
      { key: "vibration", label: "振动幅值", value: 2.87, unit: "mm/s", timestamp: new Date().toISOString(), trend: "up" },
      { key: "frequency", label: "频率", value: 12.4, unit: "Hz", timestamp: new Date().toISOString(), trend: "stable" },
      { key: "rms", label: "均方根值", value: 1.92, unit: "mm/s", timestamp: new Date().toISOString(), trend: "up" },
    ],
  },
  {
    id: "EQ003",
    name: "荷载测试系统",
    nameEn: "Load Testing System",
    category: "testing",
    status: "fault",
    location: "结构实验室",
    locationEn: "Structural Laboratory",
    model: "LTS-8000",
    serialNumber: "LTS-2021-003",
    lastMaintenance: "2025-11-05",
    predictedFailureDate: "2026-05-25",
    metrics: [
      { key: "load", label: "荷载", value: 0, unit: "kN", timestamp: new Date().toISOString(), trend: "down" },
      { key: "deformation", label: "变形量", value: 0, unit: "mm", timestamp: new Date().toISOString(), trend: "stable" },
    ],
  },
  {
    id: "EQ004",
    name: "数据采集系统",
    nameEn: "Data Acquisition System",
    category: "data",
    status: "running",
    location: "控制中心",
    locationEn: "Control Center",
    model: "DAQ-Pro 4000",
    serialNumber: "DAQ-2023-012",
    lastMaintenance: "2026-04-01",
    predictedFailureDate: null,
    metrics: [
      { key: "channels", label: "采集通道", value: 128, unit: "ch", timestamp: new Date().toISOString(), trend: "stable" },
      { key: "sampleRate", label: "采样率", value: 10000, unit: "S/s", timestamp: new Date().toISOString(), trend: "stable" },
    ],
  },
  {
    id: "EQ005",
    name: "无线传感网络节点",
    nameEn: "Wireless Sensor Network Node",
    category: "network",
    status: "running",
    location: "外墙监测点C",
    locationEn: "Exterior Wall Monitor Point C",
    model: "WSN-NX5",
    serialNumber: "WSN-2024-031",
    lastMaintenance: "2026-04-10",
    predictedFailureDate: null,
    metrics: [
      { key: "rssi", label: "信号强度", value: -68, unit: "dBm", timestamp: new Date().toISOString(), trend: "stable" },
      { key: "battery", label: "电量", value: 87, unit: "%", timestamp: new Date().toISOString(), trend: "down" },
    ],
  },
  {
    id: "EQ006",
    name: "动态信号分析仪",
    nameEn: "Dynamic Signal Analyzer",
    category: "analyzers",
    status: "maintenance",
    location: "测试平台D区",
    locationEn: "Testing Platform Zone D",
    model: "DSA-9200",
    serialNumber: "DSA-2022-015",
    lastMaintenance: "2026-05-18",
    predictedFailureDate: null,
    metrics: [
      { key: "bandwidth", label: "带宽", value: 20000, unit: "Hz", timestamp: new Date().toISOString(), trend: "stable" },
    ],
  },
  {
    id: "EQ007",
    name: "疲劳测试机",
    nameEn: "Fatigue Testing Machine",
    category: "testing",
    status: "running",
    location: "材料实验室",
    locationEn: "Materials Laboratory",
    model: "FTM-2000",
    serialNumber: "FTM-2020-002",
    lastMaintenance: "2026-02-28",
    predictedFailureDate: "2026-11-30",
    metrics: [
      { key: "cycles", label: "循环次数", value: 1248750, unit: "次", timestamp: new Date().toISOString(), trend: "up" },
      { key: "maxStress", label: "最大应力", value: 450, unit: "MPa", timestamp: new Date().toISOString(), trend: "stable" },
    ],
  },
  {
    id: "EQ008",
    name: "材料强度检测仪",
    nameEn: "Material Strength Detector",
    category: "testing",
    status: "offline",
    location: "材料实验室",
    locationEn: "Materials Laboratory",
    model: "MSD-600",
    serialNumber: "MSD-2019-008",
    lastMaintenance: "2025-09-14",
    predictedFailureDate: null,
    metrics: [],
  },
  {
    id: "EQ009",
    name: "裂缝宽度测量仪",
    nameEn: "Crack Width Gauge",
    category: "sensors",
    status: "running",
    location: "现场检测B栋",
    locationEn: "On-site Inspection Building B",
    model: "CWG-100",
    serialNumber: "CWG-2024-005",
    lastMaintenance: "2026-04-22",
    predictedFailureDate: null,
    metrics: [
      { key: "crackWidth", label: "裂缝宽度", value: 0.12, unit: "mm", timestamp: new Date().toISOString(), trend: "stable" },
    ],
  },
  {
    id: "EQ010",
    name: "地震模拟振动台",
    nameEn: "Seismic Simulation Shaker",
    category: "testing",
    status: "running",
    location: "大型实验厅",
    locationEn: "Large-scale Test Hall",
    model: "SST-6D",
    serialNumber: "SST-2018-001",
    lastMaintenance: "2026-01-08",
    predictedFailureDate: null,
    metrics: [
      { key: "maxAccel", label: "最大加速度", value: 1.8, unit: "g", timestamp: new Date().toISOString(), trend: "stable" },
      { key: "payload", label: "承载质量", value: 15000, unit: "kg", timestamp: new Date().toISOString(), trend: "stable" },
    ],
  },
  {
    id: "EQ011",
    name: "超声波探伤仪",
    nameEn: "Ultrasonic Flaw Detector",
    category: "sensors",
    status: "warning",
    location: "无损检测室",
    locationEn: "NDT Laboratory",
    model: "UFD-350",
    serialNumber: "UFD-2022-009",
    lastMaintenance: "2026-02-14",
    predictedFailureDate: "2026-09-01",
    metrics: [
      { key: "frequency", label: "探测频率", value: 5, unit: "MHz", timestamp: new Date().toISOString(), trend: "stable" },
      { key: "depth", label: "探测深度", value: 250, unit: "mm", timestamp: new Date().toISOString(), trend: "stable" },
    ],
  },
  {
    id: "EQ012",
    name: "智能环境监测站",
    nameEn: "Intelligent Environment Monitor",
    category: "environment",
    status: "running",
    location: "楼顶气象站",
    locationEn: "Rooftop Weather Station",
    model: "IEM-Pro",
    serialNumber: "IEM-2023-004",
    lastMaintenance: "2026-03-30",
    predictedFailureDate: null,
    metrics: [
      { key: "temperature", label: "温度", value: 26.3, unit: "°C", timestamp: new Date().toISOString(), trend: "up" },
      { key: "humidity", label: "湿度", value: 68, unit: "%", timestamp: new Date().toISOString(), trend: "stable" },
      { key: "windSpeed", label: "风速", value: 3.2, unit: "m/s", timestamp: new Date().toISOString(), trend: "up" },
    ],
  },
];

router.get("/equipment", (req, res) => {
  let result = [...equipmentData];
  const { category, status, search } = req.query;
  if (category && typeof category === "string") {
    result = result.filter((e) => e.category === category);
  }
  if (status && typeof status === "string") {
    result = result.filter((e) => e.status === status);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.nameEn.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
    );
  }
  res.json(result);
});

router.get("/equipment/:id", (req, res) => {
  const item = equipmentData.find((e) => e.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(item);
});

const METRIC_HISTORY_SIZE = 20;

interface MetricHistoryEntry {
  value: number;
  timestamp: string;
}

const equipmentMetricHistory: Map<string, Map<string, MetricHistoryEntry[]>> = new Map();
const equipmentCurrentValues: Map<string, Map<string, number>> = new Map();

function getOrInitHistory(equipmentId: string, metricKey: string): MetricHistoryEntry[] {
  if (!equipmentMetricHistory.has(equipmentId)) {
    equipmentMetricHistory.set(equipmentId, new Map());
  }
  const eqMap = equipmentMetricHistory.get(equipmentId)!;
  if (!eqMap.has(metricKey)) {
    eqMap.set(metricKey, []);
  }
  return eqMap.get(metricKey)!;
}

function getOrInitCurrentValue(equipmentId: string, metricKey: string, baseValue: number): number {
  if (!equipmentCurrentValues.has(equipmentId)) {
    equipmentCurrentValues.set(equipmentId, new Map());
  }
  const eqMap = equipmentCurrentValues.get(equipmentId)!;
  if (!eqMap.has(metricKey)) {
    eqMap.set(metricKey, baseValue);
  }
  return eqMap.get(metricKey)!;
}

function setCurrentValue(equipmentId: string, metricKey: string, value: number): void {
  equipmentCurrentValues.get(equipmentId)!.set(metricKey, value);
}

function computeDecimalPlaces(baseValue: number): number {
  if (baseValue % 1 === 0) return 0;
  const str = String(baseValue);
  return str.includes('.') ? str.split('.')[1].length : 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function advanceLiveValue(equipmentId: string, metricKey: string, baseValue: number): number {
  if (baseValue === 0) return 0;

  const decimals = computeDecimalPlaces(baseValue);
  const current = getOrInitCurrentValue(equipmentId, metricKey, baseValue);

  const driftScale = baseValue * 0.008;
  const noiseScale = baseValue * 0.005;

  const meanReversion = (baseValue - current) * 0.08;
  const drift = (Math.random() - 0.5) * 2 * driftScale;
  const noise = (Math.random() - 0.5) * 2 * noiseScale;

  const next = current + meanReversion + drift + noise;

  const lo = baseValue * 0.85;
  const hi = baseValue * 1.15;
  const clamped = clamp(next, Math.min(lo, hi), Math.max(lo, hi));
  const result = +clamped.toFixed(decimals);

  setCurrentValue(equipmentId, metricKey, result);
  return result;
}

function primeEquipmentHistory(item: typeof equipmentData[0]) {
  const eqHistory = equipmentMetricHistory.get(item.id);
  const isNew = !eqHistory || eqHistory.size === 0;
  if (!isNew) return;

  for (const m of item.metrics) {
    getOrInitCurrentValue(item.id, m.key, m.value);
    const history = getOrInitHistory(item.id, m.key);
    if (history.length === 0) {
      for (let i = 0; i < METRIC_HISTORY_SIZE; i++) {
        const v = advanceLiveValue(item.id, m.key, m.value);
        history.push({ value: v, timestamp: new Date(Date.now() - (METRIC_HISTORY_SIZE - i) * 5000).toISOString() });
      }
    }
  }
}

router.get("/equipment/:id/metrics", (req, res) => {
  const item = equipmentData.find((e) => e.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  primeEquipmentHistory(item);

  const now = new Date().toISOString();
  const liveMetrics = item.metrics.map(m => {
    const liveValue = advanceLiveValue(item.id, m.key, m.value);
    const history = getOrInitHistory(item.id, m.key);
    history.push({ value: liveValue, timestamp: now });
    if (history.length > METRIC_HISTORY_SIZE) history.shift();
    return { ...m, value: liveValue, timestamp: now };
  });
  res.json(liveMetrics);
});

router.get("/equipment/:id/metrics/history", (req, res) => {
  const item = equipmentData.find((e) => e.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  primeEquipmentHistory(item);

  const result = item.metrics.map(m => {
    const history = getOrInitHistory(item.id, m.key);
    return {
      key: m.key,
      label: m.label,
      unit: m.unit,
      history: history.map(h => ({ value: h.value, timestamp: h.timestamp })),
    };
  });

  res.json(result);
});

interface Reservation {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  timeSlot: string;
  createdAt: string;
  requestedBy: string;
}

const reservations: Reservation[] = [];

router.post("/equipment/:id/reserve", (req, res) => {
  const { date, timeSlot, requestedBy, equipmentName } = req.body as {
    date?: string;
    timeSlot?: string;
    requestedBy?: string;
    equipmentName?: string;
  };

  const item = equipmentData.find((e) => e.id === req.params.id);

  const reservation: Reservation = {
    id: `RES-${Date.now()}`,
    equipmentId: req.params.id,
    equipmentName: equipmentName ?? item?.name ?? req.params.id,
    date: date ?? "周五",
    timeSlot: timeSlot ?? "全天",
    createdAt: new Date().toISOString(),
    requestedBy: requestedBy ?? "用户",
  };

  reservations.push(reservation);
  res.status(201).json({ success: true, reservation });
});

router.get("/equipment/:id/reservations", (req, res) => {
  const result = reservations.filter((r) => r.equipmentId === req.params.id);
  res.json(result);
});

export default router;
