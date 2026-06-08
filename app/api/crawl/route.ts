import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { crawlSite } from "@/lib/crawler";
import { saveKnowledge } from "@/lib/knowledge";
import { getFallbackKnowledge } from "@/lib/fallback-knowledge";

export async function POST(req: NextRequest) {
  const { botId } = await req.json();
  if (!botId) return NextResponse.json({ error: "botId 필요" }, { status: 400 });

  const db = getDb();
  const bot = db.prepare("SELECT * FROM bots WHERE id = ?").get(botId) as
    | { company_url: string }
    | undefined;
  if (!bot) return NextResponse.json({ error: "봇을 찾을 수 없습니다" }, { status: 404 });

  const pages = await crawlSite(bot.company_url, 10);

  // 크롤링 결과가 적으면 fallback 지식 추가
  const fallback = getFallbackKnowledge(bot.company_url);
  if (fallback && pages.length < 3) {
    pages.push({
      url: bot.company_url,
      title: "회사 소개 (기본 정보)",
      content: fallback,
    });
  }

  saveKnowledge(botId, pages);

  return NextResponse.json({ success: true, pages: pages.length });
}
