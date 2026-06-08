import { getDb } from "./db";

export function searchKnowledge(botId: string, query: string): string {
  const db = getDb();
  const keywords = query
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 5);

  if (keywords.length === 0) {
    const rows = db
      .prepare("SELECT title, content FROM knowledge WHERE bot_id = ? LIMIT 3")
      .all(botId) as { title: string; content: string }[];
    return rows.map((r) => `[${r.title}]\n${r.content}`).join("\n\n");
  }

  const conditions = keywords.map(() => "content LIKE ?").join(" OR ");
  const params = keywords.map((k) => `%${k}%`);

  const rows = db
    .prepare(
      `SELECT title, content FROM knowledge WHERE bot_id = ? AND (${conditions}) LIMIT 5`
    )
    .all(botId, ...params) as { title: string; content: string }[];

  if (rows.length === 0) {
    const fallback = db
      .prepare("SELECT title, content FROM knowledge WHERE bot_id = ? LIMIT 3")
      .all(botId) as { title: string; content: string }[];
    return fallback.map((r) => `[${r.title}]\n${r.content}`).join("\n\n");
  }

  return rows.map((r) => `[${r.title}]\n${r.content}`).join("\n\n");
}

export function saveKnowledge(
  botId: string,
  pages: { url: string; title: string; content: string }[]
) {
  const db = getDb();
  db.prepare("DELETE FROM knowledge WHERE bot_id = ?").run(botId);
  const insert = db.prepare(
    "INSERT INTO knowledge (bot_id, url, title, content) VALUES (?, ?, ?, ?)"
  );
  for (const page of pages) {
    insert.run(botId, page.url, page.title, page.content);
  }
}
