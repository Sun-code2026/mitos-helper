import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { botId: string } }
) {
  const db = getDb();
  const bot = db.prepare("SELECT * FROM bots WHERE id = ?").get(params.botId) as
    | { id: string; name: string; greeting: string; avatar_url: string | null; sdr_active: number }
    | undefined;

  if (!bot) {
    return new NextResponse("// Bot not found", { status: 404, headers: { "Content-Type": "application/javascript" } });
  }

  const host = process.env.NEXT_PUBLIC_HOST || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const greeting = bot.greeting.replace(/'/g, "\\'").replace(/\n/g, "\\n");

  const js = `
(function() {
  if (document.getElementById('mitos-widget-root')) return;

  var BOT_ID = '${bot.id}';
  var HOST = '${host}';
  var GREETING = '${greeting}';
  var SDR_ACTIVE = ${bot.sdr_active === 1};
  var SESSION_ID = 'sess_' + Math.random().toString(36).slice(2);

  // 스타일 주입
  var style = document.createElement('style');
  style.textContent = [
    '#mitos-widget-root { position: fixed; bottom: 24px; right: 24px; z-index: 99999; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }',
    '#mitos-chat-btn { width: 64px; height: 64px; border-radius: 50%; background: #1a1a2e; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border: none; overflow: hidden; transition: transform 0.2s; }',
    '#mitos-chat-btn:hover { transform: scale(1.05); }',
    '#mitos-chat-btn img { width: 100%; height: 100%; object-fit: cover; }',
    '#mitos-chat-btn .mitos-icon { font-size: 28px; }',
    '#mitos-greeting-bubble { position: absolute; bottom: 74px; right: 0; background: white; border-radius: 12px 12px 0 12px; padding: 12px 16px; max-width: 240px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); font-size: 14px; color: #333; line-height: 1.5; cursor: pointer; }',
    '#mitos-greeting-bubble::after { content: ""; position: absolute; bottom: -8px; right: 16px; width: 0; height: 0; border-left: 8px solid transparent; border-top: 8px solid white; }',
    '#mitos-chat-frame { position: fixed; bottom: 100px; right: 24px; width: 380px; height: 560px; border: none; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.2); display: none; }',
    '@media (max-width: 480px) { #mitos-chat-frame { width: 100vw; height: 70vh; right: 0; bottom: 80px; border-radius: 16px 16px 0 0; } }'
  ].join('');
  document.head.appendChild(style);

  // 루트 엘리먼트
  var root = document.createElement('div');
  root.id = 'mitos-widget-root';

  // 그리팅 버블
  var bubble = document.createElement('div');
  bubble.id = 'mitos-greeting-bubble';
  bubble.textContent = GREETING;
  root.appendChild(bubble);

  // 채팅 버튼
  var btn = document.createElement('button');
  btn.id = 'mitos-chat-btn';
  btn.innerHTML = '<span class="mitos-icon">💬</span>';
  root.appendChild(btn);

  // iframe
  var frame = document.createElement('iframe');
  frame.id = 'mitos-chat-frame';
  frame.title = 'AI 영업사원';
  document.body.appendChild(frame);
  document.body.appendChild(root);

  var isOpen = false;
  function openChat() {
    if (!isOpen) {
      frame.src = HOST + '/widget?botId=' + BOT_ID + '&sessionId=' + SESSION_ID;
      isOpen = true;
    }
    frame.style.display = 'block';
    bubble.style.display = 'none';
  }
  function closeChat() {
    frame.style.display = 'none';
  }

  btn.onclick = function() {
    frame.style.display === 'none' ? openChat() : closeChat();
  };
  bubble.onclick = openChat;

  // 3초 후 버블 자동 표시
  setTimeout(function() {
    if (SDR_ACTIVE) bubble.style.display = 'block';
  }, 3000);

  // iframe에서 닫기 메시지 수신
  window.addEventListener('message', function(e) {
    if (e.data === 'mitos-close') closeChat();
  });
})();
`;

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}
