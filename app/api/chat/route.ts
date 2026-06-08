import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/lib/db";
import { searchKnowledge } from "@/lib/knowledge";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { botId, sessionId, message } = await req.json();
  if (!botId || !message) {
    return NextResponse.json({ error: "botId와 message 필요" }, { status: 400 });
  }

  const db = getDb();
  const bot = db.prepare("SELECT * FROM bots WHERE id = ?").get(botId) as
    | { name: string; company_name: string; greeting: string }
    | undefined;
  if (!bot) return NextResponse.json({ error: "봇 없음" }, { status: 404 });

  const knowledge = searchKnowledge(botId, message);

  const history = db
    .prepare(
      "SELECT role, content FROM conversations WHERE bot_id = ? AND session_id = ? ORDER BY created_at ASC LIMIT 20"
    )
    .all(botId, sessionId || "default") as { role: string; content: string }[];

  db.prepare("INSERT INTO conversations (bot_id, session_id, role, content) VALUES (?, ?, ?, ?)").run(
    botId,
    sessionId || "default",
    "user",
    message
  );

  const systemPrompt = `당신은 ${bot.company_name}의 AI 영업사원 "${bot.name}"입니다. 밝고 친근한 20대 여성 캐릭터입니다.
아래 회사 정보를 바탕으로 방문자 질문에 친절하고 전문적으로 답변하세요.
- 첫 인사는 따뜻하고 자연스럽게, 이름을 소개하며 시작하세요
- 어려운 전문 용어는 쉽게 풀어서 설명하세요
- 방문자가 관심을 보이면 자연스럽게 상담/문의를 유도하세요
- 답변은 2~4문장으로 간결하게, 이모지를 1~2개 사용해 친근감을 더하세요
- 절대 존재하지 않는 정보를 꾸며내지 마세요

[회사 정보]
${knowledge || "회사 정보를 불러오는 중입니다."}`;

  const messages = [
    ...history.map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user" as const, content: message },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      try {
        const stream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: systemPrompt,
          messages,
        });

        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        db.prepare(
          "INSERT INTO conversations (bot_id, session_id, role, content) VALUES (?, ?, ?, ?)"
        ).run(botId, sessionId || "default", "assistant", fullResponse);

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
