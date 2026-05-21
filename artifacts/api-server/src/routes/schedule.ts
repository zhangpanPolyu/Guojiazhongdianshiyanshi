import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface GanttBlock {
  start: number;
  end: number;
  label: string;
  type: "occupied" | "ai-optimized";
}

interface GanttRow {
  name: string;
  blocks: GanttBlock[];
}

const SCHEDULE: GanttRow[] = [
  {
    name: "离心机",
    blocks: [
      { start: 7,  end: 10,   label: "结构稳定", type: "occupied" },
      { start: 10, end: 12,   label: "AI优化",   type: "ai-optimized" },
      { start: 12, end: 15,   label: "桩基测试", type: "occupied" },
      { start: 18, end: 22,   label: "岩土试验", type: "occupied" },
    ],
  },
  {
    name: "MTS台架",
    blocks: [
      { start: 8,  end: 11,   label: "疲劳测试", type: "occupied" },
      { start: 11, end: 13,   label: "AI优化",   type: "ai-optimized" },
      { start: 13, end: 17,   label: "承载力",   type: "occupied" },
    ],
  },
  {
    name: "振动台",
    blocks: [
      { start: 6,  end: 9,    label: "地震模拟", type: "occupied" },
      { start: 9,  end: 11,   label: "AI优化",   type: "ai-optimized" },
      { start: 11, end: 14,   label: "结构动力", type: "occupied" },
      { start: 20, end: 23,   label: "强震测试", type: "occupied" },
    ],
  },
  {
    name: "驾驶模拟",
    blocks: [
      { start: 9,    end: 12,   label: "驾驶行为", type: "occupied" },
      { start: 14,   end: 18,   label: "自动驾驶", type: "occupied" },
      { start: 18,   end: 19.5, label: "AI优化",   type: "ai-optimized" },
    ],
  },
  {
    name: "高低温箱",
    blocks: [
      { start: 7,  end: 13,   label: "热循环试验", type: "occupied" },
      { start: 15, end: 20,   label: "低温疲劳",   type: "occupied" },
    ],
  },
];

router.get("/schedule/today", (_req, res) => {
  res.json(SCHEDULE);
});

export default router;
