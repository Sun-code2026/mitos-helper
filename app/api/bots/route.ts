import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const db = getDb();
  const bots = db.prepare("SELECT * FROM bots ORDER BY created_at DESC").all();
  return NextResponse.json(bots);
}

export async function POST(req: NextRequest) {
  const { name, company_name, company_url, greeting, avatar_url } = await req.json();
  if (!name || !company_url) {
    return NextResponse.json({ error: "name과 company_url은 필수입니다" }, { status: 400 });
  }

  const db = getDb();
  const id = uuidv4();
  db.prepare(
    "INSERT INTO bots (id, name, company_name, company_url, greeting, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    id,
    name,
    company_name || name,
    company_url,
    greeting || "안녕하세요! 무엇이든 물어보세요 😊",
    avatar_url || null
  );

  const bot = db.prepare("SELECT * FROM bots WHERE id = ?").get(id);
  return NextResponse.json(bot, { status: 201 });
}
