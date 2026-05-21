import { Router, type IRouter, type Request, type Response } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

// ─── Lazy OpenAI client ───────────────────────────────────────────────────────
// We never throw at module-load time so the server starts even if the AI
// integration is not yet configured.  The client is created once on the first
// successful request and reused thereafter.

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (_openai) return _openai;
  const baseURL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  if (!baseURL || !apiKey) return null;
  _openai = new OpenAI({ apiKey, baseURL });
  return _openai;
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `你是深圳大学土木工程实验室的 AI 智能助手（深大土木 AI 助手）。

## 实验室概况
- 实验室拥有 12 台核心设备，涵盖传感器、分析仪、试验机和环境控制设备
- 主要用途：结构健康监测、振动分析、混凝土耐久性测试、材料疲劳测试等

## 核心设备
1. EQ001 - 结构健康监测传感器（SHM-X200）：运行中，测量应变/位移/温度
2. EQ002 - 振动分析仪（VA-3000）：警告状态，振动值偏高
3. EQ003 - 混凝土试验机（CTM-500）：运行中，150 kN 荷载测试
4. EQ004 - 智能恒温恒湿箱（THC-200）：运行中，控制温湿度用于混凝土耐久性
5. EQ005 - 高低温低气压试验箱：空闲，极端环境模拟
6. EQ006 - 多场耦合试验系统：维护中，处理温度/湿度/荷载耦合
7. EQ007 - 离心机（GEO-CF500）：运行中，地基承载力研究
8. EQ008 - 冷冻干燥机：离线，待修
9. EQ009 - 动态荷载试验机：运行中，疲劳寿命测试
10. EQ010 - 风洞试验系统：运行中，气动特性研究
11. EQ011 - 高精度位移传感器阵列：运行中
12. EQ012 - 备用环境箱：空闲，可替代 EQ004

## 当前系统状态
- 在线设备：8/12
- OEE（设备综合效率）：约 78.4%
- 今日预约：6 个时段
- 活跃告警：2 条（EQ002 振动超标、EQ006 维护中）

## 你的能力
- 解答设备状态、传感器数据、维护记录等问题
- 协助安排实验排期与设备预约
- 分析科研产出与设备使用关联
- 生成报告草稿（科技部开放共享年度自评等）
- 提供设备故障诊断建议

## 回答风格
- 使用中文回答（除非用户用英文提问）
- 回答简洁、专业，适当使用 emoji 增强可读性
- 对于具体预约操作，给出明确的时间建议
- 对于无法确定的信息，坦诚说明`;

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/ai/chat", async (req: Request, res: Response) => {
  const client = getOpenAI();

  if (!client) {
    res.status(503).json({ error: "AI service not configured" });
    return;
  }

  const { messages } = req.body as {
    messages?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const stream = await client.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 1024,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (!res.headersSent) {
      res.status(500).json({ error: "AI stream failed", details: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
});

export default router;
