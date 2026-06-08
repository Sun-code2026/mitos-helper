"use client";
import { useEffect, useState } from "react";

interface Bot {
  id: string;
  name: string;
  company_name: string;
  company_url: string;
  greeting: string;
  avatar_url: string | null;
  sdr_active: number;
  created_at: string;
}

export default function DashboardPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    company_url: "",
    greeting: "",
    avatar_url: "",
  });
  const [creating, setCreating] = useState(false);
  const [crawling, setCrawling] = useState<string | null>(null);
  const [crawlResult, setCrawlResult] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const host = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    loadBots();
  }, []);

  async function loadBots() {
    const res = await fetch("/api/bots");
    setBots(await res.json());
  }

  async function createBot(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const bot = await res.json();
    setCreating(false);
    setShowForm(false);
    setForm({ name: "", company_name: "", company_url: "", greeting: "", avatar_url: "" });
    await loadBots();
    // 생성 후 바로 크롤링 시작
    await startCrawl(bot.id);
  }

  async function startCrawl(botId: string) {
    setCrawling(botId);
    const res = await fetch("/api/crawl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botId }),
    });
    const data = await res.json();
    setCrawlResult((prev) => ({ ...prev, [botId]: data.pages }));
    setCrawling(null);
  }

  async function deleteBot(botId: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/bots/${botId}`, { method: "DELETE" });
    await loadBots();
  }

  function copyEmbed(botId: string) {
    const code = `<script src="${host}/api/widget/${botId}"></script>`;
    navigator.clipboard.writeText(code);
    setCopied(botId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Mitos Helper</h1>
          <p className="text-gray-400 text-sm">AI 영업사원 관리 대시보드</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + 새 봇 만들기
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 봇 생성 폼 */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">새 AI 영업사원 만들기</h2>
              <form onSubmit={createBot} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">봇 이름 *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="예: 미래 (AI 영업사원)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">회사명</label>
                  <input
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    placeholder="예: 미토스테라퓨틱스"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">회사 홈페이지 URL *</label>
                  <input
                    value={form.company_url}
                    onChange={(e) => setForm({ ...form, company_url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">첫 인사말</label>
                  <textarea
                    value={form.greeting}
                    onChange={(e) => setForm({ ...form, greeting: e.target.value })}
                    placeholder="예: 미토콘드리아 기반 신약 개발 정보를 찾고 계신가요?"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none h-20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">아바타 이미지 URL (선택)</label>
                  <input
                    value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {creating ? "생성 중..." : "만들기 + 크롤링 시작"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 봇 목록 */}
        {bots.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-lg font-medium text-gray-700">등록된 AI 영업사원이 없습니다</p>
            <p className="text-sm mt-1">새 봇을 만들어 홈페이지에 설치해보세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bots.map((bot) => (
              <div key={bot.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-900 overflow-hidden flex items-center justify-center text-white font-bold">
                      {bot.avatar_url ? (
                        <img src={bot.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        bot.name[0]
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          SDR 활성
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{bot.company_name} · {bot.company_url}</p>
                      <p className="text-xs text-gray-400 mt-0.5">"{bot.greeting}"</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startCrawl(bot.id)}
                      disabled={crawling === bot.id}
                      className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      {crawling === bot.id ? "크롤링 중..." : "재학습"}
                    </button>
                    <button
                      onClick={() => deleteBot(bot.id)}
                      className="text-xs border border-red-100 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {crawlResult[bot.id] !== undefined && (
                  <div className="mt-3 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    ✅ {crawlResult[bot.id]}개 페이지 학습 완료
                  </div>
                )}

                {/* 임베드 코드 */}
                <div className="mt-4 bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-mono">임베드 코드 (HTML &lt;/body&gt; 직전에 추가)</span>
                    <button
                      onClick={() => copyEmbed(bot.id)}
                      className="text-xs text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition"
                    >
                      {copied === bot.id ? "✓ 복사됨" : "복사"}
                    </button>
                  </div>
                  <code className="text-green-400 text-xs font-mono break-all">
                    {`<script src="${host}/api/widget/${bot.id}"></script>`}
                  </code>
                </div>

                {/* 미리보기 링크 */}
                <div className="mt-3 flex gap-3">
                  <a
                    href={`/widget?botId=${bot.id}`}
                    target="_blank"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    채팅 미리보기 →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
