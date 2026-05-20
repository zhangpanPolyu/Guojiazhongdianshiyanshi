import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Send } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  displayedText: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const QUICK_COMMANDS = [
  { label: "一键生成科技部自评数据表", emoji: "📊" },
  { label: "协调明天下午的极端环境组合实验", emoji: "📅" },
  { label: "分析本季度科研产出与设备使用关联度", emoji: "📈" },
];

const AI_RESPONSES: Record<string, string> = {
  "一键生成科技部自评数据表":
    "📊 正在整合全年设备使用数据...\n\n已生成科技部开放共享年度自评报告草稿：\n• 年均有效工作机时：2,847 h\n• 对外服务收入：较去年 +23.4%\n• 用户评价均分：4.6 / 5.0\n• 培训人次：218 人次\n\nExcel 报表已就绪，是否同步至国家重大科研基础设施平台？",
  "协调明天下午的极端环境组合实验":
    "📅 正在检索明日下午资源占用情况...\n\n明日 14:00–18:00 时段：\n• 离心机：✅ 空闲\n• 高低温低气压试验箱：✅ 空闲\n• 多场耦合实验室：⚠️ 13:30–15:00 被材料组占用\n\n💡 建议：将组合实验调整为 15:30–18:30，可获得三台设备连续时间窗口。是否一键通知相关课题组负责人？",
  "分析本季度科研产出与设备使用关联度":
    "📈 正在运行 Q1 科研产出关联分析...\n\n结论：设备使用强度与论文产出呈显著正相关：\n• 振动台 × 高引用论文：r = 0.87 ⬆️\n• 离心机 × 专利申请：r = 0.79 ⬆️\n• 冷冻干燥机（闲置）产出贡献：r = 0.12 ➡️\n\n建议将振动台和离心机优先级升至 S 级，并重新评估冷冻干燥机的开放共享策略。",
};

const DEFAULT_AI_RESPONSE =
  "🤖 指令已接收，正在处理中...\n\n我已检索相关设备日历和实验室资源数据。目前系统运行状态良好，12 台核心设备中 8 台在线。\n\n如需具体操作，请告诉我设备名称和使用时间段，我将为您安排。";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-0",
    role: "ai",
    text: "您好！我是深大土木工程实验室 AI 助手。\n\n我可以帮您：\n• 查询设备状态与预约日历\n• 安排与协调实验排期\n• 生成科技部开放共享报表\n• 分析科研产出与设备使用关联\n\n请问有什么需要帮助的？",
    displayedText:
      "您好！我是深大土木工程实验室 AI 助手。\n\n我可以帮您：\n• 查询设备状态与预约日历\n• 安排与协调实验排期\n• 生成科技部开放共享报表\n• 分析科研产出与设备使用关联\n\n请问有什么需要帮助的？",
  },
  {
    id: "demo-1",
    role: "user",
    text: "帮我预约本周四的智能恒温恒湿箱用于混凝土耐久性测试。",
    displayedText: "帮我预约本周四的智能恒温恒湿箱用于混凝土耐久性测试。",
  },
  {
    id: "demo-2",
    role: "ai",
    text: "🔍 正在检索设备日历...\n\n恒温恒湿箱周四 10:00–16:00 已被深地工程课题组占用。\n\n💡 智能建议：本周五全天该设备空闲，或使用实验室另一台备用环境箱（EQ-012）。是否为您一键更改预约至周五？",
    displayedText:
      "🔍 正在检索设备日历...\n\n恒温恒湿箱周四 10:00–16:00 已被深地工程课题组占用。\n\n💡 智能建议：本周五全天该设备空闲，或使用实验室另一台备用环境箱（EQ-012）。是否为您一键更改预约至周五？",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAIResponse(text: string): string {
  for (const key of Object.keys(AI_RESPONSES)) {
    if (text.includes(key.slice(0, 7))) return AI_RESPONSES[key];
  }
  return DEFAULT_AI_RESPONSE;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── CoreIcon ─────────────────────────────────────────────────────────────────

function CoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <polygon
        points="22,2 40,12 40,32 22,42 4,32 4,12"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <polygon
        points="22,9 34,16 34,28 22,35 10,28 10,16"
        stroke="currentColor"
        strokeWidth="1"
        fill="currentColor"
        fillOpacity={0.08}
      />
      <line x1="22" y1="14" x2="22" y2="30" stroke="currentColor" strokeWidth="0.8" strokeOpacity={0.55} />
      <line x1="14" y1="22" x2="30" y2="22" stroke="currentColor" strokeWidth="0.8" strokeOpacity={0.55} />
      <line x1="16" y1="16" x2="28" y2="28" stroke="currentColor" strokeWidth="0.5" strokeOpacity={0.35} />
      <line x1="28" y1="16" x2="16" y2="28" stroke="currentColor" strokeWidth="0.5" strokeOpacity={0.35} />
      <circle cx="22" cy="22" r="6" stroke="currentColor" strokeWidth="0.75" strokeOpacity={0.4} fill="none" />
      <circle cx="22" cy="22" r="3.5" fill="currentColor" />
    </svg>
  );
}

