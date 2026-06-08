import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { botId: string } }
) {
  const db = getDb();
  const bot = db.prepare("SELECT * FROM bots WHERE id = ?").get(params.botId);
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bot);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { botId: string } }
) {
  const db = getDb();
  db.prepare("DELETE FROM knowledge WHERE bot_id = ?").run(params.botId);
  db.prepare("DELETE FROM conversations WHERE bot_id = ?").run(params.botId);
  db.prepare("DELETE FROM bots WHERE id = ?").run(params.botId);
  return NextResponse.json({ success: true });
}
