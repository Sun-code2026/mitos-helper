"use client";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function WidgetPage() {
  const [botId, setBotId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [botInfo, setBotInfo] = useState<{
    name: string;
    company_name: string;
    greeting: string;
    avatar_url: string | null;
    sdr_active: number;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bid = params.get("botId") || "";
    const sid = params.get("sessionId") || "default";
    setBotId(bid);
    setSessionId(sid);

    if (bid) {
      fetch(`/api/bots/${bid}`)
        .then((r) => r.json())
        .then((data) => {
          setBotInfo(data);
          setMessages([{ role: "assistant", content: data.greeting }]);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, sessionId, message: msg }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              accumulated += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: accumulated,
                  streaming: true,
                };
                return updated;
              });
            }
          } catch {}
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: accumulated };
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "죄송합니다. 오류가 발생했습니다.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function resetConversation() {
    setMessages([{ role: "assistant", content: botInfo?.greeting || "안녕하세요!" }]);
  }

  function closeWidget() {
    window.parent.postMessage("mitos-close", "*");
  }

  const quickReplies = ["회사 소개해주세요", "주요 제품이 뭔가요?", "연락처 알려주세요"];

  return (
    <div className="flex flex-col h-screen bg-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
        <div className="flex items-center gap-3">
          {botInfo?.avatar_url ? (
            <img src={botInfo.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold">
              {botInfo?.name?.[0] || "A"}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold">{botInfo?.name || "AI 영업사원"}</div>
            <div className="text-xs text-gray-400">{botInfo?.company_name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {botInfo?.sdr_active ? (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              SDR 활성
            </span>
          ) : null}
          <button onClick={resetConversation} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition">
            대화 초기화
          </button>
          <button onClick={closeWidget} className="text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 transition text-lg">
            ×
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gray-900 flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                {botInfo?.avatar_url ? (
                  <img src={botInfo.avatar_url} alt="bot" className="w-full h-full object-cover" />
                ) : (
                  botInfo?.name?.[0] || "A"
                )}
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gray-900 text-white rounded-br-sm"
                  : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
              }`}
            >
              {msg.content}
              {msg.streaming && <span className="inline-block w-1.5 h-4 bg-gray-400 ml-1 animate-pulse rounded-sm" />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 빠른 답변 */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center disabled:opacity-30 transition hover:bg-gray-700 flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
