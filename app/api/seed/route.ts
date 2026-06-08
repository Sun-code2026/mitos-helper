import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getFallbackKnowledge } from "@/lib/fallback-knowledge";
import { saveKnowledge } from "@/lib/knowledge";
import { v4 as uuidv4 } from "uuid";

// 데모 봇 두 개를 미리 생성하는 시드 API
export async function POST() {
  const db = getDb();

  const demos = [
    {
      id: "demo-mitos-thera",
      name: "미래",
      company_name: "미토스테라퓨틱스",
      company_url: "https://mitos-thera.com",
      greeting: "미토콘드리아 기반 신약 개발 정보를 찾고 계신가요? 무엇이든 물어보세요!",
      avatar_url: null,
    },
    {
      id: "demo-mitos-healthcare",
      name: "건이",
      company_name: "미토스헬스케어",
      company_url: "https://mitoshealthcare.com",
      greeting: "근육 건강기능식품이나 기능성 화장품에 관심 있으신가요? 도와드릴게요!",
      avatar_url: null,
    },
  ];

  const results = [];
  for (const demo of demos) {
    const existing = db.prepare("SELECT id FROM bots WHERE id = ?").get(demo.id);
    if (!existing) {
      db.prepare(
        "INSERT INTO bots (id, name, company_name, company_url, greeting, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(demo.id, demo.name, demo.company_name, demo.company_url, demo.greeting, demo.avatar_url);
    }

    // fallback 지식 저장
    const knowledge = getFallbackKnowledge(demo.company_url);
    if (knowledge) {
      saveKnowledge(demo.id, [
        { url: demo.company_url, title: `${demo.company_name} 회사 소개`, content: knowledge },
      ]);
    }

    results.push(demo.id);
  }

  return NextResponse.json({ success: true, created: results });
}
