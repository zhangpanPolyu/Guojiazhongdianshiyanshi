import React, { useState, useEffect, useRef } from "react";
import { GlassPanel } from "../../ui/glass-panel";

type Level = "CRITICAL" | "WARN" | "INFO";

interface LogLine {
  id: number;
  time: string;
  level: Level;
  msg: string;
}

const POOL: Array<{ level: Level; msg: string }> = [
  { level: "CRITICAL", msg: "[时序大模型] 高低温低气压试验箱气压阀异常振动，预计 120h 后失效，请尽早排查。" },
  { level: "WARN",     msg: "[预测性维保] 离心机#03 轴承温度偏高 +4.2°C，建议 72h 内检查润滑。" },
  { level: "INFO",     msg: "[系统] BIM 算力中心 GPU 集群负载 85%，已触发弹性扩容。" },
  { level: "WARN",     msg: "[预测性维保] 高低温试验箱压缩机效率下降 12%，建议维保周期优先处理。" },
  { level: "CRITICAL", msg: "[时序大模型] 振动台液压伺服油压波动超限 ±15%，预计 48h 后异常。" },
  { level: "INFO",     msg: "[资源调度] AI 优化算法完成今日排期，实验利用率提升 23%。" },
  { level: "WARN",     msg: "[预测性维保] 冷冻干燥机真空泵出现周期噪声 3.2 Hz，建议本周检查。" },
  { level: "INFO",     msg: "[系统] 结构健康监测已完成日志归档，数据完整性校验通过。" },
  { level: "WARN",     msg: "[预测性维保] MTS #2 力传感器零漂超阈值 0.05%，建议重新标定。" },
  { level: "CRITICAL", msg: "[时序大模型] 极端环境实验箱密封圈磨损信号异常，预计 96h 内需更换。" },
  { level: "INFO",     msg: "[系统] 智能环境监测站同步气象数据完成，温湿度参数已更新。" },
  { level: "WARN",     msg: "[预测性维保] 驾驶模拟器投影亮度衰减 8%，已加入计划更换列表。" },
  { level: "INFO",     msg: "[AI调度] 多场耦合实验室 09:00–11:00 时段已优化，冲突减少 2 项。" },
  { level: "WARN",     msg: "[预测性维保] 地震模拟振动台伺服阀响应延迟 +3ms，建议校准。" },
  { level: "CRITICAL", msg: "[时序大模型] 高温蒸汽压力容器安全阀动作频率异常，建议立即检查。" },
];

let _id = 0;
const ts = () => new Date().toLocaleTimeString("zh-CN", { hour12: false });

function seedLines(): LogLine[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: ++_id,
    time: ts(),
    level: POOL[i % POOL.length].level,
    msg: POOL[i % POOL.length].msg,
  }));
}

export function AIAlertsTerminal() {
  const [lines, setLines] = useState<LogLine[]>(seedLines);
  const poolRef = useRef(6);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const entry = POOL[poolRef.current % POOL.length];
      poolRef.current++;
      const line: LogLine = { id: ++_id, time: ts(), level: entry.level, msg: entry.msg };
      setLines(prev => [line, ...prev.slice(0, 29)]);
      timer = setTimeout(tick, 2200 + Math.random() * 1800);
    };

    timer = setTimeout(tick, 2200 + Math.random() * 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = 0;
  }, [lines]);

  return (
    <GlassPanel className="flex flex-col p-3" style={{ height: "240px" }}>
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h3 className="text-[10px] font-semibold tracking-widest text-white/60 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sci-green animate-pulse inline-block" />
          AI 预测性维保终端
        </h3>
        <span className="text-[9px] font-mono text-sci-green tracking-widest">● LIVE</span>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hide rounded bg-black/35 border border-white/5 p-2 space-y-0.5"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {lines.map((line) => (
          <div key={line.id} className="flex gap-1.5 text-[9.5px] leading-relaxed">
            <span className="text-white/25 shrink-0 tabular-nums">{line.time}</span>
            <LevelTag level={line.level} />
            <span className="text-white/65 break-words min-w-0">{line.msg}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function LevelTag({ level }: { level: Level }) {
  if (level === "CRITICAL")
    return (
      <span
        className="shrink-0 font-bold animate-pulse"
        style={{ color: "var(--sci-red)" }}
      >
        [CRITICAL]
      </span>
    );
  if (level === "WARN")
    return (
      <span className="shrink-0 font-bold" style={{ color: "var(--sci-amber)" }}>
        [WARN]
      </span>
    );
  return (
    <span className="shrink-0" style={{ color: "var(--sci-cyan)" }}>
      [INFO]
    </span>
  );
}