// ─── Chat bubbles ────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const typing = msg.displayedText.length < msg.text.length;

  return (
    <div className={cn("flex items-start gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div className="w-6 h-6 shrink-0 mt-0.5 rounded-full border border-sci-cyan/40 bg-sci-cyan/10 flex items-center justify-center">
          <CoreIcon className="w-3.5 h-3.5 text-sci-cyan" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-sci-cyan/14 border border-sci-cyan/30 text-white/90 rounded-tr-sm"
            : "bg-white/7 border border-white/10 text-white/82 rounded-tl-sm"
        )}
      >
        {msg.displayedText}
        {typing && (
          <span className="ml-0.5 inline-block w-1.5 h-[13px] bg-sci-cyan/80 animate-pulse rounded-sm align-middle" />
        )}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 shrink-0 mt-0.5 rounded-full border border-sci-cyan/40 bg-sci-cyan/10 flex items-center justify-center">
        <CoreIcon className="w-3.5 h-3.5 text-sci-cyan" />
      </div>
      <div className="bg-white/7 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-sci-cyan/60"
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AICopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [beaming, setBeaming] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll on new messages / thinking state
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

  // Typewriter: runs when message list length changes (new message added)
  useEffect(() => {
    const pending = [...messages]
      .reverse()
      .find((m) => m.role === "ai" && m.displayedText.length < m.text.length);
    if (!pending) return;

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    const targetId = pending.id;

    typingTimerRef.current = setInterval(() => {
      setMessages((prev) => {
        const msg = prev.find((m) => m.id === targetId);
        if (!msg) return prev;
        const nextLen = Math.min(msg.text.length, msg.displayedText.length + 3);
        if (nextLen >= msg.text.length) {
          clearInterval(typingTimerRef.current!);
          typingTimerRef.current = null;
          return prev.map((m) =>
            m.id === targetId ? { ...m, displayedText: msg.text } : m
          );
        }
        return prev.map((m) =>
          m.id === targetId ? { ...m, displayedText: msg.text.slice(0, nextLen) } : m
        );
      });
    }, 22);

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      if (thinkTimerRef.current) clearTimeout(thinkTimerRef.current);
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    };
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      const userMsg: Message = {
        id: makeId(),
        role: "user",
        text: trimmed,
        displayedText: trimmed,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setIsThinking(true);

      thinkTimerRef.current = setTimeout(() => {
        setIsThinking(false);
        const responseText = getAIResponse(trimmed);
        const aiMsg: Message = {
          id: makeId(),
          role: "ai",
          text: responseText,
          displayedText: "",
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 1300);
    },
    [isThinking]
  );

  const handleBeamSend = () => {
    if (!inputText.trim() || isThinking) return;
    setBeaming(true);
    setTimeout(() => setBeaming(false), 500);
    sendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBeamSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
  };

  return (
    <>
      {/* ── Floating trigger button + label ────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-center gap-1.5">
        <motion.button
          onClick={() => setIsOpen((o) => !o)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            "text-sci-cyan border border-sci-cyan/40 bg-[#050814]/85 backdrop-blur-md"
          )}
          animate={{
            scale: [1, 1.07, 1],
            boxShadow: [
              "0 0 18px rgba(0,240,255,0.22), 0 0 0px rgba(0,240,255,0)",
              "0 0 32px rgba(0,240,255,0.55), 0 0 60px rgba(0,240,255,0.15)",
              "0 0 18px rgba(0,240,255,0.22), 0 0 0px rgba(0,240,255,0)",
            ],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.14 }}
          whileTap={{ scale: 0.9 }}
          aria-label="AI 智能助手"
          title="AI 智能助手"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="core"
                className="flex items-center justify-center"
                initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                <CoreIcon className="w-7 h-7" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Text label — fades out when drawer is open */}
        <motion.span
          className="text-[9px] font-mono text-sci-cyan/65 tracking-[0.18em] select-none pointer-events-none"
          animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? 4 : 0 }}
          transition={{ duration: 0.2 }}
        >
          AI 助手
        </motion.span>
      </div>

      {/* ── Backdrop ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[55] bg-black/25 backdrop-blur-[2px] pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Drawer panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="drawer"
            className={cn(
              "fixed right-0 top-0 h-full w-[400px] z-[58]",
              "flex flex-col overflow-hidden",
              "bg-[rgba(5,8,20,0.82)] backdrop-blur-2xl",
              "border-l border-sci-cyan/20"
            )}
            style={{ boxShadow: "-4px 0 40px rgba(0,240,255,0.08)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
          >
            {/* Header */}
            <div className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-sci-cyan/12 bg-white/[0.025]">
              <div className="flex items-center gap-3">
                <CoreIcon className="w-6 h-6 text-sci-cyan" />
                <div>
                  <div className="text-[13px] font-semibold text-white tracking-wide">
                    AI 智能助手
                  </div>
                  <div className="text-[10px] font-mono text-sci-green flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sci-green animate-pulse inline-block" />
                    深大土木工程实验室 · 在线
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/35 hover:text-white/75 transition-colors p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick commands */}
            <div className="shrink-0 px-4 pt-3 pb-3 border-b border-white/[0.05]">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2.5">
                快捷指令
              </div>
              <div className="flex flex-col gap-1.5">
                {QUICK_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.label}
                    onClick={() => sendMessage(cmd.label)}
                    disabled={isThinking}
                    className={cn(
                      "text-left text-[11px] px-3.5 py-2 rounded-full border font-mono",
                      "bg-sci-cyan/[0.06] border-sci-cyan/20 text-sci-cyan/75",
                      "hover:bg-sci-cyan/[0.14] hover:border-sci-cyan/45 hover:text-sci-cyan",
                      "transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
                      "flex items-center gap-2.5"
                    )}
                  >
                    <span className="shrink-0">{cmd.emoji}</span>
                    <span className="truncate">{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} />
              ))}
              {isThinking && <ThinkingBubble />}
              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div className="shrink-0 px-4 py-3 border-t border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-end gap-2.5 bg-white/[0.06] rounded-2xl border border-white/10 px-3.5 py-2.5 focus-within:border-sci-cyan/30 transition-colors duration-200">
                <Mic className="w-4 h-4 text-white/28 shrink-0 mb-0.5 cursor-not-allowed" />
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="输入指令或提问… (Enter 发送 · Shift+Enter 换行)"
                  rows={1}
                  disabled={isThinking}
                  className={cn(
                    "flex-1 resize-none bg-transparent outline-none",
                    "text-[12px] leading-relaxed text-white/85 placeholder-white/22",
                    "disabled:opacity-50"
                  )}
                  style={{ fontFamily: "'JetBrains Mono', monospace", maxHeight: "80px" }}
                />
                <div className="relative shrink-0 mb-0.5">
                  {/* Beam burst effect */}
                  <AnimatePresence>
                    {beaming && (
                      <motion.div
                        key="beam"
                        className="absolute inset-0 rounded-full bg-sci-cyan pointer-events-none"
                        initial={{ scale: 0.6, opacity: 0.9 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{}}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.button
                    onClick={handleBeamSend}
                    disabled={!inputText.trim() || isThinking}
                    whileTap={{ scale: 0.82 }}
                    className={cn(
                      "relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
                      inputText.trim() && !isThinking
                        ? "bg-sci-cyan text-[#050814] shadow-[0_0_14px_rgba(0,240,255,0.55)]"
                        : "bg-white/10 text-white/30"
                    )}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
              <p className="text-[9px] font-mono text-white/18 text-center mt-2 leading-tight">
                AI 回复为模拟演示 · 接入真实大模型后可实现全自动化实验室管控
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
