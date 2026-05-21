import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Send, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingHint {
  equipmentId: string;
  equipmentName: string;
  date: string;
  timeSlot: string;
}

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  displayedText: string;
  bookingHint?: BookingHint;
  bookingActed?: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "ai_copilot_history_v1";

// ─── Static data ─────────────────────────────────────────────────────────────

const QUICK_COMMANDS = [
  { label: "一键生成科技部自评数据表", emoji: "📊" },
  { label: "协调明天下午的极端环境组合实验", emoji: "📅" },
  { label: "分析本季度科研产出与设备使用关联度", emoji: "📈" },
];

// Scripted fallback pool — used when the API is unavailable
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
    bookingHint: {
      equipmentId: "EQ-THERMO",
      equipmentName: "恒温恒湿箱",
      date: "周五",
      timeSlot: "全天",
    },
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

/** Whitelisted shape persisted to localStorage.
 *  - `text` is the operational message content (equipment queries, AI responses).
 *  - No usernames, email addresses, or other PII are part of the Message type.
 *  - bookingHint contains only equipmentId, equipmentName, date, and timeSlot —
 *    all operational identifiers, no personal data.
 */
interface PersistedMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  bookingHint?: BookingHint;
  bookingActed?: boolean;
}

const VALID_ROLES = new Set<string>(["user", "ai"]);

/** Strict runtime validation of a single persisted entry. Returns true only
 *  when every field matches the expected shape and type. */
