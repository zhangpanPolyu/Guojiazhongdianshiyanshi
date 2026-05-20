import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/metrics/environment", (_req, res) => {
  const now = new Date().toISOString();
  res.json({
    temperature: +(22.4 + (Math.random() * 2 - 1)).toFixed(1),
    humidity: +(65 + (Math.random() * 6 - 3)).toFixed(1),
    vibration: +(0.42 + (Math.random() * 0.2 - 0.1)).toFixed(2),
    power: +(148.6 + (Math.random() * 10 - 5)).toFixed(1),
    timestamp: now,
  });
});

export default router;
