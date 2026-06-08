import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* 네비 */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="font-bold text-lg">Mitos Helper</div>
        <Link
          href="/dashboard"
          className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          시작하기 →
        </Link>
      </nav>

      {/* 히어로 */}
      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-gray-800 text-green-400 text-sm px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          AI 영업사원이 먼저 말을 겁니다
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          홈페이지를 학습한<br />
          <span className="text-green-400">AI 영업사원</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          URL 하나만 입력하면 귀사 홈페이지를 학습한 AI가 방문자에게 먼저 말을 걸고,<br className="hidden md:block" />
          복잡한 내용도 쉽게 설명해 그냥 떠날 방문자를 문의로 바꿔줍니다.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="bg-green-500 hover:bg-green-400 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition shadow-lg shadow-green-500/20"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/widget?botId=demo"
            className="border border-gray-600 hover:border-gray-400 text-gray-300 px-8 py-3.5 rounded-xl text-base transition"
          >
            데모 체험하기
          </Link>
        </div>
      </section>

      {/* 특징 3가지 */}
      <section className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: "💬",
            title: "먼저 말 걸기",
            desc: "방문자가 페이지를 열면 3초 후 AI가 먼저 말풍선으로 인사합니다. 수동적인 챗봇이 아닌 능동적인 영업사원입니다.",
          },
          {
            icon: "🧠",
            title: "홈페이지 자동 학습",
            desc: "URL만 입력하면 홈페이지 전체를 자동으로 크롤링하고 AI가 학습합니다. 별도 데이터 입력 불필요.",
          },
          {
            icon: "🔌",
            title: "한 줄 설치",
            desc: "<script> 태그 하나만 복사해 붙여넣으면 끝. 어떤 홈페이지에도 5분 안에 설치 가능합니다.",
          },
        ].map((f) => (
          <div key={f.title} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* 설치 코드 예시 */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-4">설치는 이게 전부입니다</h2>
        <p className="text-gray-400 mb-6">복사 → 붙여넣기. 끝.</p>
        <div className="bg-gray-800 rounded-xl p-5 text-left border border-gray-700">
          <code className="text-green-400 text-sm font-mono">
            {`<script src="https://mitos-helper.com/api/widget/YOUR_BOT_ID"></script>`}
          </code>
        </div>
      </section>
    </main>
  );
}