function isValidPersistedMessage(v: unknown): v is PersistedMessage {
  if (!v || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  if (typeof m.id !== "string" || !m.id) return false;
  if (!VALID_ROLES.has(m.role as string)) return false;
  if (typeof m.text !== "string") return false;
  if (m.bookingHint !== undefined) {
    const h = m.bookingHint as Record<string, unknown>;
    if (
      typeof h.equipmentId !== "string" ||
      typeof h.equipmentName !== "string" ||
      typeof h.date !== "string" ||
      typeof h.timeSlot !== "string"
    )
      return false;
  }
  if (m.bookingActed !== undefined && typeof m.bookingActed !== "boolean")
    return false;
  return true;
}

/** Serialize messages to localStorage using only the whitelisted fields.
 *  displayedText is intentionally omitted — it is always reconstructed from
 *  `text` on restore so restored messages never re-trigger the typewriter effect. */
function saveHistory(messages: Message[]) {
  try {
    const serializable: PersistedMessage[] = messages.map((m) => {
      const entry: PersistedMessage = { id: m.id, role: m.role, text: m.text };
      if (m.bookingHint) {
        entry.bookingHint = {
          equipmentId: m.bookingHint.equipmentId,
          equipmentName: m.bookingHint.equipmentName,
          date: m.bookingHint.date,
          timeSlot: m.bookingHint.timeSlot,
        };
      }
      if (m.bookingActed !== undefined) entry.bookingActed = m.bookingActed;
      return entry;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // quota exceeded or private-browsing block — silently ignore
  }
}

/** Load and strictly validate persisted messages from localStorage.
 *  Returns null if nothing is stored, the data is malformed, or any entry
 *  fails schema validation. */
function loadHistory(): Message[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    if (!parsed.every(isValidPersistedMessage)) return null;
    return (parsed as PersistedMessage[]).map((m) => ({
      id: m.id,
      role: m.role,
      text: m.text,
      displayedText: m.text,
      bookingHint: m.bookingHint,
      bookingActed: m.bookingActed,
    }));
  } catch {
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFallbackResponse(text: string): string {
  for (const key of Object.keys(AI_RESPONSES)) {
    if (text.includes(key.slice(0, 7))) return AI_RESPONSES[key];
  }
  return DEFAULT_AI_RESPONSE;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toChatHistory(messages: Message[]): ChatMessage[] {
  return messages
    .filter((m) => m.id !== "init-0")
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));
}

/** Detect if an AI message contains a booking suggestion and extract the hint. */
function detectBookingHint(text: string): BookingHint | null {
  // Must contain a booking suggestion pattern
  const hasBookingSuggestion =
    (text.includes("是否") && text.includes("预约")) ||
    text.includes("一键更改预约") ||
    (text.includes("是否") && text.includes("一键"));
  if (!hasBookingSuggestion) return null;

  // Extract the SUGGESTED date — suggestion phrases usually follow the conflicted slot,
  // so prefer an explicit "至周X / 改为周X" pattern, then fall back to the last weekday.
  let date = "周五"; // sensible default matching the demo content
  const toDateMatch = text.match(/(?:至|更改为|调整为|改为|改到)\s*(周[一二三四五六日天])/);
  if (toDateMatch) {
    date = toDateMatch[1];
  } else {
    const allDates = [...text.matchAll(/周[一二三四五六日天]/g)];
    if (allDates.length > 0) {
      // Last weekday is almost always the suggested slot, not the conflicted one
      date = allDates[allDates.length - 1][0];
    }
  }

  // Extract time slot
  const timeSlot = text.includes("全天")
    ? "全天"
    : (() => {
        const rangeMatch = text.match(/(\d{1,2}:\d{2})[–\-—至到](\d{1,2}:\d{2})/g);
        return rangeMatch ? rangeMatch[rangeMatch.length - 1] : "全天";
      })();

  // Extract equipment name — look for known patterns
  let equipmentId = "EQ-DEMO";
  let equipmentName = "设备";

  const equipmentPatterns: Array<{ pattern: RegExp | string; id: string; name: string }> = [
    { pattern: "恒温恒湿箱", id: "EQ-THERMO", name: "恒温恒湿箱" },
    { pattern: "离心机", id: "EQ-CENTRIFUGE", name: "离心机" },
    { pattern: "振动台", id: "EQ010", name: "地震模拟振动台" },
    { pattern: "振动分析仪", id: "EQ002", name: "振动分析仪" },
    { pattern: "荷载测试系统", id: "EQ003", name: "荷载测试系统" },
    { pattern: "疲劳测试机", id: "EQ007", name: "疲劳测试机" },
    { pattern: /EQ-012/i, id: "EQ012", name: "备用环境箱（EQ-012）" },
    { pattern: /EQ-(\d{3})/i, id: "", name: "" },
  ];

  for (const { pattern, id, name } of equipmentPatterns) {
    const matched =
      typeof pattern === "string"
        ? text.includes(pattern)
        : pattern.test(text);
    if (matched) {
      if (id) {
        equipmentId = id;
        equipmentName = name;
      } else {
        // Dynamic EQ-XXX match
        const m = text.match(/EQ-(\d{3})/i);
        if (m) {
          equipmentId = `EQ${m[1]}`;
          equipmentName = `设备（EQ-${m[1]}）`;
        }
      }
      break;
    }
  }

  return { equipmentId, equipmentName, date, timeSlot };
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

// ─── BookingActionRow ────────────────────────────────────────────────────────

interface BookingActionRowProps {
  hint: BookingHint;
  onConfirm: () => void;
  onDismiss: () => void;
  isConfirming: boolean;
}

function BookingActionRow({ hint, onConfirm, onDismiss, isConfirming }: BookingActionRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="ml-8 mt-2 flex items-center gap-2 flex-wrap"
    >
      <div className="text-[10px] font-mono text-white/40 mr-0.5">
        {hint.equipmentName} · {hint.date} {hint.timeSlot}
      </div>
      <button
        onClick={onConfirm}
        disabled={isConfirming}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono",
          "border border-sci-cyan/40 bg-sci-cyan/10 text-sci-cyan",
          "hover:bg-sci-cyan/20 hover:border-sci-cyan/70 transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <CheckCircle2 className="w-3 h-3 shrink-0" />
        {isConfirming ? "预约中..." : "确认预约"}
      </button>
      <button
        onClick={onDismiss}
        disabled={isConfirming}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono",
          "border border-white/15 bg-white/5 text-white/45",
          "hover:bg-white/10 hover:text-white/65 hover:border-white/25 transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <XCircle className="w-3 h-3 shrink-0" />
        取消
      </button>
    </motion.div>
  );
}

// ─── Chat bubbles ────────────────────────────────────────────────────────────

interface ChatBubbleProps {
  msg: Message;
  onConfirmBooking?: (msgId: string) => void;
  onDismissBooking?: (msgId: string) => void;
  confirmingId?: string | null;
}

function ChatBubble({ msg, onConfirmBooking, onDismissBooking, confirmingId }: ChatBubbleProps) {
  const isUser = msg.role === "user";
  // cursor blinks while the message is still being typed/streamed
  const typing = msg.displayedText.length < msg.text.length || (msg.role === "ai" && msg.text === "" && msg.displayedText === "");
  const showBookingAction =
    !isUser &&
    msg.bookingHint != null &&
    !msg.bookingActed &&
    msg.displayedText === msg.text && // only after typing is done
    msg.text.length > 0;

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
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

      <AnimatePresence>
        {showBookingAction && (
          <BookingActionRow
            key={`booking-${msg.id}`}
            hint={msg.bookingHint!}
            isConfirming={confirmingId === msg.id}
            onConfirm={() => onConfirmBooking?.(msg.id)}
            onDismiss={() => onDismissBooking?.(msg.id)}
          />
        )}
      </AnimatePresence>
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
  const [messages, setMessages] = useState<Message[]>(
    () => loadHistory() ?? INITIAL_MESSAGES
  );
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [beaming, setBeaming] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Typewriter is only used for fallback (scripted) responses
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track 30-second auto-dismiss timers per message
  const bookingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // When clear history is triggered we must skip the very next persist cycle
  // so the reset-to-demo state is not immediately re-saved to localStorage.
  const skipPersistRef = useRef(false);

  // ── Persist messages to localStorage on every change ─────────────────────
  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    saveHistory(messages);
  }, [messages]);

  // Auto-scroll on new messages / thinking state
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

  // ── 30-second auto-dismiss for unacted booking hints ─────────────────────
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.role === "ai" && msg.bookingHint && !msg.bookingActed) {
        if (!bookingTimersRef.current.has(msg.id)) {
          const timer = setTimeout(() => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msg.id ? { ...m, bookingActed: true } : m
              )
            );
            bookingTimersRef.current.delete(msg.id);
          }, 30_000);
          bookingTimersRef.current.set(msg.id, timer);
        }
      } else if (msg.bookingActed) {
        const timer = bookingTimersRef.current.get(msg.id);
        if (timer) {
          clearTimeout(timer);
          bookingTimersRef.current.delete(msg.id);
        }
      }
    });
  }, [messages]);

  // ── Typewriter effect (fallback / scripted responses only) ────────────────
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
    }, 18);

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
      if (abortControllerRef.current) abortControllerRef.current.abort();
      bookingTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Booking confirm/dismiss handlers ──────────────────────────────────────

  const handleConfirmBooking = useCallback(async (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.bookingHint) return;

    const { bookingHint } = msg;
    setConfirmingId(msgId);

    try {
      const res = await fetch(`/api/equipment/${bookingHint.equipmentId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentName: bookingHint.equipmentName,
          date: bookingHint.date,
          timeSlot: bookingHint.timeSlot,
          requestedBy: "用户",
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { success?: boolean; reservation?: { id: string } };

      if (!data.success) {
        throw new Error("Reservation not confirmed by server");
      }

      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === msgId ? { ...m, bookingActed: true } : m
        );
        const reservationId = data.reservation?.id ?? "RES-OK";
        const successMsg: Message = {
          id: makeId(),
          role: "ai",
          text: `✅ 预约成功！\n\n已为您将 ${bookingHint.equipmentName} 预约至${bookingHint.date}${bookingHint.timeSlot !== "全天" ? ` ${bookingHint.timeSlot}` : "全天"}。\n\n预约编号：${reservationId}\n\n如需修改或取消，请告知。`,
          displayedText: "",
        };
        return [...updated, successMsg];
      });
    } catch {
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === msgId ? { ...m, bookingActed: true } : m
        );
        const errMsg: Message = {
          id: makeId(),
          role: "ai",
          text: `⚠️ 预约请求发送失败，请稍后重试或联系实验室管理员。`,
          displayedText: "",
        };
        return [...updated, errMsg];
      });
    } finally {
      setConfirmingId(null);
    }
  }, [messages]);

  const handleDismissBooking = useCallback((msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, bookingActed: true } : m))
    );
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
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

      const aiMsgId = makeId();
      let streamStarted = false;

      try {
        const history = toChatHistory([...messages, userMsg]);

        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Switch from "thinking" dots to an empty AI bubble once the stream begins
        setIsThinking(false);
        streamStarted = true;
        setMessages((prev) => [
          ...prev,
          { id: aiMsgId, role: "ai", text: "", displayedText: "" },
        ]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let serverError: string | null = null;

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let parsed: { content?: string; done?: boolean; error?: string };
            try {
              parsed = JSON.parse(raw) as typeof parsed;
            } catch {
              continue;
            }

            if (parsed.done) break outer;

            if (parsed.error) {
              serverError = parsed.error;
              break outer;
            }

            if (parsed.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        text: m.text + parsed.content,
                        displayedText: m.displayedText + parsed.content,
                      }
                    : m
                )
              );
            }
          }
        }

        if (serverError) throw new Error(serverError);

        // After stream completes, detect booking hint from final text
        setMessages((prev) => {
          const aiMsg = prev.find((m) => m.id === aiMsgId);
          if (!aiMsg) return prev;
          const hint = detectBookingHint(aiMsg.text);
          if (!hint) return prev;
          return prev.map((m) =>
            m.id === aiMsgId ? { ...m, bookingHint: hint } : m
          );
        });
      } catch (err) {
        const isAbort = err instanceof DOMException && err.name === "AbortError";
        if (isAbort) return;

        // Fallback to scripted response
        setIsThinking(false);
        const fallbackText = getFallbackResponse(trimmed);
        const hint = detectBookingHint(fallbackText);

        setMessages((prev) => {
          if (!streamStarted) {
            return [
              ...prev,
              {
                id: aiMsgId,
                role: "ai",
                text: fallbackText,
                displayedText: "",
                bookingHint: hint ?? undefined,
              },
            ];
          }
          return prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, text: fallbackText, bookingHint: hint ?? undefined }
              : m
          );
        });
      }
    },
    [isThinking, messages]
  );

  const handleClearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    // Skip the next persist cycle so the reset-to-demo state is not
    // immediately re-saved, keeping localStorage truly cleared.
    skipPersistRef.current = true;
    setMessages(INITIAL_MESSAGES);
  }, []);

  const handleBeamSend = () => {
    if (!inputText.trim() || isThinking) return;
    setBeaming(true);
    setTimeout(() => setBeaming(false), 500);
    void sendMessage(inputText);
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
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearHistory}
                  title="清除记录"
                  className="text-[10px] font-mono text-white/30 hover:text-white/65 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/25"
                >
                  清除记录
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/35 hover:text-white/75 transition-colors p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                    onClick={() => void sendMessage(cmd.label)}
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
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  onConfirmBooking={handleConfirmBooking}
                  onDismissBooking={handleDismissBooking}
                  confirmingId={confirmingId}
                />
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
                由 GPT 大模型驱动 · AI 回复仅供参考
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
