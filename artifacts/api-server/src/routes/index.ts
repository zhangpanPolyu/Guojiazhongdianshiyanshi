import { Router, type IRouter } from "express";
import healthRouter from "./health";
import equipmentRouter from "./equipment";
import alertsRouter from "./alerts";
import categoriesRouter from "./categories";
import dashboardRouter from "./dashboard";
import metricsRouter from "./metrics";
import scheduleRouter from "./schedule";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(equipmentRouter);
router.use(alertsRouter);
router.use(categoriesRouter);
router.use(dashboardRouter);
router.use(metricsRouter);
router.use(scheduleRouter);
router.use(aiRouter);

export default router;
