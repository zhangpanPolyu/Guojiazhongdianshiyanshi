import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface EnvReading {
  temperature: number;
  humidity: number;
  vibration: number;
  power: number;
  timestamp: string;
}

const HISTORY_SIZE = 20;
const envHistory: EnvReading[] = [];

function generateReading(): EnvReading {
  const last = envHistory[envHistory.length - 1];
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const temperature = last
    ? clamp(+(last.temperature + (Math.random() * 0.6 - 0.3)).toFixed(1), 18, 35)
    : +(22.4 + (Math.random() * 2 - 1)).toFixed(1);

  const humidity = last
    ? clamp(+(last.humidity + (Math.random() * 1.2 - 0.6)).toFixed(1), 20, 90)
    : +(65 + (Math.random() * 6 - 3)).toFixed(1);

  const vibration = last
    ? clamp(+(last.vibration + (Math.random() * 0.08 - 0.04)).toFixed(2), 0.1, 5)
    : +(0.42 + (Math.random() * 0.2 - 0.1)).toFixed(2);

  const power = last
    ? clamp(+(last.power + (Math.random() * 4 - 2)).toFixed(1), 100, 200)
    : +(148.6 + (Math.random() * 10 - 5)).toFixed(1);

  return { temperature, humidity, vibration, power, timestamp: new Date().toISOString() };
}

function primeHistory() {
  if (envHistory.length === 0) {
    for (let i = 0; i < HISTORY_SIZE; i++) {
      envHistory.push(generateReading());
    }
  }
}

router.get("/metrics/environment", (_req, res) => {
  primeHistory();
  const reading = generateReading();
  envHistory.push(reading);
  if (envHistory.length > HISTORY_SIZE) envHistory.shift();
  res.json(reading);
});

router.get("/metrics/environment/history", (_req, res) => {
  primeHistory();
  res.json([...envHistory]);
});

const COMPLIANCE_BASE = [
  { subject: "年均机时", value: 87, fullMark: 100 },
  { subject: "共享率",   value: 73, fullMark: 100 },
  { subject: "服务收入", value: 65, fullMark: 100 },
  { subject: "用户评价", value: 92, fullMark: 100 },
  { subject: "培训人次", value: 78, fullMark: 100 },
];

const complianceLive = [...COMPLIANCE_BASE.map(d => ({ ...d }))];

router.get("/metrics/compliance", (_req, res) => {
  const result = complianceLive.map(d => {
    const noise = Math.round((Math.random() * 4 - 2));
    const value = Math.min(d.fullMark, Math.max(1, d.value + noise));
    return { subject: d.subject, value, fullMark: d.fullMark };
  });
  res.json(result);
});

export default router;
